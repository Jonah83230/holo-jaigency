// npm run silences -- r1234.mp4   (fichier dans public/)
// Les moments où la personne parle : on coupe 0,2–0,3 s APRÈS la fin d'une prise de parole, jamais sur la fin d'un mot.
import fs from "node:fs";

import { exige, ffmpegStderr, nomSansExtension } from "./commun.mjs";

const f = process.argv[2];
const chemin = exige(f, "public");
const log = ffmpegStderr(["-i", chemin, "-vn", "-af", "silencedetect=noise=-38dB:d=0.25", "-f", "null", "-"]);
const duree = Number(/Duration: (\d+):(\d+):([\d.]+)/.exec(log)?.slice(1).reduce((s, v, i) => s + Number(v) * [3600, 60, 1][i], 0) ?? 0);
const silences = [];
let debut = null;
for (const ligne of log.split("\n")) {
  const s = /silence_start: ([\d.]+)/.exec(ligne);
  const e = /silence_end: ([\d.]+)/.exec(ligne);
  if (s) debut = Number(s[1]);
  if (e && debut !== null) {
    silences.push([debut, Number(e[1])]);
    debut = null;
  }
}
if (debut !== null) silences.push([debut, duree]);
// La parole = ce qui est entre les silences.
const parole = [];
let t = 0;
for (const [a, b] of silences) {
  if (a - t > 0.05) parole.push([+t.toFixed(2), +a.toFixed(2)]);
  t = b;
}
if (duree - t > 0.05) parole.push([+t.toFixed(2), +duree.toFixed(2)]);
fs.writeFileSync(`public/${nomSansExtension(f)}.silences.json`, JSON.stringify({ duree: +duree.toFixed(2), parole, silences }, null, 1));
console.log(`Durée ${duree.toFixed(2)} s · parole :`, parole.map(([a, b]) => `${a}–${b}`).join("  "));
