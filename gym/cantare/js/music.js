/* Music model: pitches, note values, clefs, and the conversion of library entries into pieces. */

/* A pitch is a diatonic "step": 7 * octave + degree, degree 0 = C. Middle C (C4) is step 28. */
export const DEGREE_NAMES = 'CDEFGAB';
const SEMITONES = [0, 2, 4, 5, 7, 9, 11];

export const stepName = s => DEGREE_NAMES[((s % 7) + 7) % 7] + Math.floor(s / 7);

/* Note values counted in minims. */
export const VALUE = { Mx: 16, L: 8, B: 4, S: 2, M: 1, Sm: 0.5, F: 0.25 };
export const VALUE_NAME = { Mx: 'Maxima', L: 'Longa', B: 'Brevis', S: 'Semibrevis', M: 'Minima', Sm: 'Semiminima', F: 'Fusa' };

/* Clefs: kind (C, F or G), the staff line it sits on (1 = lowest) and the step of that line. */
const CLEF_SPEC = {
  g1: ['G', 1], treble: ['G', 2], treble8: ['G', 2, -7],
  c1: ['C', 1], c2: ['C', 2], c3: ['C', 3], c4: ['C', 4], c5: ['C', 5],
  baritone: ['F', 3], bass: ['F', 4],
};
const KIND_STEP = { C: 28, F: 24, G: 32 };

export const CLEFS = Object.fromEntries(Object.entries(CLEF_SPEC).map(([id, [kind, line, shift = 0]]) => {
  const bottom = KIND_STEP[kind] + shift - 2 * (line - 1);
  const short = kind === 'F' ? 'F' + line : kind + line + (shift ? '₈' : '');
  return [id, { id, kind, line, shift, bottom, short }];
}));
export const CLEF_ORDER = ['c1', 'c2', 'c3', 'c4', 'baritone', 'bass', 'c5', 'g1', 'treble', 'treble8'];
const CHANT_CLEFS = ['c1', 'c2', 'c3', 'c4', 'baritone', 'bass'];

export function clefFor(id) { return CLEFS[id] || CLEFS.c4; }

/* Pick a clef that holds all the steps on the staff (with the given number of lines), preferring `want`. */
export function fitClef(steps, lines, want, pool = CHANT_CLEFS) {
  if (!steps.length) return clefFor(want);
  const lo = Math.min(...steps), hi = Math.max(...steps), top = 2 * (lines - 1);
  const fits = (c, slack) => lo - c.bottom >= -slack && hi - c.bottom <= top + slack;
  const w = clefFor(want === 'c5' ? 'baritone' : want);
  const order = [w, ...pool.map(clefFor).sort((a, b) => Math.abs(a.bottom - w.bottom) - Math.abs(b.bottom - w.bottom))];
  return order.find(c => pool.includes(c.id) && fits(c, 1)) || order.find(c => pool.includes(c.id) && fits(c, 3)) || w;
}

/* ---------- reading the library's note strings ---------- */
const TOKEN = /^(r)?(\d+)?(\^)?([bn#])?(Mx|Sm|L|B|S|M|F)(k)?(\.)?$/;

export function readTokens(text) {
  const notes = [];
  let last = 26;
  for (const tok of text.trim().split(/\s+/)) {
    const m = TOKEN.exec(tok);
    if (!m) throw new Error('Unreadable note: ' + tok);
    const [, rest, num, caret, acc, val, colored, dot] = m;
    const step = num ? +num : last;
    const n = { v: val, rest: !!rest, step, acc: rest ? '' : acc || '', dot: !!dot, col: !!colored, ficta: !!(caret && acc && !rest) };
    if (!rest) last = step;
    notes.push(n);
  }
  return notes;
}

/* a syllable ending in "-" continues in the next note; "_" stands for a space inside a syllable */
function putText(notes, text) {
  if (!text) return;
  const parts = text.trim().split(/\s+/);
  let i = 0;
  for (const n of notes) {
    if (n.rest || i >= parts.length) continue;
    let s = parts[i++];
    if (s === '.') continue;
    s = s.replace(/_/g, ' ');
    if (s.length > 1 && s.endsWith('-')) { n.text = s.slice(0, -1); n.hyphen = true; } else n.text = s;
  }
}

export function lengthOf(n, tempus) {
  let v = VALUE[n.v];
  if (tempus === 'O' && (n.v === 'B' || n.v === 'L' || n.v === 'Mx')) v = v * 1.5; /* perfect tempus: three semibreves to the brevis */
  if (n.dot) v *= 1.5;
  if (n.col) v *= 2 / 3;
  return v;
}

/* time stamps in minims */
/* Mensural reading of one voice in tempus perfectum (O), in minims, by the rules of the theorists:
   - a brevis next to a single semibreve (or its worth in smaller notes or rests) loses a third: imperfection,
     preferably by what follows it (a parte post), otherwise by what precedes it (a parte ante);
   - of two semibreves between breves, the second is doubled: alteration;
   - a dot after a brevis or longa keeps it perfect; a dot after a semibreve followed by a semibreve or a longer
     value separates the perfections (punctus divisionis); any other dot adds half the value.
   Prolatio minor and modus imperfectus throughout. */
const BIG = { Mx: 1, L: 1, B: 1 };
function perfectValues(notes) {
  const N = notes.length, v = new Array(N);
  const dotted = i => notes[i].dot && !notes[i].rest;
  const isDiv = i => dotted(i) && notes[i].v === 'S' && (i + 1 >= N || VALUE[notes[i + 1].v] >= 2);
  for (let i = 0; i < N; i++) {
    const m = VALUE[notes[i].v];
    v[i] = BIG[notes[i].v] ? m * 1.5 : (dotted(i) && !isDiv(i) ? m * 1.5 : m);
  }
  const done = new Set();
  const canImp = j => j !== null && !notes[j].rest && !dotted(j) && !done.has(j);
  const imperfect = j => { done.add(j); v[j] -= 2; };
  const alter = seg => {
    const k = seg[seg.length - 1], n = notes[k];
    if (seg.length < 2 || n.rest || n.v !== 'S' || dotted(k)) return false;
    v[k] = 4; return true;
  };
  const rest6 = seg => (((Math.round(seg.reduce((a, k) => a + v[k], 0) * 8)) % 48) + 48) % 48 / 8;
  let X = null, run = [];
  const settle = Y => {
    if (!run.length) return;
    const segs = [[]];
    run.forEach(k => { segs[segs.length - 1].push(k); if (isDiv(k)) segs.push([]); });
    if (!segs[segs.length - 1].length) segs.pop();
    if (segs.length === 1) {
      const sg = segs[0], r = rest6(sg);
      if (r === 2) { if (canImp(X)) imperfect(X); else if (canImp(Y)) imperfect(Y); }
      else if (r === 4) { if (!alter(sg) && canImp(X) && canImp(Y)) { imperfect(X); imperfect(Y); } }
    } else {
      segs.forEach((sg, j) => {
        const r = rest6(sg);
        if (r === 2 && j === 0 && canImp(X)) { imperfect(X); return; }
        if (r === 2 && j === segs.length - 1 && canImp(Y)) { imperfect(Y); return; }
        if (r === 4) alter(sg);
      });
    }
    run = [];
  };
  for (let i = 0; i < N; i++) {
    if (BIG[notes[i].v]) { settle(i); X = i; } else run.push(i);
  }
  settle(null);
  return v.map((x, i) => notes[i].col ? x * 2 / 3 : x);
}

/* tempus 'O' reads one voice by the mensural rules above; 'C' (and every voice of a polyphonic piece,
   whose values are written out as they sound, perfect breves with a dot) counts the values as written. */
export function stamp(notes, tempus) {
  const vals = tempus === 'O' ? perfectValues(notes) : notes.map(n => lengthOf(n, 'C'));
  let t = 0;
  notes.forEach((n, i) => { n.t = t; n.len = vals[i]; t += n.len; });
  return t;
}
export const readingOf = p => (p.voices && p.voices.length > 1 ? 'C' : p.tempus);

/* ---------- from library entry to piece ---------- */
export function pieceFrom(item, trail) {
  const tempus = item.t === 'O' ? 'O' : 'C';
  const base = { id: item.id, title: item.title, note: item.desc || '', trail, tempus, cut: !!item.cut, bflat: !!item.b };
  let kind, voices;

  if (item.poly) {
    kind = 'poly';
    voices = item.poly.map((v, i) => ({ clef: v.c || 'c4', name: v.nm || '', notes: readTokens(v.n), lyrics: i === 0 ? item.lyr || v.lyr : v.lyr }));
  } else if (item.n) {
    kind = item.fr ? 'fractus' : 'mensural';
    voices = [{ clef: item.c || 'c4', name: '', notes: readTokens(item.n), lyrics: item.lyr }];
  } else {
    kind = item.fr ? 'fractus' : 'chant';
    const s = item.s;
    voices = [{ clef: item.c || 'c4', name: '', lyrics: item.lyr,
      notes: s.map((step, i) => ({ v: i === s.length - 1 ? 'L' : 'B', rest: false, step, acc: (item.a && item.a[i]) || '', dot: false, col: false, ficta: false })) }];
  }
  if (item.st && item.v) { /* further voices written note against note beneath the tune */
    const sounding = voices[0].notes.filter(n => !n.rest);
    item.st.forEach((clef, k) => {
      const col = item.v[k] ? item.v[k].trim().split(/\s+/) : [];
      let j = 0;
      voices.push({ clef, name: '', lyrics: '', notes: voices[0].notes.map(n => {
        if (n.rest) return { ...n };
        const m = /^(\d+)([bn#])?$/.exec(col[j++] || '');
        return { ...n, step: m ? +m[1] : n.step, acc: m ? m[2] || '' : '' };
      }) });
      void sounding;
    });
  }
  const DEFAULT_NAMES = { 2: ['Superius', 'Tenor'], 3: ['Superius', 'Tenor', 'Bassus'], 4: ['Superius', 'Altus', 'Tenor', 'Bassus'] };
  if (voices.length > 1 && voices.every(v => !v.name) && DEFAULT_NAMES[voices.length]) voices.forEach((v, i) => { v.name = DEFAULT_NAMES[voices.length][i]; });
  voices.forEach(v => { putText(v.notes, v.lyrics); stamp(v.notes, voices.length > 1 ? 'C' : tempus); v.end = v.notes.length ? v.notes.at(-1).t + v.notes.at(-1).len : 0; });

  /* staff conventions: plainchant on four lines in a clef that holds it, everything mensural on five */
  const lines = kind === 'chant' ? 4 : 5;
  if (kind === 'chant') {
    const steps = voices[0].notes.filter(n => !n.rest).map(n => n.step);
    voices[0].clef = fitClef(steps, 4, voices[0].clef).id;
  }
  return { ...base, kind, lines, voices, end: Math.max(...voices.map(v => v.end)) };
}

/* ---------- pitch ---------- */
export function alterationOf(n, bflat) {
  if (n.acc === 'b') return -1;
  if (n.acc === '#') return 1;
  if (n.acc === 'n') return 0;
  return bflat && ((n.step % 7) + 7) % 7 === 6 ? -1 : 0;
}

export function midiOf(n, bflat, shift = 0) {
  const s = n.step + shift;
  return 12 * (Math.floor(s / 7) + 1) + SEMITONES[((s % 7) + 7) % 7] + alterationOf(n, bflat);
}

export const hz = (midi, a4 = 440) => a4 * Math.pow(2, (midi - 69) / 12);

/* A "shape" of a piece, used in the listing: kind, number of voices, compass in steps */
export function compass(piece) {
  const st = piece.voices[0].notes.filter(n => !n.rest).map(n => n.step);
  return st.length ? [Math.min(...st), Math.max(...st)] : [0, 0];
}

export const slug = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
