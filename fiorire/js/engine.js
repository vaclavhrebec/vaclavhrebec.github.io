/* Fiorire: the diminution engine.
   A piece is a set of voices; each voice is a list of "base" notes (the plain model) plus a map of diminutions,
   note index -> figure that replaces that note. Every figure starts on the original pitch, fills exactly the length of the
   original note and runs toward the next note of the voice. Figures are grown from contour families (tirata, gruppo,
   tremolo, arch, passaggio) and rhythm families (even, long-first, dotted, lombard) in the manner of one or several
   treatises, and they are accepted only if they pass the rules the user switched on. */
import { midiOf } from '../../gym/cantare/js/music.js';

export function makeRng(seed) { let a = (seed >>> 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export const FAMILIES = {
  tirata: 'Tirata (scale run)', gruppo: 'Gruppo (turn)', tremolo: 'Tremolo (alternation)', arch: 'Arco (arch)', passaggio: 'Passaggio (mixed run)',
};
export const RHYTHMS = { even: 'even notes', long: 'long note, then quick ones', dotted: 'dotted (long–short)', lomb: 'snapped (short–long)' };

/* The manners. Each says how many notes a figure has, which contours and rhythms it likes, and whether it leaps.
   These are modern descriptions of the manners, not transcriptions: see the About page. */
export const SCHOOLS = {
  adorg: { era: 'medieval', name: 'Ad organum faciendum, Milan c. 1100', n: [2, 3, 4], fam: { tirata: 3, gruppo: 1, arch: 3, passaggio: 0, tremolo: 0 }, rh: { even: 5, long: 2, dotted: 0, lomb: 0 }, leap: 1, cad: 3 },
  notredame: { era: 'medieval', name: 'Notre-Dame organum, c. 1200', n: [4, 8, 16], fam: { tirata: 2, gruppo: 3, arch: 3, passaggio: 2, tremolo: 1 }, rh: { even: 5, long: 2, dotted: 0, lomb: 0 }, leap: 1, cad: 3 },
  trecento: { era: 'medieval', name: 'Trecento divisions (Marchetto, Berkeley)', n: [4, 6, 8], fam: { tirata: 3, gruppo: 2, arch: 3, passaggio: 2, tremolo: 0 }, rh: { even: 5, long: 1, dotted: 0, lomb: 0 }, leap: 2, cad: 4 },
  coclico: { era: 'renaissance', name: 'Coclico, 1552', n: [3, 4], fam: { tirata: 3, gruppo: 2, arch: 1, passaggio: 1, tremolo: 0 }, rh: { even: 3, long: 3, dotted: 0, lomb: 0 }, leap: 1, cad: 2 },
  finck: { era: 'renaissance', name: 'Finck, 1556', n: [3, 4, 6], fam: { tirata: 3, gruppo: 2, arch: 2, passaggio: 1, tremolo: 0 }, rh: { even: 3, long: 2, dotted: 0, lomb: 0 }, leap: 1, cad: 2 },
  ganassi: { era: 'renaissance', name: 'Ganassi, 1535', n: [4, 6, 8], fam: { tirata: 1, gruppo: 3, arch: 1, passaggio: 2, tremolo: 4 }, rh: { even: 5, long: 2, dotted: 1, lomb: 1 }, leap: 2, cad: 2 },
  ortiz: { era: 'renaissance', name: 'Ortiz, 1553', n: [3, 4, 6, 8], fam: { tirata: 4, gruppo: 1, arch: 3, passaggio: 3, tremolo: 1 }, rh: { even: 5, long: 2, dotted: 1, lomb: 0 }, leap: 3, cad: 3 },
  dallacasa: { era: 'renaissance', name: 'Dalla Casa & Bassano, 1584–91', n: [4, 6, 8], fam: { tirata: 5, gruppo: 1, arch: 2, passaggio: 3, tremolo: 0 }, rh: { even: 3, long: 1, dotted: 4, lomb: 1 }, leap: 2, cad: 3 },
  bovicelli: { era: 'renaissance', name: 'Bovicelli, 1594', n: [4, 6, 8, 12], fam: { tirata: 3, gruppo: 2, arch: 3, passaggio: 4, tremolo: 1 }, rh: { even: 3, long: 1, dotted: 4, lomb: 2 }, leap: 3, cad: 3 },
  caccini: { era: 'renaissance', name: 'Zacconi & Caccini, 1592–1601', n: [3, 4, 6], fam: { tirata: 2, gruppo: 5, arch: 1, passaggio: 1, tremolo: 3 }, rh: { even: 3, long: 3, dotted: 2, lomb: 0 }, leap: 1, cad: 4 },
};

const PLAIN = new Set([16, 8, 4, 2, 1, .5, .25]);
const DOTTED = new Set([12, 6, 3, 1.5, .75]);

export function rhythmFor(D, n, fam, minVal) {
  let lens;
  if (fam === 'even') lens = Array(n).fill(D / n);
  else if (fam === 'long') { if (n < 3) return null; lens = [D / 2, ...Array(n - 1).fill(D / 2 / (n - 1))]; }
  else if (fam === 'dotted' || fam === 'lomb') {
    if (n % 2) return null; const pair = 2 * D / n; lens = []; for (let i = 0; i < n / 2; i++) lens.push(...(fam === 'dotted' ? [pair * .75, pair * .25] : [pair * .25, pair * .75]));
  } else return null;
  for (const l of lens) { if (l < minVal - 1e-9) return null; if (!(PLAIN.has(l) || ((fam === 'dotted' || fam === 'lomb') && DOTTED.has(l)))) return null; }
  return lens;
}

export function classify(p) {
  const d = []; for (let i = 1; i < p.length; i++) d.push(Math.sign(p[i] - p[i - 1]));
  if (d.every(x => x === d[0] && x !== 0)) return 'tirata';
  const vals = new Set(p);
  if (vals.size === 2 && p.length >= 3 && d.every((x, i) => i === 0 || x === -d[i - 1])) return 'tremolo';
  const sc = d.filter((x, i) => i && x !== d[i - 1]).length;
  if (p.length === 4 && p[0] === p[2] && Math.abs(p[1] - p[0]) === 1 && p[3] === p[0] - (p[1] - p[0])) return 'gruppo';
  if (p.length >= 5 && p[0] === p[2] && p[1] - p[0] === -(p[3] - p[2]) && vals.size === 3 && d[0] !== 0 && p[4] === p[0]) return 'gruppo';
  if (sc === 1) return 'arch';
  return 'passaggio';
}

/* ---------- state ---------- */
export const noteMidi = (n, st) => midiOf(n, st.bflat);

export function expand(voice) {
  const out = []; let t = 0;
  voice.base.forEach((n, k) => {
    const d = voice.dims.get(k);
    if (d) d.notes.forEach((x, j) => { out.push({ step: x.step, acc: x.acc || '', len: x.len, rest: false, t, k, j, dim: true, fam: d.fam }); t += x.len; });
    else { out.push({ step: n.step, acc: n.acc || '', len: n.len, rest: !!n.rest, t, k, dim: false }); t += n.len; }
  });
  return out;
}

export function fromPiece(piece) {
  const voices = piece.voices.map(v => ({ name: v.name || '', clef: v.clef, base: v.notes.map(n => ({ step: n.step, acc: n.acc || '', len: n.len, rest: !!n.rest, o: n })), dims: new Map(), on: true, mute: false }));
  return { title: piece.title, credit: piece.credit, note: piece.note, trail: piece.trail, bflat: !!piece.bflat, piece, voices };
}

/* ---------- from the model to Cantare's engraver ---------- */
const VALS = [['Mx', 16], ['L', 8], ['B', 4], ['S', 2], ['M', 1], ['Sm', .5], ['F', .25]];
export function tokenOf(len) {
  for (const [v, l] of VALS) { if (Math.abs(len - l) < 1e-9) return { v, dot: false }; if (Math.abs(len - 1.5 * l) < 1e-9) return { v, dot: true }; }
  const f = VALS.find(([, l]) => l <= len + 1e-9) || VALS[VALS.length - 1]; return { v: f[0], dot: false };
}
/* the notes of a voice as Cantare's engraver wants them: plain notes as they were, figure notes as new notes */
export function engravable(st, exps, pieceOver = null) {
  const base = pieceOver || st.piece;
  const voices = base.voices.map((v, vi) => {
    const src = st.voices[vi].base;
    const notes = exps[vi].map((e, i) => {
      let n;
      if (!e.dim) { n = { ...(src[e.k].o || {}), step: e.step, acc: e.acc || '', rest: e.rest, len: e.len }; if (!n.v) Object.assign(n, tokenOf(e.len)); }
      else { n = { ...tokenOf(e.len), step: e.step, acc: e.acc || '', rest: false, col: false, ficta: false, len: e.len }; if (e.j === 0) { const o = src[e.k].o; if (o && o.text) { n.text = o.text; n.hyphen = o.hyphen; } } }
      n.t = e.t; n.src = i; return n;
    });
    return { ...v, notes, end: notes.length ? notes[notes.length - 1].t + notes[notes.length - 1].len : 0 };
  });
  return { ...base, voices, end: Math.max(0, ...voices.map(v => v.end)) };
}

export function snapshot(st) { return JSON.stringify(st.voices.map(v => ({ base: v.base, dims: [...v.dims] }))); }
export function restore(st, s) { JSON.parse(s).forEach((x, i) => { st.voices[i].base = x.base; st.voices[i].dims = new Map(x.dims); }); }

export function stripAll(st, vi = null) { st.voices.forEach((v, i) => { if (vi == null || vi === i) v.dims.clear(); }); }

/* reduction: keep only the notes that begin on a beat (a multiple of `unit` minims) or after a rest, and let each lengthen over the quick notes after it */
export function reduceVoice(v, unit = 2) {
  const ex = expand(v); const out = []; let t = 0;
  for (const n of ex) {
    const prev = out[out.length - 1];
    const keep = n.rest || !prev || prev.rest || (t % unit === 0 && n.len >= 1 - 1e-9) || n.len >= unit;
    if (keep) out.push({ step: n.step, acc: n.acc, len: n.len, rest: n.rest }); else prev.len += n.len;
    t += n.len;
  }
  v.base = out; v.dims = new Map();
}

/* ---------- context for the rules ---------- */
export function context(st) { const ex = st.voices.map(expand); return { st, ex }; }
const at = (arr, t) => { let lo = 0, hi = arr.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1, n = arr[m]; if (t < n.t - 1e-9) hi = m - 1; else if (t >= n.t + n.len - 1e-9) lo = m + 1; else return n; } return null; };
function overlapping(arr, a, b) { const out = []; let lo = 0, hi = arr.length - 1, s = arr.length; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m].t + arr[m].len > a + 1e-9) { s = m; hi = m - 1; } else lo = m + 1; } for (let i = s; i < arr.length && arr[i].t < b - 1e-9; i++) out.push(arr[i]); return out; }

const CONS = new Set([0, 3, 4, 7, 8, 9]);
const isCons = (semis, vsBass) => { const m = ((semis % 12) + 12) % 12; return CONS.has(m) || (m === 5 && !vsBass); };

export const DEFAULTS = {
  schools: ['coclico', 'ortiz', 'dallacasa'], density: 60, minDur: 2, minValue: .5, maxLeap: 2, targetLeap: 3,
  noSeventh: true, consBeat: true, passDiss: true, noParallels: true, noCross: true, noTritone: true, keepRange: true, keepFinal: true, cadences: true, beat: 2, maxSimul: 2, together: 50,
};

/* Check a figure (array of {step, len, acc?}) that would replace base note k of voice vi. Returns a list of broken rules. */
export function check(ctx, vi, k, fig, o) {
  const st = ctx.st, bad = new Set();
  const own = ctx.ex[vi]; const first = own.find(n => n.k === k); if (!first) return ['position'];
  const t0 = first.t; let t = t0;
  const notes = fig.notes.map(f => { const n = { step: f.step, acc: f.acc || '', len: f.len, t, rest: false }; t += f.len; return n; });
  const orig = st.voices[vi].base[k], tNext = st.voices[vi].base[k + 1];
  const nextT = fig.next;
  const mid = n => midiOf(n, st.bflat);
  /* melodic */
  const seq = [...notes]; if (nextT) seq.push({ step: nextT.step, acc: nextT.acc });
  for (let i = 1; i < seq.length; i++) {
    const dl = Math.abs(seq[i].step - seq[i - 1].step);
    const lim = i === seq.length - 1 && nextT ? o.targetLeap : o.maxLeap;
    if (dl > lim) bad.add('leap');
    if (o.noSeventh && (dl === 6 || dl === 8)) bad.add('seventh');
    if (o.noTritone && Math.abs(mid(seq[i]) - mid(seq[i - 1])) === 6) bad.add('tritone');
  }
  if (o.keepRange) { const all = own.filter(n => !n.rest).map(n => n.step); const lo = Math.min(...all) - 1, hi = Math.max(...all) + 1; if (notes.some(n => n.step < lo || n.step > hi)) bad.add('range'); }
  /* vertical */
  const others = ctx.ex.map((e, j) => j).filter(j => j !== vi);
  const lowestAt = (a, b) => { let m = 1e9; for (const j of others) for (const x of overlapping(ctx.ex[j], a, b)) if (!x.rest) m = Math.min(m, mid(x)); const o2 = mid(orig); return m; };
  notes.forEach((n, idx) => {
    const a = n.t, b = n.t + n.len, m = mid(n);
    const strong = idx > 0 && Math.abs(a / o.beat - Math.round(a / o.beat)) < 1e-9;
    for (const j of others) for (const x of overlapping(ctx.ex[j], a, b)) {
      if (x.rest) continue;
      const dstep = ((Math.abs(n.step - x.step) % 7) + 7) % 7;
      if (o.noSeventh && dstep === 6) bad.add('seventh');
      if (o.noCross && ctx.rank && ctx.rank[j] != null) { if (ctx.rank[j] < ctx.rank[vi] && n.step > x.step) bad.add('crosses a voice'); if (ctx.rank[j] > ctx.rank[vi] && n.step < x.step) bad.add('crosses a voice'); }
      if (idx > 0 && x.t <= a + 1e-9) { /* a sonority sounding at the onset of this note */
        const xm = mid(x), vsBass = Math.min(m, xm) <= Math.min(m, xm, lowestAt(a, a + 1e-3)) + 0;
        const cons = isCons(Math.abs(m - xm), vsBass);
        if (!cons) {
          if (o.consBeat && strong) bad.add('dissonance on the beat');
          else if (o.passDiss) {
            const prev = notes[idx - 1] || { step: first.step }, nx = notes[idx + 1] || nextT;
            const stepwise = Math.abs(n.step - prev.step) <= 1 && (!nx || Math.abs(n.step - nx.step) <= 1);
            if (!stepwise) bad.add('unprepared dissonance');
          }
        }
      }
    }
  });
  /* parallel fifths and octaves on the minim grid */
  if (o.noParallels) {
    const sample = (arr, tt) => at(arr, tt);
    const ownAt = tt => { if (tt >= t0 - 1e-9 && tt < t0 + first.len - 1e-9) { for (const n of notes) if (tt >= n.t - 1e-9 && tt < n.t + n.len - 1e-9) return n; } return sample(own, tt); };
    for (let tt = Math.ceil(t0 - 1 - 1e-9); tt <= t0 + first.len + 1e-9; tt++) {
      if (tt < t0 - 1 - 1e-9) continue;
      const a1 = ownAt(tt), a2 = ownAt(tt + 1); if (!a1 || !a2 || a1 === a2 || a1.rest || a2.rest) continue;
      if (a1.step === a2.step && a1.acc === a2.acc) continue;
      for (const j of others) {
        const b1 = at(ctx.ex[j], tt), b2 = at(ctx.ex[j], tt + 1); if (!b1 || !b2 || b1 === b2 || b1.rest || b2.rest) continue;
        const i1 = Math.abs(mid(a1) - mid(b1)) % 12, i2 = Math.abs(mid(a2) - mid(b2)) % 12;
        const perf = x => x === 0 || x === 7;
        if (perf(i1) && i1 === i2) { const da = Math.sign(mid(a2) - mid(a1)), db = Math.sign(mid(b2) - mid(b1)); if (da && da === db) bad.add('parallels'); }
      }
    }
  }
  return [...bad];
}

/* ---------- growing a figure ---------- */
const pick = (rng, weights) => { const e = Object.entries(weights).filter(([, w]) => w > 0); let r = rng() * e.reduce((a, [, w]) => a + w, 0); for (const [k, w] of e) if ((r -= w) < 0) return k; return e.length ? e[0][0] : null; };

function nextOf(voice, k) { const n = voice.base[k + 1]; return n && !n.rest ? n : null; }
export function isCadence(voice, k) {
  const n = voice.base[k], T = nextOf(voice, k); if (!T) return false;
  if (Math.abs(T.step - n.step) !== 1) return false;
  const after = voice.base[k + 2];
  return T.len >= 4 || !after || after.rest;
}

function grow(ctx, vi, k, o, rng, schoolKey) {
  const sc = SCHOOLS[schoolKey], v = ctx.st.voices[vi], n = v.base[k], T = nextOf(v, k), D = n.len;
  const cad = isCadence(v, k);
  const len = pick(rng, Object.fromEntries(sc.n.map(x => [x, 1]))); const nn = +len;
  const rhf = pick(rng, sc.rh); const lens = rhythmFor(D, nn, rhf, o.minValue); if (!lens) return null;
  const rel = T ? T.step - n.step : 0; const dir = rel === 0 ? (rng() < .5 ? 1 : -1) : Math.sign(rel);
  const p = [0]; let cur = 0;
  for (let j = 1; j < nn; j++) {
    const left = nn - j; let step;
    if (T && Math.abs(rel - cur) > left + 1 && rng() < .85) step = Math.sign(rel - cur) * (rng() < .18 && sc.leap >= 2 && Math.abs(rel - cur) > left + 2 ? 2 : 1);
    else { const r = rng(); step = r < .12 && sc.leap >= 2 ? (rng() < .5 ? 2 : -2) : (rng() < .5 ? 1 : -1); if (j === 1 && rng() < .6) step = dir; }
    cur += step; p.push(cur);
  }
  const last = p[p.length - 1];
  if (T) { if (last === rel) return null; if (cad && Math.abs(rel - last) !== 1) return null; } else if (Math.abs(last) > 1) return null;
  if (new Set(p).size < 2) return null;
  const fam = classify(p);
  if (rng() * 5 > sc.fam[fam] + .6 + (cad ? sc.cad * .3 : 0)) return null;
  return { notes: p.map((x, i) => ({ step: n.step + x, acc: i === 0 ? n.acc : '', len: lens[i] })), fam, rh: rhf, school: schoolKey, next: T ? { step: T.step, acc: T.acc } : null, cad };
}

export function candidates(ctx, vi, k, o, rng, want = 10, all = false) {
  const out = [], seen = new Set(); let tries = 0;
  const schools = o.schools.length ? o.schools : Object.keys(SCHOOLS);
  while (out.length < want && tries++ < (all ? 700 : 160)) {
    const f = grow(ctx, vi, k, o, rng, schools[Math.floor(rng() * schools.length)]); if (!f) continue;
    const key = f.notes.map(x => x.step + ':' + x.len).join(' '); if (seen.has(key)) continue; seen.add(key);
    f.broken = check(ctx, vi, k, f, o); if (f.broken.length && !all) continue;
    out.push(f);
  }
  if (all) out.sort((a, b) => a.broken.length - b.broken.length);
  return out;
}

export function applyFigure(st, vi, k, f) { st.voices[vi].dims.set(k, { notes: f.notes.map(x => ({ step: x.step, acc: x.acc || '', len: x.len })), fam: f.fam, rh: f.rh, school: f.school }); }

export function rankVoices(st) { const med = st.voices.map(v => { const s = v.base.filter(n => !n.rest).map(n => n.step).sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; }); const order = med.map((m, i) => [m, i]).sort((a, b) => b[0] - a[0]); const rank = []; order.forEach(([, i], r) => rank[i] = r); return rank; }

/* the time spans (in minims) in which a voice other than vi already carries a figure */
function othersBusy(st, vi) {
  const spans = [];
  st.voices.forEach((w, j) => { if (j === vi) return; let t = 0; w.base.forEach((n, k) => { if (w.dims.has(k)) spans.push([t, t + n.len, j]); t += n.len; }); });
  return spans;
}
export function diminuteVoice(st, vi, o, rng) {
  const v = st.voices[vi]; let count = 0, T = 0; const times = v.base.map(n => { const t = T; T += n.len; return t; });
  const lastSound = (() => { for (let i = v.base.length - 1; i >= 0; i--) if (!v.base[i].rest) return i; return -1; })();
  for (let k = 0; k < v.base.length; k++) {
    const n = v.base[k]; if (n.rest || v.dims.has(k) || n.len < o.minDur) continue;
    if (o.keepFinal && k === lastSound) continue;
    if (!o.cadences && isCadence(v, k)) continue;
    if (rng() * 100 >= o.density) continue;
    const busy = new Set(othersBusy(st, vi).filter(([a, b]) => a < times[k] + n.len - 1e-9 && b > times[k] + 1e-9).map(x => x[2]));
    if (busy.size + 1 > (o.maxSimul || 4)) continue;
    if (busy.size && rng() * 100 >= o.together) continue;
    const ctx = context(st); ctx.rank = rankVoices(st);
    const c = candidates(ctx, vi, k, o, rng, 1);
    if (c.length) { applyFigure(st, vi, k, c[0]); count++; }
  }
  return count;
}

export function countDims(st) { return st.voices.reduce((a, v) => a + v.dims.size, 0); }
export function smallest(st) { let m = 99; st.voices.forEach(v => v.dims.forEach(d => d.notes.forEach(x => { m = Math.min(m, x.len); }))); return m === 99 ? null : m; }
export function violations(st, o) {
  const ctx = context(st); ctx.rank = rankVoices(st); let bad = 0;
  st.voices.forEach((v, vi) => v.dims.forEach((d, k) => { const nx = nextOf(v, k); const f = { notes: d.notes, next: nx ? { step: nx.step, acc: nx.acc } : null }; if (check(ctx, vi, k, f, o).length) bad++; }));
  return bad;
}
