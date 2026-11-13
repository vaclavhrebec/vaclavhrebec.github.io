import { pieceFrom, stamp, CLEFS, CLEF_ORDER, clefFor, fitClef, midiOf, hz, slug, stepName, VALUE_NAME } from './music.js';
import { engraveSystems, systemSVG, styleOf, glyphIcon, setFont, headWidth } from './engrave.js';
import * as snd from './audio.js';
import { createMic, describe, spellMidi, median } from './mic.js';
import { createTake } from './take.js';
import { tr, setLang, getLang, guessLang, LANGS, translatePage } from './i18n.js';

const $ = s => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v); }
  kids.flat().forEach(c => e.append(c.nodeType ? c : document.createTextNode(c)));
  return e;
};

/* ------------------------------------------------------------------ state */
const STORE = 'cantare-next:v1';
const prefs = { theme: 'dark', tempo: 52, timbre: 'organ', a4: 440, zoom: 13, view: 'score', click: false, hand: true, volume: .8, names: true, font: 'manuscript', lang: '',
  /* singing: the dot follows the exact pitch; what is sung is written out; with speakers the organ is filtered out */
  micFlex: true, micDia: false, micNotate: true, micPhones: false, micCal: null, micLag: 0,
  /* the beat: which note value the tactus counts; loop; hear notes while editing; the organ's pipe settings */
  unit: 'B', loop: false, audition: true, sound: {} };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* storage may be blocked */ }
setFont(prefs.font);
snd.setSound(prefs.sound || {});
setLang(prefs.lang || guessLang());
const savePrefs = () => { try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (e) { /* ignore */ } };

const S = {
  library: [], flat: [],
  base: null,            /* the piece as read from the library */
  piece: null,           /* the piece as shown: talea, tempus applied */
  shift: 0,              /* transposition in diatonic steps */
  clefs: [],             /* clef overrides per voice */
  lines: 0,              /* 0 = automatic */
  tempus: null,          /* null = as written */
  talea: -1, taleaLook: 'chant',
  voice: [],             /* per voice: on | mute | hide */
  leaf: 0, leaves: [],
  playing: false, startAt: 0, sel: null, index: [], systems: null, edit: false,
};

/* talea patterns, in breves; a three is a perfect longa, six a perfect maxima */
const TALEAE = [
  ['Longa, brevis', [2, 1]], ['Brevis, longa', [1, 2]],
  ['Three breves, perfect longa', [1, 1, 1, 3]], ['Three breves, longa, brevis, perfect longa', [1, 1, 1, 2, 1, 3]],
  ['Three longas, perfect maxima', [2, 2, 2, 6]], ['Perfect longa, longa, brevis', [3, 2, 1]],
];

const T = { get hidden() { return tr('improvise this voice'); } };

/* ------------------------------------------------------------------ utilities */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); }

function applyTheme() {
  document.documentElement.dataset.theme = prefs.theme;
  document.querySelector('meta[name=theme-color]').content = prefs.theme === 'dark' ? '#0f1218' : prefs.theme === 'vellum' ? '#e6d7b3' : '#f1eadb';
}

/* ------------------------------------------------------------------ library */
let uid = 100000;
const jrpCache = {};
const jrpGet = path => (jrpCache[path] ||= fetch('jrp/' + path).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(e => { delete jrpCache[path]; throw e; }));
const dispTitle = it => it.title;

async function loadLibrary() {
  const [lib, tags] = await Promise.all([fetch('data/library.json').then(r => r.json()), fetch('data/taglines.json').then(r => r.json())]);
  /* the Josquin Research Project: far too much to carry at once, so it is fetched piece by piece, only when opened */
  lib.push({ group: 'Josquin Research Project', note: 'Masses, motets and songs from about 1420 to 1540, by Josquin, Ockeghem, La Rue, Busnoys, Du Fay and many more, in all their voices. From the Josquin Research Project (josquin.stanford.edu, Stanford University), CC BY-NC 4.0.', lazy: 'index.json', count: 1379 });
  lib.push({ group: 'Canons from the Josquin Research Project', note: 'Every piece of that collection that contains a canon, sorted by the interval of the answer. Each entry says which voice follows which: use Hide on the following voice and improvise it yourself.', lazy: 'canons.json', count: 216 });
  S.library = lib;
  (function walk(list, trail) { list.forEach(g => { const t = [...trail, g.group]; (g.items || []).forEach(it => { it.id ??= ++uid; S.flat.push({ item: it, trail: t }); }); if (g.subs) walk(g.subs, t); }); })(lib.filter(g => !g.lazy), []);
  $('#tagline').textContent = tags[Math.floor(Math.random() * tags.length)];
}

/* a lazy group fills itself in when it is first opened */
async function fillLazy(g, trail) {
  if (g.loaded || g.loading) return;
  g.loading = true; g.failed = false;
  try {
    const data = await jrpGet(g.lazy);
    if (g.lazy === 'index.json') g.subs = data.map(c => ({ group: c.group, note: c.note, lazy: 'c/' + c.code + '.json', count: c.count }));
    else g.subs = data.subs || [];
    if (data.items) g.items = data.items;
    (function walk(list, t) { list.forEach(x => { const tt = [...t, x.group]; (x.items || []).forEach(it => { it.id ??= ++uid; S.flat.push({ item: it, trail: tt }); }); if (x.subs) walk(x.subs, tt); }); })(g.subs || [], trail);
    (g.items || []).forEach(it => { it.id ??= ++uid; S.flat.push({ item: it, trail: [...trail, g.group] }); });
    g.loaded = true;
  } catch (e) { g.failed = true; }
  g.loading = false;
  renderTree($('#search').value);
}

/* a random piece: first a category at random (each equally likely), then a piece within it */
const RANDOM_GROUPS = ['Cantus planus', 'Cantus fractus', 'Cantus mensurabilis', 'Polyphonic models'];
function randomPick() {
  const pools = RANDOM_GROUPS.map(g => S.flat.filter(f => f.trail[0] === g)).filter(p => p.length);
  const pool = pools.length ? pools[Math.floor(Math.random() * pools.length)] : S.flat;
  return pool[Math.floor(Math.random() * pool.length)];
}

const countIn = g => (g.items || []).length + (g.subs || []).reduce((a, s) => a + countIn(s), 0);
const openGroups = new Set();
let jrpTitles = null;

function renderTree(filter = '') {
  const q = filter.trim().toLowerCase();
  const tree = $('#tree');
  tree.textContent = '';
  const make = (g, trail, first) => {
    const key = [...trail, g.group].join('/');
    const items = (g.items || []).filter(it => !q || (it.title + ' ' + (it.desc || '')).toLowerCase().includes(q));
    const subs = (g.subs || []).map(s => make(s, [...trail, g.group])).filter(Boolean);
    if (!items.length && !subs.length && !(g.lazy && !q)) return null;
    const d = el('details', { class: trail.length ? 'sub' : '' }, el('summary', {}, g.group, el('small', {}, String(g.count || countIn(g) || ''))));
    if (first || q || openGroups.has(key)) d.open = true;
    d.addEventListener('toggle', () => { if (d.open) { openGroups.add(key); if (g.lazy && !g.loaded) fillLazy(g, trail); } else openGroups.delete(key); });
    if (g.note && !q) d.append(el('p', { class: 'gnote' }, g.note));
    items.forEach(it => d.append(el('button', { class: 'item', 'data-id': it.id, 'aria-current': S.base && S.base.id === it.id ? 'true' : 'false', onclick: () => { openItem(it, [...trail, g.group]); if (innerWidth < 1100) closeDrawer('library'); } }, el('b', {}, it.title))));
    subs.forEach(x => d.append(x));
    if (g.lazy && !g.loaded) d.append(el('p', { class: 'more' }, g.failed ? tr('Could not load this part of the collection (offline?).') : g.loading || d.open ? tr('Loading…') : tr('Open to load.')));
    return d;
  };
  S.library.forEach((g, i) => { const d = make(g, [], i === 0); if (d) tree.append(d); });
  /* searching the whole Josquin collection by title and composer */
  if (q.length >= 3) {
    if (!jrpTitles) jrpGet('search.json').then(d => { jrpTitles = d; if ($('#search').value.trim().toLowerCase() === q) renderTree(filter); }).catch(() => {});
    else {
      const words = q.split(/\s+/);
      const hits = jrpTitles.filter(([, t, c]) => { const h = (t + ' ' + c).toLowerCase(); return words.every(w => h.includes(w)); }).slice(0, 60);
      if (hits.length) {
        const d = el('details', {}, el('summary', {}, tr('Josquin Research Project'), el('small', {}, String(hits.length) + (hits.length === 60 ? '+' : ''))));
        d.open = true;
        hits.forEach(([id, t, c]) => d.append(el('button', { class: 'item', onclick: async () => {
          try { const it = await jrpGet('p/' + id + '.json'); it.id ??= ++uid; openItem(it, ['Josquin Research Project', c]); if (innerWidth < 1100) closeDrawer('library'); } catch (e) { toast(tr('Could not load that piece (offline?).')); }
        } }, el('b', {}, t))));
        tree.append(d);
      }
    }
  }
  if (!tree.children.length) tree.append(el('p', { class: 'more' }, tr('Nothing found.')));
}

/* ------------------------------------------------------------------ opening a piece */
function openItem(item, trail, opts = {}) {
  stopPlayback();
  S.base = pieceFrom(item, trail.length ? trail : S.flat.find(f => f.item === item)?.trail || []);
  S.shift = 0; S.clefs = []; S.lines = 0; S.tempus = null; S.cut = null; S.talea = -1; S.taleaLook = 'chant'; S.leaf = 0; S.startAt = 0; S.sel = null;
  S.base.mine = !!item.mine;
  S.voice = S.base.voices.map(() => 'on');
  rebuildPiece();
  render(true);
  hist.undo = []; hist.redo = [];
  buildStudio(); buildTransform(); buildEditTools(); buildVoiceChips();
  document.querySelectorAll('.tree .item').forEach(b => b.setAttribute('aria-current', String(+b.dataset.id === item.id)));
  try { history.replaceState(null, '', item.mine ? location.pathname : '#' + slug(item.title)); } catch (e) { /* ignore */ }
  syncTitleEdit();
  $('#stage').scrollTop = 0;
  if (opts.toast) toast(opts.toast);
}

/* the shown piece derives from the base piece plus the Studio's choices */
function rebuildPiece() {
  take.clear();
  const b = S.base;
  const p = { ...b, voices: b.voices.map(v => ({ ...v, notes: v.notes.map(n => ({ ...n })) })) };
  if (S.tempus) p.tempus = S.tempus;
  if (S.cut != null) p.cut = S.cut;
  if (S.talea >= 0 && b.kind === 'chant') {
    const pat = TALEAE[S.talea][1], v = p.voices[0];
    v.notes.forEach((n, i) => {
      const br = pat[i % pat.length];
      const [val, dot] = br === 1 ? ['B', false] : br === 2 ? ['L', false] : br === 3 ? ['L', true] : br === 6 ? ['Mx', true] : ['B', false];
      n.v = val; n.dot = dot;
    });
    p.talea = true;
    if (S.taleaLook === 'mensural') { p.kind = 'mensural'; p.lines = 5; }
  }
  /* durations: in the talea every value is read in tempus imperfectum */
  p.voices.forEach(v => { stamp(v.notes, p.talea ? 'C' : p.tempus); v.end = v.notes.length ? v.notes.at(-1).t + v.notes.at(-1).len : 0; });
  p.end = Math.max(...p.voices.map(v => v.end));
  if (S.lines) p.lines = S.lines;
  else if (S.talea >= 0 && S.taleaLook === 'mensural') p.lines = 5;
  S.piece = p;
}

/* ------------------------------------------------------------------ drawing the page */
const paper = $('#paper');
const spaceW = () => Math.max(20, (paper.clientWidth || $('#stage').clientWidth - 40) - 40) / prefs.zoom;

function render(resetLeaf) {
  const p = S.piece;
  $('#trail').textContent = (p.trail || []).join('  ›  ');
  $('#title').textContent = p.title;
  $('#note').textContent = p.note + (p.talea ? ' Talea: ' + TALEAE[S.talea][0] + '.' : '');
  const useBook = prefs.view === 'book' && p.voices.length > 1;
  $('#pager').hidden = !useBook;
  paper.className = useBook ? 'book' : 'paper';
  paper.textContent = '';
  S.index = [];
  const opts = { clefs: S.clefs, state: S.voice, shift: S.shift, names: prefs.names, t: T, fullLast: S.edit };
  if (useBook) renderBook(p, opts, resetLeaf);
  else renderScore(p, opts);
  collectNotes();
  markSel();
}

function renderScore(p0, opts) {
  const w = spaceW();
  const { p, order } = withTake(p0);
  const systems = engraveSystems(p, order, w, opts);
  systems.forEach((s, i) => paper.append(el('div', { class: 'sys', 'data-sys': i, 'data-t0': s.t0, 'data-t1': s.t1 }, parse(systemSVG(s, prefs.zoom)))));
  paper.classList.toggle('singing', p !== p0);
  if (p !== p0) paper.querySelectorAll(`g[data-voice="${p.voices.length - 1}"]`).forEach(g => g.classList.add('sung'));
  S.systems = systems;
}

function renderBook(p, opts, resetLeaf) {
  const paneCss = (paper.clientWidth || $('#stage').clientWidth) / 2 - 36;
  const availH = Math.max(300, $('#stage').clientHeight - 130);
  /* first pass at the chosen size to learn how tall a line is, then shrink so that two lines per pane fit one screen */
  let scale = prefs.zoom;
  const probe = p.voices.map((_, i) => engraveSystems(p, [i], Math.max(18, paneCss / scale), { ...opts, names: false }));
  const maxH = Math.max(...probe.map(s => Math.max(...s.map(x => x.h))));
  scale = Math.max(8, Math.min(scale, (availH / 2 - 34) / (2 * maxH + 1.2)));
  S.bookScale = scale;
  const paneW = Math.max(18, paneCss / scale);
  const per = p.voices.map((_, i) => engraveSystems(p, [i], paneW, { ...opts, names: false }));
  const sysH = Math.max(...per.map(s => Math.max(...s.map(x => x.h)))) * scale + 14;
  const rows = Math.max(2, Math.floor((availH / 2 - 30) / sysH));
  /* leaves: every voice shows at most `rows` lines; the boundaries fall on starts of lines of any voice */
  const cuts = [...new Set(per.flatMap(s => s.map(x => x.t0)))].sort((a, b) => a - b);
  const leaves = [];
  let a = 0;
  while (a < cuts.length) {
    let b = a + 1;
    const fits = e => per.every(s => s.filter(x => x.t0 >= cuts[a] - 1e-6 && x.t0 < (e < cuts.length ? cuts[e] : Infinity) - 1e-6).length <= rows);
    while (b < cuts.length && fits(b + 1)) b++;
    leaves.push({ t0: cuts[a], t1: b < cuts.length ? cuts[b] : Infinity });
    a = b;
  }
  S.leaves = leaves;
  if (resetLeaf) S.leaf = 0;
  S.leaf = Math.min(S.leaf, leaves.length - 1);
  const L = leaves[S.leaf];
  $('#leafNo').textContent = `Leaf ${S.leaf + 1} of ${leaves.length}`;
  const order = p.voices.length === 3 ? [0, 1, 2, -1] : [0, 1, 2, 3];
  order.forEach(vi => {
    const pane = el('div', { class: 'pane' });
    if (vi >= 0 && vi < p.voices.length) {
      const v = p.voices[vi];
      if (v.name) pane.append(el('span', { class: 'tag' }, v.name));
      per[vi].filter(x => x.t0 >= L.t0 - 1e-6 && x.t0 < L.t1 - 1e-6).forEach(s => pane.append(el('div', { class: 'sys' }, parse(systemSVG(s, scale)))));
    }
    paper.append(pane);
  });
}

const parse = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

function collectNotes() {
  S.index = [...paper.querySelectorAll('.note')].map(e => ({ e, t: +e.dataset.t, end: +e.dataset.t + +e.dataset.len, on: false }));
}

/* ------------------------------------------------------------------ studio */
function chipRow(label, buttons) { return el('div', { class: 'row' }, label ? el('label', {}, label) : '', buttons); }
const chip = (text, pressed, fn, extra = {}) => el('button', { class: 'chip', 'aria-pressed': String(!!pressed), onclick: fn, ...extra }, text);

/* ---------- transforming the melody itself (all voices; undo brings it back) ---------- */
const VORDER = ['F', 'Sm', 'M', 'S', 'B', 'L', 'Mx'];
const IV = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12 }; /* perfect or major, in semitones */
const PERFECT = n => [1, 4, 5, 8].includes(n);
const semis = (q, n) => IV[n] + (PERFECT(n) ? { P: 0, A: 1, d: -1 }[q] : { M: 0, m: -1, A: 1, d: -2 }[q]);
const adv = { dir: 1, q: 'M', n: 2, exact: true };
/* move every note by d steps and c semitones, writing the sharps and flats that keep each interval exactly */
function transposeExact(d, c) {
  const bf = S.base.bflat;
  commit(() => S.base.voices.forEach(v => v.notes.forEach(n => {
    if (n.rest) return;
    const want = midiOf(n, bf, 0) + c;
    let st = n.step + d;
    for (let tries = 0; tries < 3; tries++) {
      const nat = midiOf({ step: st, acc: 'n' }, false, 0), a = want - nat;
      const sig = bf && ((st % 7) + 7) % 7 === 6 ? -1 : 0;
      if (a >= -1 && a <= 1) { n.step = st; n.acc = a === sig ? '' : a === 0 ? 'n' : a < 0 ? 'b' : '#'; if (!n.acc) n.ficta = false; return; }
      st += a > 0 ? 1 : -1; /* no double sharps or flats: the neighbouring step spells it */
    }
  })));
}
/* the next key on C D E F G A B♭, from the final of the melody */
function toneStep(dir) {
  const ns = S.base.voices[0].notes.filter(n => !n.rest); if (!ns.length) return;
  const fin = ns.at(-1), pc = ((midiOf(fin, S.base.bflat, 0) % 12) + 12) % 12;
  const KEYS = [0, 2, 4, 5, 7, 9, 10]; /* C D E F G A B♭ */
  const idx = KEYS.reduce((b, k, i) => (Math.abs(k - pc) < Math.abs(KEYS[b] - pc) ? i : b), 0);
  const to = (idx + dir + KEYS.length) % KEYS.length;
  let c = KEYS[to] - KEYS[idx];
  if (dir > 0 && c <= 0) c += 12; if (dir < 0 && c >= 0) c -= 12;
  transposeExact(dir, c);
}
function scaleValues(dir) {
  commit(() => S.base.voices.forEach(v => v.notes.forEach(n => { const i = VORDER.indexOf(n.v); if (i >= 0) n.v = VORDER[Math.max(0, Math.min(VORDER.length - 1, i + dir))]; })));
}

function buildTransform() {
  const b = S.base, c = $('#transformPop');
  c.textContent = '';
  const card = (title, ...kids) => { const d = el('section', { class: 'card' }, el('h3', {}, title), ...kids); c.append(d); return d; };
  const redo = () => { rebuildPiece(); render(); buildTransform(); buildVoiceChips(); };

  /* clefs */
  const multi = b.voices.length > 1;
  const clefCard = card(tr('Clef and staff'));
  b.voices.forEach((v, i) => {
    const cur = S.clefs[i] || v.clef;
    clefCard.append(el('div', { class: 'row' }, el('label', {}, multi ? (v.name || tr('Voice') + ' ' + (i + 1)) : tr('Clef')),
      el('select', { 'aria-label': tr('Clef'), onchange: e => { S.clefs[i] = e.target.value; render(); } }, ...CLEF_ORDER.map(k => el('option', { value: k, selected: k === cur }, CLEFS[k].short)))));
  });
  clefCard.append(chipRow(tr('Lines'), [[0, tr('Auto')], [4, '4'], [5, '5']].map(([n, t]) => chip(t, S.lines === n, () => { S.lines = n; redo(); }))));
  clefCard.append(el('p', { class: 'hint' }, tr('Plainchant stands on four lines, everything mensural on five; Auto follows that rule.')));

  /* pitch */
  const range = (() => { const st = b.voices[0].notes.filter(n => !n.rest).map(n => n.step + S.shift); return st.length ? stepName(Math.min(...st)) + '–' + stepName(Math.max(...st)) : ''; })();
  card(tr('Pitch'),
    el('div', { class: 'row' }, el('label', {}, tr('Step')), chip('−', false, () => { S.shift -= 1; redo(); }), chip('+', false, () => { S.shift += 1; redo(); }),
      el('label', {}, tr('Octave')), chip('−', false, () => { S.shift -= 7; redo(); }), chip('+', false, () => { S.shift += 7; redo(); }), chip(tr('Reset'), false, () => { S.shift = 0; redo(); })),
    el('p', { class: 'hint' }, `Melody now spans ${range}. Steps move every voice along the white keys, so the mode stays as it is.`),
    el('div', { class: 'row' }, chip(tr('Tone up'), false, () => toneStep(1), { title: tr('Move the whole melody up to the next key on C D E F G A B♭, adding sharps and flats to the notes where needed') }),
      chip(tr('Tone down'), false, () => toneStep(-1), { title: tr('Move the whole melody down to the previous key on C D E F G A B♭, adding sharps and flats to the notes where needed') })));
  /* advanced transposition: any interval, up or down, exact or along the scale */
  const qs = PERFECT(adv.n) ? [['P', tr('perfect')], ['A', tr('augmented')], ['d', tr('diminished')]] : [['M', tr('major')], ['m', tr('minor')], ['A', tr('augmented')], ['d', tr('diminished')]];
  if (!qs.some(([k]) => k === adv.q)) adv.q = qs[0][0];
  const NUM = [[1, 'unison'], [2, 'second'], [3, 'third'], [4, 'fourth'], [5, 'fifth'], [6, 'sixth'], [7, 'seventh'], [8, 'octave']];
  card(tr('Advanced transposition'),
    chipRow(tr('Direction'), [chip(tr('Up'), adv.dir > 0, () => { adv.dir = 1; buildTransform(); }), chip(tr('Down'), adv.dir < 0, () => { adv.dir = -1; buildTransform(); })]),
    el('div', { class: 'row' },
      el('select', { 'aria-label': tr('Quality of the interval'), onchange: e => { adv.q = e.target.value; } }, ...qs.map(([k, n]) => el('option', { value: k, selected: k === adv.q }, n))),
      el('select', { 'aria-label': tr('Interval'), onchange: e => { adv.n = +e.target.value; buildTransform(); } }, ...NUM.map(([k, n]) => el('option', { value: k, selected: k === adv.n }, tr(n))))),
    el('label', { class: 'row check', title: tr('On: every interval stays exactly the same, so D minor becomes G minor, with sharps and flats on the notes. Off: every note moves the same number of steps along the scale, so D dorian becomes E phrygian') },
      el('input', { type: 'checkbox', checked: adv.exact, onchange: e => { adv.exact = e.target.checked; } }), tr('Respect intervallic structure')),
    el('div', { class: 'row' }, chip(tr('Transpose'), true, () => {
      const d = adv.dir * (adv.n - 1);
      if (adv.exact) transposeExact(d, adv.dir * semis(adv.q, adv.n));
      else commit(() => S.base.voices.forEach(v => v.notes.forEach(n => { if (!n.rest) n.step += d; })));
    })));
  card(tr('Note values'),
    el('div', { class: 'row' }, chip(tr('Double all values'), false, () => scaleValues(1), { title: tr('Doubles every note and rest: brevis becomes longa, and so on') }),
      chip(tr('Halve all values'), false, () => scaleValues(-1), { title: tr('Halves every note and rest: brevis becomes semibrevis, and so on') })));

  /* mensuration */
  const t = S.tempus || b.tempus;
  if (b.kind !== 'chant') {
    card(tr('Mensuration'),
      chipRow(tr('Tempus'), [['C', false, 'C', tr('Tempus imperfectum')], ['C', true, '¢', tr('Tempus imperfectum diminutum, alla breve')], ['O', false, 'O', tr('Tempus perfectum')], ['O', true, '⌀', tr('Tempus perfectum diminutum')]]
        .map(([k, cut, sign, name]) => chip(sign, t === k && !!(S.cut ?? b.cut) === cut, () => { S.tempus = k; S.cut = cut; redo(); }, { title: name, 'aria-label': name }))),
      el('p', { class: 'hint' }, tr('In tempus perfectum a brevis holds three semibreves.')));
  } else {
    const looks = [['chant', tr('Chant notation')], ['mensural', tr('Mensural notation')]];
    card(tr('Talea'),
      el('div', { class: 'row' }, chip(tr('None'), S.talea < 0, () => { S.talea = -1; redo(); })),
      ...TALEAE.map(([name], i) => el('div', { class: 'row' }, chip(`${i + 1}. ${name}`, S.talea === i, () => { S.talea = i; redo(); }))),
      S.talea >= 0 ? chipRow(tr('Shown as'), looks.map(([k, n]) => chip(n, S.taleaLook === k, () => { S.taleaLook = k; redo(); }))) : '',
      el('p', { class: 'hint' }, 'A talea lays a repeating rhythmic pattern over the chant. Dotted values are perfect.'));
  }

}

/* a labelled slider with its value; `done` runs when the hand lets go */
function slider(label, min, max, value, fn, step = 1, unit = '', done) {
  const out = el('output', {}, value + unit);
  return el('div', { class: 'row slider' }, el('label', {}, label),
    el('input', { type: 'range', min, max, step, value, oninput: e => { const v = +e.target.value; out.textContent = v + unit; fn(v); }, onchange: () => { testTone(); if (done) done(); } }), out);
}
function setSound(o) { snd.setSound(o); prefs.sound = { ...snd.SOUND }; savePrefs(); }
/* a short note to hear what a setting does */
function testTone() { if (S.playing) return; const ctx = snd.ensure(); playNote({ timbre: prefs.timbre, midi: 57, a4: prefs.a4, at: ctx.currentTime + .02, dur: .7, text: 'a' }); }

function buildStudio() {
  const b = S.base, c = $('#cards');
  c.textContent = '';
  const multi = b.voices.length > 1;
  const card = (title, ...kids) => { const d = el('section', { class: 'card' }, el('h3', {}, title), ...kids); c.append(d); return d; };

  /* sound */
  card(tr('Sound'),
    chipRow(tr('Timbre'), Object.entries(snd.TIMBRES).map(([k, v]) => chip(tr(v.label), prefs.timbre === k, () => { prefs.timbre = k; if (k === 'voice') snd.prepare(); savePrefs(); buildStudio(); testTone(); }))),
    el('div', { class: 'row' }, el('label', {}, tr('Volume')), el('input', { type: 'range', min: 0, max: 100, value: Math.round(prefs.volume * 100), oninput: e => { prefs.volume = e.target.value / 100; snd.setVolume(prefs.volume); savePrefs(); } })),
    chipRow(tr('Pitch'), [...[415, 440, 466].map(h => chip('a′ = ' + h, prefs.a4 === h, () => { prefs.a4 = h; savePrefs(); syncMicOpt(); buildStudio(); })),
      el('label', { class: 'hzin', title: tr('The pitch of a′ in Hz') }, 'a′ =', el('input', { type: 'number', min: 300, max: 600, step: 'any', inputmode: 'decimal', value: prefs.a4,
        onchange: e => { const v = +e.target.value; if (v >= 300 && v <= 600) { prefs.a4 = v; savePrefs(); syncMicOpt(); buildStudio(); } } }), 'Hz')]),
    slider(tr('Brightness'), 0, 100, snd.SOUND.bright, v => setSound({ bright: v })),
    slider(tr('Room'), 0, 100, snd.SOUND.room, v => setSound({ room: v })),
    chipRow('', [chip(tr('Hear notes while editing'), prefs.audition, () => { prefs.audition = !prefs.audition; savePrefs(); buildStudio(); })]),
    chipRow(tr('Tactus'), [chip(tr('Click'), prefs.click, () => { prefs.click = !prefs.click; savePrefs(); buildStudio(); }), chip(tr('Hand'), prefs.hand, () => { prefs.hand = !prefs.hand; savePrefs(); syncHand(); buildStudio(); })]));

  /* the organ registers speak with the pipe settings; Your own takes the drawbars */
  if (snd.REG[prefs.timbre] || prefs.timbre === 'custom') {
    const pipe = card(tr('Pipes'));
    [['atk', 'Attack', 0, 300, 1, ' ms'], ['rel', 'Release', 10, 600, 5, ' ms'], ['chiff', 'Chiff', 0, 100, 1, ''], ['ens', 'Ensemble', 0, 12, .1, ' ct'], ['wind', 'Wind', 0, 100, 1, ''], ['scoop', 'Scoop', 0, 30, 1, ' ct']]
      .forEach(([k, label, a, b, st, u]) => pipe.append(slider(tr(label), a, b, snd.SOUND[k], v => setSound({ [k]: v }), st, u)));
    pipe.append(el('h4', {}, tr('Harmonics, as organ drawbars')));
    const bars = prefs.timbre === 'custom' ? snd.SOUND.draw : snd.drawOf(prefs.timbre);
    snd.FEET.forEach((ft, i) => pipe.append(slider(ft, 0, 100, bars[i], v => {
      if (prefs.timbre !== 'custom') { setSound({ draw: snd.drawOf(prefs.timbre) }); prefs.timbre = 'custom'; savePrefs(); }
      const d = [...snd.SOUND.draw]; d[i] = v; setSound({ draw: d });
    }, 1, '', () => buildStudio())));
    pipe.append(el('div', { class: 'row' }, chip(tr('Copy sound settings'), false, async e => {
      const t = `Sound: ${tr(snd.TIMBRES[prefs.timbre].label)}; brightness ${snd.SOUND.bright}; room ${snd.SOUND.room}; attack ${snd.SOUND.atk} ms; release ${snd.SOUND.rel} ms; chiff ${snd.SOUND.chiff}; wind ${snd.SOUND.wind}; scoop ${snd.SOUND.scoop} cents; ensemble ${snd.SOUND.ens} cents; drawbars ${snd.FEET.map((f, i) => f + '=' + (prefs.timbre === 'custom' ? snd.SOUND.draw : bars)[i]).join(' ')}; volume ${Math.round(prefs.volume * 100)}; a′ = ${prefs.a4} Hz`;
      try { await navigator.clipboard.writeText(t); toast(tr('Copied')); } catch (err) { window.prompt('', t); }
    }, { title: tr('Copies the current sound settings as text, to send to whoever is tuning the sound') })));
  }

  /* view */
  card(tr('View'),
    chipRow(tr('Notation'), [['manuscript', tr('Manuscript')], ['bravura', tr('Engraved')]].map(([k, n]) => chip(n, prefs.font === k, () => { prefs.font = k; setFont(k); savePrefs(); render(true); buildStudio(); }))),
    chipRow(tr('Layout'), [['score', tr('Score')], ['book', tr('Choir book')]].map(([k, n]) => chip(n, prefs.view === k, () => { prefs.view = k; savePrefs(); S.leaf = 0; render(true); buildStudio(); }, { disabled: k === 'book' && !multi }))),
    el('div', { class: 'row' }, el('label', {}, tr('Size')), el('input', { type: 'range', min: 9, max: 24, value: prefs.zoom, oninput: e => { prefs.zoom = +e.target.value; savePrefs(); render(); } })),
    chipRow(tr('Theme'), [['dark', 'Dark'], ['light', 'Light'], ['vellum', 'Vellum']].map(([k, n]) => chip(tr(n), prefs.theme === k, () => { prefs.theme = k; savePrefs(); applyTheme(); buildStudio(); }, k === 'vellum' ? { title: tr('Vellum and a rastrum: the music on an old page') } : {}))),
    chipRow(tr('Screen'), [chip(tr('Focus'), document.documentElement.classList.contains('focus'), () => setFocus(true), { title: tr('Only the music: everything else is put away') }),
      document.fullscreenEnabled ? chip(tr('Full screen'), !!document.fullscreenElement, () => toggleFull()) : ''].filter(Boolean)));

  card(tr('Share'), el('div', { class: 'row' }, chip(tr('Copy link'), false, async () => {
    const url = linkOf(b);
    try { await navigator.clipboard.writeText(url); toast(tr('Link copied')); } catch (e) { toast(url); }
  }, { title: tr('Copy a link that opens this exact melody') }), chip(tr('Print'), false, () => window.print())),
    el('div', { class: 'row' }, b.mine
      ? chip(tr('Delete this melody'), false, () => { mine = mine.filter(x => x.id !== b.id); saveMineList(); mineGroup(); renderTree($('#search').value); const pick = randomPick(); openItem(pick.item, pick.trail); })
      : chip(tr('Keep as my melody'), false, () => { const it = itemOf(b); it.title = b.title; adoptMine(it); toast(tr('Kept under Your melodies.')); }, { title: tr('Keep this melody, as it is now, among your own, to change and send') })));
}

function buildVoiceChips() {
  const box = $('#voiceChips');
  box.textContent = '';
  if (S.base.voices.length < 2) return;
  S.base.voices.forEach((v, i) => {
    const set = st => () => { S.voice[i] = S.voice[i] === st ? 'on' : st; render(); buildVoiceChips(); if (S.playing) { /* sound follows at once */ } };
    box.append(el('div', { class: 'vc' }, el('span', {}, v.name || tr('Voice') + ' ' + (i + 1)),
      el('button', { 'aria-pressed': String(S.voice[i] === 'mute'), title: tr('Seen, not heard: sing it from the notation'), onclick: set('mute') }, tr('Mute')),
      el('button', { 'aria-pressed': String(S.voice[i] === 'hide'), title: tr('Neither seen nor heard: improvise it'), onclick: set('hide') }, tr('Hide'))));
  });
}


/* ------------------------------------------------------------------ editing (only after the pencil is tapped) */
const hist = { undo: [], redo: [] };
const snap = () => JSON.stringify(S.base.voices.map(v => v.notes));
function afterEdit() {
  S.base.voices.forEach(v => { stamp(v.notes, S.base.tempus); v.end = v.notes.length ? v.notes.at(-1).t + v.notes.at(-1).len : 0; });
  S.base.end = Math.max(...S.base.voices.map(v => v.end));
  stopPlayback();
  rebuildPiece(); render(); buildEditTools(); buildTransform();
}
function commit(change) {
  hist.undo.push(snap()); if (hist.undo.length > 200) hist.undo.shift();
  hist.redo = [];
  change(); afterEdit(); keepMine();
}
function restoreSnap(js) { JSON.parse(js).forEach((ns, i) => { S.base.voices[i].notes = ns; }); if (S.sel && !S.base.voices[S.sel.vi].notes[S.sel.i]) S.sel = null; afterEdit(); }
const undo = () => { if (hist.undo.length) { hist.redo.push(snap()); restoreSnap(hist.undo.pop()); keepMine(); } };
const redoEdit = () => { if (hist.redo.length) { hist.undo.push(snap()); restoreSnap(hist.redo.pop()); keepMine(); } };
const selNote = () => (S.sel ? S.base.voices[S.sel.vi]?.notes[S.sel.i] : null);
function markSel() {
  paper.querySelectorAll('.note.sel').forEach(x => x.classList.remove('sel'));
  if (S.sel && S.edit) paper.querySelector(`.note[data-v="${S.sel.vi}"][data-i="${S.sel.i}"]`)?.classList.add('sel');
}
function select(vi, i) { S.sel = { vi, i }; markSel(); buildEditTools(); }
/* the notes the organ has sounded lately, so the microphone can tell the organ from the singer */
const SOUNDED = [];
function playNote(o) {
  snd.note(o);
  SOUNDED.push({ t0: o.at, t1: o.at + o.dur, f: hz(o.midi, o.a4) });
  if (SOUNDED.length > 400) SOUNDED.splice(0, SOUNDED.length - 400);
}
function hear(n) { if (!n || n.rest || !prefs.audition) return; const ctx = snd.ensure(); playNote({ timbre: prefs.timbre, midi: midiOf(n, S.piece.bflat, S.shift), a4: prefs.a4, text: n.text, at: ctx.currentTime + .02, dur: .6 }); }

const EDIT = {
  pitch(d) { const n = selNote(); if (!n || n.rest) return; commit(() => { n.step = Math.max(7, Math.min(55, n.step + d)); }); hear(selNote()); },
  value(v) { const n = selNote(); if (n) commit(() => { n.v = v; }); },
  rest() { const n = selNote(); if (n) commit(() => { n.rest = !n.rest; if (n.rest) n.acc = ''; }); },
  dot() { const n = selNote(); if (n) commit(() => { n.dot = !n.dot; }); },
  acc(a) { const n = selNote(); if (n && !n.rest) commit(() => { n.acc = n.acc === a ? '' : a; n.ficta = false; }); },
  del() {
    if (!S.sel) return;
    const { vi, i } = S.sel, ns = S.base.voices[vi].notes;
    if (ns.length < 2 && !S.base.mine) return;
    commit(() => { ns.splice(i, 1); S.sel = ns.length ? { vi, i: Math.min(i, ns.length - 1) } : null; });
  },
  add() {
    const vi = S.sel ? S.sel.vi : 0, ns = S.base.voices[vi].notes, at = S.sel ? S.sel.i : ns.length - 1;
    const src = ns[at] || { step: 28 };
    commit(() => { ns.splice(at + 1, 0, { v: src.v || 'B', rest: false, step: src.step, acc: '', dot: false, col: false, ficta: false }); S.sel = { vi, i: at + 1 }; });
  },
  move(d) { if (!S.sel) return; const ns = S.base.voices[S.sel.vi].notes, i = Math.max(0, Math.min(ns.length - 1, S.sel.i + d)); select(S.sel.vi, i); hear(ns[i]); },
};

const ICON = {
  undo: '<svg class="ico" viewBox="0 0 24 24"><path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12" transform="translate(0 -5)"/></svg>',
  redo: '<svg class="ico" viewBox="0 0 24 24"><path d="M15 7l5 5-5 5"/><path d="M20 12H10a6 6 0 0 0 0 12" transform="translate(0 -5)"/></svg>',
  left: '<svg class="ico" viewBox="0 0 24 24"><path d="M14.500 5l-7 7 7 7"/></svg>',
  right: '<svg class="ico" viewBox="0 0 24 24"><path d="M9.500 5l7 7-7 7"/></svg>',
  up: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 14.500l7-7 7 7"/></svg>',
  down: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 9.500l7 7 7-7"/></svg>',
  dot: '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.600" fill="currentColor"/></svg>',
  plus: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 7h14M10 7V4.500h4V7M7 7l1 13h8l1-13"/></svg>',
};

function buildEditTools() {
  const box = $('#editTools');
  box.hidden = !S.edit;
  $('#editBtn').setAttribute('aria-pressed', String(S.edit));
  box.textContent = '';
  $('#toolbar').classList.toggle('editing', S.edit);
  if (!S.edit) { syncTitleEdit(); return; }
  const n = selNote(), has = !!n;
  const btn = (html, title, fn, o = {}) => { const b = el('button', { class: 'tbtn' + (o.on ? ' on' : ''), title, 'aria-label': title, disabled: !!o.dis, onclick: fn }); b.innerHTML = html; return b; };
  const grp = (...k) => el('div', { class: 'tb-group' }, ...k.flat());
  box.append(
    grp(btn(ICON.undo, tr('Undo'), undo, { dis: !hist.undo.length }), btn(ICON.redo, tr('Redo'), redoEdit, { dis: !hist.redo.length })),
    grp(btn(ICON.left, tr('Previous note'), () => EDIT.move(-1), { dis: !has }), btn(ICON.right, tr('Next note'), () => EDIT.move(1), { dis: !has }),
      btn(ICON.up, tr('Higher'), () => EDIT.pitch(1), { dis: !has || n.rest }), btn(ICON.down, tr('Lower'), () => EDIT.pitch(-1), { dis: !has || n.rest })),
    grp(['Mx', 'L', 'B', 'S', 'M', 'Sm', 'F'].map(v => btn(glyphIcon('note', v), VALUE_NAME[v], () => { if (has) EDIT.value(v); else { S.inDur = v; buildEditTools(); } }, { on: has ? n.v === v : (S.inDur || 'S') === v }))),
    grp(btn(glyphIcon('rest'), tr('Rest'), () => { if (has) EDIT.rest(); else { S.inRest = !S.inRest; buildEditTools(); } }, { on: has ? n.rest : !!S.inRest }), btn(ICON.dot, tr('Dot'), () => EDIT.dot(), { on: has && n.dot, dis: !has })),
    grp([['b', tr('Flat')], ['n', tr('Natural')], ['#', tr('Sharp')]].map(([k, t]) => btn(glyphIcon('acc', k), t, () => EDIT.acc(k), { on: has && n.acc === k, dis: !has || n.rest }))),
    grp(btn(ICON.plus, tr('Add a note after this one'), () => EDIT.add()), btn(ICON.trash, tr('Delete'), () => EDIT.del(), { dis: !has })),
  );
  $('#toolbar').classList.toggle('editing', S.edit);
  if (!has) box.append(el('span', { class: 'edit-hint' }, tr('Tap a note to select it, or tap the staff to put a note there.')));
  syncTitleEdit();
}

$('#clearBtn').addEventListener('click', () => newMelody());
$('#editBtn').addEventListener('click', () => {
  S.edit = !S.edit;
  if (!S.edit) S.sel = null;
  buildEditTools(); render(); markSel();
});
$('#transformBtn').addEventListener('click', e => {
  e.stopPropagation();
  const pop = $('#transformPop'); pop.hidden = !pop.hidden;
  if (!pop.hidden) { const r = $('#toolbar').getBoundingClientRect(); pop.style.top = (r.bottom + 6) + 'px'; }
  $('#transformBtn').setAttribute('aria-expanded', String(!pop.hidden));
});
document.addEventListener('click', e => { const pop = $('#transformPop'); if (!pop.hidden && e.target.isConnected && !pop.contains(e.target)) { pop.hidden = true; $('#transformBtn').setAttribute('aria-expanded', 'false'); } });

/* ------------------------------------------------------------------ playback */
/* the beat in minimae: a brevis holds six of them in tempus perfectum, a longa twice the brevis */
const beatMinims = () => { const O = S.piece.tempus === 'O' && !S.piece.talea; return { L: O ? 12 : 8, B: O ? 6 : 4, S: 2, M: 1 }[prefs.unit] || (O ? 6 : 4); };
const spm = () => (60 / prefs.tempo) / beatMinims(); /* seconds per minim */

let timer = 0, raf = 0, clock = null;

/* the tactus hand: down on the beat (positio), up halfway through it (elevatio) */
const thArm = document.getElementById('thArm'), thHand = document.getElementById('thHand');
function poseHand(lift) {
  thArm.style.transform = `rotate(${(lift - .5) * 5}deg)`;
  thHand.style.transform = `rotate(${(lift - .5) * 16}deg)`;
}
function beatHand(pos) {
  const ph = ((pos / beatMinims()) % 1 + 1) % 1;
  poseHand((1 - Math.cos(2 * Math.PI * ph)) / 2);
}
function syncHand() {
  $('#tactusHand').hidden = !prefs.hand;
  $('#tactusHand').classList.toggle('beating', !!S.playing);
  if (!S.playing) poseHand(.5);
}

function sounding() {
  const out = [];
  S.piece.voices.forEach((v, vi) => {
    if (S.voice[vi] !== 'on') return;
    v.notes.forEach(n => { if (!n.rest) out.push({ vi, n }); });
  });
  return out.sort((a, b) => a.n.t - b.n.t);
}

function startPlayback() {
  const ctx = snd.ensure();
  snd.setVolume(prefs.volume);
  const p = S.piece, from = S.startAt || 0, k = spm();
  const events = sounding().filter(e => e.n.t + e.n.len > from + 1e-6);
  let ei = 0, bi = Math.ceil(from / (S.piece.tempus === 'O' ? 6 : 4));
  const t0 = ctx.currentTime + .15;
  clock = { t0, from, k, end: p.end, ended: false };
  recHook(ctx, t0, from);
  singStart(from);
  const beat = beatMinims();
  const pump = () => {
    const horizon = ctx.currentTime + 1.2;
    while (ei < events.length && t0 + (events[ei].n.t - from) * k < horizon) {
      const { vi, n } = events[ei++];
      const at = t0 + Math.max(0, n.t - from) * k;
      const cut = Math.max(0, from - n.t);
      playNote({ timbre: prefs.timbre, midi: midiOf(n, p.bflat, S.shift), a4: prefs.a4, at, text: n.text, dur: Math.max(.08, (n.len - cut) * k - .03), level: .2 / Math.sqrt(Math.max(1, p.voices.length)) });
    }
    while (prefs.click && bi * beat < p.end && t0 + (bi * beat - from) * k < horizon) { snd.click(t0 + (bi * beat - from) * k, bi % 1 === 0 && bi % 3 === 0); bi++; }
  };
  pump();
  timer = setInterval(pump, 150);
  setPlaying(true);
  frame();
}

function stopPlayback(keep) {
  clearInterval(timer); cancelAnimationFrame(raf);
  recStop();
  singStop();
  clock = null;
  if (S.playing) setPlaying(false);
  S.index.forEach(x => { if (x.on) { x.e.classList.remove('on'); x.on = false; } });
}

function setPlaying(on) {
  S.playing = on;
  $('#playIcon').innerHTML = on ? '<path d="M7 6h3v12H7zM14 6h3v12h-3z"/>' : '<path d="M8 5.500v13l10.500-6.500z"/>';
  $('#play').setAttribute('aria-label', on ? tr('Stop') : tr('Play'));
  syncHand();
}

let lastSys = -1, lastLeaf = -1;
function frame() {
  if (!clock) return;
  const pos = clock.from + (snd.now() - clock.t0) / clock.k;
  if (prefs.hand) beatHand(Math.max(0, pos));
  if (pos >= clock.end + 0.5) { stopPlayback(); S.startAt = 0; if (prefs.loop) startPlayback(); return; }
  for (const x of S.index) {
    const on = x.t <= pos && pos < x.end;
    if (on !== x.on) { x.on = on; x.e.classList.toggle('on', on); }
  }
  /* follow the music */
  if (paper.classList.contains('book')) {
    const li = S.leaves.findIndex(l => pos >= l.t0 - 1e-6 && pos < l.t1);
    if (li >= 0 && li !== S.leaf) { S.leaf = li; render(); if (S.playing) { /* keep the highlight on */ } }
  } else if (S.systems) {
    const si = S.systems.findIndex(s => pos >= s.t0 && pos < s.t1);
    if (si >= 0 && si !== lastSys) {
      lastSys = si;
      const node = paper.children[si], st = $('#stage');
      const r = node.getBoundingClientRect(), sr = st.getBoundingClientRect();
      if (r.top < sr.top + 40 || r.bottom > sr.bottom - 40) st.scrollTo({ top: st.scrollTop + r.top - sr.top - 90, behavior: 'smooth' });
    }
  }
  raf = requestAnimationFrame(frame);
}

/* tapping a note plays it and sets where playback begins */
paper.addEventListener('click', e => {
  if (held) { held = false; return; }
  const g = e.target.closest('.note');
  if (!g) {
    /* with Edit on, a click on the staff puts a note there; on the clef and signs it opens their settings */
    if (!S.edit) return;
    const h = staffHit(e);
    if (!h) return;
    if (h.inHead) { $('#transformBtn').click(); return; }
    putNote(h.vi, h.at, h.step, S.inRest);
    return;
  }
  const t = +g.dataset.t, vi = +g.dataset.v, i = +g.dataset.i;
  if (vi >= S.piece.voices.length) return; /* the written-out singing */
  if (S.edit) {
    const bn = S.base.voices[vi].notes[i];
    /* a click on a rest puts a note in its place */
    if (bn && bn.rest && !S.inRest) { const h = staffHit(e); if (h) { commit(() => { bn.rest = false; bn.step = h.step; bn.acc = S.inAcc || ''; S.sel = { vi, i }; }); hear(selNote()); return; } }
    select(vi, i); hear(bn); return;
  }
  const n = S.piece.voices[vi].notes[i];
  S.startAt = t;
  paper.querySelectorAll('.note.sel').forEach(x => x.classList.remove('sel'));
  g.classList.add('sel');
  if (!n.rest && !S.playing) { const ctx = snd.ensure(); playNote({ timbre: prefs.timbre, midi: midiOf(n, S.piece.bflat, S.shift), a4: prefs.a4, text: n.text, at: ctx.currentTime + .02, dur: .7 }); }
  if (S.playing) { stopPlayback(true); startPlayback(); }
});

$('#play').addEventListener('click', () => { if (S.playing) { stopPlayback(); } else startPlayback(); });
$('#tempo').addEventListener('input', e => { prefs.tempo = +e.target.value; $('#bpm').textContent = prefs.tempo; savePrefs(); if (S.playing) { const pos = clock.from + (snd.now() - clock.t0) / clock.k; stopPlayback(true); S.startAt = pos; startPlayback(); } });
/* the beat: which value the tactus counts, tapping it, and looping */
const UNITS = [['L', 'Longa'], ['B', 'Brevis'], ['S', 'Semibrevis'], ['M', 'Minima']];
function setTempo(v) {
  prefs.tempo = Math.max(10, Math.min(300, Math.round(v))); $('#tempo').value = prefs.tempo; $('#bpm').textContent = prefs.tempo; savePrefs();
  if (S.playing && clock) { const pos = clock.from + (snd.now() - clock.t0) / clock.k; stopPlayback(true); S.startAt = pos; startPlayback(); }
}
function buildUnits() {
  const sel = $('#unit'); sel.textContent = '';
  UNITS.forEach(([k, n]) => sel.append(el('option', { value: k, selected: prefs.unit === k }, tr(n) + ' = ' + tr('tactus'))));
}
$('#unit').addEventListener('change', e => { prefs.unit = e.target.value; setTempo(prefs.tempo); });
const taps = [];
$('#tap').addEventListener('click', () => {
  const t = performance.now();
  if (taps.length && t - taps[taps.length - 1] > 2500) taps.length = 0;
  taps.push(t); if (taps.length > 6) taps.shift();
  if (taps.length >= 2) setTempo(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)));
});
const syncLoop = () => $('#loopBtn').setAttribute('aria-pressed', String(prefs.loop));
$('#loopBtn').addEventListener('click', () => { prefs.loop = !prefs.loop; savePrefs(); syncLoop(); });
$('#prevLeaf').addEventListener('click', () => { S.leaf = Math.max(0, S.leaf - 1); render(); });
$('#nextLeaf').addEventListener('click', () => { S.leaf = Math.min(S.leaves.length - 1, S.leaf + 1); render(); });
document.addEventListener('keydown', e => {
  if (e.target.matches('input, select, textarea')) return;
  if (e.target.isContentEditable) return;
  if (e.code === 'Space') { e.preventDefault(); $('#play').click(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redoEdit(); else undo(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const VK = ['Mx', 'L', 'B', 'S', 'M', 'Sm', 'F'];
  if (/^[a-gA-G]$/.test(e.key)) { e.preventDefault(); typeNote(e.key.toUpperCase()); return; }
  if (e.key === 'r' || e.key === 'R') { e.preventDefault(); typeRest(); return; }
  if (/^[1-7]$/.test(e.key)) { e.preventDefault(); const v = VK[+e.key - 1]; if (S.sel) EDIT.value(v); else { S.inDur = v; buildEditTools(); } return; }
  if (S.sel && (e.key === '-' || e.key === 'n' || e.key === 'N' || e.key === '=')) { e.preventDefault(); EDIT.acc(e.key === '-' ? 'b' : e.key === '=' ? '#' : 'n'); return; }
  if (S.sel && e.key === '.') { e.preventDefault(); EDIT.dot(); return; }
  if (e.key === 'Escape' && S.sel) { S.sel = null; markSel(); buildEditTools(); return; }
  if (S.sel && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); EDIT.pitch(e.key === 'ArrowUp' ? 7 : -7); return; }
  if (S.sel && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); EDIT.del(); return; }
  if (S.edit && S.sel) {
    if (e.key === 'ArrowUp') { e.preventDefault(); EDIT.pitch(1); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); EDIT.pitch(-1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); EDIT.move(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); EDIT.move(-1); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); EDIT.del(); return; }
  }
  if (e.key === 'ArrowRight' && !$('#pager').hidden) $('#nextLeaf').click();
  if (e.key === 'ArrowLeft' && !$('#pager').hidden) $('#prevLeaf').click();
});

/* ------------------------------------------------------------------ composing: your own melodies */
/* Clear starts a melody on an empty staff. Your melodies are kept in this browser, listed first in the library,
   and Copy link carries the whole melody in the address, so it opens anywhere. */
const MINE = 'cantare-next:mine';
let mine = [];
try { mine = JSON.parse(localStorage.getItem(MINE) || '[]'); } catch (e) { mine = []; }
mine.forEach(it => { it.id = ++uid; it.mine = true; });
const saveMineList = () => { try { localStorage.setItem(MINE, JSON.stringify(mine.map(({ id, ...it }) => it))); } catch (e) { /* ignore */ } };
const tokOf = n => n.rest ? 'r' + n.v + (n.dot ? '.' : '') : n.step + (n.ficta && n.acc ? '^' : '') + (n.acc || '') + n.v + (n.col ? 'k' : '') + (n.dot ? '.' : '');
/* the base piece as a library item */
function itemOf(b) {
  const it = { title: b.title, t: b.tempus, b: b.bflat || undefined, cut: b.cut || undefined, mine: true };
  if (b.voices.length > 1) it.poly = b.voices.map(v => ({ c: v.clef, nm: v.name, n: v.notes.map(tokOf).join(' '), lyr: v.lyrics || undefined }));
  else { it.c = b.voices[0].clef; it.n = b.voices[0].notes.map(tokOf).join(' '); if (b.voices[0].lyrics) it.lyr = b.voices[0].lyrics; }
  return it;
}
function mineGroup() {
  let g = S.library.find(x => x.mine);
  if (!mine.length) { if (g) S.library.splice(S.library.indexOf(g), 1); return; }
  if (!g) { g = { group: tr('Your melodies'), mine: true, note: tr('Kept in this browser. Copy link sends one anywhere.'), items: [] }; S.library.unshift(g); }
  g.group = tr('Your melodies'); g.items = mine;
}
function keepMine() {
  if (!S.base || !S.base.mine) return;
  const it = mine.find(x => x.id === S.base.id);
  if (!it) return;
  Object.assign(it, itemOf(S.base), { id: it.id });
  saveMineList();
}
function adoptMine(item, open = true) {
  item.id ??= ++uid; item.mine = true;
  mine.unshift(item); saveMineList(); mineGroup(); renderTree($('#search').value);
  if (open) { openItem(item, [tr('Your melodies')]); S.base.mine = true; }
}
function newMelody() {
  const cur = S.base;
  adoptMine({ title: tr('Your own melody'), n: '', c: cur && cur.kind !== 'chant' ? cur.voices[0].clef : 'c4', t: 'C', mine: true });
  S.edit = true; S.sel = null; S.inDur = 'S'; S.inRest = false; buildEditTools(); render(); markSel();
  toast(tr('Tap the staff to put a note there, or type A to G.'));
}
function linkOf(b) {
  if (!b.mine) return location.origin + location.pathname + '#' + slug(b.title);
  const json = JSON.stringify(itemOf(b)), bytes = new TextEncoder().encode(json);
  let bin = ''; bytes.forEach(x => { bin += String.fromCharCode(x); });
  return location.origin + location.pathname + '#w=' + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function itemFromLink(h) {
  try {
    const b64 = h.replace(/-/g, '+').replace(/_/g, '/'), bin = atob(b64);
    const it = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
    return it && (it.n != null || it.poly) ? it : null;
  } catch (e) { return null; }
}

/* where on the staff a click or tap falls: which voice, which step, and between which notes */
function staffHit(e) {
  const svg = e.target.closest && e.target.closest('svg.system');
  const sysEl = svg && svg.closest('.sys');
  if (!svg || !sysEl || !S.systems) return null;
  const sys = S.systems[+sysEl.dataset.sys];
  if (!sys) return null;
  const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  const lines = S.piece.lines;
  const real = sys.staves.filter(st => st.vi < S.piece.voices.length && S.voice[st.vi] !== 'hide');
  if (!real.length) return null;
  const dist = st => { const y = q.y - st.y; return y < -1.5 ? -1.5 - y : y > lines + .5 ? y - lines - .5 : 0; };
  const st = real.reduce((a, b) => (dist(b) < dist(a) ? b : a));
  const vi = st.vi, clef = clefFor(S.clefs[vi] || S.piece.voices[vi].clef);
  const step = Math.round(clef.bottom + 2 * ((lines - 1) - (q.y - st.y))) - S.shift;
  const head = headWidth(S.piece, clef);
  /* the notes of this voice on this line, by their place */
  const els = [...svg.querySelectorAll(`.note[data-v="${vi}"]`)].map(g => { const bb = g.getBBox(); return { i: +g.dataset.i, x: bb.x + bb.width / 2 }; });
  const before = els.filter(x => x.x < q.x);
  const at = before.length ? before[before.length - 1].i + 1 : els.length ? els[0].i : S.base.voices[vi].notes.length;
  return { vi, step: Math.max(7, Math.min(55, step)), at, inHead: q.x < head - .2 };
}
function putNote(vi, at, step, rest) {
  const ns = S.base.voices[vi].notes;
  commit(() => { ns.splice(at, 0, { v: S.inDur || 'S', rest: !!rest, step, acc: rest ? '' : S.inAcc || '', dot: false, col: false, ficta: false }); S.sel = { vi, i: at }; });
  hear(selNote());
}
/* A to G: that note in the octave closest to the note before */
function typeNote(letter) {
  if (!S.base) return;
  const vi = S.sel ? S.sel.vi : 0, ns = S.base.voices[vi].notes, at = S.sel ? S.sel.i + 1 : ns.length;
  let prev = null;
  for (let i = at - 1; i >= 0; i--) if (!ns[i].rest) { prev = ns[i].step; break; }
  if (prev === null) { const c = clefFor(S.clefs[vi] || S.base.voices[vi].clef); prev = c.bottom + S.piece.lines - 1; }
  const d = 'CDEFGAB'.indexOf(letter);
  let best = d, bd = 99;
  for (let k = 0; k < 9; k++) { const s = d + 7 * k; if (Math.abs(s - prev) < bd) { bd = Math.abs(s - prev); best = s; } }
  if (!S.edit) { S.edit = true; }
  putNote(vi, at, best, false);
}
function typeRest() {
  if (!S.base) return;
  const vi = S.sel ? S.sel.vi : 0, ns = S.base.voices[vi].notes, at = S.sel ? S.sel.i + 1 : ns.length;
  if (!S.edit) S.edit = true;
  putNote(vi, at, 28, true);
}
/* right-click (or press and hold): a note becomes a rest of the same value; a rest goes away */
function noteToRest(vi, i) {
  const ns = S.base.voices[vi].notes, n = ns[i];
  if (!n) return;
  if (n.rest) commit(() => { ns.splice(i, 1); S.sel = ns.length ? { vi, i: Math.max(0, i - 1) } : null; });
  else commit(() => { n.rest = true; n.acc = ''; S.sel = { vi, i }; });
}
paper.addEventListener('contextmenu', e => {
  if (!S.edit) return;
  const g = e.target.closest('.note');
  if (!g || +g.dataset.v >= S.piece.voices.length) return;
  e.preventDefault(); noteToRest(+g.dataset.v, +g.dataset.i);
});
let holdT = 0, held = false;
paper.addEventListener('pointerdown', e => {
  held = false;
  if (!S.edit || e.pointerType === 'mouse') return;
  const g = e.target.closest('.note');
  if (!g || +g.dataset.v >= S.piece.voices.length) return;
  clearTimeout(holdT);
  holdT = setTimeout(() => { held = true; noteToRest(+g.dataset.v, +g.dataset.i); }, 550);
});
['pointerup', 'pointercancel', 'pointermove'].forEach(k => paper.addEventListener(k, e => { if (k !== 'pointermove' || Math.abs(e.movementY) + Math.abs(e.movementX) > 4) clearTimeout(holdT); }));

/* the title of your own melody can be written over */
const titleEl = $('#title');
titleEl.addEventListener('input', () => { if (S.base && S.base.mine) { S.base.title = titleEl.textContent.trim() || tr('Your own melody'); keepMine(); renderTree($('#search').value); } });
titleEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); } });
const syncTitleEdit = () => { const on = !!(S.edit && S.base && S.base.mine); titleEl.contentEditable = on ? 'true' : 'false'; titleEl.classList.toggle('editable', on); };

/* ------------------------------------------------------------------ focus and full screen */
function setFocus(on) {
  document.documentElement.classList.toggle('focus', on);
  if (on) closeDrawer('studio');
  if (S.piece) setTimeout(() => render(), 60);
}
function toggleFull() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else document.documentElement.requestFullscreen().catch(() => {});
}
document.addEventListener('fullscreenchange', () => { if (S.base) buildStudio(); });
document.body.append(el('div', { class: 'focusbar' },
  document.fullscreenEnabled ? el('button', { title: tr('Full screen'), 'aria-label': tr('Full screen'), onclick: toggleFull }, '⛶') : '',
  el('button', { title: tr('Leave focus'), 'aria-label': tr('Leave focus'), onclick: () => setFocus(false) }, '×')));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.documentElement.classList.contains('focus') && !S.sel) setFocus(false); });

/* ------------------------------------------------------------------ drawers, theme, search */
const relayout = () => {};
const syncLibBtn = () => $('#openLib').setAttribute('aria-pressed', String($('#library').dataset.open === 'true'));
function openDrawer(id) { $('#' + id).dataset.open = 'true'; syncLibBtn(); if (innerWidth >= 1100) relayout(); }
function closeDrawer(id) { $('#' + id).dataset.open = 'false'; syncLibBtn(); if (innerWidth >= 1100) relayout(); }
const toggleDrawer = id => ($('#' + id).dataset.open === 'true' ? closeDrawer : openDrawer)(id);
$('#openLib').addEventListener('click', () => toggleDrawer('library'));
$('#openStudio').addEventListener('click', () => toggleDrawer('studio'));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeDrawer(b.dataset.close)));
$('#toggleTheme').addEventListener('click', () => { prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark'; savePrefs(); applyTheme(); if (S.base) buildStudio(); });
$('#search').addEventListener('input', e => renderTree(e.target.value));

/* ------------------------------------------------------------------ microphone, singing and recording */
const mic = createMic(() => snd.ensure());
const take = createTake();
const rec = { me: false, listen: null, src: null };
const syncMicOpt = () => { mic.opt.flex = prefs.micFlex; mic.opt.phones = prefs.micPhones; mic.opt.a4 = prefs.a4; };
syncMicOpt();
/* which organ notes the microphone may be hearing right now: those sounding, and those that ended under 0.6 s ago */
mic.organ = now => {
  const cur = [], prev = []; let prevAge = 1;
  for (let i = SOUNDED.length - 1; i >= 0; i--) {
    const x = SOUNDED[i];
    if (now >= x.t0 - .02 && now < x.t1 + .05) { if (!cur.includes(x.f)) cur.push(x.f); }
    else if (x.t1 <= now && now - x.t1 < .6) { if (!prev.includes(x.f)) prev.push(x.f); prevAge = Math.min(prevAge, now - x.t1); }
  }
  return { cur, prev, prevAge };
};

/* writing out the singing: only while the music plays with the microphone open and Notate on */
const takeShown = () => mic.on && prefs.micNotate && take.parts.length > 0;
const semi = () => spm() / 2; /* seconds per semiminima */
const takeCtx = () => ({
  c: semi(), shown: mic.shown, peak: mic.peak, O: S.piece.tempus === 'O' && !S.piece.talea, dia: prefs.micDia, bflat: S.piece.bflat,
  cal: prefs.micCal, lagGuess: prefs.micLag,
  learn: d => { prefs.micLag = Math.round((prefs.micLag * .4 + d * .6) * 1000) / 1000; savePrefs(); },
});
let takeRender = 0;
const takeChanged = () => { if (!takeRender) takeRender = requestAnimationFrame(() => { takeRender = 0; render(); }); };
function singStart(from) {
  const had = take.parts.length;
  take.clear();
  if (mic.on && prefs.micNotate && !rec.listen) take.start(from * 2);
  if (had) takeChanged();
}
function singStop() {
  if (!clock || !take.on) return;
  const pos = clock.from + (snd.now() - clock.t0) / clock.k;
  const changed = take.finish(Math.min(pos, clock.end) * 2, takeCtx());
  take.on = false;
  if (changed || take.parts.length) takeChanged();
}
mic.onRaw = (now, mm, q, rms, onset) => {
  if (!take.on || !clock) return;
  const u = 2 * (clock.from + (now - mic.lag(prefs.micCal) - (prefs.micCal != null ? 0 : prefs.micLag) - clock.t0) / clock.k);
  if (take.record(u, mm, q, rms, onset, takeCtx())) takeChanged();
};

/* the take as a voice of its own, in red, above the music or below it when it was sung below */
function withTake(p) {
  const order = p.voices.map((_, i) => i);
  if (!takeShown()) return { p, order };
  const notes = take.notes(p.bflat);
  const steps = notes.filter(n => !n.rest).map(n => n.step);
  const first = p.voices.findIndex((_, i) => S.voice[i] !== 'hide');
  const ref = p.voices[first < 0 ? 0 : first];
  const refClef = clefFor(S.clefs[first] || ref.clef);
  let clef = refClef.id;
  if (steps.length) {
    const mid = refClef.bottom + p.lines - 1;
    if (Math.abs(median(steps) - mid) > 4.5) clef = fitClef(steps, p.lines, refClef.id, p.kind === 'chant' ? undefined : CLEF_ORDER).id;
  }
  /* above, unless nearly all of it was sung below the note of the music at that moment */
  let below = 0, n = 0;
  notes.forEach(q => {
    if (q.rest) return;
    const cf = ref.notes.find(x => x.t <= q.t + 1e-6 && q.t < x.t + x.len - 1e-6);
    if (!cf || cf.rest) return;
    n++; if (q.midi < midiOf(cf, p.bflat, S.shift)) below++;
  });
  const above = !(n && below >= .8 * n);
  const tk = { clef, name: tr('You'), notes, lyrics: '', sung: true, end: notes.length ? notes.at(-1).t + notes.at(-1).len : 0 };
  const voices = [...p.voices, tk];
  const vi = voices.length - 1;
  S.clefs[vi] = undefined;
  const at = above ? order.indexOf(first < 0 ? 0 : first) : order.length;
  order.splice(at, 0, vi);
  return { p: { ...p, voices, end: Math.max(p.end, tk.end) }, order };
}

/* the sung pitch as a faint red dot on the staff: next to the note being played, or at the end when nothing plays.
   While the singing is written out, the dot is the pen, on the red staff, where the music has got to. */
let dotWhere = null;
function dotTarget() {
  if (!S.piece || paper.classList.contains('book')) return null;
  const takeVi = takeShown() ? S.piece.voices.length : -1;
  const audible = S.piece.voices.findIndex((_, i) => S.voice[i] !== 'hide');
  if (clock) {
    const on = S.index.find(x => x.on && +x.e.dataset.v === (audible < 0 ? 0 : audible)) || S.index.find(x => x.on && +x.e.dataset.v < S.piece.voices.length);
    if (on) {
      const svg = on.e.closest('svg.system'), bb = on.e.getBBox();
      const gv = takeVi >= 0 && svg.querySelector(`g[data-voice="${takeVi}"]`) ? takeVi : +on.e.dataset.v;
      return { svg, vi: gv, x: bb.x + bb.width + .45 };
    }
  }
  const sys = [...paper.querySelectorAll('svg.system')].pop();
  if (!sys) return null;
  const vb = sys.viewBox.baseVal;
  const vi = audible < 0 ? 0 : audible;
  return sys.querySelector(`g[data-voice="${vi}"]`) ? { svg: sys, vi, x: vb.width - 1.6, end: true } : null;
}
function drawDot(hit) {
  const old = paper.querySelector('.micdot');
  if (!hit || hit.snap == null || !S.piece) { if (old) old.remove(); return; }
  const tg = dotTarget();
  if (!tg) { if (old) old.remove(); return; }
  const g = tg.svg.querySelector(`g[data-voice="${tg.vi}"]`);
  const sung = tg.vi >= S.piece.voices.length;
  const clefId = sung ? withTake(S.piece).p.voices[tg.vi]?.clef : (S.clefs[tg.vi] || S.piece.voices[tg.vi].clef);
  const clef = clefFor(clefId), lines = S.piece.lines;
  const sp = spellMidi(hit.snap), sig = S.piece.bflat && sp.L === 6 ? -1 : 0;
  const acc = sp.alt === sig ? '' : sp.alt < 0 ? '♭' : sp.alt > 0 ? '♯' : '♮';
  const y0 = (lines - 1) - (sp.s - clef.bottom) / 2;
  const cents = prefs.micFlex ? Math.max(-50, Math.min(50, (hit.midi - hit.snap) * 100)) : 0;
  const y = y0 - cents / 100 * .5, r = .5;
  const vb = tg.svg.viewBox.baseVal;
  const x = Math.min(tg.x + (acc ? .9 : 0), vb.width - r - .2);
  let ledg = '';
  for (let k = -1; k >= Math.floor(y0); k--) ledg += `<path d="M${(x - .9).toFixed(2)} ${k}h1.8" class="staffline"/>`;
  for (let k = lines; k <= Math.ceil(y0); k++) ledg += `<path d="M${(x - .9).toFixed(2)} ${k}h1.8" class="staffline"/>`;
  const html = `${ledg}${acc ? `<text x="${(x - 1.1).toFixed(2)}" y="${(y0 + .45).toFixed(2)}" class="micacc">${acc}</text>` : ''}<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${r + .04}" ry="${(r * .86).toFixed(2)}" class="micball"/>`;
  let d = old;
  if (!d || d.parentNode !== g) { if (old) old.remove(); d = document.createElementNS('http://www.w3.org/2000/svg', 'g'); d.setAttribute('class', 'micdot'); g.append(d); }
  if (d.dataset.h !== html) { d.innerHTML = html; d.dataset.h = html; }
}

function micTone(midi) { return describe(midi); }
mic.onFrame = (hit) => {
  drawDot(hit);
  const nameEl = $('#micNote'), needle = $('#micNeedle'), cents = $('#micCents');
  if (!nameEl) return;
  if (!hit) { nameEl.textContent = '–'; cents.textContent = ''; needle.style.opacity = '.2'; needle.style.left = '50%'; return; }
  const d = micTone(hit.midi);
  nameEl.textContent = d.name; cents.textContent = (d.cents > 0 ? '+' : '') + d.cents + ' ¢';
  needle.style.opacity = '1'; needle.style.left = (50 + Math.max(-50, Math.min(50, d.cents))) + '%';
};
mic.onTake = () => { buildMic(); toast(tr('Recorded. Press Play back to hear yourself with the music.')); };
mic.onRecState = () => buildMic();
async function micToggle() {
  if (mic.on) { mic.stop(); rec.me = false; take.clear(); render(); buildMic(); $('#micBtn').classList.remove('on'); return; }
  syncMicOpt();
  const r = await mic.start();
  if (r === 'blocked') toast(tr('The microphone is blocked: allow it in the browser settings.'));
  else if (r !== 'ok') toast(tr('This browser cannot use the microphone here.'));
  else toast(tr('Sing: your pitch shows as a red dot on the staff.'));
  $('#micBtn').classList.toggle('on', mic.on);
  buildMic();
}
async function clapTest() {
  if (!mic.on) await micToggle();
  if (!mic.on || mic.clapping) return;
  stopPlayback();
  toast(tr('Clap with each click.'));
  buildMic();
  const v = await mic.clapTest(t => snd.click(t, true));
  if (v == null) toast(tr('No claps were heard. Try again, a little louder.'));
  else { prefs.micCal = v; savePrefs(); toast(tr('Latency') + ': ' + Math.round(v * 1000) + ' ms'); }
  buildMic();
}
function buildMic() {
  const pop = $('#micPop'); if (!pop) return;
  pop.textContent = '';
  const card = el('div', { class: 'card' });
  const sw = (key, label, title, after) => chip(tr(label), prefs[key], () => { prefs[key] = !prefs[key]; savePrefs(); syncMicOpt(); if (after) after(); buildMic(); }, { title: tr(title) });
  card.append(el('div', { class: 'row' }, chip(tr(mic.on ? 'Close the microphone' : 'Open the microphone'), mic.on, micToggle)));
  if (mic.on) card.append(el('div', { class: 'tuner' }, el('b', { id: 'micNote' }, '–'), el('span', { id: 'micCents' }), el('div', { class: 'meter' }, el('i', { class: 'mid' }), el('i', { id: 'micNeedle' }))));
  card.append(el('p', { class: 'hint' }, tr('The note you sing shows as a faint red dot on the staff: next to the note being played, or at the end when nothing plays.')));
  card.append(el('div', { class: 'row wrap' },
    sw('micFlex', 'Flexible pitch', 'On: the dot follows your exact pitch, a little above or below its note when you are sharp or flat. Off: it sits on the nearest note, like a written second voice'),
    sw('micNotate', 'Notate', 'While the music plays, what you sing is written out in red on a staff of its own, down to fusae', () => { if (!prefs.micNotate) { take.clear(); render(); } }),
    sw('micDia', 'Diatonic', 'What you sing is written with the notes of the scale only (B or B flat as the music has it), never a chromatic note', () => { if (take.frames.length && take.quantize(true, takeCtx())) takeChanged(); }),
    sw('micPhones', 'Headphones', 'On: no filtering, so unisons and octaves with the organ show too. Off: the organ is filtered out of what the microphone hears, for singing along through speakers')));
  const lat = el('input', { type: 'number', min: 0, max: 600, step: 1, inputmode: 'numeric', placeholder: tr('auto'), value: prefs.micCal == null ? '' : Math.round(prefs.micCal * 1000), 'aria-label': tr('Latency'),
    onchange: e => { const v = e.target.value.trim(); prefs.micCal = v === '' ? null : Math.max(0, Math.min(600, +v)) / 1000; savePrefs(); } });
  card.append(el('div', { class: 'row latrow', title: tr('The time from the organ sounding to your voice reaching the microphone, so what you sing is written in the right place. Empty: worked out by itself') },
    el('label', {}, tr('Latency')), lat, el('span', {}, 'ms'), chip(tr(mic.clapping ? 'Listening…' : 'Clap test'), false, clapTest, { disabled: mic.clapping, title: tr('Eight clicks: clap with each one, and the latency is measured') })));
  if (mic.on) {
    card.append(el('div', { class: 'row' }, chip(tr('Record me') + (mic.recording ? ' · ' + tr('Recording…') : ''), rec.me, () => { rec.me = !rec.me; buildMic(); },
      { title: tr('On: every time the music plays while the microphone is on, your voice is recorded with it') })));
    card.append(el('p', { class: 'hint' }, tr('Press Play: your voice is recorded together with the music. Use headphones, so the organ does not leak into the recording.')));
  }
  if (take.parts.length) card.append(el('div', { class: 'row' }, chip(tr('Clear the written singing'), false, () => { take.clear(); render(); buildMic(); })));
  if (mic.take && mic.take.url) {
    const t = mic.take;
    const au = el('audio', { controls: true, src: t.url, style: 'width:100%' });
    const ext = /mp4|aac/.test(t.mime) ? 'm4a' : /ogg/.test(t.mime) ? 'ogg' : 'webm';
    card.append(el('div', { class: 'take' }, el('label', {}, tr('Your recording')), au,
      el('div', { class: 'row' },
        chip(tr('Play back'), false, () => listenBack(), { disabled: !t.buffer, title: tr('Play your last recording together with the music, from where you started') }),
        el('a', { class: 'chip', href: t.url, download: 'cantare-' + slug(S.base?.title || 'recording').slice(0, 40) + '.' + ext }, tr('Download')),
        chip(tr('Delete'), false, () => { URL.revokeObjectURL(t.url); mic.take = null; buildMic(); }))));
  }
  pop.append(card);
}
/* hear the take again with the music: the music starts where it did, the voice a little earlier by the latency */
function listenBack() {
  const t = mic.take; if (!t || !t.buffer) return;
  stopPlayback(); rec.listen = t; S.startAt = t.from; startPlayback();
}
function recHook(ctx, t0, from) {
  if (rec.listen) {
    const t = rec.listen; rec.listen = null;
    const s = t0 - (t.t0 - t.startCtx) - mic.latency(prefs.micCal) - (prefs.micCal != null ? 0 : prefs.micLag), now = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = t.buffer;
    const g = ctx.createGain(); g.gain.value = 1.4; src.connect(g); g.connect(ctx.destination);
    if (s >= now) src.start(s); else if (now - s < t.buffer.duration) src.start(now, now - s);
    rec.src = src;
    return;
  }
  if (mic.on && rec.me) mic.beginTake(t0, from);
}
function recStop() {
  if (rec.src) { try { rec.src.stop(); } catch (e) { /* ignore */ } rec.src = null; }
  if (mic.recording) mic.endTake();
}
$('#micBtn').addEventListener('click', e => {
  e.stopPropagation();
  const pop = $('#micPop'); pop.hidden = !pop.hidden;
  if (!pop.hidden) { buildMic(); const r = $('#toolbar').getBoundingClientRect(); pop.style.top = (r.bottom + 6) + 'px'; }
  $('#micBtn').setAttribute('aria-expanded', String(!pop.hidden));
});
document.addEventListener('click', e => { const pop = $('#micPop'); if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('.chip')) { pop.hidden = true; $('#micBtn').setAttribute('aria-expanded', 'false'); } });

/* Guidonian hand: the Gym's hand room, opened over the page so the camera works with the music still in view */
$('#handBtn').addEventListener('click', () => {
  const v = $('#handView'), f = $('#handFrame');
  if (!f.getAttribute('src')) f.setAttribute('src', '../hand/');
  v.hidden = false; stopPlayback();
});
$('#handClose').addEventListener('click', () => { $('#handView').hidden = true; });

/* share */
$('#footShare').addEventListener('click', async () => {
  const url = location.href.split('#')[0] + location.hash, title = 'Cantare super librum';
  try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch (e) { return; }
  try { await navigator.clipboard.writeText(url); toast(tr('Link copied')); } catch (e) { toast(url); }
});

/* interface language */
function applyLang() {
  translatePage(); buildUnits();
  if (S.base) { renderTree($('#search').value); buildStudio(); buildTransform(); buildEditTools(); buildVoiceChips(); render(); }
  $('#play').setAttribute('aria-label', tr(S.playing ? 'Stop' : 'Play'));
}
(function langPicker() {
  const sel = $('#lang');
  LANGS.forEach(([k, short, name]) => sel.append(el('option', { value: k, title: name, selected: k === getLang() }, short)));
  sel.addEventListener('change', () => { prefs.lang = sel.value; setLang(prefs.lang); savePrefs(); applyLang(); });
})();

let rt = 0, lastW = 0;
new ResizeObserver(() => {
  const w = paper.clientWidth + $('#stage').clientHeight * 1000;
  if (w === lastW) return;
  lastW = w; clearTimeout(rt); rt = setTimeout(() => S.piece && !S.playing && render(), 90);
}).observe($('#stage'));

/* ------------------------------------------------------------------ start */
(async function start() {
  applyTheme();
  translatePage();
  $('#tempo').value = prefs.tempo; $('#bpm').textContent = prefs.tempo;
  buildUnits(); syncLoop(); syncHand();
  const wide = innerWidth >= 1100;
  $('#library').dataset.open = String(wide); $('#studio').dataset.open = 'false'; syncLibBtn();
  await loadLibrary();
  mineGroup(); renderTree();
  /* a refresh always brings a new random piece; a link someone opens (with #piece) still opens that piece */
  const reload = performance.getEntriesByType?.('navigation')[0]?.type === 'reload';
  const want = reload ? '' : decodeURIComponent(location.hash.slice(1));
  let opened = false;
  if (want.startsWith('w=')) {
    const it = itemFromLink(want.slice(2));
    if (it) {
      /* a melody sent as a link: kept among your melodies (once), and opened */
      const same = mine.find(x => JSON.stringify(itemOf(pieceFrom(x, []))) === JSON.stringify(itemOf(pieceFrom(it, []))));
      if (same) { openItem(same, [tr('Your melodies')]); } else adoptMine(it);
      opened = true;
    }
  }
  if (!opened) {
    const hit = want && S.flat.find(f => slug(f.item.title) === want);
    const pick = hit || randomPick();
    openItem(pick.item, pick.trail);
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();

if (prefs.timbre === 'voice') snd.prepare();
window.cantare = { S, prefs, openItem, jrpGet };
