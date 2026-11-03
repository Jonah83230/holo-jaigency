/**
 * Les articulations détectées par Apple Vision (npm run pose), nettoyées pour être dessinées :
 * chaque bras est rangé selon son côté de l'écran, les sauts impossibles d'une image à l'autre
 * sont retirés et les trous courts sont comblés. Sinon, le squelette tremble ou saute.
 */
export type Point = [number, number, number];
export type Ligne = { t: number; j: Record<string, Point> };

const NOMS = ["nose", "neck", "root", "lSh", "rSh", "lEl", "rEl", "lWr", "rWr"];
/** Tête, dos et bras : vus d'en bas, les genoux et les pieds sont trop mal détectés pour être tracés. */
export const OS: readonly (readonly [string, string])[] = [
  ["nose", "neck"], ["neck", "lSh"], ["neck", "rSh"], ["lSh", "lEl"], ["lEl", "lWr"], ["rSh", "rEl"], ["rEl", "rWr"], ["neck", "root"],
];

const fiable = (p: Point | undefined): p is Point => !!p && p[2] >= 0.3;

export function nettoyer(lignes: Ligne[]): Ligne[] {
  const milieux = lignes.map((l) => (l.j.lSh && l.j.rSh ? (l.j.lSh[0] + l.j.rSh[0]) / 2 : null)).filter((x): x is number => x !== null).sort((a, b) => a - b);
  const milieu = milieux[Math.floor(milieux.length / 2)] ?? 0.5;
  const js = lignes.map((l) => {
    const j: Record<string, Point> = { ...l.j };
    for (const k of ["Sh", "El", "Wr"]) {
      const pts = [l.j[`l${k}`], l.j[`r${k}`]].filter(fiable);
      const meilleur = (gauche: boolean) => pts.filter((v) => (v[0] > milieu) === gauche).sort((a, b) => b[2] - a[2])[0];
      const g = meilleur(true), d = meilleur(false);
      if (g) j[`l${k}`] = g; else delete j[`l${k}`];
      if (d) j[`r${k}`] = d; else delete j[`r${k}`];
    }
    return j;
  });
  for (const k of NOMS) {
    // sauts impossibles : plus de 25 px (+ 8 px par image manquante) d'une image à l'autre
    let dernier: Point | null = null, trou = 0;
    for (const j of js) {
      const v = j[k];
      if (!fiable(v)) { trou++; continue; }
      const saut = dernier ? Math.hypot((v[0] - dernier[0]) * 1080, (v[1] - dernier[1]) * 1920) : 0;
      if (dernier && saut > 25 + 8 * trou && trou < 12) { delete j[k]; trou++; continue; }
      dernier = v; trou = 0;
    }
    // trous de moins de 0,75 s : on relie en ligne droite
    for (let i = 0; i < js.length; i++) {
      if (fiable(js[i]![k])) continue;
      let b = i;
      while (b < js.length && !fiable(js[b]![k])) b++;
      const a = i - 1;
      if (b - a <= 45 && (a >= 0 || b < js.length)) {
        const p = a >= 0 ? js[a]![k]! : js[b]![k]!, q = b < js.length ? js[b]![k]! : p;
        for (let m = i; m < b; m++) {
          const u = a >= 0 && b < js.length ? (m - a) / (b - a) : 0;
          js[m]![k] = [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, 0.3];
        }
      }
      i = b;
    }
  }
  return lignes.map((l, i) => ({ t: l.t, j: js[i]! }));
}

/** Une articulation à la seconde `src` du rush, en pixels (1080 × 1920), moyennée sur ±4 images. */
export function articulation(lignes: Ligne[], src: number, nom: string): [number, number] | null {
  if (!lignes.length) return null;
  const pas = lignes.length > 1 ? lignes[1]!.t - lignes[0]!.t : 1 / 60;
  const i = Math.round((src - lignes[0]!.t) / pas);
  let x = 0, y = 0, n = 0;
  for (let k = i - 4; k <= i + 4; k++) {
    const p = lignes[k]?.j[nom];
    if (fiable(p)) { x += p[0]; y += p[1]; n++; }
  }
  return n >= 4 ? [(x / n) * 1080, (y / n) * 1920] : null;
}
