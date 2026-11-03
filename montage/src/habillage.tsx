import React from "react";
import { loadFont as chargerArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as chargerCaveat } from "@remotion/google-fonts/CaveatBrush";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { articulation, OS, type Ligne } from "./squelette";

/** Les textes et calques par-dessus la vidéo, aux couleurs jaigency (papier, encre, jaune, violet). */
export const BLOC = chargerArchivo("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const MAIN = chargerCaveat("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const C = { papier: "#F4EEE1", jaune: "#F5D547", violet: "#9D7BFF", encre: "#15121D" } as const;
const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const virgule = (x: number) => String(+x.toFixed(2)).replace(".", ",");

/** Un petit rebond à chaque événement (rep comptée, carte qui arrive). */
const rebond = (depuis: number) => 1 + 0.18 * Math.exp(-depuis / 5) * Math.cos(depuis / 2.2);

const Bande: React.FC<{ couleur: string; inclinaison: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ couleur, inclinaison, children, style }) => (
  <div style={{ background: couleur, padding: "14px 30px 8px", transform: `rotate(${inclinaison}deg)`, boxShadow: "0 10px 24px rgba(0,0,0,0.45)", borderRadius: 6, ...style }}>{children}</div>
);

export const Compteur: React.FC<{ repsFinal: number[]; detail?: (faites: number) => string | null }> = ({ repsFinal, detail }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const faites = repsFinal.filter((r) => r <= frame / fps).length;
  const depuis = faites ? frame - Math.round(repsFinal[faites - 1]! * fps) : 99;
  const ligne = detail?.(faites) ?? null;
  return (
    <div style={{ position: "absolute", right: 60, top: 250, zIndex: 6, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
      <div style={{ transform: `scale(${rebond(depuis)})`, transformOrigin: "100% 50%" }}>
        <Bande couleur={faites === repsFinal.length ? C.jaune : C.papier} inclinaison={-2}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ fontFamily: BLOC, fontSize: 40, color: C.encre }}>REPS</span>
            <span style={{ fontFamily: BLOC, fontSize: 150, lineHeight: 1, color: C.encre, minWidth: 190, textAlign: "right" }}>{String(faites).padStart(2, "0")}</span>
          </div>
        </Bande>
      </div>
      {ligne ? <span style={{ fontFamily: BLOC, fontSize: 36, color: "white", textShadow: `0 3px 0 ${C.encre}, 0 0 12px ${C.encre}` }}>{ligne}</span> : null}
    </div>
  );
};

export const Accroche: React.FC<{ lignes: [string, string] }> = ({ lignes }) => (
  <div style={{ position: "absolute", left: 0, width: 1080, top: 1330, display: "flex", justifyContent: "center", zIndex: 6 }}>
    <Bande couleur={C.violet} inclinaison={-2} style={{ padding: "18px 30px 12px" }}>
      <div style={{ fontFamily: BLOC, fontSize: 62, lineHeight: 1.08, color: C.encre, textAlign: "center" }}>
        {lignes[0]}
        <br />
        {lignes[1]}
      </div>
    </Bande>
  </div>
);

export const Vitesse: React.FC<{ vitesse: number }> = ({ vitesse }) => (
  <div style={{ position: "absolute", left: 60, top: 270, zIndex: 6, fontFamily: BLOC, fontSize: 64, color: C.jaune, textShadow: `0 4px 0 ${C.encre}` }}>×{virgule(vitesse)} ▶▶</div>
);

export const Credit: React.FC<{ texte: string }> = ({ texte }) => (
  <div style={{ position: "absolute", left: 0, width: 1080, top: 1540, textAlign: "center", zIndex: 6, fontFamily: BLOC, fontSize: 28, color: "white", opacity: 0.85, textShadow: `0 2px 0 ${C.encre}` }}>{texte}</div>
);

export const Carte: React.FC<{ titre: string; reps: number; montee: number | null; descente: number | null; phrase?: string; question: string }> = ({ titre, reps, montee, descente, phrase, question }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 10], [500, 0], { ...borne, easing: (x) => 1 - (1 - x) ** 3 });
  return (
    <div style={{ position: "absolute", left: 90, width: 900, top: 940, zIndex: 6, transform: `translateY(${y}px) scale(${rebond(frame)}) rotate(-2deg)` }}>
      <div style={{ background: C.papier, borderRadius: 30, overflow: "hidden", boxShadow: "0 24px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ background: C.encre, color: C.jaune, fontFamily: BLOC, fontSize: 50, textAlign: "center", padding: "26px 0 18px", letterSpacing: "0.06em" }}>{titre}</div>
        <div style={{ padding: "30px 40px 34px", display: "flex", flexDirection: "column", gap: 12, fontFamily: BLOC, color: C.encre }}>
          <span style={{ fontSize: 96, lineHeight: 1 }}>{reps} REPS</span>
          {montee !== null && descente !== null ? <span style={{ fontSize: 42 }}>montée {virgule(+montee.toFixed(1))} s · descente {virgule(+descente.toFixed(1))} s</span> : null}
          {phrase ? <span style={{ fontFamily: MAIN, fontSize: 52, color: C.violet }}>{phrase}</span> : null}
          <span style={{ fontSize: 38, marginTop: 6, opacity: interpolate(frame, [36, 48], [0, 1], borne) }}>{question}</span>
        </div>
      </div>
    </div>
  );
};

/** La salle bleue de l'hologramme : dégradé et quadrillage fin. */
export const Plan: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 40%, #12408f 0%, #0a2763 55%, #061538 100%)" }}>
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(140,190,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(140,190,255,0.08) 2px, transparent 2px)", backgroundSize: "60px 60px" }} />
  </AbsoluteFill>
);

/** La ligne de scan qui descend en `duree` s. */
export const LigneScan: React.FC<{ duree: number }> = ({ duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = interpolate(frame, [0, Math.round(duree * fps)], [0, 1920], borne);
  return <div style={{ position: "absolute", left: 0, width: 1080, top: y - 6, height: 12, zIndex: 5, background: "#d9f1ff", boxShadow: "0 0 30px 12px #4f9dff, 0 0 80px 30px rgba(79,157,255,0.5)" }} />;
};

/** Le squelette du haut du corps à la seconde `src` du rush, avec la traînée des poignets. */
export const Squelette: React.FC<{ lignes: Ligne[]; src: number }> = ({ lignes, src }) => {
  const pt = (n: string, s = src) => articulation(lignes, s, n);
  const trainee = (n: string) => {
    const out: string[] = [];
    for (let k = 0; k <= 21; k++) {
      const p = pt(n, src - 0.7 + k * (0.7 / 21));
      if (p) out.push(`${p[0].toFixed(1)},${p[1].toFixed(1)}`);
    }
    return out.join(" ");
  };
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, zIndex: 3, filter: `drop-shadow(0 0 10px ${C.violet})` }}>
      {["lWr", "rWr"].map((n) => <polyline key={n} points={trainee(n)} fill="none" stroke={C.jaune} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />)}
      {OS.map(([a, b]) => {
        const p = pt(a), q = pt(b);
        return p && q ? <line key={a + b} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={C.violet} strokeWidth={9} strokeLinecap="round" /> : null;
      })}
      {Array.from(new Set(OS.flat())).map((n) => {
        const p = pt(n);
        const poignet = n === "lWr" || n === "rWr";
        return p ? <circle key={n} cx={p[0]} cy={p[1]} r={poignet ? 17 : 11} fill={poignet ? C.jaune : "white"} stroke={C.encre} strokeWidth={4} /> : null;
      })}
    </svg>
  );
};

/** La bulle ronde de la voix face caméra, sous le compteur. */
export const Bulle: React.FC<{ duree: number; children: React.ReactNode }> = ({ duree, children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 9, duree - 9, duree], [0, 1, 1, 0], { ...borne, easing: (x) => 1 - (1 - x) ** 3 });
  return (
    <AbsoluteFill style={{ zIndex: 6, pointerEvents: "none" }}>
      <div style={{ position: "absolute", right: 40, top: 470, width: 250, height: 250, borderRadius: "50%", overflow: "hidden", border: `8px solid ${C.jaune}`, boxShadow: "0 18px 40px rgba(0,0,0,0.55)", transform: `scale(${s})` }}>{children}</div>
    </AbsoluteFill>
  );
};
