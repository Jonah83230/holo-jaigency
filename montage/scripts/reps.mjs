// npm run reps -- r1234.pose.json
// → public/r1234.reps.json : pour chaque rep, quand les mains arrivent en haut, le point le plus haut et le bas d'avant, en secondes du rush,
//   plus les temps moyens de montée et de descente. Mesuré sur la hauteur des poignets, jamais tapé à la main.
// Marche pour un mouvement où les mains montent puis redescendent (développé, Arnold press, élévations…).
import fs from "node:fs";
import path from "node:path";

const fichier = process.argv[2];
if (!fichier) {
  console.error("Usage : npm run reps -- <fichier .pose.json dans public/>");
  process.exit(1);
}
const lignes = JSON.parse(fs.readFileSync(path.join("public", fichier), "utf8"));

// hauteur moyenne des deux poignets (0 = haut de l'image), lissée sur ±5 images
const brut = lignes.map((l) => {
  const ys = ["lWr", "rWr"].map((k) => l.j[k]).filter((p) => p && p[2] >= 0.3).map((p) => p[1]);
  return ys.length ? ys.reduce((s, y) => s + y, 0) / ys.length : null;
});
const y = brut.map((_, i) => {
  const v = brut.slice(Math.max(0, i - 5), i + 6).filter((x) => x !== null);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
});
const tries = y.filter((v) => v !== null).sort((a, b) => a - b);
if (tries.length < 30) {
  console.error("Pas assez d'images où les poignets sont visibles : refilme avec tout le haut du corps dans le cadre.");
  process.exit(1);
}
// repères robustes : le haut des bras tendus (5 % les plus hauts) et la hauteur médiane pendant la série ;
// la médiane ignore les images d'avant et d'après la série (haltères posés, téléphone qu'on attrape).
const haut = tries[Math.floor(tries.length * 0.05)], mediane = tries[Math.floor(tries.length * 0.5)];
// un sommet compte quand les mains montent au-dessus de ce seuil, puis redescendent sous la médiane
const seuilHaut = haut + 0.45 * (mediane - haut), seuilReArme = mediane;

const sommets = [], atteints = [];
let arme = true, meilleur = null;
for (let i = 0; i < y.length; i++) {
  if (y[i] === null) continue;
  if (arme && y[i] < seuilHaut) { arme = false; meilleur = i; atteints.push(i); }
  if (!arme) {
    if (y[i] < y[meilleur]) meilleur = i;
    if (y[i] > seuilReArme) { sommets.push(meilleur); arme = true; }
  }
}
if (!arme && meilleur !== null) sommets.push(meilleur);

const t = (i) => +lignes[i].t.toFixed(3);
const plusBasEntre = (a, b) => {
  let m = null;
  for (let i = a; i < b; i++) if (y[i] !== null && (m === null || y[i] > y[m])) m = i;
  return m;
};
const reps = sommets.map((s, k) => {
  const avant = plusBasEntre(k ? sommets[k - 1] : Math.max(0, s - Math.round((lignes.length / Math.max(1, sommets.length)))), s);
  // atteint : les mains arrivent en haut (le compteur tombe là) ; sommet : le point le plus haut
  return { atteint: t(atteints[k]), sommet: t(s), basAvant: avant === null ? null : t(avant) };
});
const montees = reps.filter((r) => r.basAvant !== null).map((r) => r.sommet - r.basAvant);
const descentes = reps.slice(1).filter((r) => r.basAvant !== null).map((r, k) => r.basAvant - reps[k].sommet);
const moy = (xs) => (xs.length ? +(xs.reduce((s, x) => s + x, 0) / xs.length).toFixed(2) : null);
const sortie = { reps, monteeMoyenne: moy(montees), descenteMoyenne: moy(descentes) };
const cible = path.join("public", fichier.replace(/\.pose\.json$/, ".reps.json"));
fs.writeFileSync(cible, JSON.stringify(sortie, null, 1));
console.log(`${reps.length} reps → ${cible}`);
console.log(`sommets (s) : ${reps.map((r) => r.sommet.toFixed(2)).join(" · ")}`);
console.log(`montée moyenne ${sortie.monteeMoyenne} s · descente moyenne ${sortie.descenteMoyenne} s`);
