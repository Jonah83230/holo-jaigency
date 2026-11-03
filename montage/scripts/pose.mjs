// npm run pose -- r1234.mp4   (fichier dans public/, Mac uniquement)
// → public/r1234.pose.json : les articulations du corps à chaque image, détectées par Apple Vision
//   sur ton Mac (rien n'est envoyé en ligne). C'est ce qui sert au squelette et au compteur de reps.
import { execFileSync } from "node:child_process";

import { exige, nomSansExtension } from "./commun.mjs";

if (process.platform !== "darwin") {
  console.error("La détection du corps utilise Apple Vision : elle ne marche que sur Mac.");
  process.exit(1);
}
const f = process.argv[2];
const chemin = exige(f, "public");
const sortie = `public/${nomSansExtension(f)}.pose.json`;
execFileSync("swift", ["scripts/pose.swift", chemin, "0", "36000", sortie], { stdio: "inherit" });
console.log(`→ ${sortie}`);
