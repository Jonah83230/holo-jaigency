// npm run sons   (une seule fois) : fabrique les bruitages du montage (whoosh, pop, tick, hit) par calcul,
// sans aucun son de quelqu'un d'autre. WAV 48 kHz mono dans public/sfx/.
import fs from "node:fs";
import path from "node:path";

const SR = 48000;
fs.mkdirSync("public/sfx", { recursive: true });
let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function wav(file, samples) {
  const peak = Math.max(...samples.map(Math.abs)) || 1;
  const gain = 0.5 / peak; // -6 dBFS
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s * gain)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join("public/sfx", file), buf);
}

const n = (sec) => Math.round(sec * SR);

// Whoosh: noise through a sweeping one-pole low-pass, swelling then fading.
{
  const len = n(0.42); const out = []; let lp = 0, lp2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const cutoff = 300 + 5200 * Math.sin(Math.PI * Math.min(1, t * 1.1));
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lp += a * (rand() - lp); lp2 += a * (lp - lp2);
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, t)), 1.6);
    out.push(lp2 * env);
  }
  wav("whoosh.wav", out);
}
// Pop: short sine with a fast pitch drop + a tiny click.
{
  const len = n(0.16); const out = []; let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 320 + 900 * Math.exp(-t * 45);
    ph += (2 * Math.PI * f) / SR;
    const env = Math.min(1, t / 0.003) * Math.exp(-t * 28);
    out.push(Math.sin(ph) * env + (t < 0.004 ? rand() * 0.4 : 0));
  }
  wav("pop.wav", out);
}
// Tick: camera-shutter double click (high-passed noise bursts).
{
  const len = n(0.09); const out = []; let prev = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const burst = (t < 0.012 ? Math.exp(-t * 400) : 0) + (t > 0.045 && t < 0.06 ? Math.exp(-(t - 0.045) * 450) * 0.8 : 0);
    const x = rand(); const hp = x - prev; prev = x;
    out.push(hp * burst);
  }
  wav("tick.wav", out);
}
// Hit: low thump (sine drop) with a noise transient: lands the big numbers.
{
  const len = n(0.5); const out = []; let ph = 0, lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 48 + 110 * Math.exp(-t * 18);
    ph += (2 * Math.PI * f) / SR;
    lp += 0.25 * (rand() - lp);
    const body = Math.sin(ph) * Math.exp(-t * 7);
    const trans = lp * Math.exp(-t * 60) * 0.7;
    out.push(body + trans);
  }
  wav("hit.wav", out);
}
console.log("Bruitages prêts dans public/sfx");
