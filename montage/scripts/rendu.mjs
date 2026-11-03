// npm run rendu -- mon-reel   → out/mon-reel.mp4 (1080×1920)
import { execFileSync } from "node:child_process";

import { exige } from "./commun.mjs";
import { verifierProjet } from "./verifier-projet.mjs";

const nom = process.argv[2];
const props = exige(`${nom}.json`, "projets");
verifierProjet(props);
execFileSync("npx", ["remotion", "render", "Holo", `out/${nom}.mp4`, `--props=${props}`], { stdio: "inherit" });
console.log(`Vidéo prête : out/${nom}.mp4`);
