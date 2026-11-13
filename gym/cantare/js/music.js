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
  baritone: ['F', 3], bass: ['F', 4], f5: ['F', 5],
  /* the gamma ut clef: Γ marks Γ ut, the low G (G2) */
  gamma3: ['Γ', 3], gamma4: ['Γ', 4], gamma5: ['Γ', 5],
};
const KIND_STEP = { C: 28, F: 24, G: 32, 'Γ': 18 };

export const CLEFS = Object.fromEntries(Object.entries(CLEF_SPEC).map(([id, [kind, line, shift = 0]]) => {
  const bottom = KIND_STEP[kind] + shift - 2 * (line - 1);
  const short = kind === 'F' ? 'F' + line : kind + line + (shift ? '₈' : '');
  return [id, { id, kind, line, shift, bottom, short }];
}));
export const CLEF_ORDER = ['c1', 'c2', 'c3', 'c4', 'c5', 'baritone', 'bass', 'f5', 'g1', 'treble', 'treble8'];
/* the palette also offers the gamma ut clef; it is never chosen automatically */
export const CLEF_PALETTE = [...CLEF_ORDER, 'gamma3', 'gamma4', 'gamma5'];
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
  if (!text || !text.trim()) return notes; /* an empty staff, to write on */
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
  if (n.alt) v *= 2; /* brevis altera: written as a brevis, lasting two */
  if (n.col) v *= 2 / 3;
  return v;
}

/* time stamps in minims */
export function stamp(notes, tempus) {
  let t = 0;
  for (const n of notes) { n.t = t; n.len = lengthOf(n, tempus); t += n.len; }
  return t;
}

/* ---------- from library entry to piece ---------- */
export function pieceFrom(item, trail) {
  const tempus = item.t === 'O' ? 'O' : 'C';
  /* a piece from the Josquin Research Project: its credit is kept apart from the description and shown under the music */
  let note = item.desc || '', credit = '';
  const jm = note.match(/\s*From the Josquin Research Project([\s\S]*?);\s*converted to Cantare notation \(tools\/kern2cantare\.py\)\./);
  if (jm) { credit = 'From the Josquin Research Project' + jm[1] + '.'; note = note.replace(jm[0], '').trim(); }
  const base = { id: item.id, title: item.title, note, credit, trail, tempus, cut: !!item.cut, bflat: !!item.b,
    /* a measured piece whose long and short notes run in threes although written without the O (cantus fractus), and its upbeat in minims */
    ternary: !!item.tern, beatOff: item.up || 0 };
  let kind, voices;

  if (item.poly) {
    kind = 'poly';
    voices = item.poly.map((v, i) => ({ clef: v.c || 'c4', name: v.nm || '', notes: readTokens(v.n), lyrics: i === 0 ? item.lyr || v.lyr : v.lyr }));
  } else if (item.n != null) {
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
  voices.forEach(v => { putText(v.notes, v.lyrics); stamp(v.notes, tempus); v.end = v.notes.length ? v.notes.at(-1).t + v.notes.at(-1).len : 0; });

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
