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
/* ---------- the names of the voices ----------
   Every part is called by one of the four names of the choirbook, Cantus, Altus, Tenor, Bassus, whatever the source calls it
   (Superius, Discantus, Contratenor altus, Contra, Quintus, Vagans …), so that its initial (C A T B) says where it sings.
   A contratenor is an Altus when it sings above the tenor or beside a bassus, else a Bassus; a part named only by its
   place in the set of partbooks (Quintus, Sextus, Vagans, a number) takes the name of the voices it lies with.
   Two or more parts of one kind are numbered from the top down, keeping the numbers of the source where it has them: Cantus 1, Cantus 2. */
const ROLE = [
  [/^(superius|superior( vox)?|discantus|discant|cantus|canon royal)$/, 'Cantus'],
  [/^(altus|contraltus|contratenor altus|contra acutus)$/, 'Altus'],
  [/^tenor$/, 'Tenor'],
  [/^(bassus|contrabassus|contratenor bass(us|is)|contra grauis|contra gravis|bar[iy](ton(ans)?|psaltes|phonus|canor)|barriphanos)$/, 'Bassus'],
  [/^(contra|contratenor)$/, 'contra'],
];
const ORD = { primus: 1, secundus: 2, tertius: 3, quartus: 4 }, ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6 };
function nameVoices(voices) {
  const DEFAULT = { 2: ['Cantus', 'Tenor'], 3: ['Cantus', 'Tenor', 'Bassus'], 4: ['Cantus', 'Altus', 'Tenor', 'Bassus'] };
  if (voices.length > 1 && voices.every(v => !v.name) && DEFAULT[voices.length]) { voices.forEach((v, i) => { v.name = DEFAULT[voices.length][i]; }); }
  if (voices.length < 2) {
    voices.forEach(v => { const r = ROLE.find(([re]) => re.test((v.name || '').toLowerCase().trim())); if (r && r[1] !== 'contra') v.name = r[1]; });
    return;
  }
  const mean = v => { const s = v.notes.filter(n => !n.rest).map(n => n.step); return s.length ? s.reduce((a, b) => a + b, 0) / s.length : 28; };
  const info = voices.map(v => {
    let raw = (v.name || '').replace(/[\[\]:]/g, '').replace(/\s+/g, ' ').trim().toLowerCase(), num = null;
    const pre = raw.match(/^(primus|secundus|tertius|quartus) (.+)$/); if (pre) { num = ORD[pre[1]]; raw = pre[2]; }
    const post = raw.match(/^(.*?)\s*\b(\d+|i{1,3}|iv|vi?|primus|secundus|tertius)$/);
    if (post && post[1]) { raw = post[1]; num = /\d/.test(post[2]) ? +post[2] : ROMAN[post[2]] || ORD[post[2]]; }
    const r = ROLE.find(([re]) => re.test(raw));
    return { v, raw, num, role: r ? r[1] : null, m: mean(v), clef: v.clef };
  });
  const avg = role => { const a = info.filter(x => x.role === role); return a.length ? a.reduce((s, x) => s + x.m, 0) / a.length : null; };
  const ten = avg('Tenor');
  /* a contratenor: beside a bassus, or above the tenor, it is the Altus; otherwise it is the lowest voice, the Bassus */
  const hasBass = info.some(x => x.role === 'Bassus');
  info.filter(x => x.role === 'contra').forEach(x => {
    const bass = avg('Bassus');
    x.role = (hasBass && (bass == null || x.m > bass)) || ten == null || x.m >= ten ? 'Altus' : 'Bassus';
  });
  /* the others lie with the voices nearest to them (where a kind is missing, its usual place relative to the tenor) */
  const al = avg('Altus'), t0 = ten ?? (al != null ? al - 2 : 26);
  const ref = { Cantus: avg('Cantus') ?? t0 + 6, Altus: al ?? t0 + 2, Tenor: ten ?? t0, Bassus: avg('Bassus') ?? t0 - 4 };
  /* a part written in the same clef as a named one counts as a step nearer to it: the clef says the range the part was written for */
  const near = (x, k) => Math.abs(ref[k] - x.m) - (info.some(y => y.role === k && y.clef === x.clef) ? 1 : 0);
  info.filter(x => !x.role).forEach(x => {
    x.role = Object.keys(ref).reduce((best, k) => near(x, k) < near(x, best) ? k : best, 'Tenor');
    x.num = null;
  });
  /* numbering: the numbers of the source where they are whole and distinct, the voice named plainly first, then by place */
  ['Cantus', 'Altus', 'Tenor', 'Bassus'].forEach(role => {
    const g = info.filter(x => x.role === role);
    if (g.length < 2) { g.forEach(x => { x.v.name = role; }); return; }
    const given = g.filter(x => x.num != null).map(x => x.num);
    if (new Set(given).size !== given.length || given.some(n => n > g.length)) g.forEach(x => { x.num = null; });
    const used = new Set(g.map(x => x.num).filter(n => n != null));
    let k = 1;
    const free = () => { while (used.has(k)) k++; used.add(k); return k; };
    g.filter(x => x.num == null).forEach(x => { x.num = free(); });
    g.forEach(x => { x.v.name = role + ' ' + x.num; });
  });
}

export function pieceFrom(item, trail) {
  const tempus = item.t === 'O' ? 'O' : 'C';
  /* a piece from the Josquin Research Project: its credit is kept apart from the description and shown under the music */
  let note = item.desc || '', credit = '';
  const jm = note.match(/\s*From the Josquin Research Project([\s\S]*?);\s*converted to Cantare notation \(tools\/kern2cantare\.py\)\./);
  if (jm) { credit = 'From the Josquin Research Project' + jm[1] + '.'; note = note.replace(jm[0], '').trim(); }
  const base = { id: item.id, title: item.title, note, credit: item.cr || credit, trail, tempus, cut: !!item.cut, bflat: !!item.b,
    /* a measured piece whose long and short notes run in threes although written without the O (cantus fractus), and its upbeat in minims */
    ternary: !!item.tern, beatOff: item.up || 0,
    /* the Josquin collection is converted with every value already at its full length (a perfect brevis written B.),
       so its O must not lengthen breves, longs and maximas a second time */
    abs: !!(jm || item.jrp) };
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
  nameVoices(voices);
  voices.forEach(v => { putText(v.notes, v.lyrics); stamp(v.notes, base.abs ? 'C' : tempus); v.end = v.notes.length ? v.notes.at(-1).t + v.notes.at(-1).len : 0; });

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
