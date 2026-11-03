import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import { Accroche, Bulle, Carte, Compteur, Credit, LigneScan, Plan, Squelette, Vitesse } from "./habillage";
import { FPS_PAR_DEFAUT, finalA, morceaux, placerVoix, rushA, type Projet, type Reps } from "./projet";
import { nettoyer, type Ligne } from "./squelette";

/**
 * La série filmée, comptée à partir des articulations ; puis une ligne de scan efface la salle
 * et la série continue en hologramme (vidéo générée par transfert de mouvement à partir du rush,
 * annoncée comme de l'IA à l'écran) ; la carte de fin donne les temps mesurés et pose la question.
 */
const SCAN = 0.8; // secondes pour que la ligne de scan traverse l'écran
const FONDU = 0.2;

const useJson = <T,>(fichier: string | undefined) => {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [attente] = useState(() => (fichier ? delayRender(fichier) : null));
  useEffect(() => {
    if (!fichier || attente === null) return;
    fetch(staticFile(fichier))
      .then((r) => r.json() as Promise<T>)
      .then((d) => { setDonnees(d); continueRender(attente); });
  }, [fichier, attente]);
  return donnees;
};

export const Holo: React.FC<Projet> = (p) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const a = (t0: number, t1: number, noeud: React.ReactNode, cle?: string) => (
    <Sequence key={cle} from={f(t0)} durationInFrames={Math.max(1, f(t1) - f(t0))} layout="none">{noeud}</Sequence>
  );
  const m = useMemo(() => morceaux(p), [p]);
  const fin = m[m.length - 1]!.debut + m[m.length - 1]!.duree;
  const holo = m.find((x) => x.type === "holo");
  const scan = holo?.debut ?? fin;
  const bascule = p.holo?.face ? scan + SCAN + (p.holo.bascule ?? 1.6) : scan;

  const pose = useJson<Ligne[]>(p.pose);
  const lignes = useMemo(() => (pose ? nettoyer(pose) : null), [pose]);
  const reps = useJson<Reps>(p.reps);
  const repsFinal = useMemo(() => (reps ? reps.reps.map((r) => finalA(m, r.atteint)) : []), [reps, m]);
  const derniere = repsFinal[repsFinal.length - 1] ?? fin - 2;
  const voix = placerVoix(p);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {holo && p.holo ? (
        <>
          {a(scan, fin, <Plan />, "plan")}
          {p.holo.face ? a(scan, bascule + FONDU, <Clip fichier={p.holo.face} debut={0} vitesse={holo.vitesse} fondu={false} />, "face") : null}
          {a(bascule, holo.debut + holo.duree, <Clip fichier={p.holo.troisQuarts} debut={f((bascule - scan) * holo.vitesse)} vitesse={holo.vitesse} fondu={!!p.holo.face} />, "34")}
          {a(holo.debut + holo.duree, fin, <Freeze frame={f(holo.duree) - 1}><Clip fichier={p.holo.troisQuarts} debut={0} vitesse={holo.vitesse} fondu={false} /></Freeze>, "tenue")}
        </>
      ) : null}
      <SousLeScan scan={scan}>
        {m.filter((x) => x.type === "video" || (x.type === "holo" && x.vitesse > 0)).map((s) => a(s.debut, s.type === "holo" ? s.debut + SCAN : s.debut + s.duree, (
          <AbsoluteFill>
            <OffthreadVideo src={staticFile(p.video)} muted startFrom={f(s.de)} playbackRate={s.vitesse} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
        ), `v${s.debut}`))}
        {lignes ? <SqueletteAuTemps lignes={lignes} m={m} /> : null}
      </SousLeScan>
      {holo ? a(scan, scan + SCAN, <LigneScan duree={SCAN} />, "scan") : null}
      {repsFinal.length ? <Compteur repsFinal={repsFinal} /> : null}
      {p.accroche ? a(0, (repsFinal[1] ?? 3) + 0.2, <Accroche lignes={p.accroche} />, "accroche") : null}
      {m.filter((x) => x.type !== "tenue" && x.vitesse !== 1).map((s) => a(s.debut + (s.type === "holo" ? 0.9 : 0), s.debut + s.duree, <Vitesse vitesse={s.vitesse} />, `x${s.debut}`))}
      {p.carte && reps ? a(derniere + 0.3, fin, <Carte titre={p.carte.titre} reps={reps.reps.length} montee={reps.monteeMoyenne} descente={reps.descenteMoyenne} phrase={p.carte.phrase} question={p.carte.question} />, "carte") : null}
      {p.credits?.avant ? a(0, scan, <Credit texte={p.credits.avant} />, "c1") : null}
      {p.credits?.apres && holo ? a(scan + SCAN, fin, <Credit texte={p.credits.apres} />, "c2") : null}
      {voix.length ? (
        <Sequence from={f(voix[0]!.debut)} durationInFrames={f(fin) - f(voix[0]!.debut)} layout="none">
          <Bulle duree={f(voix[voix.length - 1]!.debut + voix[voix.length - 1]!.a - voix[voix.length - 1]!.de) - f(voix[0]!.debut)}>
            {voix.map((c, i) => {
              const suivante = voix[i + 1];
              const arret = suivante ? suivante.debut : c.debut + (c.a - c.de);
              return (
                <Sequence key={c.debut} from={f(c.debut) - f(voix[0]!.debut)} durationInFrames={Math.max(1, f(arret) - f(c.debut))}>
                  <OffthreadVideo src={staticFile(p.voix!.video)} startFrom={f(c.de)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Sequence>
              );
            })}
          </Bulle>
        </Sequence>
      ) : null}
      {p.bruitages !== false ? (
        <>
          {repsFinal.map((t, i) => a(t, t + 0.6, <Audio src={staticFile(i === repsFinal.length - 1 ? "sfx/hit.wav" : "sfx/tick.wav")} volume={0.45} />, `s${i}`))}
          {m.filter((x) => x.type !== "tenue" && x.vitesse !== 1).map((s) => a(s.debut, s.debut + 0.5, <Audio src={staticFile("sfx/whoosh.wav")} volume={0.25} />, `w${s.debut}`))}
          {p.holo?.face ? a(bascule - 0.1, bascule + 0.4, <Audio src={staticFile("sfx/whoosh.wav")} volume={0.2} />, "wb") : null}
          {p.carte && reps ? a(derniere + 0.3, derniere + 0.6, <Audio src={staticFile("sfx/pop.wav")} volume={0.5} />, "pop") : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** La vraie vidéo et son squelette restent sous la ligne de scan. */
const SousLeScan: React.FC<{ scan: number; children: React.ReactNode }> = ({ scan, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = interpolate(frame, [Math.round(scan * fps), Math.round((scan + SCAN) * fps)], [0, 1920], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ clipPath: `inset(${y}px 0 0 0)`, zIndex: 2 }}>{children}</AbsoluteFill>;
};

const SqueletteAuTemps: React.FC<{ lignes: Ligne[]; m: ReturnType<typeof morceaux> }> = ({ lignes, m }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Squelette lignes={lignes} src={rushA(m, frame / fps)} />;
};

const Clip: React.FC<{ fichier: string; debut: number; vitesse: number; fondu: boolean }> = ({ fichier, debut, vitesse, fondu }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = fondu ? interpolate(frame, [0, Math.round(FONDU * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <OffthreadVideo src={staticFile(fichier)} muted startFrom={debut} playbackRate={vitesse} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

export { FPS_PAR_DEFAUT };
