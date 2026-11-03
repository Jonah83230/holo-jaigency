// npm run extrait -- r1234.mp4 23.7 15   → public/r1234-extrait.mp4
// Le morceau de ta série à donner à l'outil de transfert de mouvement (15 s maximum pour Genjutsu Lite),
// à partir de la seconde où l'hologramme doit prendre le relais. Sans le son.
import { exige, ffmpeg, nomSansExtension } from "./commun.mjs";

const [f, depuis, duree = "15"] = process.argv.slice(2);
if (!f || depuis === undefined) {
  console.error("Usage : npm run extrait -- <rush dans public/> <seconde de départ> [durée, 15 par défaut]");
  process.exit(1);
}
const entree = exige(f, "public");
const sortie = `public/${nomSansExtension(f)}-extrait.mp4`;
ffmpeg(["-loglevel", "error", "-ss", depuis, "-t", duree, "-i", entree, "-an", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", sortie]);
console.log(`→ ${sortie} (${duree} s depuis ${depuis} s) : c'est la vidéo « mouvement » à donner à l'outil.`);
