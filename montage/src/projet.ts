/**
 * Un projet « Holo » = un fichier projets/<nom>.json, écrit par Claude.
 * Temps en secondes. `de` / `a` / `depuis` : dans le rush. Le reste : dans la vidéo finale.
 */
export type Segment = { de: number; a: number; vitesse: number };
export type Projet = {
  fps?: number;
  /** Le rush de la série, converti (public/r1234.mp4), avec sa pose et ses reps (npm run pose / reps). */
  video: string;
  pose?: string;
  reps?: string;
  /** Les morceaux du rush, dans l'ordre (vitesse 1 = temps réel ; > 1 = accéléré, affiché à l'écran). */
  segments: Segment[];
  /**
   * L'hologramme généré (transfert de mouvement) à partir du rush, depuis la seconde `depuis`.
   * `face` (optionnel) passe d'abord, `troisQuarts` prend le relais `bascule` s après le scan.
   */
  holo?: { face?: string; troisQuarts: string; depuis: number; duree: number; vitesse: number; bascule?: number };
  /** Le texte d'accroche (2 lignes), jusqu'à la 2e rep. */
  accroche?: [string, string];
  /** La carte de fin : les temps moyens viennent du fichier reps. */
  carte?: { titre: string; phrase?: string; question: string };
  /** Sa voix face caméra dans une bulle : les meilleures prises, coupées aux silences. */
  voix?: { video: string; coupes: { de: number; a: number }[] };
  credits?: { avant?: string; apres?: string };
  /** Secondes gardées sur la dernière image de l'hologramme (carte). Par défaut 2,6 s ou jusqu'à la fin de la voix. */
  tenue?: number;
  bruitages?: boolean;
};

export type Reps = { reps: { atteint: number; sommet: number; basAvant: number | null }[]; monteeMoyenne: number | null; descenteMoyenne: number | null };

export const FPS_PAR_DEFAUT = 60;
export const ECART_VOIX = 0.15;

/** Un morceau placé sur la vidéo finale. */
export type Morceau = Segment & { type: "video" | "holo" | "tenue"; debut: number; duree: number };

/** Les coupes de voix placées bout à bout, à partir de 0,1 s. */
export function placerVoix(p: Projet) {
  let t = 0.1;
  return (p.voix?.coupes ?? []).map((c) => {
    const placee = { ...c, debut: t };
    t += c.a - c.de + ECART_VOIX;
    return placee;
  });
}
const finVoix = (p: Projet) => {
  const v = placerVoix(p);
  const d = v[v.length - 1];
  return d ? d.debut + (d.a - d.de) : 0;
};

export function morceaux(p: Projet): Morceau[] {
  const out: Morceau[] = [];
  let t = 0;
  for (const s of p.segments) {
    const duree = (s.a - s.de) / s.vitesse;
    out.push({ ...s, type: "video", debut: t, duree });
    t += duree;
  }
  if (p.holo) {
    const h = p.holo;
    const duree = h.duree / h.vitesse;
    out.push({ de: h.depuis, a: h.depuis + h.duree, vitesse: h.vitesse, type: "holo", debut: t, duree });
    t += duree;
  }
  const tenue = p.tenue ?? Math.max(2.6, finVoix(p) + 0.5 - t);
  const dernier = out[out.length - 1]!;
  out.push({ de: dernier.a, a: dernier.a, vitesse: 0, type: "tenue", debut: t, duree: tenue });
  return out;
}

export const dureeProjet = (p: Projet) => {
  const m = morceaux(p);
  const d = m[m.length - 1];
  return d ? d.debut + d.duree : 1;
};

/** La seconde du rush montrée au temps t de la vidéo finale. */
export function rushA(m: Morceau[], t: number) {
  const s = m.find((x) => t < x.debut + x.duree) ?? m[m.length - 1]!;
  return s.de + Math.min(t - s.debut, s.duree) * s.vitesse;
}
/** Le temps de la vidéo finale où la seconde `src` du rush apparaît. */
export function finalA(m: Morceau[], src: number) {
  const s = m.find((x) => x.type !== "tenue" && src < x.a) ?? m.filter((x) => x.type !== "tenue").pop()!;
  return s.debut + (Math.min(src, s.a) - s.de) / s.vitesse;
}
