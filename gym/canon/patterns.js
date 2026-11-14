/* Patterns to practise for any canon: short duxes built from a repeated formula of steps
   (e.g. "second up, third down"), as in the 16th-century tables of canonic formulas.

   1. The formula must be allowed by the rules of this canon for ever (rules.js: every window of steps can follow
      the one before), so it can be repeated as long as you like and left at any moment.
   2. The whole resulting score is then written out in real pitches and checked note by note, the entries and the
      ending included: every voice consonant with the lowest one (third, fifth, sixth, octave, unison; a fourth only
      between two upper voices; no diminished fifth or augmented fourth), no parallel fifths, octaves or unisons
      between two voices that both move (in similar or contrary motion), and no tritone leap in any voice. */
import { nextSteps, MOTION_NAME, MOTIONS } from './rules.js';

const STEPS = MOTIONS;
const mod = (x, n) => ((x % n) + n) % n;

/* semitones of a scale step (C4 = 28) */
export const stepMidi = (step, sc) => 12 * (Math.floor(step / 7) + 1) + sc[mod(step, 7)];

/* every voice of the canon written out: [{ t, d, notes: [{ step, midi } | null per slot] }] */
export function realise(dux, ts, sc, real) {
  const n = ts.length + 1, len = dux.length + n - 1;
  const vs = [{ t: 0, d: 0 }, ...ts.map((t, i) => ({ t, d: i + 1 }))];
  return vs.map(({ t, d }) => ({ t, d, notes: Array.from({ length: len }, (_, k) => {
    const D = dux[k - d];
    if (D === undefined) return null;
    const step = D + t;
    const midi = real[t] ? stepMidi(D, sc) + real[t][0] : stepMidi(step, sc);
    return { step, midi };
  }) }));
}

const OVER_LOW = new Set([0, 3, 4, 7, 8, 9]);   /* against the lowest voice */
const BETWEEN_UPPER = new Set([0, 3, 4, 5, 7, 8, 9]);
const PERFECT = new Set([0, 7]);

/* the check, note by note; returns null when correct, or what is wrong */
export function check(voices) {
  const len = voices[0].notes.length;
  for (const v of voices) for (let k = 1; k < len; k++) {
    const a = v.notes[k - 1], b = v.notes[k];
    if (a && b && Math.abs(a.midi - b.midi) === 6) return `tritone leap at note ${k + 1}`;
  }
  for (let k = 0; k < len; k++) {
    const on = voices.map(v => v.notes[k]).filter(Boolean);
    if (on.length < 2) continue;
    const low = Math.min(...on.map(x => x.midi));
    for (const x of on) if (!OVER_LOW.has(mod(x.midi - low, 12))) return `dissonance against the lowest voice at slot ${k + 1}`;
    for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
      if (on[i].midi === low || on[j].midi === low) continue;
      if (!BETWEEN_UPPER.has(mod(on[i].midi - on[j].midi, 12))) return `dissonance between upper voices at slot ${k + 1}`;
    }
    if (Math.max(...on.map(x => x.midi)) - low > 31) return 'the voices are too far apart';
  }
  for (let k = 1; k < len; k++) for (let i = 0; i < voices.length; i++) for (let j = i + 1; j < voices.length; j++) {
    const a0 = voices[i].notes[k - 1], a1 = voices[i].notes[k], b0 = voices[j].notes[k - 1], b1 = voices[j].notes[k];
    if (!a0 || !a1 || !b0 || !b1) continue;
    if (a0.midi === a1.midi || b0.midi === b1.midi) continue;          /* one voice holds: no parallel */
    const x = mod(a0.midi - b0.midi, 12), y = mod(a1.midi - b1.midi, 12);
    if (PERFECT.has(x) && x === y) return `parallel ${x ? 'fifths' : 'octaves or unisons'} at slot ${k + 1}`;
  }
  return null;
}

/* is the formula p (repeated for ever) allowed by the rules of this canon? */
function endless(A, p) {
  const D = A.D, L = p.length, s = i => p[mod(i, L)];
  for (let i = 0; i < L; i++) {
    const win = Array.from({ length: D }, (_, j) => s(i + j));
    const nx = nextSteps(A, win);
    if (!nx || !nx.includes(s(i + D))) return false;
  }
  return true;
}
const rotations = p => p.map((_, i) => [...p.slice(i), ...p.slice(0, i)]);
const canonical = p => rotations(p).map(r => r.join(',')).sort()[0];
const periodic = p => { for (let q = 1; q < p.length; q++) if (p.length % q === 0 && p.every((m, i) => m === p[i % q])) return true; return false; };

function describe(p) {
  const drift = p.reduce((a, b) => a + b, 0);
  const steps = p.map(m => MOTION_NAME[m]).join(', ');
  const per = p.length === 1 ? 'every note' : `every ${['', '', 'two', 'three', 'four', 'five', 'six'][p.length]} notes`;
  const how = drift === 0 ? 'and back where it began' : `${drift > 0 ? 'rising' : 'falling'} ${drift === 1 || drift === -1 ? 'a step' : drift === 2 || drift === -2 ? 'a third' : 'a fourth'} ${per}`;
  return { steps: steps.charAt(0).toUpperCase() + steps.slice(1), how };
}

/* the patterns for canon ts (comes i enters i notes after the dux, ts[i] steps of the scale away) */
export function findPatterns(A, ts, sc, real, max = 6) {
  const n = ts.length + 1, N = [12, 12, 10, 9, 8][n - 1] || 8;
  const found = new Map(), maxLen = n <= 2 ? 4 : n === 3 ? 5 : 6;
  /* a formula is grown step by step; a beginning that already breaks the rules is not followed further */
  const fits = p => { const i = p.length - 1 - A.D; if (i < 0) return true; const nx = nextSteps(A, p.slice(i, i + A.D)); return !!nx && nx.includes(p.at(-1)); };
  const grow = (p) => {
    if (p.length) {
      const drift = p.reduce((a, b) => a + b, 0), c = canonical(p), zeros = p.filter(m => m === 0).length;
      if (!periodic(p) && !found.has(c) && Math.abs(drift) <= 3 && zeros * 2 <= p.length && endless(A, p)) {
        const leap = p.reduce((a, m) => a + Math.abs(m), 0) / p.length;
        const score = (drift === 0 ? 1.2 : Math.abs(drift) === 1 ? 0 : Math.abs(drift) === 2 ? 1.6 : 2.6) + leap * .6 + zeros / p.length * 4 + p.length * .2
          + p.filter(m => Math.abs(m) >= 5).length * 1.5;
        found.set(c, { p, score });
      }
    }
    if (p.length < maxLen) for (const m of STEPS) { const q = [...p, m]; if (fits(q)) grow(q); }
  };
  grow([]);
  const out = [];
  for (const { p, score } of [...found.values()].sort((a, b) => a.score - b.score)) {
    let best = null;
    for (const r of rotations(p)) for (let s0 = 22; s0 <= 34; s0++) {
      const dux = [s0];
      for (let i = 1; i < N; i++) dux.push(dux[i - 1] + r[(i - 1) % r.length]);
      const all = [...dux, ...ts.flatMap(t => dux.map(D => D + t))];
      const lo = Math.min(...all), hi = Math.max(...all);
      if (lo < 14 || hi > 42) continue;
      const voices = realise(dux, ts, sc, real);
      if (check(voices)) continue;
      /* prefer a start where the comites need no sharps or flats, then the middle of the voice */
      const chrom = voices.reduce((a, v) => a + v.notes.filter(x => x && x.midi !== stepMidi(x.step, sc)).length, 0);
      const mid = (Math.min(...dux) + Math.max(...dux)) / 2, cost = Math.abs(mid - 29) + chrom * 2;
      if (!best || cost < best.cost) best = { dux, r, voices, cost };
    }
    if (!best) continue;
    out.push({ formula: best.r, dux: best.dux, voices: best.voices, ...describe(best.r) });
    if (out.length >= max) break;
  }
  return out;
}
