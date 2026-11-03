// Vérifie qu'un projet JSON est complet et que ses fichiers existent dans public/, avant un aperçu ou un rendu.
import fs from "node:fs";
import path from "node:path";

export function verifierProjet(chemin) {
  const p = JSON.parse(fs.readFileSync(chemin, "utf8"));
  const erreurs = [];
  const fichiers = [p.video, p.pose, p.reps, p.holo?.face, p.holo?.troisQuarts, p.voix?.video].filter(Boolean);
  for (const f of fichiers) if (!fs.existsSync(path.join("public", f))) erreurs.push(`fichier absent de public/ : ${f}`);
  if (!Array.isArray(p.segments) || p.segments.length === 0) erreurs.push("« segments » est vide");
  for (const s of p.segments ?? []) if (!(s.a > s.de) || !(s.vitesse > 0)) erreurs.push(`segment incohérent : ${JSON.stringify(s)}`);
  if (p.holo && !(p.holo.duree > 0 && p.holo.vitesse > 0)) erreurs.push("« holo » : durée et vitesse doivent être positives");
  if (p.holo && p.credits?.apres === undefined) erreurs.push("« credits.apres » manque : l'hologramme doit être annoncé comme de l'IA à l'écran");
  for (const f of ["tick", "hit", "whoosh", "pop"]) if (p.bruitages !== false && !fs.existsSync(`public/sfx/${f}.wav`)) erreurs.push("bruitages absents : lance « npm run sons » (ou mets \"bruitages\": false)");
  if (erreurs.length) {
    console.error([...new Set(erreurs)].join("\n"));
    process.exit(1);
  }
  return p;
}
