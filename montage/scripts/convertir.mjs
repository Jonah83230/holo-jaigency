// npm run convertir -- IMG_1234.MOV   (le fichier est dans rushes/)
// → public/r1234.mp4 : 1080×1920, H.264, son AAC, prêt pour Remotion. L'original n'est pas modifié.
import { exige, ffmpeg, nomSansExtension } from "./commun.mjs";

const fichiers = process.argv.slice(2);
if (fichiers.length === 0) {
  console.error("Usage : npm run convertir -- <fichier dans rushes/> [autres fichiers…]");
  process.exit(1);
}
for (const f of fichiers) {
  const entree = exige(f, "rushes");
  const sortie = `public/r${nomSansExtension(f).replace(/\D/g, "") || nomSansExtension(f)}.mp4`;
  ffmpeg(["-loglevel", "error", "-i", entree, "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", sortie]);
  console.log(`${f} → ${sortie}`);
}
