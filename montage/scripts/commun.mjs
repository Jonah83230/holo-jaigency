import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Le ffmpeg livré avec Remotion : rien d'autre à installer. */
export function ffmpeg(args) {
  return execFileSync("npx", ["remotion", "ffmpeg", "-hide_banner", "-y", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}
/** ffmpeg écrit ses mesures (durée, silences) sur la sortie d'erreur, même quand tout va bien. */
export function ffmpegStderr(args) {
  return spawnSync("npx", ["remotion", "ffmpeg", "-hide_banner", ...args], { encoding: "utf8" }).stderr ?? "";
}
export const nomSansExtension = (f) => path.basename(f).replace(/\.[^.]+$/, "");
export function exige(fichier, dossier) {
  const chemin = path.join(dossier, fichier ?? "");
  if (!fichier || !fs.existsSync(chemin)) {
    console.error(`Fichier introuvable : ${chemin}`);
    process.exit(1);
  }
  return chemin;
}
