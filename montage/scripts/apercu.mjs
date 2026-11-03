// npm run apercu -- mon-reel 0.5 4 8 12   → out/apercu/mon-reel-*.jpg : des images clés pour vérifier avant le rendu complet.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

import { exige } from "./commun.mjs";
import { verifierProjet } from "./verifier-projet.mjs";

const [nom, ...temps] = process.argv.slice(2);
const props = exige(`${nom}.json`, "projets");
const projet = verifierProjet(props);
fs.mkdirSync("out/apercu", { recursive: true });
for (const t of temps.length ? temps : ["0.5", "4", "8", "12", "16"]) {
  const frame = Math.round(Number(t) * (projet.fps ?? 60));
  execFileSync("npx", ["remotion", "still", "Holo", `out/apercu/${nom}-${t}s.jpg`, `--props=${props}`, `--frame=${frame}`, "--image-format=jpeg", "--scale=0.5"], { stdio: "inherit" });
}
