import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Config } from "@remotion/cli/config";

// Vidéos de téléphone 1080×1920, H.264 haute qualité (TikTok et Instagram ré-encodent ensuite).
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(16);

// macOS protège Bureau, Documents et Téléchargements : le Chrome de rendu ne peut pas y lire ses propres
// fichiers et le rendu reste bloqué. `npm run installer-navigateur` en fait une copie hors de ces dossiers.
const copie = path.join(os.homedir(), ".remotion-chrome/chrome-headless-shell");
const executable = ["mac-arm64/chrome-headless-shell-mac-arm64", "mac-x64/chrome-headless-shell-mac-x64"]
  .map((d) => path.join(copie, d, "chrome-headless-shell"))
  .find((p) => fs.existsSync(p));
if (executable) Config.setBrowserExecutable(executable);
