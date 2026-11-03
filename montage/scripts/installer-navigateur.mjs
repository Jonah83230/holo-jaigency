// npm run installer-navigateur   (une seule fois, Mac) : télécharge le Chrome de rendu de Remotion
// puis le copie dans ~/.remotion-chrome, hors des dossiers protégés par macOS.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

execFileSync("npx", ["remotion", "browser", "ensure"], { stdio: "inherit" });
const source = path.join("node_modules", ".remotion", "chrome-headless-shell");
const cible = path.join(os.homedir(), ".remotion-chrome", "chrome-headless-shell");
if (process.platform === "darwin" && fs.existsSync(source)) {
  fs.mkdirSync(path.dirname(cible), { recursive: true });
  fs.cpSync(source, cible, { recursive: true, verbatimSymlinks: true });
  console.log("Navigateur de rendu copié dans", cible);
} else {
  console.log("Navigateur de rendu prêt.");
}
