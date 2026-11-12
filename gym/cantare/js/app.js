import { pieceFrom, stamp, CLEFS, CLEF_ORDER, clefFor, midiOf, slug, stepName, VALUE_NAME } from './music.js';
import { engraveSystems, systemSVG, styleOf, glyphIcon, setFont } from './engrave.js';
import * as snd from './audio.js';
import { createMic, describe } from './mic.js';
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
const prefs = { theme: 'dark', tempo: 52, timbre: 'organ', a4: 440, zoom: 13, view: 'score', click: false, volume: .8, names: true, font: 'manuscript', lang: '' };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* storage may be blocked */ }
setFont(prefs.font);
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
  document.querySelector('meta[name=theme-color]').content = prefs.theme === 'dark' ? '#0f1218' : '#f1eadb';
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
  S.shift = 0; S.clefs = []; S.lines = 0; S.tempus = null; S.talea = -1; S.taleaLook = 'chant'; S.leaf = 0; S.startAt = 0; S.sel = null;
  S.voice = S.base.voices.map(() => 'on');
  rebuildPiece();
  render(true);
  hist.undo = []; hist.redo = [];
  buildStudio(); buildTransform(); buildEditTools(); buildVoiceChips();
  document.querySelectorAll('.tree .item').forEach(b => b.setAttribute('aria-current', String(+b.dataset.id === item.id)));
  try { history.replaceState(null, '', '#' + slug(item.title)); } catch (e) { /* ignore */ }
  $('#stage').scrollTop = 0;
  if (opts.toast) toast(opts.toast);
}

/* the shown piece derives from the base piece plus the Studio's choices */
function rebuildPiece() {
  const b = S.base;
  const p = { ...b, voices: b.voices.map(v => ({ ...v, notes: v.notes.map(n => ({ ...n })) })) };
  if (S.tempus) p.tempus = S.tempus;
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
  const opts = { clefs: S.clefs, state: S.voice, shift: S.shift, names: prefs.names, t: T };
  if (useBook) renderBook(p, opts, resetLeaf);
  else renderScore(p, opts);
  collectNotes();
  markSel();
}

function renderScore(p, opts) {
  const w = spaceW();
  const systems = engraveSystems(p, p.voices.map((_, i) => i), w, opts);
  systems.forEach((s, i) => paper.append(el('div', { class: 'sys', 'data-sys': i, 'data-t0': s.t0, 'data-t1': s.t1 }, parse(systemSVG(s, prefs.zoom)))));
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
    el('p', { class: 'hint' }, `Melody now spans ${range}. Steps move every voice along the white keys, so the mode stays as it is.`));

  /* mensuration */
  const t = S.tempus || b.tempus;
  if (b.kind !== 'chant') {
    card(tr('Mensuration'),
      chipRow(tr('Tempus'), [['C', tr('Imperfectum')], ['O', tr('Perfectum')]].map(([k, n]) => chip(n, t === k, () => { S.tempus = k; redo(); }))),
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

function buildStudio() {
  const b = S.base, c = $('#cards');
  c.textContent = '';
  const multi = b.voices.length > 1;
  const card = (title, ...kids) => { const d = el('section', { class: 'card' }, el('h3', {}, title), ...kids); c.append(d); return d; };

  /* sound */
  card(tr('Sound'),
    chipRow(tr('Timbre'), Object.entries(snd.TIMBRES).map(([k, v]) => chip(tr(v.label), prefs.timbre === k, () => { prefs.timbre = k; savePrefs(); buildStudio(); }))),
    el('div', { class: 'row' }, el('label', {}, tr('Volume')), el('input', { type: 'range', min: 0, max: 100, value: Math.round(prefs.volume * 100), oninput: e => { prefs.volume = e.target.value / 100; snd.setVolume(prefs.volume); savePrefs(); } })),
    chipRow(tr('Pitch'), [415, 440, 466].map(h => chip('a′ = ' + h, prefs.a4 === h, () => { prefs.a4 = h; savePrefs(); buildStudio(); }))),
    chipRow(tr('Tactus'), [chip(tr('Click'), prefs.click, () => { prefs.click = !prefs.click; savePrefs(); buildStudio(); })]));

  /* view */
  card(tr('View'),
    chipRow(tr('Notation'), [['manuscript', tr('Manuscript')], ['bravura', tr('Engraved')]].map(([k, n]) => chip(n, prefs.font === k, () => { prefs.font = k; setFont(k); savePrefs(); render(true); buildStudio(); }))),
    chipRow(tr('Layout'), [['score', tr('Score')], ['book', tr('Choir book')]].map(([k, n]) => chip(n, prefs.view === k, () => { prefs.view = k; savePrefs(); S.leaf = 0; render(true); buildStudio(); }, { disabled: k === 'book' && !multi }))),
    el('div', { class: 'row' }, el('label', {}, tr('Size')), el('input', { type: 'range', min: 9, max: 24, value: prefs.zoom, oninput: e => { prefs.zoom = +e.target.value; savePrefs(); render(); } })),
    chipRow(tr('Theme'), [chip(tr('Dark'), prefs.theme === 'dark', () => { prefs.theme = 'dark'; savePrefs(); applyTheme(); buildStudio(); }), chip(tr('Light'), prefs.theme === 'light', () => { prefs.theme = 'light'; savePrefs(); applyTheme(); buildStudio(); })]));

  card(tr('Share'), el('div', { class: 'row' }, chip(tr('Copy link'), false, async () => {
    const url = location.origin + location.pathname + '#' + slug(b.title);
    try { await navigator.clipboard.writeText(url); toast(tr('Link copied')); } catch (e) { toast(url); }
  }), chip(tr('Print'), false, () => window.print())));
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
  change(); afterEdit();
}
function restoreSnap(js) { JSON.parse(js).forEach((ns, i) => { S.base.voices[i].notes = ns; }); if (S.sel && !S.base.voices[S.sel.vi].notes[S.sel.i]) S.sel = null; afterEdit(); }
const undo = () => { if (hist.undo.length) { hist.redo.push(snap()); restoreSnap(hist.undo.pop()); } };
const redoEdit = () => { if (hist.redo.length) { hist.undo.push(snap()); restoreSnap(hist.redo.pop()); } };
const selNote = () => (S.sel ? S.base.voices[S.sel.vi]?.notes[S.sel.i] : null);
function markSel() {
  paper.querySelectorAll('.note.sel').forEach(x => x.classList.remove('sel'));
  if (S.sel && S.edit) paper.querySelector(`.note[data-v="${S.sel.vi}"][data-i="${S.sel.i}"]`)?.classList.add('sel');
}
function select(vi, i) { S.sel = { vi, i }; markSel(); buildEditTools(); }
function hear(n) { if (!n || n.rest) return; const ctx = snd.ensure(); snd.note({ timbre: prefs.timbre, midi: midiOf(n, S.piece.bflat, S.shift), a4: prefs.a4, at: ctx.currentTime + .02, dur: .6 }); }

const EDIT = {
  pitch(d) { const n = selNote(); if (!n || n.rest) return; commit(() => { n.step = Math.max(7, Math.min(55, n.step + d)); }); hear(selNote()); },
  value(v) { const n = selNote(); if (n) commit(() => { n.v = v; }); },
  rest() { const n = selNote(); if (n) commit(() => { n.rest = !n.rest; if (n.rest) n.acc = ''; }); },
  dot() { const n = selNote(); if (n) commit(() => { n.dot = !n.dot; }); },
  acc(a) { const n = selNote(); if (n && !n.rest) commit(() => { n.acc = n.acc === a ? '' : a; n.ficta = false; }); },
  del() {
    if (!S.sel) return;
    const { vi, i } = S.sel, ns = S.base.voices[vi].notes;
    if (ns.length < 2) return;
    commit(() => { ns.splice(i, 1); S.sel = { vi, i: Math.min(i, ns.length - 1) }; });
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
  if (!S.edit) return;
  const n = selNote(), has = !!n;
  const btn = (html, title, fn, o = {}) => { const b = el('button', { class: 'tbtn' + (o.on ? ' on' : ''), title, 'aria-label': title, disabled: !!o.dis, onclick: fn }); b.innerHTML = html; return b; };
  const grp = (...k) => el('div', { class: 'tb-group' }, ...k.flat());
  box.append(
    grp(btn(ICON.undo, tr('Undo'), undo, { dis: !hist.undo.length }), btn(ICON.redo, tr('Redo'), redoEdit, { dis: !hist.redo.length })),
    grp(btn(ICON.left, tr('Previous note'), () => EDIT.move(-1), { dis: !has }), btn(ICON.right, tr('Next note'), () => EDIT.move(1), { dis: !has }),
      btn(ICON.up, tr('Higher'), () => EDIT.pitch(1), { dis: !has || n.rest }), btn(ICON.down, tr('Lower'), () => EDIT.pitch(-1), { dis: !has || n.rest })),
    grp(['Mx', 'L', 'B', 'S', 'M', 'Sm', 'F'].map(v => btn(glyphIcon('note', v), VALUE_NAME[v], () => EDIT.value(v), { on: has && n.v === v, dis: !has }))),
    grp(btn(glyphIcon('rest'), tr('Rest'), () => EDIT.rest(), { on: has && n.rest, dis: !has }), btn(ICON.dot, tr('Dot'), () => EDIT.dot(), { on: has && n.dot, dis: !has })),
    grp([['b', tr('Flat')], ['n', tr('Natural')], ['#', tr('Sharp')]].map(([k, t]) => btn(glyphIcon('acc', k), t, () => EDIT.acc(k), { on: has && n.acc === k, dis: !has || n.rest }))),
    grp(btn(ICON.plus, tr('Add a note after this one'), () => EDIT.add()), btn(ICON.trash, tr('Delete'), () => EDIT.del(), { dis: !has })),
  );
  if (!has) box.append(el('span', { class: 'edit-hint' }, tr('Tap a note to select it.')));
}

$('#editBtn').addEventListener('click', () => {
  S.edit = !S.edit;
  if (!S.edit) S.sel = null;
  buildEditTools(); markSel();
});
$('#transformBtn').addEventListener('click', e => {
  e.stopPropagation();
  const pop = $('#transformPop'); pop.hidden = !pop.hidden;
  if (!pop.hidden) { const r = $('#toolbar').getBoundingClientRect(); pop.style.top = (r.bottom + 6) + 'px'; }
  $('#transformBtn').setAttribute('aria-expanded', String(!pop.hidden));
});
document.addEventListener('click', e => { const pop = $('#transformPop'); if (!pop.hidden && !pop.contains(e.target)) { pop.hidden = true; $('#transformBtn').setAttribute('aria-expanded', 'false'); } });

/* ------------------------------------------------------------------ playback */
const spm = () => (60 / prefs.tempo) / (S.piece.tempus === 'O' && !S.piece.talea ? 6 : 4); /* seconds per minim */

let timer = 0, raf = 0, clock = null;

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
  const beat = S.piece.tempus === 'O' && !p.talea ? 6 : 4;
  const pump = () => {
    const horizon = ctx.currentTime + 1.2;
    while (ei < events.length && t0 + (events[ei].n.t - from) * k < horizon) {
      const { vi, n } = events[ei++];
      const at = t0 + Math.max(0, n.t - from) * k;
      const cut = Math.max(0, from - n.t);
      snd.note({ timbre: prefs.timbre, midi: midiOf(n, p.bflat, S.shift), a4: prefs.a4, at, dur: Math.max(.08, (n.len - cut) * k - .03), level: .2 / Math.sqrt(Math.max(1, p.voices.length)) });
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
  clock = null;
  if (S.playing) setPlaying(false);
  S.index.forEach(x => { if (x.on) { x.e.classList.remove('on'); x.on = false; } });
}

function setPlaying(on) {
  S.playing = on;
  $('#playIcon').innerHTML = on ? '<path d="M6 5h4.5v14H6zM13.500 5H18v14h-4.500z"/>' : '<path d="M7 4.500v15l12-7.500z"/>';
  $('#play').setAttribute('aria-label', on ? tr('Stop') : tr('Play'));
}

let lastSys = -1, lastLeaf = -1;
function frame() {
  if (!clock) return;
  const pos = clock.from + (snd.now() - clock.t0) / clock.k;
  if (pos >= clock.end + 0.5) { stopPlayback(); S.startAt = 0; return; }
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
  const g = e.target.closest('.note');
  if (!g) return;
  const t = +g.dataset.t, vi = +g.dataset.v, i = +g.dataset.i;
  if (S.edit) { select(vi, i); hear(S.base.voices[vi].notes[i]); return; }
  const n = S.piece.voices[vi].notes[i];
  S.startAt = t;
  paper.querySelectorAll('.note.sel').forEach(x => x.classList.remove('sel'));
  g.classList.add('sel');
  if (!n.rest && !S.playing) { const ctx = snd.ensure(); snd.note({ timbre: prefs.timbre, midi: midiOf(n, S.piece.bflat, S.shift), a4: prefs.a4, at: ctx.currentTime + .02, dur: .7 }); }
  if (S.playing) { stopPlayback(true); startPlayback(); }
});

$('#play').addEventListener('click', () => { if (S.playing) { stopPlayback(); } else startPlayback(); });
$('#tempo').addEventListener('input', e => { prefs.tempo = +e.target.value; $('#bpm').textContent = prefs.tempo; savePrefs(); if (S.playing) { const pos = clock.from + (snd.now() - clock.t0) / clock.k; stopPlayback(true); S.startAt = pos; startPlayback(); } });
$('#prevLeaf').addEventListener('click', () => { S.leaf = Math.max(0, S.leaf - 1); render(); });
$('#nextLeaf').addEventListener('click', () => { S.leaf = Math.min(S.leaves.length - 1, S.leaf + 1); render(); });
document.addEventListener('keydown', e => {
  if (e.target.matches('input, select, textarea')) return;
  if (e.code === 'Space') { e.preventDefault(); $('#play').click(); }
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

/* ------------------------------------------------------------------ drawers, theme, search */
const relayout = () => {};
function openDrawer(id) { $('#' + id).dataset.open = 'true'; if (innerWidth >= 1100) relayout(); }
function closeDrawer(id) { $('#' + id).dataset.open = 'false'; if (innerWidth >= 1100) relayout(); }
const toggleDrawer = id => ($('#' + id).dataset.open === 'true' ? closeDrawer : openDrawer)(id);
$('#openLib').addEventListener('click', () => toggleDrawer('library'));
$('#openStudio').addEventListener('click', () => toggleDrawer('studio'));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeDrawer(b.dataset.close)));
$('#toggleTheme').addEventListener('click', () => { prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark'; savePrefs(); applyTheme(); if (S.base) buildStudio(); });
$('#search').addEventListener('input', e => renderTree(e.target.value));

/* ------------------------------------------------------------------ microphone and recording */
const mic = createMic(() => snd.ensure());
const rec = { me: false, listen: null, src: null };
function micTone(midi) { const d = describe(midi, prefs.a4); return d; }
mic.onFrame = (hit) => {
  const nameEl = $('#micNote'), needle = $('#micNeedle'), cents = $('#micCents');
  if (!nameEl) return;
  if (!hit) { nameEl.textContent = '–'; cents.textContent = ''; needle.style.opacity = '.2'; needle.style.left = '50%'; return; }
  const d = micTone(hit.midi);
  nameEl.textContent = d.name; cents.textContent = (d.cents > 0 ? '+' : '') + d.cents + ' ¢';
  needle.style.opacity = '1'; needle.style.left = (50 + Math.max(-50, Math.min(50, d.cents))) + '%';
};
mic.onTake = () => { buildMic(); toast(tr('Recording saved')); };
mic.onRecState = () => buildMic();
async function micToggle() {
  if (mic.on) { mic.stop(); rec.me = false; buildMic(); $('#micBtn').classList.remove('on'); return; }
  const r = await mic.start();
  if (r === 'blocked') toast(tr('The microphone is blocked: allow it in the browser settings.'));
  else if (r !== 'ok') toast(tr('This browser cannot use the microphone here.'));
  $('#micBtn').classList.toggle('on', mic.on);
  buildMic();
}
function buildMic() {
  const pop = $('#micPop'); if (!pop) return;
  pop.textContent = '';
  const card = el('div', { class: 'card' });
  card.append(el('div', { class: 'row' }, chip(tr(mic.on ? 'Close the microphone' : 'Open the microphone'), mic.on, micToggle)));
  if (mic.on) {
    card.append(el('div', { class: 'tuner' }, el('b', { id: 'micNote' }, '–'), el('span', { id: 'micCents' }), el('div', { class: 'meter' }, el('i', { class: 'mid' }), el('i', { id: 'micNeedle' }))));
    card.append(el('div', { class: 'row' }, chip(tr('Record me') + (mic.recording ? ' · ' + tr('Recording…') : ''), rec.me, () => { rec.me = !rec.me; buildMic(); })));
    card.append(el('p', { class: 'hint' }, tr('Press Play: your voice is recorded together with the music. Use headphones, so the organ does not leak into the recording.')));
  }
  if (mic.take && mic.take.url) {
    const t = mic.take;
    const au = el('audio', { controls: true, src: t.url, style: 'width:100%' });
    const ext = /mp4|aac/.test(t.mime) ? 'm4a' : /ogg/.test(t.mime) ? 'ogg' : 'webm';
    card.append(el('div', { class: 'take' }, el('label', {}, tr('Your recording')), au,
      el('div', { class: 'row' },
        chip(tr('Play back'), false, () => listenBack(), { disabled: !t.buffer }),
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
    const s = t0 - (t.t0 - t.startCtx) - mic.latency(), now = ctx.currentTime;
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
  translatePage();
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
  const wide = innerWidth >= 1100;
  $('#library').dataset.open = String(wide); $('#studio').dataset.open = 'false';
  await loadLibrary();
  renderTree();
  const want = decodeURIComponent(location.hash.slice(1));
  const hit = want && S.flat.find(f => slug(f.item.title) === want);
  const pick = hit || S.flat[Math.floor(Math.random() * S.flat.length)];
  openItem(pick.item, pick.trail);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();

window.cantare = { S, prefs, openItem, jrpGet };
