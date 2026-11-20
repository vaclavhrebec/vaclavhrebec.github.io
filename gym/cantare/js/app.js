import { readScoreFile, toMusicXML, ACCEPT } from './scorefile.js';
import { readTokens, pieceFrom, stamp, lengthOf, CLEFS, CLEF_ORDER, CLEF_PALETTE, clefFor, fitClef, midiOf, hz, slug, stepName, VALUE_NAME } from './music.js';
import { engraveSystems, buildColumns, systemSVG, styleOf, glyphIcon, setFont, headWidth, clefAt, setSpacing } from './engrave.js';
import * as snd from './audio.js';
import { syllablesOf } from './latin.js';
import { createMic, describe, spellMidi, median } from './mic.js';
import { createTake } from './take.js';
import { openSingIn, gabcOf } from './singin.js';
import { tr, setLang, getLang, guessLang, LANGS, translatePage } from './i18n.js';

const $ = s => document.querySelector(s);
/* a voice's name with its number small and low: Cantus₁ */
const vname = n => { const m = /^(.*?)\s*(\d+)$/.exec(n || ''); return m ? el('span', {}, m[1], el('sub', { class: 'vnum' }, m[2])) : (n || ''); };
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v); }
  kids.flat().forEach(c => e.append(c.nodeType ? c : document.createTextNode(c)));
  return e;
};

/* ------------------------------------------------------------------ state */
const STORE = 'cantare-next:v1';
const prefs = { bookKind: 'it', theme: 'dark', tempo: 60, timbre: 'voice', a4: 440, zoom: 13, spacing: 1, view: 'score', click: false, hand: true, pendulum: false, handStyle: 'palm', handSize: 1, pendSize: 1, volume: .8, names: true, font: 'bravura', lang: '',
  /* singing: the dot follows the exact pitch; what is sung is written out; with speakers the organ is filtered out */
  micFlex: true, micDia: false, micNotate: true, micPhones: false, micCal: null, micLag: 0,
  /* the beat: which note value the tactus counts; loop; hear notes while editing; the organ's pipe settings */
  unit: 'B', loop: false, audition: true, sound: {} };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { /* storage may be blocked */ }
/* 13 Nov 2026: the engraved Bravura shapes became the default for everyone, once */
if (!prefs.fontBravura) { prefs.font = 'bravura'; prefs.fontBravura = true; try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (e) { /* ignore */ } }
setFont(prefs.font);
/* 13 Nov 2026: the voice sung by Chimera became the default sound for everyone, once */
if (!prefs.voiceDefault) { prefs.timbre = 'voice'; prefs.voiceDefault = true; try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (e) { /* ignore */ } }
/* 14 Nov 2026: the bare hand (flat palm, no baton) became the default for everyone, once */
if (!prefs.palmDefault) { prefs.handStyle = 'palm'; prefs.palmDefault = true; try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch (e) { /* ignore */ } }
setSpacing(prefs.spacing);
snd.setSound(prefs.sound || {});
{ /* the language is shared with the other pages of the site: ?lang=, then the site-wide choice, then this app's own */
  let shared = ''; try { shared = new URL(location.href).searchParams.get('lang') || localStorage.getItem('lang') || ''; } catch (e) { /* none */ }
  if (LANGS.some(x => x[0] === shared)) { prefs.lang = shared; try { localStorage.setItem('lang', shared); } catch (e) { /* none */ } }
  setLang(prefs.lang || guessLang());
}
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
/* organum purum: the chant is not measured; each note is held until the cantor gives the sign (a tap) to move on */
const OP = { on: false, i: -1, list: [], h: null };
/* the Du Fay easter egg (js/dufay-egg.js) counts only the time in which music is really sounding */
window.cantareSounding = () => !!S.playing;

/* Taleae: a repeating rhythm laid over the chant, one value for each chant note; rests (r…) take no note.
   B brevis, L longa, L. perfect longa, Ba brevis altera (written as a brevis, lasting two), Mx duplex longa (maxima), Mx. perfect maxima.
   The first seven are Václav's own; then the six rhythmic modes of Notre-Dame polyphony (Johannes de Garlandia,
   De mensurabili musica, c. 1250) and tenor patterns with rests (ordines) as in the clausulae and motets built on them. */
const TALEAE = [
  ['Longa, brevis (1st rhythmic mode, trochaic)', 'L B'],
  ['Brevis, longa (2nd rhythmic mode, iambic)', 'B L'],
  ['Longa, brevis, brevis', 'L B B'],
  ['Three breves, perfect longa', 'B B B L.'],
  ['Three breves, longa, brevis, perfect longa', 'B B B L B L.'],
  ['Three longas, perfect maxima', 'L L L Mx.'],
  ['Perfect longa, longa, brevis', 'L. L B'],
  ['3rd rhythmic mode (dactylic): perfect longa, brevis, brevis altera', 'L. B Ba', 'Garlandia'],
  ['4th rhythmic mode (anapaestic): brevis, brevis altera, perfect longa', 'B Ba L.', 'Garlandia'],
  ['5th rhythmic mode (spondaic): perfect longas', 'L.', 'Garlandia'],
  ['6th rhythmic mode (tribrachic): breves', 'B', 'Garlandia'],
  ['1st mode, first ordo: longa, brevis, longa, brevis rest', 'L B L rB', 'ordo'],
  ['1st mode, second ordo: longa, brevis, longa, brevis, longa, brevis rest', 'L B L B L rB', 'ordo'],
  ['2nd mode, first ordo: brevis, longa, brevis, longa, longa rest', 'B L B L rL', 'ordo'],
  ['5th mode, two perfect longas and a perfect longa rest', 'L. L. rL.', 'ordo'],
  ['5th mode, three perfect longas and a perfect longa rest', 'L. L. L. rL.', 'ordo'],
  ['3rd mode tenor: perfect longa, brevis, brevis altera, perfect longa, perfect longa rest', 'L. B Ba L. rL.', 'ordo'],
  ['Maxima, longa, brevis, longa rest', 'Mx L B rL'],
  /* tenor patterns typical of each century (generic patterns of the kind, not quotations of particular pieces) */
  ['Franconian motet tenor: perfect longa, longa, brevis, perfect longa rest', 'L. L B rL.', '13'],
  ['Franconian motet tenor: two perfect longas, longa, brevis, perfect longa rest', 'L. L. L B rL.', '13'],
  ['Isorhythmic tenor (modus perfectus): perfect longa, perfect longa rest, longa, brevis, perfect longa, perfect longa rest', 'L. rL. L B L. rL.', '14'],
  ['Isorhythmic tenor (modus imperfectus): longa, longa rest, longa, longa, longa rest', 'L rL L L rL', '14'],
  ['Isorhythmic tenor in long values: longa, longa, longa rest, maxima, longa rest', 'L L rL Mx rL', '15'],
  ['Cantus firmus in equal longas, as in the tenor of a cantus-firmus mass', 'L', '15'],
];
/* the Talea window lists them by period */
const TALEA_GROUPS = [
  [undefined, 'Basic patterns'],
  ['Garlandia', 'Notre-Dame, c. 1200: the rhythmic modes (Garlandia)'],
  ['ordo', 'Notre-Dame: tenor ordines of clausulae and early motets'],
  ['13', '13th century: Franconian motet tenors'],
  ['14', '14th century: Ars nova isorhythmic tenors'],
  ['15', '15th century: isorhythmic and cantus-firmus tenors'],
];
const TALEA_VAL = { B: ['B', false], Ba: ['B', false, true], L: ['L', false], 'L.': ['L', true], Mx: ['Mx', false], 'Mx.': ['Mx', true] };

const T = { get hidden() { return tr('improvise this voice'); } };

/* ------------------------------------------------------------------ utilities */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); }

const SUN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7"/></svg>';
const MOON = '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg>';
function applyTheme() {
  if (prefs.theme !== 'dark' && prefs.theme !== 'light') prefs.theme = 'light';
  document.documentElement.dataset.theme = prefs.theme;
  /* the button shows where it leads: the sun in the dark, the moon in the light */
  const b = document.getElementById('toggleTheme');
  if (b) { const dark = prefs.theme === 'dark'; b.innerHTML = dark ? SUN : MOON; const t = tr(dark ? 'Light mode' : 'Dark mode'); b.title = t; b.setAttribute('aria-label', t); }
  document.querySelector('meta[name=theme-color]').content = prefs.theme === 'dark' ? '#0f1218' : prefs.theme === 'vellum' ? '#e6d7b3' : '#c2a07a';
}

/* ------------------------------------------------------------------ library */
let uid = 100000;
const jrpCache = {};
const jrpGet = path => (jrpCache[path] ||= fetch(path.startsWith('chant/') ? path : 'jrp/' + path).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(e => { delete jrpCache[path]; throw e; }));
const dispTitle = it => it.title;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function loadLibrary() {
  const [lib, tags] = await Promise.all([fetch('data/library.json').then(r => r.json()), fetch('data/taglines.json').then(r => r.json())]);
  /* the Josquin Research Project sits inside Polyphonic models under plain names; far too much to carry at once,
     so it is fetched piece by piece, only when opened. Its credit appears under each piece once it is opened. */
  const poly = lib.find(g => g.group === 'Polyphonic models');
  (poly.subs ||= []).push(
    { group: 'Masses, motets and songs, 1420–1540', note: 'By Josquin, Ockeghem, La Rue, Busnoys, Du Fay and many more, in all their voices, sorted by composer.', lazy: 'index.json', count: 1379 },
    { group: 'Canons', note: 'Every piece here that contains a canon, sorted by the interval of the answer. Each entry says which voice follows which: use Hide on the following voice and improvise it yourself.', lazy: 'canons.json', count: 216 });
  /* Gregorian chant: about eleven hundred scores from GregoBase (CC0), fetched by kind of chant only when opened */
  const planus = lib.find(g => g.group === 'Cantus planus');
  (planus.subs ||= []).push({ group: 'Gregorian chant from GregoBase', note: 'Introits, graduals, alleluias, offertories, communions, tracts, sequences, hymns, the Mass Ordinary, antiphons and responsories, mostly in the Solesmes editions. Scores from GregoBase (gregobase.selapa.net), the open database of chant, CC0.', lazy: 'chant/index.json', count: 1103 });
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

/* a random piece: first a category at random, then a piece within it.
   Polyphony is drawn twice as often as each of the other three. */
const RANDOM_GROUPS = [['Cantus planus', 1], ['Cantus fractus', 1], ['Cantus mensurabilis', 1], ['Polyphonic models', 2]];
async function randomPick() {
  const pools = RANDOM_GROUPS.map(([g, w]) => ({ w, p: S.flat.filter(f => f.trail[0] === g) })).filter(x => x.p.length);
  let r = Math.random() * pools.reduce((a, x) => a + x.w, 0), pool = S.flat;
  for (const x of pools) { if ((r -= x.w) < 0) { pool = x.p; break; } }
  /* the polyphonic models also hold the whole Josquin collection: draw from all of it */
  if (pool[0]?.trail[0] === 'Polyphonic models') {
    try {
      const all = jrpTitles || (jrpTitles = await jrpGet('search.json'));
      const k = Math.floor(Math.random() * (pool.length + all.length));
      if (k >= pool.length) {
        const [id, , c] = all[k - pool.length];
        const it = await jrpGet('p/' + id + '.json'); it.id ??= ++uid;
        return { item: it, trail: ['Polyphonic models', c] };
      }
      return pool[k];
    } catch (e) { /* offline: one of the models carried here */ }
  }
  if (pool[0]?.trail[0] === 'Cantus planus') {
    try {
      const all = chantTitles || (chantTitles = await jrpGet('chant/search.json'));
      const k = Math.floor(Math.random() * (pool.length + all.length));
      if (k >= pool.length) {
        const [u, i] = all[k - pool.length];
        const data = await jrpGet('chant/' + u + '.json'), it = data.items[i]; it.id ??= ++uid;
        return { item: it, trail: ['Cantus planus', 'Gregorian chant from GregoBase', CHANT_KINDS[u]] };
      }
      return pool[k];
    } catch (e) { /* offline: one of the chants carried here */ }
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

const countIn = g => g.lazy && g.count ? g.count : (g.items || []).length + (g.subs || []).reduce((a, s) => a + countIn(s), 0);
const openGroups = new Set();
let jrpTitles = null, chantTitles = null;
const CHANT_KINDS = { in: 'Introits', gr: 'Graduals', al: 'Alleluias', of: 'Offertories', co: 'Communions', tr: 'Tracts', se: 'Sequences', hy: 'Hymns', ky: 'Kyriale: Mass Ordinary', an: 'Antiphons', re: 'Responsories', ca: 'Canticles' };

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
        const d = el('details', {}, el('summary', {}, tr('Masses, motets and songs, 1420–1540'), el('small', {}, String(hits.length) + (hits.length === 60 ? '+' : ''))));
        d.open = true;
        hits.forEach(([id, t, c]) => d.append(el('button', { class: 'item', onclick: async () => {
          try { const it = await jrpGet('p/' + id + '.json'); it.id ??= ++uid; openItem(it, ['Polyphonic models', c]); if (innerWidth < 1100) closeDrawer('library'); } catch (e) { toast(tr('Could not load that piece (offline?).')); }
        } }, el('b', {}, t))));
        tree.append(d);
      }
    }
  }
  /* and the Gregorian chants of GregoBase, by title */
  if (q.length >= 3) {
    if (!chantTitles) jrpGet('chant/search.json').then(d => { chantTitles = d; if ($('#search').value.trim().toLowerCase() === q) renderTree(filter); }).catch(() => {});
    else {
      const words = q.split(/\s+/);
      const hits = chantTitles.filter(([u, , t]) => { const h = (t + ' ' + CHANT_KINDS[u]).toLowerCase(); return words.every(w => h.includes(w)); }).slice(0, 80);
      if (hits.length) {
        const d = el('details', {}, el('summary', {}, tr('Gregorian chant from GregoBase'), el('small', {}, String(hits.length) + (hits.length === 80 ? '+' : ''))));
        d.open = true;
        hits.forEach(([u, k, t]) => d.append(el('button', { class: 'item', onclick: async () => {
          try { const it = (await jrpGet('chant/' + u + '.json')).items[k]; it.id ??= ++uid; openItem(it, ['Cantus planus', 'Gregorian chant from GregoBase', CHANT_KINDS[u]]); if (innerWidth < 1100) closeDrawer('library'); } catch (e) { toast(tr('Could not load that piece (offline?).')); }
        } }, el('b', {}, t), el('small', { class: 'hitkind' }, CHANT_KINDS[u]))));
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
  S.addVi = 0; S.adding = null;
  S.shift = 0; S.clefs = []; S.lines = 0; S.tempus = null; S.cut = null; S.talea = -1; S.taleaLook = 'chant'; S.leaf = 0; S.startAt = 0; S.sel = null;
  S.base.mine = !!item.mine; S.base.sung = !!item.sung;
  /* chant (plainchant and cantus fractus) always opens at 60 */
  if (S.base.kind === 'chant' || S.base.kind === 'fractus') setTempo(60);
  S.voice = S.base.voices.map(() => 'on'); S.nofollow = [];
  rebuildPiece();
  render(true);
  hist.undo = []; hist.redo = [];
  buildStudio(); buildTransform(); buildEditTools(); buildVoiceChips(); voiceReady();
  document.querySelectorAll('.tree .item').forEach(b => b.setAttribute('aria-current', String(+b.dataset.id === item.id)));
  /* a piece of the Josquin collection is addressed by its number, which a link can open again */
  const jrpId = item.jrp || (item.desc || '').match(/josquin\.stanford\.edu, (\w+)\)/)?.[1];
  try { history.replaceState(null, '', item.mine ? location.pathname : '#' + (jrpId ? 'jrp:' + jrpId : slug(item.title))); } catch (e) { /* ignore */ }
  syncTitleEdit();
  $('#stage').scrollTop = 0;
  if (opts.toast) toast(opts.toast);
}

/* the shown piece derives from the base piece plus the Studio's choices */
function rebuildPiece() {
  take.clear();
  if (OP.on) opRelease(); OP.i = -1; OP.list = [];
  const b = S.base;
  const p = { ...b, voices: b.voices.map(v => ({ ...v, notes: v.notes.map(n => ({ ...n })) })) };
  if (S.tempus) p.tempus = S.tempus;
  if (S.cut != null) p.cut = S.cut;
  if (S.talea >= 0 && b.kind === 'chant') {
    const pat = TALEAE[S.talea][1].split(' '), v = p.voices[0], out = [];
    let k = 0;
    const src = v.notes.filter(n => !n.rest);
    src.forEach((n, i) => {
      /* rests in the pattern come before the next sounding value (never after the last note) */
      while (pat[k % pat.length].startsWith('r')) {
        const [val, dot] = TALEA_VAL[pat[k % pat.length].slice(1)];
        if (i > 0) out.push({ v: val, dot, rest: true, step: n.step, acc: '', col: false, ficta: false });
        k++;
      }
      const [val, dot, alt] = TALEA_VAL[pat[k % pat.length]];
      n.v = val; n.dot = dot; n.alt = !!alt; out.push(n); k++;
    });
    v.notes = out;
    p.talea = true;
    if (S.taleaLook === 'mensural') { p.kind = 'mensural'; p.lines = 5; }
  }
  /* durations: in the talea every value is read in tempus imperfectum */
  p.voices.forEach(v => { stamp(v.notes, p.talea || p.abs ? 'C' : p.tempus); v.end = v.notes.length ? v.notes.at(-1).t + v.notes.at(-1).len : 0; });
  p.end = Math.max(...p.voices.map(v => v.end));
  if (S.lines) p.lines = S.lines;
  else if (S.talea >= 0 && S.taleaLook === 'mensural') p.lines = 5;
  S.piece = p;
  if ($('#tempo')) showTempo();
}

/* ------------------------------------------------------------------ drawing the page */
const paper = $('#paper');
const spaceW = () => Math.max(20, (paper.clientWidth || $('#stage').clientWidth - 40) - 40) / prefs.zoom;

function render(resetLeaf) {
  const p = S.piece;
  $('#trail').textContent = (p.trail || []).join('  ›  ');
  $('#title').textContent = p.title;
  $('#note').textContent = p.note + (p.talea ? ' Talea: ' + TALEAE[S.talea][0] + '.' : '');
  /* the description waits behind the háček next to the title */
  $('#noteToggle').hidden = !$('#note').textContent.trim();
  $('#note').hidden = !S.noteOpen;
  $('#noteToggle').setAttribute('aria-expanded', String(!!S.noteOpen));
  $('#credit').hidden = !p.credit;
  $('#credit').innerHTML = p.credit ? esc(p.credit).replace('josquin.stanford.edu', '<a href="https://josquin.stanford.edu" target="_blank" rel="noopener">josquin.stanford.edu</a>').replace('gregobase.selapa.net', '<a href="https://gregobase.selapa.net" target="_blank" rel="noopener">gregobase.selapa.net</a>') : '';
  const useBook = prefs.view === 'book' && p.voices.length > 1;
  syncLayoutSw(p);
  $('#pager').hidden = !useBook;
  paper.className = useBook ? 'book' : 'paper';
  paper.textContent = '';
  S.index = [];
  const opts = { clefs: S.clefs, state: S.voice, shift: S.shift, names: prefs.names, t: T, fullLast: S.edit, voiceCtl: true };
  const roll = !!prefs.roll && !useBook;  /* a real true/false: classList.toggle with undefined would flip the class on every render */
  paper.classList.toggle('rolling', roll);
  if (useBook) renderBook(p, opts, resetLeaf);
  else if (roll) renderRoll(p, opts);
  else renderScore(p, opts);
  collectNotes();
  markSel();
  syncZoom();
  syncSubmit();
}

/* score or choir book: the book button beside the title, the same choice in Transform and in the Studio */
function setView(v) { prefs.view = v; if (v === 'book') prefs.roll = false; savePrefs(); S.leaf = 0; render(true); buildTransform(); buildStudio(); }
function setBookKind(v) { prefs.bookKind = v; savePrefs(); render(); buildTransform(); }
function syncLayoutSw(p) {
  const multi = p.voices.length > 1, book = prefs.view === 'book' && multi;
  $('#layoutSw').hidden = !multi;
  $('#bookBtn').setAttribute('aria-pressed', String(book));
  $('#bookLbl').textContent = book ? tr('Choir book') : tr('Score');
  $('#bookKind').hidden = !(book && p.voices.length >= 4);
  $('#bookKind').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bk === prefs.bookKind)));
}
$('#bookBtn').addEventListener('click', () => setView(prefs.view === 'book' ? 'score' : 'book'));
$('#bookKind').addEventListener('click', e => { const b = e.target.closest('[data-bk]'); if (b) setBookKind(b.dataset.bk); });

/* ---------- zoom: the + and − beside the music. 100 % is the usual size; the biggest is one line on the whole screen */
const ZMIN = 5, ZDEF = 13, ZSTEP = 1.18;
function setZoom(z) {
  const max = S.zoomMax && isFinite(S.zoomMax) ? S.zoomMax : 200;
  prefs.zoom = Math.max(ZMIN, Math.min(max, z));
  S.scoreZoom = null; S.bookScale = null; S.fitFor = null; S.bookFor = null; /* the size chosen now holds, also while editing */
  savePrefs(); render();
}
function syncZoom() {
  const out = $('#zoomOut'), inn = $('#zoomIn'), pct = $('#zoomPct2');
  if (!out) return;
  const max = S.zoomMax && isFinite(S.zoomMax) ? S.zoomMax : 200;
  const shown = Math.min(prefs.zoom, max);
  pct.textContent = Math.round(shown / ZDEF * 100) + ' %';
  inn.disabled = shown >= max - .01;
  out.disabled = shown <= ZMIN + .01;
  const r = $('#zoomRange'); if (r) { r.max = Math.max(ZDEF, Math.ceil(max)); r.value = shown; }
}
$('#zoomIn').addEventListener('click', () => setZoom(Math.min(prefs.zoom, S.zoomMax || 200) * ZSTEP));
$('#zoomOut').addEventListener('click', () => setZoom(Math.min(prefs.zoom, S.zoomMax || 200) / ZSTEP));
$('#zoomPct').addEventListener('click', () => setZoom(ZDEF));

function renderScore(p0, opts) {
  const { p, order } = withTake(p0);
  let z = prefs.zoom, w = spaceW() * prefs.zoom / z;
  let systems = engraveSystems(p, order, w, opts);
  /* the biggest size: one line (with all its voices) fills the height of the window; four to six voices therefore
     always show a whole line of all the voices. Zoom + stops there. */
  /* while editing the size stays as it was when Edit was tapped (the editing toolbar may take room; the music must not jump) */
  const frozen = S.edit && S.fitFor === p0.id && S.scoreZoom;
  if (frozen) { z = S.scoreZoom; w = spaceW() * prefs.zoom / z; systems = engraveSystems(p, order, w, opts); }
  else {
    const st = $('#stage'), avail = st.clientHeight - paper.offsetTop - 30;
    let cap = Infinity;
    for (let k = 0; k < 3 && avail > 120; k++) {
      const h = Math.max(...systems.map(s => s.h));
      cap = Math.max(ZMIN, avail / h * .99);
      if (h * z <= avail) break;
      z = cap;
      w = spaceW() * prefs.zoom / z;
      systems = engraveSystems(p, order, w, opts);
    }
    S.zoomMax = cap;
  }
  S.scoreZoom = z; S.fitFor = p0.id;
  /* several voices: the space between two systems is about twice the space between two voices of one system */
  const between = systems[0] && systems[0].staves.length > 1 ? `margin-bottom:${Math.max(18, Math.round(4.8 * z))}px` : '';
  systems.forEach((s, i) => paper.append(el('div', { class: 'sys', 'data-sys': i, 'data-t0': s.t0, 'data-t1': s.t1, style: between }, parse(systemSVG(s, z)))));
  paper.classList.toggle('singing', p !== p0);
  if (p !== p0) paper.querySelectorAll(`g[data-voice="${p.voices.length - 1}"]`).forEach(g => g.classList.add('sung'));
  S.systems = systems;
}

/* one long line that rolls from right to left while it plays; the clefs stay at the left edge */
function renderRoll(p0, opts) {
  const { p, order } = withTake(p0);
  const [sys] = engraveSystems(p, order, 1e7, { ...opts, justify: false, count: 5 });
  const avail = $('#stage').clientHeight - paper.offsetTop - 30;
  S.zoomMax = avail > 120 ? Math.max(ZMIN, avail / sys.h * .99) : Infinity;
  const z = Math.min(prefs.zoom, S.zoomMax), hw = sys.ind + sys.head;
  S.rollZ = z;
  const head = el('div', { class: 'rollhead', style: `width:${(hw * z).toFixed(1)}px` },
    parse(`<svg class="system" viewBox="0 0 ${hw.toFixed(2)} ${sys.h.toFixed(2)}" width="${(hw * z).toFixed(1)}" height="${(sys.h * z).toFixed(1)}" xmlns="http://www.w3.org/2000/svg">${sys.svg}</svg>`));
  head.querySelectorAll('.note, .brevenum').forEach(n => n.remove());
  const roll = el('div', { class: 'roll' }, el('div', { class: 'rollin' }, el('div', { class: 'sys', 'data-sys': 0, 'data-t0': sys.t0, 'data-t1': sys.t1 }, parse(systemSVG(sys, z))), head));
  paper.append(roll);
  paper.classList.toggle('singing', p !== p0);
  if (p !== p0) paper.querySelectorAll(`g[data-voice="${p.voices.length - 1}"]`).forEach(g => g.classList.add('sung'));
  S.systems = [sys];
}
/* the place of a moment on the long line, in pixels */
function rollX(pos) {
  const sys = S.systems && S.systems[0];
  if (!sys || !sys.xt.length) return 0;
  const xt = sys.xt;
  let i = 0;
  while (i + 1 < xt.length && xt[i + 1][0] <= pos) i++;
  const [t0, x0] = xt[i], [t1, x1] = i + 1 < xt.length ? xt[i + 1] : [S.piece.end, sys.w - sys.ind];
  const x = t1 > t0 ? x0 + (x1 - x0) * Math.min(1, Math.max(0, (pos - t0) / (t1 - t0))) : x0;
  return (sys.ind + x) * (S.rollZ || prefs.zoom);
}

/* ---------- the choir book: where the lines and the pages turn ----------
   Each voice is measured on its own (its columns and their widths). A line runs from one moment to the next as long as
   every voice's music for that time fits the width of a page; the most crowded voice decides. A leaf holds `rows` lines. */
function planBook(p, paneW, rows, opts) {
  const meas = p.voices.map((v, i) => {
    const cols = buildColumns(p, [i]);
    const pre = [0]; cols.forEach(c => pre.push(pre.at(-1) + c.need));
    const head = headWidth(p, clefFor(opts.clefs?.[i] || v.clef)) + .4;
    return { v, cols, pre, cap: Math.max(4, (paneW - 3.4 - head) * .97) };
  });
  const lowerIdx = (cols, t) => { let lo = 0, hi = cols.length; while (lo < hi) { const m = (lo + hi) >> 1; if (cols[m].t < t - 1e-6) lo = m + 1; else hi = m; } return lo; };
  /* the room one voice needs between two moments; a voice still silent or still holding a note at the start gets a little lead */
  const need = (m, s, e) => {
    const a = lowerIdx(m.cols, s), b = lowerIdx(m.cols, e);
    let w = m.pre[b] - m.pre[a];
    const first = a < m.cols.length ? m.cols[a].t : e;
    if (first > s + 1e-6 && first < e) w += 1.8;
    return w;
  };
  /* how many voices hold a sounding note across the moment t (a line or page should rather turn where none does) */
  const held = t => p.voices.reduce((k, v) => k + (v.notes.some(n => !n.rest && n.t < t - 1e-6 && n.t + n.len > t + 1e-6) ? 1 : 0), 0);
  const end = p.end;
  const times = [...new Set(meas.flatMap(m => m.cols.map(c => Math.round(c.t * 1e4) / 1e4)).concat([Math.round(end * 1e4) / 1e4]))].sort((a, b) => a - b);
  const starts = [0];
  let s = 0;
  while (s < end - 1e-6) {
    let k = times.findIndex(t => t > s + 1e-6);
    if (k < 0) break;
    const fit = [];
    for (; k < times.length; k++) {
      const e = times[k];
      if (fit.length && !meas.every(m => need(m, s, e) <= m.cap)) break;
      fit.push(e);
    }
    let e = fit[fit.length - 1];
    if (e < end - 1e-6 && fit.length > 1) {
      /* among the last good places, the latest where no voice is holding a note over the turn */
      const span = e - s;
      const good = fit.filter(t => t - s >= span * .82);
      const best = Math.min(...good.map(held));
      e = good.filter(t => held(t) === best).at(-1);
    }
    if (e >= end - 1e-6) break;
    starts.push(e); s = e;
  }
  const leaves = [];
  for (let i = 0; i < starts.length; i += rows) leaves.push({ t0: starts[i], t1: i + rows < starts.length ? starts[i + rows] : Infinity, lines: starts.slice(i, i + rows) });
  return { starts, leaves };
}
/* a copy of the piece in which every rest that runs over one of the moments is cut there into rests of the usual values */
function splitRestsAt(p, cuts) {
  const tp = p.talea || p.abs ? 'C' : p.tempus;
  const VALS = ['L', 'B', 'S', 'M', 'Sm', 'F'].map(v => ({ v, len: lengthOf({ v }, tp) })).sort((a, b) => b.len - a.len);
  const restsOf = (n, src, t, d) => {
    const out = [];
    let left = d;
    for (const x of VALS) while (left >= x.len - 1e-6) { out.push({ ...n, v: x.v, dot: false, col: false, alt: false, t, len: x.len, src }); t += x.len; left -= x.len; }
    if (left > 1e-6) out.push({ ...n, t, len: left, src }); /* an odd remainder keeps the last piece */
    return out;
  };
  const cutsIn = (a, b) => cuts.filter(c => c > a + 1e-6 && c < b - 1e-6);
  return { ...p, voices: p.voices.map(v => ({ ...v, notes: v.notes.flatMap((n, i) => {
    if (!n.rest) return [n];
    const cs = cutsIn(n.t, n.t + n.len);
    if (!cs.length) return [n];
    const pts = [n.t, ...cs, n.t + n.len];
    return pts.slice(1).flatMap((b, j) => restsOf(n, i, pts[j], b - pts[j]));
  }) })) };
}

function renderBook(p, opts, resetLeaf) {
  const paneCss = (paper.clientWidth || $('#stage').clientWidth) / 2 - 36;
  const availH = Math.max(300, $('#stage').clientHeight - 130);
  /* rows of the opening: two voices side by side in each; four voices make two rows, five or six three, and so on */
  const R = Math.max(2, Math.ceil(p.voices.length / 2));
  /* first pass at the chosen size to learn how tall a line is, then shrink so that two lines per pane fit one screen */
  let scale = prefs.zoom;
  const probe = p.voices.map((_, i) => engraveSystems(p, [i], Math.max(18, paneCss / scale), { ...opts, names: false }));
  const maxH = Math.max(...probe.map(s => Math.max(...s.map(x => x.h))));
  const bookFit = Math.max(R > 2 ? 5 : 8, (availH / R - 34) / ((R > 2 ? 1 : 2) * maxH + 1.2));
  S.zoomMax = bookFit;
  scale = Math.min(scale, bookFit);
  if (S.edit && S.bookFor === p.id && S.bookScale) scale = S.bookScale; /* editing keeps the size */
  S.bookScale = scale; S.bookFor = p.id;
  const paneW = Math.max(18, paneCss / scale);
  const per = p.voices.map((_, i) => engraveSystems(p, [i], paneW, { ...opts, names: false }));
  const sysH = Math.max(...per.map(s => Math.max(...s.map(x => x.h)))) * scale + 14;
  const rows = Math.max(R > 2 ? 1 : 2, Math.floor((availH / R - 30) / sysH));
  /* The opening is synchronised: every voice shows the same stretch of time, and every line of the opening begins at the
     same moment in all the voices. The voice that needs the most room for that time (many minims, many syllables) decides
     where a line ends; the others are spread to the same span. A rest that runs over a line or a turn of the page is split,
     so that each page shows only the silence that belongs to it; a sounding note stays on the page where it begins. */
  const plan = planBook(p, paneW, rows, opts);
  const leaves = plan.leaves;
  const bp = splitRestsAt(p, plan.starts);
  const sys = bp.voices.map((_, i) => engraveSystems(bp, [i], paneW, { ...opts, names: false, breaks: plan.starts.slice(1) }));
  const linesOn = (s, t0, t1) => s.filter(x => x.t0 >= t0 - 1e-6 && x.t0 < t1 - 1e-6);
  S.leaves = leaves;
  if (resetLeaf) S.leaf = 0;
  S.leaf = Math.min(S.leaf, leaves.length - 1);
  const L = leaves[S.leaf];
  $('#leafNo').textContent = `Leaf ${S.leaf + 1} of ${leaves.length}`;
  /* the opening of the book: left page Cantus above, right page Altus above; below, the Italian book has the Tenor
     on the left and the Bassus on the right, the German book the other way round */
  let order = p.voices.length === 3 ? [0, 1, 2, -1] : prefs.bookKind === 'de' && p.voices.length === 4 ? [0, 1, 3, 2] : [0, 1, 2, 3];
  /* more than four voices: the highest voices at the top of the opening, then the alti, the tenors and the bassi,
     two side by side in each row (left page, right page) */
  if (p.voices.length > 4) {
    const GROUP = [[/^(cantus|superius|discantus|soprano)/i, 0], [/^(altus|contratenor altus|alto)/i, 1], [/^contratenor bassus/i, 3], [/^tenor/i, 2], [/^(bassus|bass|contratenor bassus)/i, 3]];
    const mean = v => { const ns = v.notes.filter(n => !n.rest); return ns.length ? ns.reduce((a, n) => a + n.step, 0) / ns.length : 0; };
    const known = p.voices.map(v => { const g = GROUP.find(([re]) => re.test((v.name || '').trim())); return g ? g[1] : null; });
    const rank = p.voices.map((v, i) => {
      if (known[i] != null && !/^(quintus|sextus|vagans|contratenor$)/i.test((v.name || '').trim())) return known[i];
      /* a voice without a telling name goes with the known voice nearest in range */
      let best = 2, d = 1e9; p.voices.forEach((w, j) => { if (j !== i && known[j] != null && !/^(quintus|sextus|vagans|contratenor$)/i.test((w.name || '').trim())) { const e = Math.abs(mean(w) - mean(v)); if (e < d) { d = e; best = known[j]; } } });
      return best;
    });
    order = p.voices.map((_, i) => i).sort((a, b) => rank[a] - rank[b] || mean(p.voices[b]) - mean(p.voices[a]) || a - b);
    if (order.length % 2) order.push(-1);
  }
  paper.style.setProperty('--rows', String(order.length / 2));
  order.forEach(vi => {
    const pane = el('div', { class: 'pane' + (vi >= 0 && S.voice[vi] === 'hide' ? ' blank' : '') });
    if (vi >= 0 && vi < p.voices.length) {
      const v = p.voices[vi];
      if (v.name) pane.append(el('span', { class: 'tag' }, vname(v.name)));
      linesOn(sys[vi], L.t0, L.t1).forEach(s => pane.append(el('div', { class: 'sys' }, parse(systemSVG(s, scale)))));
    }
    paper.append(pane);
  });
}

const parse = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

function collectNotes() {
  S.index = [...paper.querySelectorAll('.note')].map(e => ({ e, t: +e.dataset.t, end: +e.dataset.t + +e.dataset.len, v: +e.dataset.v, on: false }));
  if (OP.on && OP.i >= 0) opMark(false);
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
    clefCard.append(el('div', { class: 'row' }, el('label', {}, multi ? (v.name ? vname(v.name) : tr('Voice') + ' ' + (i + 1)) : tr('Clef')),
      el('select', { 'aria-label': tr('Clef'), onchange: e => { S.clefs[i] = e.target.value; render(); } }, ...CLEF_PALETTE.map(k => el('option', { value: k, selected: k === cur }, CLEFS[k].short)))));
  });
  clefCard.append(chipRow(tr('Lines'), [[0, tr('Auto')], [4, '4'], [5, '5'], [6, '6']].map(([n, t]) => chip(t, S.lines === n, () => { S.lines = n; redo(); }))));
  if (S.base.voices.length > 1) card(tr('Layout'),
    chipRow('', [['score', tr('Score')], ['book', tr('Choir book')]].map(([v, n]) => chip(n, prefs.view === v, () => setView(v)))),
    prefs.view === 'book' && S.base.voices.length >= 4 ? chipRow(tr('Choir book'), [['it', tr('Italian')], ['de', tr('German')]].map(([v, n]) => chip(n, prefs.bookKind === v, () => setBookKind(v)))) : '',
    el('p', { class: 'hint' }, tr('Italian choir book: Cantus and Tenor on the left page, Altus and Bassus on the right. German: Bassus on the left, Tenor on the right.')));
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
      ...TALEA_GROUPS.flatMap(([g, head]) => [el('h4', {}, tr(head)), ...TALEAE.map((t, i) => [t, i]).filter(([t]) => t[2] === g).map(([[name], i]) => el('div', { class: 'row' }, chip(`${i + 1}. ${name}`, S.talea === i, () => { S.talea = i; redo(); })))]),
      el('p', { class: 'hint' }, tr('For organum purum, where the chant is not measured at all, choose Organum purum under the music: each note is then held until you give the sign.')),
      S.talea >= 0 ? chipRow(tr('Shown as'), looks.map(([k, n]) => chip(n, S.taleaLook === k, () => { S.taleaLook = k; redo(); }))) : '',
      el('p', { class: 'hint' }, tr('A talea lays a repeating rhythmic pattern over the chant. Perfect values last three; a brevis altera is written as a brevis and lasts two. The rhythmic modes follow Johannes de Garlandia (c. 1250); the ordines are tenor patterns with rests, as in Notre-Dame clausulae and motets.')));
  }

}

/* a labelled slider with its value; `done` runs when the hand lets go */
function slider(label, min, max, value, fn, step = 1, unit = '', done, quiet) {
  const out = el('output', {}, value + unit);
  return el('div', { class: 'row slider' }, el('label', {}, label),
    el('input', { type: 'range', min, max, step, value, oninput: e => { const v = +e.target.value; out.textContent = v + unit; fn(v); }, onchange: () => { if (!quiet) testTone(); if (done) done(); } }), out);
}
function setSound(o) { snd.setSound(o); prefs.sound = { ...snd.SOUND }; savePrefs(); }
/* a short note to hear what a setting does */
function testTone() { if (S.playing) return; const ctx = snd.ensure(); playNote({ timbre: prefs.timbre, midi: 57, a4: prefs.a4, at: ctx.currentTime + .02, dur: .7, text: 'a' }); }

function buildSection(which, c) {
  const b = S.base;
  const multi = b.voices.length > 1;
  const card = (title, ...kids) => { const d = el('section', { class: 'card' }, el('h3', {}, title), ...kids); c.append(d); return d; };

  /* sound */
  if (which === 'sound') card(tr('Sound'),
    chipRow(tr('Timbre'), Object.entries(snd.TIMBRES).map(([k, v]) => chip(tr(v.label), prefs.timbre === k, () => { prefs.timbre = k; voiceReady(); savePrefs(); buildStudio(); testTone(); }))),
    el('div', { class: 'row' }, el('label', {}, tr('Volume')), el('input', { type: 'range', min: 0, max: 100, value: Math.round(prefs.volume * 100), oninput: e => { prefs.volume = e.target.value / 100; snd.setVolume(prefs.volume); savePrefs(); } })),
    slider(tr('Brightness'), 0, 100, snd.SOUND.bright, v => setSound({ bright: v })),
    slider(tr('Room'), 0, 100, snd.SOUND.room, v => setSound({ room: v })),
    /* inégalité: pairs of semiminims in stepwise motion sung unequally. Bourgeois (Le droict chemin de musique, 1550):
       long–short, as if the first were dotted; contre-inégalité the other way round, short–long */
    chipRow(tr('Inégalité'), [['off', tr('Equal')], ['inegal', tr('Inégal (long–short, Bourgeois)')], ['contre', tr('Contre-inégal (short–long)')]].map(([k, n]) => chip(n, (prefs.inegal || 'off') === k, () => { prefs.inegal = k; savePrefs(); buildStudio(); }))),
    prefs.inegal && prefs.inegal !== 'off' ? chipRow(tr('Degree'), [['gentle', tr('Gentle (3 : 2)')], ['dotted', tr('Dotted (3 : 1)')]].map(([k, n]) => chip(n, (prefs.inegalDeg || 'gentle') === k, () => { prefs.inegalDeg = k; savePrefs(); buildStudio(); }))) : '',
    el('p', { class: 'hint' }, tr('Semiminims are always sung in pairs, as under one slur. Inégalité makes the pairs that move by step unequal: Bourgeois (1550) sings the first longer, as if dotted; contre-inégalité sings it shorter.')));

  /* the organ registers speak with the pipe settings; Your own takes the drawbars (shown in the same Sound window) */
  if ((which === 'pipes' || which === 'sound') && (snd.REG[prefs.timbre] || prefs.timbre === 'custom')) {
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
  if (which === 'view') card(tr('View'),
    chipRow(tr('Layout'), [['score', tr('Score')], ['book', tr('Choir book')]].map(([k, n]) => chip(n, prefs.view === k, () => setView(k), { disabled: k === 'book' && !multi }))),
    el('div', { class: 'row' }, el('label', {}, tr('Zoom')), el('input', { type: 'range', id: 'zoomRange', min: ZMIN, max: 60, step: .5, value: prefs.zoom, oninput: e => setZoom(+e.target.value) })),
    slider(tr('Spacing'), 60, 200, Math.round((prefs.spacing || 1) * 100), v => { prefs.spacing = v / 100; setSpacing(prefs.spacing); savePrefs(); render(); }, 5, '%', null, true),
    chipRow(tr('Theme'), [['dark', 'Dark'], ['light', 'Light']].map(([k, n]) => chip(tr(n), prefs.theme === k, () => { prefs.theme = k; savePrefs(); applyTheme(); buildStudio(); }))),
    chipRow(tr('Screen'), [chip(tr('Focus'), document.documentElement.classList.contains('focus'), () => setFocus(true), { title: tr('Only the music: everything else is put away') }),
      document.fullscreenEnabled ? chip(tr('Full screen'), !!document.fullscreenElement, () => toggleFull()) : ''].filter(Boolean)));

  if (which === 'tactus') card(tr('Tactus'),
    chipRow(tr('Show'), BEATS.map(([k, n]) => chip(tr(n), beatNow() === k, () => setBeat(k)))),
    slider(tr('Size of the hand'), 50, 200, Math.round((prefs.handSize || 1) * 100), v => { prefs.handSize = v / 100; savePrefs(); syncHand(); }, 5, '%', null, true),
    slider(tr('Size of the pendulum'), 40, 200, Math.round((prefs.pendSize || 1) * 100), v => { prefs.pendSize = v / 100; savePrefs(); syncHand(); }, 5, '%', null, true),
    chipRow(tr('Click'), [chip(tr('On'), prefs.click, () => { prefs.click = true; savePrefs(); buildStudio(); }), chip(tr('Off'), !prefs.click, () => { prefs.click = false; savePrefs(); buildStudio(); })]));
  if (which === 'share') card(tr('Share'), el('div', { class: 'row' }, chip(tr('Copy link'), false, async () => {
    const url = linkOf(b);
    try { await navigator.clipboard.writeText(url); toast(tr('Link copied')); } catch (e) { toast(url); }
  }, { title: tr('Copy a link that opens this exact melody') }), chip(tr('Save as PDF'), false, () => exportPDF())),
    el('div', { class: 'row' }, b.mine
      ? chip(tr('Delete this melody'), false, async () => { mine = mine.filter(x => x.id !== b.id); saveMineList(); mineGroup(); renderTree($('#search').value); const pick = await randomPick(); openItem(pick.item, pick.trail); })
      : chip(tr('Keep as my melody'), false, () => { const it = itemOf(b); it.title = b.title; adoptMine(it); toast(tr('Kept under Your melodies.')); }, { title: tr('Keep this melody, as it is now, among your own, to change and send') })));
}

/* everything that was in the Studio now sits as single buttons in the bar under the music;
   a button with ▾ opens its settings in a window in the middle of the screen */
let optOpen = null;
function openOpt(k) {
  const pop = $('#optPop');
  optOpen = k; pop.textContent = '';
  pop.append(el('div', { class: 'clefpop-head' }, el('span'), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: closeOpt }, '×')));
  const box = el('div', { class: 'cards' }); pop.append(box);
  buildSection(k, box);
  pop.hidden = false;
}
function closeOpt() { optOpen = null; $('#optPop').hidden = true; }
/* the beat is shown by one button that turns through its forms on each tap: bare hand, hand with a baton, pendulum, none */
const BEATS = [
  ['palm', 'Hand', '<path d="M8 20c-2.2-1.7-3.6-4-4.2-6.6-.3-1 .9-1.6 1.5-.8L7 14.5V6.5a1.2 1.2 0 0 1 2.4 0V11M9.4 11V4.6a1.2 1.2 0 0 1 2.4 0V11M11.8 11V5.4a1.2 1.2 0 0 1 2.4 0V11.4M14.2 11.4V7.4a1.2 1.2 0 0 1 2.4 0v6.2c0 3.400-2 6.400-5.400 6.400H8z"/>'],
  ['baton', 'Hand with baton', '<path d="M7 20c-1.800-1.400-2.900-3.300-3.400-5.400-.2-.8.7-1.300 1.200-.7L6.400 15.600V9.200a1 1 0 0 1 2 0v3.300M8.400 12.500V8.400a1 1 0 0 1 2 0v4.300M10.400 12.700V9.200a1 1 0 0 1 2 0v4c0 3.500-1.900 6.800-5.400 6.800"/><path d="M11.500 11.500 21 3"/>'],
  ['pendulum', 'Pendulum', '<path d="M12 3v.5M12 3.500 16.500 15"/><circle cx="17.200" cy="17" r="2.600"/><path d="M6 21h12"/><path d="M5.500 9.500a8 8 0 0 0 1.300 4" stroke-dasharray="1.400 1.600"/>'],
  ['off', 'No tactus', '<circle cx="12" cy="12" r="8"/><path d="M6.500 17.500 17.500 6.500"/>'],
];
const beatNow = () => prefs.hand ? (prefs.handStyle === 'baton' ? 'baton' : 'palm') : prefs.pendulum ? 'pendulum' : 'off';
function beatButton() {
  const k = BEATS.findIndex(b => b[0] === beatNow()), [id, label, icon] = BEATS[k];
  const next = BEATS[(k + 1) % BEATS.length];
  const b = el('button', { type: 'button', class: 'chip opt beatcycle', 'aria-pressed': String(id !== 'off'),
    title: tr('Tap to change') + ': ' + BEATS.map(x => tr(x[1])).join(' → '), 'aria-label': tr(label) + ' – ' + tr('Tap to change') + ': ' + tr(next[1]),
    onclick: () => {
      const n = next[0];
      prefs.hand = n === 'palm' || n === 'baton'; if (prefs.hand) prefs.handStyle = n;
      prefs.pendulum = n === 'pendulum';
      savePrefs(); syncHand(); buildStudio();
    } });
  b.append(parse(`<svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>`), el('span', {}, tr(label)));
  return b;
}
function setBeat(n) {
  prefs.hand = n === 'palm' || n === 'baton'; if (prefs.hand) prefs.handStyle = n;
  prefs.pendulum = n === 'pendulum';
  savePrefs(); syncHand(); buildStudio();
}
/* one button for the tactus (hand, baton, pendulum, click): it shows what beats now and opens its window */
function tactusButton() {
  const [id, label, icon] = BEATS.find(b => b[0] === beatNow());
  const b = el('button', { type: 'button', class: 'chip opt beatcycle', 'aria-pressed': String(id !== 'off' || !!prefs.click), title: tr('Tactus: hand, baton, pendulum and click'), onclick: () => (optOpen === 'tactus' ? closeOpt() : openOpt('tactus')) });
  b.append(parse(`<svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>`), el('span', {}, tr(label) + (prefs.click ? ' + ' + tr('Click') : '') + ' ▾'));
  return b;
}
/* one small button for the sound: it names the sound now chosen and opens the window with all of them */
function soundButton() {
  const name = tr((snd.TIMBRES[prefs.timbre] || {}).label || 'Sound');
  const b = el('button', { type: 'button', class: 'chip opt soundbtn', title: tr('Sound') + ': ' + name, onclick: () => (optOpen === 'sound' ? closeOpt() : openOpt('sound')) });
  b.append(parse('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.500 8.500a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12"/></svg>'), el('span', {}, name), el('span', { class: 'caret' }, '▾'));
  return b;
}
function buildStudio() {
  const bar = $('#optbar'), b = S.base, multi = b.voices.length > 1;
  const btn = (label, pressed, fn, title) => el('button', { type: 'button', class: 'chip opt', ...(pressed == null ? {} : { 'aria-pressed': String(!!pressed) }), onclick: fn, title: title || '' }, label);
  const more = k => () => (optOpen === k ? closeOpt() : openOpt(k));
  const THEMES = [['dark', 'Dark'], ['light', 'Light']];
  const themeName = (THEMES.find(t => t[0] === prefs.theme) || THEMES[0])[1];
  bar.replaceChildren(...[
    soundButton(),
    tactusButton(),
    b.voices.length === 1 ? btn(tr('Organum purum'), OP.on, () => opToggle(), tr('The chant is not measured: each note is held until you give the sign to go on, as the cantor did in Notre-Dame organum purum')) : '',
    btn(tr('Hear notes while editing'), prefs.audition, () => { prefs.audition = !prefs.audition; savePrefs(); buildStudio(); }),
    multi ? btn(tr('Choir book'), prefs.view === 'book', () => setView(prefs.view === 'book' ? 'score' : 'book')) : '',
    btn(tr('One line'), !!prefs.roll, () => { prefs.roll = !prefs.roll; if (prefs.roll && prefs.view === 'book') prefs.view = 'score'; savePrefs(); render(true); buildStudio(); try { buildTransform(); } catch (e) {} }, tr('The whole piece on one long line that rolls by while it plays; the clefs stay at the left')),
    btn(tr('View') + ' ▾', null, more('view')),
    btn(tr(themeName), null, () => { const i = THEMES.findIndex(t => t[0] === prefs.theme); prefs.theme = THEMES[(i + 1) % THEMES.length][0]; savePrefs(); applyTheme(); buildStudio(); }, tr('Theme')),
    btn(tr('Focus'), false, () => setFocus(true), tr('Only the music: everything else is put away')),
    btn(tr('Copy link'), null, async () => { const url = linkOf(b); try { await navigator.clipboard.writeText(url); toast(tr('Link copied')); } catch (e) { toast(url); } }, tr('Copy a link that opens this exact melody')),
    b.mine
      ? btn(tr('Delete this melody'), null, async () => { mine = mine.filter(x => x.id !== b.id); saveMineList(); mineGroup(); renderTree($('#search').value); const pick = await randomPick(); openItem(pick.item, pick.trail); })
      : btn(tr('Keep as my melody'), null, () => { const it = itemOf(b); it.title = b.title; adoptMine(it); toast(tr('Kept under Your melodies.')); }, tr('Keep this melody, as it is now, among your own, to change and send')),
  ].filter(Boolean));
  if (optOpen) {
    { const box = $('#optPop .cards'); if (box) { box.textContent = ''; buildSection(optOpen, box); } }
  }
}
/* the pop-up windows live in the body, not inside the scrolling toolbar: on iPhone (Safari) a fixed window inside a
   horizontally scrolling bar is clipped by it and never shows */
document.querySelectorAll('#toolbar > .pop').forEach(p => document.body.append(p));
document.addEventListener('pointerdown', e => { const pop = $('#optPop'); if (pop && !pop.hidden && !pop.contains(e.target) && !e.target.closest('#optbar')) closeOpt(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && optOpen) closeOpt(); });

function buildVoiceChips() {
  const box = $('#voiceChips');
  box.textContent = '';
  if (S.base.voices.length < 2) return;
  S.base.voices.forEach((v, i) => {
    const set = st => () => { S.voice[i] = S.voice[i] === st ? 'on' : st; render(); buildVoiceChips(); if (S.playing) { /* sound follows at once */ } };
    /* compact: the voice's initial, then Mute (a silenced speaker) and Hide (a closed eye); the full words are in the tooltips */
    const name = v.name || tr('Voice') + ' ' + (i + 1);
    const MUTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
    const HIDE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><path d="M4 20L20 4"/></svg>';
    const NOFOL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h6"/><path d="M14 8l5 4-5 4z"/><path d="M4 20L20 4"/></svg>';
    box.append(el('div', { class: 'vc', title: name }, el('span', {}, name.charAt(0).toUpperCase(), /\d+$/.test(name) ? el('sub', {}, name.match(/\d+$/)[0]) : ''),
      el('button', { 'aria-pressed': String(S.voice[i] === 'mute'), title: name + ' – ' + tr('Mute') + ': ' + tr('Seen, not heard: sing it from the notation'), 'aria-label': name + ' ' + tr('Mute'), onclick: set('mute') }, parse(MUTE)),
      el('button', { 'aria-pressed': String(!!(S.nofollow && S.nofollow[i])), title: name + ' – ' + tr('Do not follow') + ': ' + tr('Heard and seen, but the notes are not lit as they sound: follow it yourself'), 'aria-label': name + ' ' + tr('Do not follow'), onclick: () => { S.nofollow = S.nofollow || []; S.nofollow[i] = !S.nofollow[i]; if (S.nofollow[i]) S.index.forEach(x => { if (x.v === i && x.on) { x.e.classList.remove('on'); x.on = false; } }); buildVoiceChips(); } }, parse(NOFOL)),
      el('button', { 'aria-pressed': String(S.voice[i] === 'hide'), title: name + ' – ' + tr('Hide') + ': ' + tr('Neither seen nor heard: improvise it'), 'aria-label': name + ' ' + tr('Hide'), onclick: set('hide') }, parse(HIDE))));
  });
}


/* ------------------------------------------------------------------ editing (only after the pencil is tapped) */
const hist = { undo: [], redo: [] };
const snap = () => JSON.stringify(S.base.voices.map(v => v.notes));
function afterEdit() {
  S.base.voices.forEach(v => { if (S.base.mine || v.userText) applyText(v); });
  S.base.voices.forEach(v => { stamp(v.notes, S.base.abs ? 'C' : S.base.tempus); v.end = v.notes.length ? v.notes.at(-1).t + v.notes.at(-1).len : 0; });
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
  text: '<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 6V4.5h14V6"/><path d="M12 4.5V17"/><path d="M9 17h6"/><path d="M4 21h16"/></svg>',
  undo: '<svg class="ico" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
  redo: '<svg class="ico" viewBox="0 0 24 24"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg>',
  left: '<svg class="ico" viewBox="0 0 24 24"><path d="M14.500 5l-7 7 7 7"/></svg>',
  right: '<svg class="ico" viewBox="0 0 24 24"><path d="M9.500 5l7 7-7 7"/></svg>',
  up: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 14.500l7-7 7 7"/></svg>',
  down: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 9.500l7 7 7-7"/></svg>',
  dot: '<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.600" fill="currentColor"/></svg>',
  plus: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 7h14M10 7V4.500h4V7M7 7l1 13h8l1-13"/></svg>',
};


/* ---------- text under the notes, for melodies people write themselves.
   Typed as words with hyphens between syllables ("A-ve ma-ris stel-la"); one syllable to each note, in order (rests are
   skipped). A dot ( . ) lets a syllable go on over one more note; after the last syllable the last one simply goes on.
   Kept in the voice as the library's own text format ("A- ve ma- ris"), so Chimera sings it, the link carries it and the
   copy sent to Václav contains it. */
function lyrOfTyped(t) {
  const out = [];
  t.replace(/[\r\n]+/g, ' ').trim().split(/\s+/).filter(Boolean).forEach(w => {
    if (w === '.' || !w.includes('-') || w === '-') { out.push(w); return; }
    const parts = w.split('-').filter(x => x !== '');
    parts.forEach((x, i) => out.push(x === '.' ? '.' : i < parts.length - 1 ? x + '-' : x));
  });
  return out.join(' ');
}
function typedOfLyr(l) {
  const out = []; let word = null;
  (l || '').trim().split(/\s+/).filter(Boolean).forEach(tok => {
    const open = tok.length > 1 && tok.endsWith('-');
    if (word !== null) {
      if (tok === '.') { word += '.-'; return; }
      word += tok;
      if (!open) { out.push(word); word = null; }
    } else if (open) word = tok;
    else out.push(tok);
  });
  if (word !== null) out.push(word.replace(/-$/, ''));
  return out.join(' ');
}
function applyText(v) {
  v.notes.forEach(n => { delete n.text; delete n.hyphen; });
  if (!v.lyrics) return;
  const parts = v.lyrics.trim().split(/\s+/);
  let i = 0;
  for (const n of v.notes) {
    if (n.rest || i >= parts.length) continue;
    let w = parts[i++];
    if (w === '.') continue;
    w = w.replace(/_/g, ' ');
    if (w.length > 1 && w.endsWith('-')) { n.text = w.slice(0, -1); n.hyphen = true; } else n.text = w;
  }
}
/* the Text window */
function askText(vi0 = 0) {
  if (!S.base) return;
  const pop = $('#clefPop'), b = S.base;
  let vi = Math.min(vi0, b.voices.length - 1);
  const area = el('textarea', { class: 'nm-in tx-in', rows: 4, spellcheck: 'false', placeholder: tr('e.g. A-ve ma-ris stel-la, De-i Ma-ter al-ma'), 'aria-label': tr('Text under the notes') });
  const count = el('p', { class: 'hint tx-count' });
  const voiceRow = el('div', { class: 'tx-voices' });
  const syls = () => lyrOfTyped(area.value).split(' ').filter(Boolean).length;
  const showCount = () => {
    const notes = b.voices[vi].notes.filter(n => !n.rest).length, k = area.value.trim() ? syls() : 0;
    count.textContent = tr('Notes') + ': ' + notes + ' · ' + tr('Syllables (and dots)') + ': ' + k +
      (k > notes ? ' — ' + tr('more syllables than notes: the rest waits for new notes') : k && k < notes ? ' — ' + tr('the last syllable goes on over the remaining notes') : '');
  };
  const put = () => {
    const v = b.voices[vi];
    v.lyrics = lyrOfTyped(area.value); v.userText = true;
    applyText(v); afterEdit(); keepMine(); showCount();
  };
  let t = null;
  area.addEventListener('input', () => { clearTimeout(t); t = setTimeout(put, 250); showCount(); });
  const pickVoice = i => { vi = i; area.value = typedOfLyr(b.voices[vi].lyrics); drawVoices(); showCount(); };
  const drawVoices = () => {
    voiceRow.replaceChildren(...(b.voices.length > 1 ? b.voices.map((v, i) => el('button', { type: 'button', class: 'chip' + (i === vi ? ' on' : ''), 'aria-pressed': String(i === vi), onclick: () => pickVoice(i) }, v.name || tr('Voice') + ' ' + (i + 1))) : []));
  };
  const close = () => { clearTimeout(t); put(); pop.hidden = true; sendLater(); };
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('Text under the notes')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: close }, '×')),
    el('div', { class: 'nm' },
      voiceRow,
      el('label', {}, tr('Type the text, with a hyphen between the syllables of a word'), area),
      count,
      el('p', { class: 'hint' }, tr('One syllable to each note, in order. A dot ( . ) lets a syllable go on over one more note: A-.-ve gives “A” two notes. Chimera sings the text when you press Play.')),
      el('div', { class: 'nm-go' },
        el('button', { type: 'button', class: 'chip', onclick: () => { area.value = ''; put(); } }, tr('Clear the text')),
        el('button', { type: 'button', class: 'chip primary', onclick: close }, tr('Done')))));
  pickVoice(vi);
  pop.hidden = false; setTimeout(() => area.focus(), 30);
}

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
    grp(btn(ICON.text + '<span class="tblab">' + esc(tr('Text')) + '</span>', tr('Text under the notes'), () => askText(S.sel ? S.sel.vi : 0))),
  );
  $('#toolbar').classList.toggle('editing', S.edit);
  if (!has) box.append(el('span', { class: 'edit-hint' }, tr('Tap a note to select it, or tap the staff to put a note there.')));
  syncTitleEdit();
}

$('#clearBtn').addEventListener('click', () => askNewMelody());
$('#editBtn').addEventListener('click', () => {
  S.edit = !S.edit;
  if (!S.edit) S.sel = null;
  buildEditTools(); render(); markSel();
});
$('#transformBtn').addEventListener('click', e => {
  e.stopPropagation();
  const pop = $('#transformPop'); pop.hidden = !pop.hidden;
  /* the window opens in the middle of the screen (see .pop) */
  $('#transformBtn').setAttribute('aria-expanded', String(!pop.hidden));
});
document.addEventListener('click', e => { const pop = $('#transformPop'); if (!pop.hidden && e.target.isConnected && !pop.contains(e.target)) { pop.hidden = true; $('#transformBtn').setAttribute('aria-expanded', 'false'); } });

/* ------------------------------------------------------------------ playback */
/* the beat in minimae: a brevis holds six of them in tempus perfectum, a longa twice the brevis */
/* triple time: tempus perfectum, or a piece that moves in threes (cantus fractus) */
const isTriple = () => !!S.piece && !S.piece.talea && (S.piece.tempus === 'O' || (S.piece.ternary && S.piece.tempus === 'C'));
const beatMinims = () => { const O = isTriple(); return { L: O ? 12 : 8, B: O ? 6 : 4, S: 2, M: 1 }[prefs.unit] || (O ? 6 : 4); };
/* the tempo always counts semibreves: 60 means the semibrevis at 60, so a brevis tactus beats at 30 */
const spm = () => (60 / prefs.tempo) / 2; /* seconds per minim */
const tactusPerMin = () => Math.round(prefs.tempo * 2 / beatMinims() * 10) / 10;
const showTempo = () => { const i = $('#tempo'); if (document.activeElement !== i) i.value = prefs.tempo; i.title = `${tr('Semibrevis')} ${prefs.tempo} · ${tr('tactus')} ${tactusPerMin()}`; };

let timer = 0, raf = 0, clock = null;

/* the tactus hand: down on the beat (positio), up halfway through it (elevatio) */
const thArm = document.getElementById('thArm');
/* lift 0: the hand down (the downbeat), 1: up (the upbeat) */
function poseHand(lift) {
  thArm.style.transform = `rotate(${(lift - .5) * (prefs.handStyle === 'palm' ? 9 : 8)}deg)`;
}
/* the tactus: equal in duple time (down on the beat, up halfway);
   in tempus perfectum, when the brevis is counted, unequal (tactus inaequalis): down on 1, still on 2, up on 3 */
const ease = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
function beatHand(pos) {
  const unit = beatMinims();
  const ph = (((pos - (S.piece.beatOff || 0)) / unit) % 1 + 1) % 1;
  const tri = isTriple() && unit === 6, up = tri ? 2 / 3 : 1 / 2;
  /* in tempus perfectum the hand stays down through the first two semibreves and up through the third,
     moving only briefly into each position, so that the 2 + 1 is plain to see */
  const fall = tri ? .07 : Math.min(.18, (1 - up) * .6), rise = tri ? .07 : Math.min(.18, up * .45);
  /* the hand arrives up exactly on the upbeat and down exactly on the downbeat */
  const lift = ph < up ? ease(up - rise, up, ph) : 1 - ease(1 - fall, 1, ph);
  poseHand(lift);
}
/* the pendulum swings once for each part of the tactus (each semibrevis under a brevis tactus: two in duple, three in triple time),
   reaching the end of its swing exactly on each part, as a real pendulum: a sine */
function swingPendulum(pos) {
  const unit = beatMinims(), parts = isTriple() && unit === 6 ? 3 : 2;
  const x = (pos - (S.piece.beatOff || 0)) / (unit / parts);
  const ang = t => (16 * Math.cos(Math.PI * t)).toFixed(2);
  $('#pdArm').style.transform = `rotate(${ang(x)}deg)`;
  /* a trail of fading bobs behind the moving one: faster swing, longer trail */
  [['#pdG1', .045, .28], ['#pdG2', .09, .16], ['#pdG3', .135, .08]].forEach(([id, lag, op]) => {
    const g = $(id), speed = Math.abs(Math.sin(Math.PI * x));
    g.style.transform = `rotate(${ang(x - lag)}deg)`; g.style.opacity = (op * speed).toFixed(3);
  });
}
function syncHand() {
  $('#pendulum').hidden = !prefs.pendulum;
  $('#pendulum').style.setProperty('--ps', prefs.pendSize || 1);
  $('#tactusHand').style.setProperty('--hs', prefs.handSize || 1);
  $('#tactusHand').dataset.style = prefs.handStyle || 'palm';
  if (!S.playing) { $('#pdArm').style.transform = ''; document.querySelectorAll('.pd-ghost').forEach(g => { g.style.opacity = 0; }); }
  $('#tactusHand').hidden = !prefs.hand;
  $('#tactusHand').classList.toggle('beating', !!S.playing);
  if (!S.playing) poseHand(.5);
}

function sounding() {
  const out = [];
  S.piece.voices.forEach((v, vi) => {
    if (S.voice[vi] !== 'on') return;
    /* a note without its own syllable continues the syllable before it (a ligature in chant, a melisma in mensural
       music): it is sung on that syllable's vowel and tied to the note before, with no new accent */
    const texted = !!v.lyrics && v.notes.some(n => n.text);
    /* voice, lute and sackbut sing the whole line legato: every note flows into the next unless a rest comes between */
    const flowing = ['voice', 'lute', 'sackbut'].includes(prefs.timbre);
    /* the voice sings each syllable in Latin, with its consonants: the onset before the first note, the coda at the end of the last */
    const syls = texted ? syllablesOf(v.notes) : new Map();
    let syl = '', prev = null, u = null, hy = false, phrase = [];
    /* the shape of a phrase (the notes between two rests): rising lines grow, falling lines soften, the phrase's last
       note is let go; the voice also swells or fades within a note towards the next one, so the line breathes as one */
    const shape = () => {
      if (!phrase.length) return;
      const ms = phrase.map(e => midiOf(e.n, S.piece.bflat, S.shift)), ws = phrase.map(e => e.n.len);
      const mean = ms.reduce((a, m, i) => a + m * ws[i], 0) / ws.reduce((a, w) => a + w, 0);
      phrase.forEach((e, i) => {
        const rise = i ? Math.max(-3, Math.min(3, ms[i] - ms[i - 1])) : 0;
        e.dyn = 1 + .09 * (ms[i] - mean) + .04 * rise - (i === phrase.length - 1 && phrase.length > 1 ? .15 : 0);
      });
      /* a phrase begins gently, wherever it lies in the voice's range: a high entry is not a loud one. The voice comes in
         at about 80 % and grows into the line over its first two semibreves; only then does the shape by pitch fully apply. */
      const t0 = phrase[0].n.t, GROW = 4;
      phrase.forEach(e => {
        const w = Math.min(1, (e.n.t - t0) / GROW);
        e.dyn = (.8 + .2 * w) * (1 + w * (e.dyn - 1));
      });
      /* a phrase that ends on a long note lets it die away: the last third falls to about 65 % */
      const lastE = phrase[phrase.length - 1];
      if (phrase.length > 1 && lastE.n.len >= 2) lastE.fade = .65;
      phrase.forEach(e => { e.ph = phrase; });
      phrase = [];
    };
    v.notes.forEach(n => {
      if (n.rest) { prev = null; shape(); return; }
      if (n.tie && prev && midiOf(prev.n, S.piece.bflat, 0) === midiOf(n, S.piece.bflat, 0) && Math.abs(prev.n.t + prev.n.len + (prev.extra || 0) - n.t) < 1e-6) { prev.extra = (prev.extra || 0) + n.len; return; }
      /* a new syllable of the same word (the one before ended in a hyphen) is bound to it */
      const inWord = !!(n.text && prev && hy);
      if (n.text) { syl = n.text; u = snd.units(syls.get(n)); hy = !!n.hyphen; } else if (!texted) u = snd.units(null);
      const e = { vi, n, syl: n.text || syl, tied: texted && !n.text && !!prev, joined: !!prev, u, last: true };
      if ((e.tied || flowing) && prev) prev.legato = true;
      if (e.tied && prev) prev.last = false;
      /* a voice without words sings its whole phrase on one breath: every note joined to the one before continues it */
      if (!texted && prefs.timbre === 'voice' && prev && Math.abs(prev.n.t + prev.n.len + (prev.extra || 0) - n.t) < 1e-6) { e.tied = true; prev.last = false; prev.legato = true; }
      if (prev && !e.tied && Math.abs(prev.n.t + prev.n.len - n.t) < 1e-6) { prev.next = e; if (inWord) prev.inWord = true; }
      out.push(e); prev = e; phrase.push(e);
    });
    shape();
  });
  /* semiminims go in pairs, as under one slur (each pair starting on a minim of the tactus): the second note is lighter
     and flows from the first; a new pair takes a small fresh breath. With inégalité the stepwise pairs are unequal. */
  const ineg = prefs.inegal === 'inegal' || prefs.inegal === 'contre' ? prefs.inegal : null;
  const r = ineg ? (prefs.inegalDeg === 'dotted' ? .75 : .6) : .5, first = ineg === 'contre' ? 1 - r : r;
  const lists = new Map();
  out.forEach(e => { if (!lists.has(e.vi)) lists.set(e.vi, []); lists.get(e.vi).push(e); });
  lists.forEach(list => list.forEach((a, i) => {
    const b = list[i + 1], q = (S.piece.beatOff || 0);
    if (!b || a.pairB || a.n.v !== 'Sm' || b.n.v !== 'Sm' || Math.abs(a.n.len - .5) > 1e-6 || Math.abs(b.n.len - .5) > 1e-6) return;
    if (Math.abs(a.n.t + a.n.len - b.n.t) > 1e-6 || Math.abs(((a.n.t - q) % 1 + 1) % 1) > 1e-6) return;
    a.pairA = true; b.pairB = true;
    a.dyn = (a.dyn || 1) * 1.06; b.dyn = (b.dyn || 1) * .84;
    if (ineg && Math.abs(a.n.step - b.n.step) <= 1) { const d = first * 1 - .5; a.dl = d; b.dt = d; b.dl = -d; }
  }));
  /* dissonance and resolution: a note that clashes with another voice (a second, a seventh, a tritone, or a fourth
     above the lowest voice), at its start or when another voice moves under it (a suspension), leans in a little;
     the consonance it resolves to is sung softer. */
  const P = S.piece, mid = n => midiOf(n, P.bflat, S.shift);
  const all = P.voices.map(v => v.notes.filter(n => !n.rest));
  const find = (ns, t) => { let lo = 0, hi = ns.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (ns[m].t <= t + 1e-6) { r = m; lo = m + 1; } else hi = m - 1; } return r >= 0 && t < ns[r].t + ns[r].len - 1e-6 ? ns[r] : null; };
  const at = t => all.map(ns => find(ns, t)).filter(Boolean);
  const onsets = [...new Set(all.flat().map(n => n.t))].sort((a, b) => a - b);
  const clash = (n, t) => {
    const here = at(t), m = mid(n), low = Math.min(...here.map(mid));
    return here.some(o => { if (o === n) return false; const d = Math.abs(mid(o) - m) % 12; return [1, 2, 6, 10, 11].includes(d) || (d === 5 && Math.min(m, mid(o)) === low); });
  };
  const byVoice = new Map();
  out.forEach(e => { if (!byVoice.has(e.vi)) byVoice.set(e.vi, []); byVoice.get(e.vi).push(e); });
  if (P.voices.length > 1) byVoice.forEach(list => list.forEach((e, i) => {
    const n = e.n, moves = [];
    for (let lo = 0, hi = onsets.length; ; ) { if (lo >= hi) { for (let j = lo; j < onsets.length && onsets[j] < n.t + n.len * .6; j++) if (onsets[j] > n.t + 1e-6) moves.push(onsets[j]); break; } const m = (lo + hi) >> 1; if (onsets[m] <= n.t) lo = m + 1; else hi = m; }
    e.diss = [n.t, ...moves].some(t => clash(n, t));
    if (e.diss) e.dyn = (e.dyn || 1) * 1.22;
    else if (i && list[i - 1].diss && list[i - 1].n.t + list[i - 1].n.len >= n.t - 1e-6) e.dyn = (e.dyn || 1) * .82;
  }));
  /* the dynamics kept within a singer's range, then each note swells towards the next of its phrase */
  out.forEach(e => { e.dyn = Math.max(.5, Math.min(1.7, e.dyn || 1)); });
  out.forEach(e => { const ph = e.ph, i = ph ? ph.indexOf(e) : -1; if (i >= 0 && i + 1 < ph.length) e.swell = ph[i + 1].dyn / e.dyn; delete e.ph; });
  return out.sort((a, b) => a.n.t - b.n.t);
}

/* the voice's syllables for this piece, fetched before it sings (the files of a piece are small and stay cached) */
function voiceReady() {
  /* recorded and modelled instruments: their notes (a few MB at most, kept for offline use) load before they play */
  if (prefs.timbre !== 'voice') return Promise.race([snd.warm(prefs.timbre), new Promise(r => setTimeout(r, 8000))]);
  if (!S.piece) return Promise.resolve();
  const p = S.piece;
  return Promise.race([snd.prepare().then(() => snd.load(sounding().map(e => ({ u: e.u, midi: midiOf(e.n, p.bflat, S.shift) })))), new Promise(r => setTimeout(r, 6000))]);
}

function startPlayback() {
  const ctx = snd.ensure();
  snd.setVolume(prefs.volume);
  const p = S.piece, from = S.startAt || 0, k = spm();
  const events = sounding().filter(e => e.n.t + e.n.len > from + 1e-6);
  const off = p.beatOff || 0;
  let ei = 0, bi = Math.ceil((from - off) / beatMinims() - 1e-9);
  const t0 = ctx.currentTime + .15;
  clock = { t0, from, k, end: p.end, ended: false };
  recHook(ctx, t0, from);
  singStart(from);
  const beat = beatMinims();
  const pump = () => {
    const horizon = ctx.currentTime + 1.2;
    while (ei < events.length && t0 + (events[ei].n.t - from) * k < horizon) {
      const { vi, n, syl, tied, legato, joined } = events[ei++];
      const ev0 = events[ei - 1], nt = n.t + (ev0.dt || 0);
      const at = t0 + Math.max(0, nt - from) * k;
      const cut = Math.max(0, from - nt);
      const tie = tied && n.t >= from - 1e-6;
      const midi = midiOf(n, p.bflat, S.shift), dur = Math.max(.08, (n.len + (ev0.dl || 0) + (events[ei - 1].extra || 0) - cut) * k - (legato ? 0 : .03));
      /* the coda closes before the next syllable's onset consonants begin */
      /* inside a word the vowel runs on into the next syllable's consonants (legato); between words it gives way to them */
      const ev = events[ei - 1], nx = ev.next, lead = nx ? Math.min(.25, snd.leadOf(nx.u, midiOf(nx.n, p.bflat, S.shift))) : 0;
      const close = at + dur - (ev.inWord ? lead * .3 : lead);
      const shaped = prefs.timbre !== 'organ' && prefs.musical !== false;
      playNote({ timbre: prefs.timbre, midi, a4: prefs.a4, at, text: syl, tied: tie, legato: !!legato, value: n.len + (ev.extra || 0), joined: !!joined && cut === 0, dur, u: ev.u, last: ev.last, close, inWord: !!ev.inWord,
        swell: shaped && legato ? ev.swell : null, fade: shaped ? ev.fade : null, lift: !!ev.pairA, key: vi, level: .2 / Math.sqrt(Math.max(1, p.voices.length)) * (shaped ? ev.dyn || 1 : 1) });
    }
    while (prefs.click && bi * beat + off < p.end && t0 + (bi * beat + off - from) * k < horizon) { snd.click(t0 + (bi * beat + off - from) * k, bi % 1 === 0 && bi % 3 === 0); bi++; }
  };
  pump();
  timer = setInterval(pump, 150);
  setPlaying(true);
  frame();
}


/* ------------------------------------------------------------------ organum purum */
/* In the organum purum of Notre-Dame (Leonin's Magnus liber, c. 1200) the chant in the tenor is not measured: each
   note is held as long as the organal voice above needs for its melisma, and moves on only at the sign of the cantor.
   Here the big button (or the space bar, Enter or →) is that sign; ← goes back one note. The voice holds each note as
   one open-ended vowel, glides within a ligature and says the next syllable when the text moves on. */
const opPanel = $('#opPanel');
function opList() { return S.piece ? sounding().filter(e => e.vi === 0) : []; }
function opRelease() {
  if (OP.h) { try { OP.h.release(); } catch (e) { /* gone */ } OP.h = null; }
  else snd.silence();
}
function opSound(e, fwd) {
  const midi = midiOf(e.n, S.piece.bflat, S.shift);
  if (prefs.timbre === 'voice') {
    const fresh = !OP.h || !OP.h.alive;
    if (fresh) OP.h = snd.hold({ a4: prefs.a4, level: .2 });
    let ok = false;
    if (OP.h) ok = fresh ? OP.h.sing(e.u, midi) : (e.tied && fwd ? OP.h.glide(midi) : OP.h.say(e.u, midi));
    if (ok) return;
    /* the voice is not ready yet: the note sounds on the organ meanwhile, and the voice loads */
    if (OP.h) { try { OP.h.release(); } catch (x) { /* gone */ } OP.h = null; }
    voiceReady();
    snd.silence(); const ctx = snd.ensure();
    playNote({ timbre: 'organ', midi, a4: prefs.a4, at: ctx.currentTime + .015, dur: 600, level: .2 });
    return;
  }
  snd.silence();
  const ctx = snd.ensure();
  playNote({ timbre: prefs.timbre, midi, a4: prefs.a4, at: ctx.currentTime + .015, dur: 600, level: .2, text: e.syl, legato: true });
}
function opMark(scroll = true) {
  S.index.forEach(x => { if (x.on) { x.e.classList.remove('on'); x.on = false; } });
  const e = OP.list[OP.i]; if (!e) return;
  const x = S.index.find(x => x.v === 0 && Math.abs(x.t - e.n.t) < 1e-6);
  if (!x) return;
  x.e.classList.add('on'); x.on = true;
  if (scroll) {
    const r = paper.querySelector('.roll');
    if (r) { const b = x.e.getBoundingClientRect(), rb = r.getBoundingClientRect(); r.scrollLeft += b.left - rb.left - r.clientWidth / 2; }
    else { const st = $('#stage'), b = x.e.getBoundingClientRect(), sb = st.getBoundingClientRect(); if (b.top < sb.top + 40 || b.bottom > sb.bottom - 40) st.scrollTo({ top: st.scrollTop + b.top - sb.top - 90, behavior: 'smooth' }); }
  }
}
function opLabel() {
  const n = OP.list.length, i = OP.i, next = OP.list[i + 1];
  const sub = i < 0 ? tr('Tap to sound the first note') : i >= n ? tr('The end: tap to begin again')
    : (next ? tr('Next') + ': ' + ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'][midiOf(next.n, S.piece.bflat, S.shift) % 12] + (next.n.text && !next.tied ? ' · ' + next.n.text : '') : tr('Last note: tap to end'));
  $('#opBig').textContent = i < 0 || i >= n ? tr('Begin') : tr('Go on');
  $('#opSub').textContent = sub;
  $('#opCount').textContent = i >= 0 && i < n ? (i + 1) + ' / ' + n : n + '';
  $('#opBack').disabled = i <= 0;
}
function opStep(dir) {
  if (!OP.on || !S.piece) return;
  if (S.playing) stopPlayback(true);
  snd.ensure(); snd.setVolume(prefs.volume);
  if (!OP.list.length) OP.list = opList();
  if (OP.i >= OP.list.length && dir > 0) OP.i = -1;
  const j = OP.i + dir;
  if (j < 0) return;
  if (j >= OP.list.length) { opRelease(); OP.i = OP.list.length; S.index.forEach(x => { if (x.on) { x.e.classList.remove('on'); x.on = false; } }); opLabel(); return; }
  OP.i = j; opSound(OP.list[j], dir > 0); opMark(); opLabel();
}
function opStop() { opRelease(); OP.i = -1; S.index.forEach(x => { if (x.on) { x.e.classList.remove('on'); x.on = false; } }); opLabel(); }
function opToggle(on = !OP.on) {
  if (!on) opStop();
  OP.on = on; OP.i = -1; OP.list = [];
  if (on) { stopPlayback(); voiceReady(); OP.list = opList(); opLabel(); }
  opPanel.hidden = !on;
  document.documentElement.classList.toggle('organum', on);
  buildStudio();
}
/* the sign is given on pointerdown, the moment the finger touches, not when it lifts */
$('#opNext').addEventListener('pointerdown', e => { if (e.button > 0) return; e.preventDefault(); opStep(1); });
$('#opNext').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) opStep(1); } });
$('#opBack').addEventListener('click', () => opStep(-1));
$('#opEnd').addEventListener('click', () => opToggle(false));

/* jump to the previous or next note (of any voice) while playing, and play on from there */
function seekStep(dir) {
  if (!S.playing || !clock) return;
  const pos = Math.max(clock.from, clock.from + (snd.now() - clock.t0) / clock.k);
  const on = [...new Set(sounding().map(e => Math.round(e.n.t * 1e6) / 1e6))].sort((a, b) => a - b);
  if (!on.length) return;
  let t;
  if (dir < 0) {
    let cur = on[0];
    for (const x of on) if (x <= pos + 1e-6) cur = x;
    const before = on.filter(x => x < cur - 1e-6);
    t = before.length ? before[before.length - 1] : on[0];
  } else {
    t = on.find(x => x > pos + 1e-6);
    if (t == null) return;
  }
  stopPlayback(true); S.startAt = t; startPlayback();
}
function stopPlayback(keep, natural) {
  clearInterval(timer); cancelAnimationFrame(raf);
  /* Stop means stop: the sounding notes are cut at once, not finished */
  if (!natural) snd.silence();
  recStop();
  singStop();
  clock = null;
  if (S.playing) setPlaying(false);
  S.index.forEach(x => { if (x.on) { x.e.classList.remove('on'); x.on = false; } });
}

function setPlaying(on) {
  S.playing = on;
  $('#playIcon').innerHTML = on ? '<path d="M7 6h3v12H7zM14 6h3v12h-3z"/>' : '<path d="M8 5.500v13l10.500-6.500z"/>';
  $('#play').setAttribute('aria-label', on ? tr('Pause') : tr('Play'));
  syncHand();
}

let lastSys = -1, lastLeaf = -1;
function frame() {
  if (!clock) return;
  const pos = clock.from + (snd.now() - clock.t0) / clock.k;
  if (prefs.hand) beatHand(Math.max(0, pos));
  if (prefs.pendulum) swingPendulum(Math.max(0, pos));
  if (pos >= clock.end + 0.5) { stopPlayback(false, true); S.startAt = 0; if (prefs.loop) startPlayback(); return; }
  for (const x of S.index) {
    const on = !(S.nofollow && S.nofollow[x.v]) && x.t <= pos && pos < x.end;
    if (on !== x.on) { x.on = on; x.e.classList.toggle('on', on); }
  }
  /* follow the music */
  if (paper.classList.contains('book')) {
    const li = S.leaves.findIndex(l => pos >= l.t0 - 1e-6 && pos < l.t1);
    if (li >= 0 && li !== S.leaf) { S.leaf = li; render(); if (S.playing) { /* keep the highlight on */ } }
  } else if (paper.classList.contains('rolling')) {
    /* the music moves, the eye stays in the middle */
    const r = paper.querySelector('.roll');
    if (r) r.scrollLeft = rollX(pos) - r.clientWidth / 2;
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
  /* in organum purum a tapped note becomes the held one */
  if (OP.on && vi === 0 && !n.rest) { if (!OP.list.length) OP.list = opList(); const j = OP.list.findIndex(x => Math.abs(x.n.t - t) < 1e-6); if (j >= 0) { OP.i = j - 1; opStep(1); } return; }
  S.startAt = t;
  paper.querySelectorAll('.note.sel').forEach(x => x.classList.remove('sel'));
  g.classList.add('sel');
  if (!n.rest && !S.playing) { const ctx = snd.ensure(); playNote({ timbre: prefs.timbre, midi: midiOf(n, S.piece.bflat, S.shift), a4: prefs.a4, text: n.text, at: ctx.currentTime + .02, dur: .7 }); }
  if (S.playing) { stopPlayback(true); startPlayback(); }
});

/* play / pause: pausing keeps the place, play goes on from there; the button left of it goes back to the beginning */
$('#play').addEventListener('click', e => {
  if (OP.on) { e.stopImmediatePropagation(); if (OP.i >= 0 && OP.i < OP.list.length) opStop(); else { OP.i = -1; opStep(1); } return; }
  if (S.playing) { const pos = clock ? clock.from + (snd.now() - clock.t0) / clock.k : 0; stopPlayback(); S.startAt = Math.max(0, Math.min(pos, S.piece.end - 1e-6)); }
  else { snd.ensure(); const b = $('#play'); b.classList.add('loading'); voiceReady().then(() => { b.classList.remove('loading'); if (!S.playing) startPlayback(); }); }
});
$('#rewind').addEventListener('click', () => {
  const was = S.playing;
  if (was) stopPlayback(true);
  S.startAt = 0; S.leaf = 0;
  if (was) startPlayback(); else { render(); $('#stage').scrollTo?.({ top: 0, behavior: 'smooth' }); }
});
/* the pitch: a′ in Hz, typed beside Tap */
const showPitch = () => { const i = $('#pitchHz'); if (i && document.activeElement !== i) i.value = prefs.a4; };
$('#pitchHz').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
$('#pitchHz').addEventListener('change', e => {
  const v = +String(e.target.value).replace(',', '.');
  if (!(v >= 200 && v <= 1000)) { e.target.value = prefs.a4; return; }
  prefs.a4 = Math.round(v * 10) / 10; e.target.value = prefs.a4; savePrefs(); syncMicOpt(); buildStudio();
  if (S.playing && clock) { const pos = clock.from + (snd.now() - clock.t0) / clock.k; stopPlayback(true); S.startAt = pos; startPlayback(); }
});
showPitch();
$('#tempo').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
$('#tempo').addEventListener('change', e => { const v = +e.target.value; if (!v) { e.target.value = prefs.tempo; return; } prefs.tempo = Math.max(10, Math.min(300, Math.round(v))); e.target.value = prefs.tempo; showTempo(); savePrefs(); if (S.playing) { const pos = clock.from + (snd.now() - clock.t0) / clock.k; stopPlayback(true); S.startAt = pos; startPlayback(); } });
/* the beat: which value the tactus counts, tapping it, and looping */
const UNITS = [['L', 'Longa'], ['B', 'Brevis'], ['S', 'Semibrevis'], ['M', 'Minima']];
function setTempo(v) {
  prefs.tempo = Math.max(10, Math.min(300, Math.round(v))); $('#tempo').value = prefs.tempo; showTempo(); savePrefs();
  if (S.playing && clock) { const pos = clock.from + (snd.now() - clock.t0) / clock.k; stopPlayback(true); S.startAt = pos; startPlayback(); }
}
/* Tactus: which note value the beat counts, chosen by its shape (minima, semibrevis, brevis, longa) */
function buildUnits() {
  const seg = $('#unitSeg'); seg.textContent = '';
  ['M', 'S', 'B', 'L'].forEach(k => {
    const n = (UNITS.find(u => u[0] === k) || [k, k])[1];
    seg.append(el('button', { type: 'button', 'aria-pressed': String(prefs.unit === k), title: tr(n) + ' = ' + tr('tactus'), 'aria-label': tr(n) + ' = ' + tr('tactus'),
      onclick: () => { const tac = seg.closest('.tactus'); if (!tac.classList.contains('open')) { tac.classList.add('open'); return; } prefs.unit = k; setTempo(prefs.tempo); tac.classList.remove('open'); buildUnits(); } }, parse(glyphIcon('note', k))));
  });
}
document.querySelector('.tactus .tlab')?.addEventListener('click', () => document.querySelector('.tactus').classList.toggle('open'));
document.addEventListener('pointerdown', e => { const t = document.querySelector('.tactus.open'); if (t && !t.contains(e.target)) t.classList.remove('open'); });
const taps = [];
$('#tap').addEventListener('click', () => {
  const t = performance.now();
  if (taps.length && t - taps[taps.length - 1] > 2500) taps.length = 0;
  taps.push(t); if (taps.length > 6) taps.shift();
  if (taps.length >= 2) setTempo(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)) * beatMinims() / 2);
});
const syncLoop = () => $('#loopBtn').setAttribute('aria-pressed', String(prefs.loop));
$('#loopBtn').addEventListener('click', () => { prefs.loop = !prefs.loop; savePrefs(); syncLoop(); });
$('#prevLeaf').addEventListener('click', () => { S.leaf = Math.max(0, S.leaf - 1); render(); });
$('#nextLeaf').addEventListener('click', () => { S.leaf = Math.min(S.leaves.length - 1, S.leaf + 1); render(); });
document.addEventListener('keydown', e => {
  if (e.target.matches('input, select, textarea')) return;
  if (e.target.isContentEditable) return;
  if (OP.on && !S.edit && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (e.code === 'Space' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); if (!e.repeat) opStep(1); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); if (!e.repeat) opStep(-1); return; }
    if (e.key === 'Escape') { opStop(); return; }
  }
  if (e.code === 'Space') { e.preventDefault(); $('#play').click(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) {
    if (S.edit && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redoEdit(); else undo(); }
    return;
  }
  /* while it plays, the arrows step back or forward note by note and the music goes on from there */
  if (!S.edit && S.playing && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); seekStep(e.key === 'ArrowLeft' ? -1 : 1); return; }
  /* the keyboard writes music only after the pencil (Edit) is tapped; until then only the page keys work */
  if (!S.edit) {
    if (e.key === 'ArrowRight' && !$('#pager').hidden) $('#nextLeaf').click();
    if (e.key === 'ArrowLeft' && !$('#pager').hidden) $('#prevLeaf').click();
    return;
  }
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
const tokOf = n => n.rest ? 'r' + n.v + (n.dot ? '.' : '') : n.step + (n.ficta && n.acc ? '^' : '') + (n.acc || '') + n.v + (n.col ? 'k' : '') + (n.dot ? '.' : '') + (n.tie ? '~' : '');
/* the base piece as a library item */
function itemOf(b) {
  const it = { title: b.title, t: b.tempus, b: b.bflat || undefined, cut: b.cut || undefined, mine: true };
  if (b.voices.length > 1) it.poly = b.voices.map(v => ({ c: v.clef, nm: v.name, n: v.notes.map(tokOf).join(' '), lyr: v.lyrics || undefined }));
  else if (b.kind === 'chant') {
    /* plainchant (also a chant sung in) stays plainchant: square notes on four lines */
    const ns = b.voices[0].notes.filter(n => !n.rest);
    it.c = b.voices[0].clef; it.s = ns.map(n => n.step); delete it.t;
    if (ns.some(n => n.acc)) it.a = ns.map(n => n.acc || '');
    if (b.voices[0].lyrics) it.lyr = b.voices[0].lyrics;
    if (b.sung) it.sung = true;
  } else { it.c = b.voices[0].clef; it.n = b.voices[0].notes.map(tokOf).join(' '); if (b.voices[0].lyrics) it.lyr = b.voices[0].lyrics; }
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
  sendLater();
}
function adoptMine(item, open = true) {
  item.id ??= ++uid; item.mine = true;
  mine.unshift(item); saveMineList(); mineGroup(); renderTree($('#search').value);
  if (open) { openItem(item, [tr('Your melodies')]); S.base.mine = true; }
}
function newMelody(title, words = '') {
  const cur = S.base;
  sendMine();
  const lyr = lyrOfTyped(words || '');
  adoptMine({ title: title || tr('Your own melody'), n: '', c: cur && cur.kind !== 'chant' ? cur.voices[0].clef : 'c4', t: 'C', mine: true, lyr: lyr || undefined });
  if (lyr && S.base) S.base.voices[0].lyrics = lyr;
  S.edit = true; S.sel = null; S.inDur = 'S'; S.inRest = false; buildEditTools(); render(); markSel();
  toast(tr('Tap the staff to put a note there, or type A to G.'));
}
/* New: first the melody gets its name; then an empty staff opens in Edit. */
const SENDPREF = 'cantare-next:send';
function askNewMelody() {
  const pop = $('#clefPop');
  let send = true; try { send = localStorage.getItem(SENDPREF) !== 'no'; } catch (e) { /* ignore */ }
  const name = el('input', { type: 'text', class: 'nm-in', maxlength: 120, placeholder: tr('e.g. My cantus firmus in the first mode'), 'aria-label': tr('Name of the melody') });
  const who = el('input', { type: 'text', class: 'nm-in', maxlength: 80, placeholder: tr('Your name (optional)'), 'aria-label': tr('Your name (optional)') });
  const words = el('textarea', { class: 'nm-in tx-in', rows: 2, maxlength: 4000, spellcheck: 'false', placeholder: tr('e.g. A-ve ma-ris stel-la'), 'aria-label': tr('Text (optional)') });
  const box = el('input', { type: 'checkbox', checked: send });
  const go = () => {
    const t = name.value.trim();
    if (!t) { name.focus(); name.classList.add('need'); return; }
    try { localStorage.setItem(SENDPREF, box.checked ? 'yes' : 'no'); if (who.value.trim()) localStorage.setItem('cantare-next:who', who.value.trim()); } catch (e) { /* ignore */ }
    pop.hidden = true; newMelody(t, words.value);
  };
  try { who.value = localStorage.getItem('cantare-next:who') || ''; } catch (e) { /* ignore */ }
  name.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('New melody')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: () => { pop.hidden = true; } }, '×')),
    el('div', { class: 'nm' },
      el('label', {}, tr('Name of the melody'), name),
      el('label', {}, tr('Your name (optional)'), who),
      el('label', {}, tr('Text (optional): a hyphen between syllables; it can also be added later with the Text button'), words),
      el('label', { class: 'nm-send' }, box, el('span', {}, tr('Send a copy to Václav Hřebec, who collects the melodies people write here (title, notes, text and your name if given).'))),
      el('p', { class: 'hint' }, tr('Your melody is saved in this browser under Your melodies in the library.')),
      el('div', { class: 'nm-go' }, el('button', { type: 'button', class: 'chip', onclick: () => { pop.hidden = true; } }, tr('Cancel')),
        el('button', { type: 'button', class: 'chip', onclick: () => singIn(name.value.trim()) }, tr('Sing a chant instead')),
        el('button', { type: 'button', class: 'chip primary', onclick: go }, tr('Start writing')))));
  pop.hidden = false; setTimeout(() => name.focus(), 30);
}
/* Sing a chant: the microphone writes it down as plainchant (singin.js); it is kept among your melodies */
function singIn(title = '') {
  if (S.playing) stopPlayback();
  if (mic.on) micToggle();
  openSingIn({
    el, tr, pop: $('#clefPop'), getCtx: () => snd.ensure(), a4: () => prefs.a4,
    draw: it => {
      const p = pieceFrom(it, []), w = Math.max(20, ($('#clefPop').clientWidth - 40) / 12);
      return engraveSystems(p, [0], w, { names: false, count: false }).map(s => systemSVG(s, 12)).join('');
    },
    play: it => {
      const p = pieceFrom(it, []), ctx = snd.ensure(); let at = ctx.currentTime + .1;
      let syl = '';
      p.voices[0].notes.forEach(n => {
        if (n.rest) return;
        const tied = !n.text && !!syl; if (n.text) syl = n.text;
        playNote({ timbre: prefs.timbre, midi: midiOf(n, p.bflat, 0), a4: prefs.a4, at, dur: .5, text: syl || 'a', tied, value: 4 });
        at += .55;
      });
    },
    save: it => {
      adoptMine(it); S.base.sung = true; sendMine();
      toast(tr('Saved under Your melodies. Edit corrects a note; the PDF button saves the score.'));
    },
  });
  const t = document.querySelector('.singin .nm-in'); if (t && title) t.value = title;
}
$('#singBtn')?.addEventListener('click', () => singIn());

/* a copy of each written melody goes to Václav (if the writer agreed): when it rests for a minute, when another one is
   started, and when the page is left; only melodies with a few notes, and only when something changed since the last copy */
const sentAt = new Map();
let sendT = null;
function sendMine(b = S.base) {
  clearTimeout(sendT);
  if (!b || !b.mine) return;
  try { if (localStorage.getItem(SENDPREF) === 'no') return; } catch (e) { /* ignore */ }
  const notes = b.voices.reduce((a, v) => a + v.notes.filter(n => !n.rest).length, 0);
  if (notes < 3) return;
  const it = itemOf(b), key = JSON.stringify(it);
  if (sentAt.get(b.id) === key) return;
  sentAt.set(b.id, key);
  const body = mailBody(b, it, key);
  try { fetch('https://formsubmit.co/ajax/vaclavhrebec2000@gmail.com', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }).catch(() => {}); } catch (e) { /* offline: it goes with the next change */ sentAt.delete(b.id); }
}
/* what the email about a melody contains */
function mailBody(b, it = itemOf(b), key = JSON.stringify(it)) {
  let who = ''; try { who = localStorage.getItem('cantare-next:who') || ''; } catch (e) { /* ignore */ }
  const body = { _subject: 'Cantare – a new melody: ' + b.title, _template: 'table', _captcha: 'false', About: 'Cantare super librum – melody written by a visitor',
    Title: b.title, Name: who || '—', Notes: it.n || (it.poly || []).map(v => v.n).join(' | ') || (it.s || []).join(' '),
    Text: b.voices.map(v => typedOfLyr(v.lyrics).replace(/\s\.(?=\s|$)/g, '').replace(/-\.-/g, '-').replace(/-/g, '')).filter(Boolean).join(' | ') || '—',
    Syllables: b.voices.map(v => v.lyrics || '').filter(Boolean).join(' | ') || '—', Link: linkOf(b), Data: key };
  if (b.kind === 'chant') {
    /* a chant also goes as GABC, the plain-text chant notation that Gregorio and GregoBase read */
    body._subject = 'Cantare – a new chant' + (b.sung ? ' (sung in)' : '') + ': ' + b.title;
    body.About = 'Cantare super librum – chant ' + (b.sung ? 'sung in' : 'written') + ' by a visitor';
    body.Text = (b.voices[0].lyrics || '').replace(/\s\.(?=\s|$)/g, '').replace(/-\s+/g, '').trim() || '—';
    body.Notes = b.voices[0].notes.filter(n => !n.rest).map(n => 'CDEFGAB'[((n.step % 7) + 7) % 7] + (n.acc === 'b' ? '♭' : n.acc === '#' ? '♯' : '')).join(' ');
    body.GABC = gabcOf(b.title, clefFor(b.voices[0].clef), b.voices[0].notes);
  }
  return body;
}

/* Submit to the collection: the writer's final version, marked so that Václav sees it is offered for the library.
   Sent even when the automatic copies are switched off, since the writer asks for it here. */
function askSubmit() {
  const b = S.base; if (!b || !b.mine) return;
  const pop = $('#clefPop');
  const it0 = mine.find(x => x.id === b.id) || {};
  const notes = b.voices.reduce((a, v) => a + v.notes.filter(n => !n.rest).length, 0);
  let whoV = ''; try { whoV = localStorage.getItem('cantare-next:who') || ''; } catch (e) { /* ignore */ }
  const who = el('input', { type: 'text', class: 'nm-in', maxlength: 80, value: whoV, placeholder: tr('Your name'), 'aria-label': tr('Your name') });
  const mail = el('input', { type: 'email', class: 'nm-in', maxlength: 120, placeholder: tr('Your email (optional, if you want an answer)'), 'aria-label': tr('Your email (optional, if you want an answer)') });
  const src = el('input', { type: 'text', class: 'nm-in', maxlength: 200, value: it0.src || '', placeholder: tr('e.g. my own; or a hymn from a 1545 hymnal'), 'aria-label': tr('Composer or source') });
  const msg = el('textarea', { class: 'nm-in tx-in', rows: 5, maxlength: 2000, placeholder: tr('Say hello, tell me where the melody comes from, or ask me anything'), 'aria-label': tr('Write a short message to Václav') });
  const go = async () => {
    if (!who.value.trim()) { who.focus(); who.classList.add('need'); return; }
    if (!src.value.trim()) { src.focus(); src.classList.add('need'); return; }
    try { localStorage.setItem('cantare-next:who', who.value.trim()); } catch (e) { /* ignore */ }
    const body = mailBody(b);
    body._subject = 'Cantare – SUBMITTED TO THE COLLECTION: ' + b.title;
    body.About = 'Cantare super librum – a visitor submits this melody to the collection (final version)';
    body['Submitted to the collection'] = 'YES – final version, ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    body.Name = who.value.trim();
    body['Composer or source'] = src.value.trim();
    if (mail.value.trim()) { body.Email = mail.value.trim(); body._replyto = mail.value.trim(); }
    body.Message = msg.value.trim() || '—';
    sendBtn.disabled = true; sendBtn.textContent = tr('Sending…');
    let ok = false;
    try {
      const r = await fetch('https://formsubmit.co/ajax/vaclavhrebec2000@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      ok = r.ok;
    } catch (e) { ok = false; }
    if (!ok) { sendBtn.disabled = false; sendBtn.textContent = tr('Submit'); toast(tr('Could not send: are you online? Please try again.')); return; }
    const it = mine.find(x => x.id === b.id);
    if (it) { it.submitted = new Date().toISOString(); it.src = src.value.trim(); saveMineList(); }
    sentAt.set(b.id, JSON.stringify(itemOf(b)));
    pop.hidden = true; syncSubmit();
    toast(tr('Thank you! Václav will look at it for the collection.'));
  };
  const sendBtn = el('button', { type: 'button', class: 'chip primary', onclick: go }, tr('Submit'));
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('Submit to the collection')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: () => { pop.hidden = true; } }, '×')),
    el('div', { class: 'nm' },
      el('p', { class: 'hint' }, tr('This sends the melody as it is now — notes, text and title — to Václav Hřebec, who looks at it and may add it to the library for everyone. Finish it first; you can submit a corrected version later.')),
      el('p', { class: 'sb-what' }, el('strong', {}, b.title), ' · ' + notes + ' ' + tr('notes') + (b.voices.some(v => v.lyrics) ? ' · ' + tr('with text') : ' · ' + tr('no text yet'))),
      el('label', {}, tr('Your name'), who),
      el('label', {}, tr('Composer or source'), src),
      el('label', {}, tr('Your email (optional, if you want an answer)'), mail),
      el('label', { class: 'msg-l' }, el('strong', {}, tr('Write a short message to Václav')), msg),
      el('div', { class: 'nm-go' }, el('button', { type: 'button', class: 'chip', onclick: () => { pop.hidden = true; } }, tr('Cancel')), sendBtn)));
  pop.hidden = false; setTimeout(() => (who.value ? src : who).focus(), 30);
}
function syncSubmit() {
  const bar = $('#submitBar'); if (!bar) return;
  const b = S.base, show = !!(b && b.mine && b.voices.some(v => v.notes.some(n => !n.rest)));
  bar.hidden = !show; if (!show) return;
  const it = mine.find(x => x.id === b.id);
  $('#submitLbl').textContent = it && it.submitted ? tr('Submit the corrected version') : tr('Submit this melody to the collection');
  $('#submitHint').textContent = it && it.submitted ? tr('Submitted on') + ' ' + new Date(it.submitted).toLocaleDateString() + ' ✓' : '';
}
$('#submitBtn').addEventListener('click', () => askSubmit());
const sendLater = () => { clearTimeout(sendT); sendT = setTimeout(() => sendMine(), 60000); };
addEventListener('pagehide', () => sendMine());
document.addEventListener('visibilitychange', () => { if (document.hidden) sendMine(); });

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
    return it && (it.n != null || it.poly || Array.isArray(it.s)) ? it : null;
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
  q.x -= sys.ind || 0; /* the first line starts after the voices' initials */
  const lines = S.piece.lines;
  const real = sys.staves.filter(st => st.vi < S.piece.voices.length && S.voice[st.vi] !== 'hide');
  if (!real.length) return null;
  const dist = st => { const y = q.y - st.y; return y < -1.5 ? -1.5 - y : y > lines + .5 ? y - lines - .5 : 0; };
  const st = real.reduce((a, b) => (dist(b) < dist(a) ? b : a));
  /* in chant the clef may change inside the line: the pitch is read in the clef in force where the pointer is */
  const vi = st.vi, clef = clefAt(st, q.x) || clefFor(S.clefs[vi] || S.piece.voices[vi].clef);
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
  const vi = S.sel ? S.sel.vi : Math.min(S.addVi || 0, S.base.voices.length - 1), ns = S.base.voices[vi].notes, at = S.sel ? S.sel.i + 1 : ns.length;
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
  const vi = S.sel ? S.sel.vi : Math.min(S.addVi || 0, S.base.voices.length - 1), ns = S.base.voices[vi].notes, at = S.sel ? S.sel.i + 1 : ns.length;
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
$('#noteToggle').addEventListener('click', () => {
  S.noteOpen = !S.noteOpen;
  $('#note').hidden = !S.noteOpen; $('#noteToggle').setAttribute('aria-expanded', String(S.noteOpen));
});

/* a click on a clef (with or without Edit) opens the palette of all the clefs for that voice */
function openClefPop(vi) {
  const pop = $('#clefPop'), v = S.piece.voices[vi], cur = S.clefs[vi] || v.clef, st = styleOf(S.piece);
  const pick = k => { S.clefs[vi] = k === S.base.voices[vi]?.clef ? undefined : k; pop.hidden = true; render(true); buildStudio?.(); };
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('Clef') + (S.piece.voices.length > 1 && v.name ? ' · ' + v.name : '')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: () => { pop.hidden = true; } }, '×')),
    el('div', { class: 'clefgrid' }, ...CLEF_PALETTE.map(k => {
      const b = el('button', { type: 'button', 'aria-pressed': String(k === cur), onclick: () => pick(k) }, parse(glyphIcon('clef', k, st)), el('span', {}, CLEFS[k].short));
      return b;
    })));
  pop.hidden = false;
}
paper.addEventListener('click', e => {
  const h = e.target.closest('.clef-hit');
  if (!h) return;
  e.stopPropagation(); e.preventDefault();
  openClefPop(+h.dataset.clefVi);
}, true);
paper.addEventListener('pointerdown', e => { if (e.target.closest('.clef-hit, .vctl')) e.stopPropagation(); }, true);
/* Mute (seen, not heard) and Hide (neither seen nor heard) beside each voice */
paper.addEventListener('click', e => {
  const c = e.target.closest('.vctl');
  if (!c) return;
  e.stopPropagation(); e.preventDefault();
  const i = +c.dataset.vi, st = c.dataset.act;
  S.voice[i] = S.voice[i] === st ? 'on' : st; render(); buildVoiceChips();
}, true);
document.addEventListener('pointerdown', e => { const pop = $('#clefPop'); if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('.clef-hit')) pop.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#clefPop').hidden = true; });

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
const fullEl = () => document.fullscreenElement || document.webkitFullscreenElement;
const canFull = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
function toggleFull() {
  const r = document.documentElement;
  if (fullEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document)?.catch?.(() => {});
  else (r.requestFullscreen || r.webkitRequestFullscreen).call(r)?.catch?.(() => {});
}
/* the full-screen button at the top right */
const FULL_IN = '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
const FULL_OUT = '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>';
const syncFullBtn = () => {
  const on = !!fullEl();
  document.documentElement.classList.toggle('full', on);
  const b = $('#fullBtn'); if (!b) return;
  b.hidden = !canFull; b.setAttribute('aria-pressed', 'false');
  b.innerHTML = on ? FULL_OUT : FULL_IN;
  const t = tr(on ? 'Leave full screen' : 'Full screen'); b.title = t; b.setAttribute('aria-label', t);
};
$('#fullBtn')?.addEventListener('click', toggleFull);
syncFullBtn();
['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => { syncFullBtn(); if (S.base) { buildStudio(); setTimeout(() => render(), 80); } }));
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
  if (S.adding && S.adding.mode === 'sing') setTimeout(offerKeep, 50);
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
  const sysObj = S.systems?.[+tg.svg.closest('.sys')?.dataset.sys];
  const clef = clefAt(sysObj?.staves?.find(x => x.vi === tg.vi), tg.x) || clefFor(clefId), lines = S.piece.lines;
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
  if (!pop.hidden) buildMic();
  $('#micBtn').setAttribute('aria-expanded', String(!pop.hidden));
});
document.addEventListener('click', e => { const pop = $('#micPop'); if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('.chip')) { pop.hidden = true; $('#micBtn').setAttribute('aria-expanded', 'false'); } });

/* Guidonian hand: a small camera window on this page. What the hand shows sounds at once, together with the
   playback and with whoever sings into the microphone; nothing stops and nobody is sent elsewhere. */
const closeHand = () => { $('#handView').hidden = true; $('#handFrame').removeAttribute('src'); $('#handBtn').setAttribute('aria-pressed', 'false'); };
$('#handBtn').setAttribute('aria-pressed', 'false');
$('#handBtn').addEventListener('click', () => {
  const v = $('#handView'), f = $('#handFrame');
  if (!v.hidden) { closeHand(); return; }
  const dark = document.documentElement.dataset.theme === 'dark';
  f.setAttribute('src', `../hand/?embed=1&theme=${dark ? 'dark' : 'light'}&ref=${encodeURIComponent(prefs.a4 || 440)}`);
  v.hidden = false; $('#handBtn').setAttribute('aria-pressed', 'true');
});
$('#handClose').addEventListener('click', closeHand);
/* the window can be dragged by its title */
(() => {
  const w = $('#handView'), h = $('#handDrag'); let d = null;
  h.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; const r = w.getBoundingClientRect(); d = { x: e.clientX - r.left, y: e.clientY - r.top }; h.setPointerCapture(e.pointerId); });
  h.addEventListener('pointermove', e => { if (!d) return; const x = Math.max(0, Math.min(innerWidth - w.offsetWidth, e.clientX - d.x)), y = Math.max(0, Math.min(innerHeight - 40, e.clientY - d.y)); Object.assign(w.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' }); });
  h.addEventListener('pointerup', () => { d = null; });
})();

/* share */
/* Save as PDF: the whole piece in score layout on white A4 pages, through the browser's print dialog ("Save as PDF") */
function exportPDF() {
  const p = S.piece;
  if (!p) return;
  if (S.playing) stopPlayback();
  const zoom = 12, pageW = 690; /* A4 with margins, in CSS pixels */
  const opts = { clefs: S.clefs, state: S.voice, shift: S.shift, names: prefs.names, t: T };
  const systems = engraveSystems(p, p.voices.map((_, i) => i), pageW / zoom, opts);
  const sheet = el('div', { id: 'printSheet' },
    el('p', { class: 'ps-trail' }, (p.trail || []).join('  ›  ')),
    el('h1', {}, p.title),
    p.note ? el('p', { class: 'ps-note' }, p.note) : '',
    ...systems.map(s => el('div', { class: 'ps-sys', style: s.staves.length > 1 ? `margin-bottom:${Math.max(14, Math.round(4.8 * zoom))}px` : '' }, parse(systemSVG(s, zoom)))),
    p.credit ? el('p', { class: 'ps-credit' }, p.credit) : '',
    el('p', { class: 'ps-foot' }, 'Cantare super librum · vaclavhrebec.github.io/gym/cantare'));
  $('#printSheet')?.remove();
  document.body.append(sheet);
  const root = document.documentElement, theme = root.dataset.theme, title = document.title;
  root.dataset.theme = 'light'; root.classList.add('printing');
  document.title = p.title.replace(/[\\/:*?"<>|]/g, '');
  const done = () => { root.dataset.theme = theme; root.classList.remove('printing'); document.title = title; sheet.remove(); removeEventListener('afterprint', done); };
  addEventListener('afterprint', done);
  setTimeout(() => { window.print(); if (!('onafterprint' in window)) setTimeout(done, 1000); }, 60);
}
/* Save: a PDF of the score, or MusicXML for MuseScore and the other notation programs */
function exportXML() {
  const p = S.piece; if (!p) return;
  const xml = toMusicXML(p, n => midiOf(n, p.bflat, S.shift));
  const a = el('a', { href: URL.createObjectURL(new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' })), download: (slug(p.title) || 'cantare').slice(0, 60) + '.musicxml' });
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast(tr('Saved as MusicXML: it opens in MuseScore, Sibelius, Finale and Dorico.'));
}
$('#saveBtn').addEventListener('click', e => {
  e.stopPropagation();
  const pop = $('#clefPop');
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('Save')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: () => { pop.hidden = true; } }, '×')),
    el('div', { class: 'nm' },
      el('p', { class: 'hint' }, tr('The whole piece with the voices you have added.')),
      el('div', { class: 'nm-go' },
        el('button', { type: 'button', class: 'chip', onclick: () => { pop.hidden = true; exportPDF(); } }, tr('PDF (A4 pages)')),
        el('button', { type: 'button', class: 'chip primary', onclick: () => { pop.hidden = true; exportXML(); } }, tr('MusicXML (MuseScore…)')))));
  pop.hidden = false;
});

/* ------------------------------------------------------------------ your own score, and voices added to a piece */
/* a piece from the library is not changed: a voice added to it goes into a copy among Your melodies */
function ensureMine(suffix) {
  if (S.base.mine) return;
  const it = itemOf(S.base);
  it.title = S.base.title + ' – ' + suffix;
  if (S.base.kind === 'chant' && it.s) { /* plainchant with a voice beside it: written out as breves, so the voices line up */
    it.n = S.base.voices[0].notes.map(tokOf).join(' '); it.c = S.base.voices[0].clef; delete it.s; delete it.a; it.t = 'C';
  }
  const voiceState = S.voice.slice();
  adoptMine(it);
  S.voice = voiceState.slice(0, S.base.voices.length);
  while (S.voice.length < S.base.voices.length) S.voice.push('on');
}
const ROLES = ['Cantus', 'Altus', 'Tenor', 'Bassus'];
function addVoice(name, clef, notes) {
  stopPlayback();
  S.base.voices.push({ clef, name, notes, lyrics: '' });
  S.voice.push('on'); S.clefs.length = S.base.voices.length;
  if (S.base.kind === 'chant') { S.base.kind = 'mensural'; S.lines = 5; }
  afterEdit(); buildVoiceChips(); buildStudio(); keepMine();
  return S.base.voices.length - 1;
}
/* the singing as tokens, from the beginning of the piece: rests up to the first sung note */
const REST_VALS = [[16, 'Mx'], [8, 'L'], [4, 'B'], [2, 'S'], [1, 'M'], [.5, 'Sm'], [.25, 'F']];
function restsFor(len) { const out = []; let left = Math.round(len * 4) / 4; for (const [v, n] of REST_VALS) while (left >= v - 1e-6) { out.push('r' + n); left -= v; } return out; }
function keepTake(name) {
  const ns = take.notes(S.piece.bflat).map(n => ({ ...n, step: n.rest ? n.step : n.step - S.shift }));
  if (!ns.some(n => !n.rest)) { toast(tr('Nothing was written down yet: sing while the music plays.')); return; }
  const toks = restsFor(ns[0].t);
  ns.forEach(n => toks.push(n.rest ? 'r' + n.v + (n.dot ? '.' : '') : n.step + (n.acc || '') + n.v + (n.dot ? '.' : '') + (n.tie ? '~' : '')));
  const notes = readTokens(toks.join(' '));
  const steps = notes.filter(n => !n.rest).map(n => n.step);
  const clef = fitClef(steps, 5, 'c4', CLEF_ORDER).id;
  ensureMine(tr('with my voices'));
  take.clear();
  const vi = addVoice(name, clef, notes);
  S.adding = null;
  toast(tr('Your voice is now part of the piece') + ': ' + name + '. ' + tr('Add another, or mute any voice below.'));
  return vi;
}
function offerKeep() {
  if (!S.adding || !take.parts.some(q => q.m !== null)) return;
  const pop = $('#clefPop'), name = S.adding.name;
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('Keep what you sang?')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: () => { pop.hidden = true; } }, '×')),
    el('div', { class: 'nm' },
      el('p', { class: 'hint' }, tr('What you sang is written in red. Keep it as a new voice of the piece, or sing it again.')),
      el('div', { class: 'nm-go' },
        el('button', { type: 'button', class: 'chip', onclick: () => { pop.hidden = true; S.adding = null; take.clear(); render(); } }, tr('Cancel')),
        el('button', { type: 'button', class: 'chip', onclick: () => { pop.hidden = true; take.clear(); render(); S.startAt = 0; voiceReady().then(startPlayback); } }, tr('Sing again')),
        el('button', { type: 'button', class: 'chip primary', onclick: () => { pop.hidden = true; keepTake(name); } }, tr('Keep it as') + ' ' + name))));
  pop.hidden = false;
}
async function startSinging(name) {
  if (!mic.on) await micToggle();
  if (!mic.on) return;
  prefs.micNotate = true; savePrefs(); buildMic();
  S.adding = { mode: 'sing', name };
  take.clear(); S.startAt = 0;
  toast(tr('The music plays from the beginning: sing your voice with it. Press Stop when you are done.'));
  await voiceReady(); startPlayback();
}
function startWriting(name) {
  ensureMine(tr('with my voices'));
  const ref = S.base.voices.at(-1);
  const vi = addVoice(name, ref ? ref.clef : 'c4', []);
  S.addVi = vi; S.edit = true; S.sel = null; S.inDur = S.inDur || 'S'; S.inRest = false;
  $('#editBtn').setAttribute('aria-pressed', 'true');
  buildEditTools(); render(); syncTitleEdit();
  toast(tr('Tap the new staff to put a note there, or type A to G.'));
}
function askAddVoice() {
  if (!S.base) return;
  const pop = $('#clefPop');
  const have = new Set(S.base.voices.map(v => (v.name || '').replace(/\s*\d+$/, '')));
  const guess = ROLES.find(r => !have.has(r)) || 'Cantus';
  const name = el('select', { class: 'nm-in', 'aria-label': tr('Voice') }, ...ROLES.map(r => el('option', { value: r, selected: r === guess }, tr(r))));
  const nameOf = () => { const r = name.value, same = S.base.voices.filter(v => (v.name || '').replace(/\s*\d+$/, '') === r).length; return same ? r + ' ' + (same + 1) : r; };
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('Add a voice')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: () => { pop.hidden = true; } }, '×')),
    el('div', { class: 'nm' },
      el('p', { class: 'hint' }, tr('Build the piece voice by voice: sing a new voice to what is there, or write it down. Mute or hide any voice with the buttons below the music; Save exports the whole piece.')),
      el('label', {}, tr('Voice'), name),
      el('p', { class: 'hint' }, S.base.mine ? '' : tr('The piece in the library stays as it is: your voices go into a copy under Your melodies.')),
      el('div', { class: 'nm-go' },
        el('button', { type: 'button', class: 'chip', onclick: () => { pop.hidden = true; } }, tr('Cancel')),
        el('button', { type: 'button', class: 'chip', onclick: () => { pop.hidden = true; startWriting(nameOf()); } }, tr('Write it')),
        el('button', { type: 'button', class: 'chip primary', onclick: () => { pop.hidden = true; startSinging(nameOf()); } }, tr('Sing it')))));
  pop.hidden = false;
}
$('#addVoiceBtn')?.addEventListener('click', e => { e.stopPropagation(); askAddVoice(); });

/* Open: a score from the computer (MuseScore, MusicXML, MIDI) becomes a piece among Your melodies */
function sendUpload(file, b) {
  try { if (localStorage.getItem(SENDPREF) === 'no') return; } catch (e) { /* ignore */ }
  let who = ''; try { who = localStorage.getItem('cantare-next:who') || ''; } catch (e) { /* ignore */ }
  const it = itemOf(b), fd = new FormData();
  fd.append('_subject', 'Cantare – an uploaded score: ' + b.title); fd.append('_template', 'table'); fd.append('_captcha', 'false');
  fd.append('About', 'Cantare super librum – a score uploaded by a visitor'); fd.append('Title', b.title); fd.append('Name', who || '—');
  fd.append('File', file.name + ' (' + Math.round(file.size / 1024) + ' kB)'); fd.append('Link', linkOf(b)); fd.append('Data', JSON.stringify(it));
  if (file.size < 5e6) fd.append('attachment', file, file.name);
  sentAt.set(b.id, JSON.stringify(it));
  fetch('https://formsubmit.co/ajax/vaclavhrebec2000@gmail.com', { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).catch(() => sentAt.delete(b.id));
}
function askUpload() {
  const pop = $('#clefPop');
  let send = true; try { send = localStorage.getItem(SENDPREF) !== 'no'; } catch (e) { /* ignore */ }
  const box = el('input', { type: 'checkbox', checked: send });
  const who = el('input', { type: 'text', class: 'nm-in', maxlength: 80, placeholder: tr('Your name (optional)'), 'aria-label': tr('Your name (optional)') });
  try { who.value = localStorage.getItem('cantare-next:who') || ''; } catch (e) { /* ignore */ }
  const input = el('input', { type: 'file', accept: ACCEPT, hidden: true });
  const status = el('p', { class: 'hint' });
  input.addEventListener('change', async () => {
    const f = input.files && input.files[0]; if (!f) return;
    try { localStorage.setItem(SENDPREF, box.checked ? 'yes' : 'no'); if (who.value.trim()) localStorage.setItem('cantare-next:who', who.value.trim()); } catch (e) { /* ignore */ }
    status.textContent = tr('Reading') + ' ' + f.name + '…';
    try {
      const it = await readScoreFile(f);
      pop.hidden = true;
      sendMine();
      adoptMine(it);
      sendUpload(f, S.base);
      toast(tr('Opened') + ': ' + it.title + '. ' + tr('Play it, sing with it, mute voices or add your own.'));
    } catch (err) {
      status.textContent = tr('This file could not be read. Try MusicXML (.musicxml or .mxl), exported from your notation program.');
    }
  });
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('Open your score')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: () => { pop.hidden = true; } }, '×')),
    el('div', { class: 'nm' },
      el('p', { class: 'hint' }, tr('MuseScore (.mscz, .mscx), MusicXML (.musicxml, .xml, .mxl) or MIDI (.mid). Each part becomes a voice, a whole note a semibrevis; the text comes along. It is kept in this browser under Your melodies.')),
      el('label', {}, tr('Your name (optional)'), who),
      el('label', { class: 'nm-send' }, box, el('span', {}, tr('Send a copy to Václav Hřebec, who collects the pieces people bring here (the file, its title and your name if given).'))),
      status, input,
      el('div', { class: 'nm-go' },
        el('button', { type: 'button', class: 'chip', onclick: () => { pop.hidden = true; } }, tr('Cancel')),
        el('button', { type: 'button', class: 'chip primary', onclick: () => input.click() }, tr('Choose a file…')))));
  pop.hidden = false;
}
$('#openBtn')?.addEventListener('click', e => { e.stopPropagation(); askUpload(); });
/* a score dropped onto the page opens the same way */
addEventListener('dragover', e => { if ([...(e.dataTransfer?.items || [])].some(i => i.kind === 'file')) e.preventDefault(); });
addEventListener('drop', async e => {
  const f = e.dataTransfer?.files?.[0]; if (!f || !/\.(mscz|mscx|musicxml|xml|mxl|midi?)$/i.test(f.name)) return;
  e.preventDefault();
  try { const it = await readScoreFile(f); sendMine(); adoptMine(it); sendUpload(f, S.base); toast(tr('Opened') + ': ' + it.title); }
  catch (err) { toast(tr('This file could not be read. Try MusicXML (.musicxml or .mxl), exported from your notation program.')); }
});

$('#footShare').addEventListener('click', async () => {
  const url = location.href.split('#')[0] + location.hash, title = 'Cantare super librum';
  try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch (e) { return; }
  try { await navigator.clipboard.writeText(url); toast(tr('Link copied')); } catch (e) { toast(url); }
});

/* interface language */
function applyLang() {
  translatePage(); buildUnits(); applyTheme();
  if (S.base) { renderTree($('#search').value); buildStudio(); buildTransform(); buildEditTools(); buildVoiceChips(); render(); }
  $('#play').setAttribute('aria-label', tr(S.playing ? 'Pause' : 'Play'));
}
(function langPicker() {
  const sel = $('#lang');
  LANGS.forEach(([k, short, name]) => sel.append(el('option', { value: k, title: name, selected: k === getLang() }, short)));
  sel.addEventListener('change', () => { prefs.lang = sel.value; setLang(prefs.lang); try { localStorage.setItem('lang', prefs.lang); } catch (e) { /* none */ } savePrefs(); applyLang(); });
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
  $('#tempo').value = prefs.tempo; showTempo();
  buildUnits(); syncLoop(); syncHand();
  /* the library starts closed; the Library button opens it */
  $('#library').dataset.open = 'false'; $('#studio').dataset.open = 'false'; syncLibBtn();
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
  if (!opened && /^jrp:\w+$/.test(want)) {
    try {
      const it = await jrpGet('p/' + want.slice(4) + '.json'); it.id ??= ++uid;
      const comp = (it.desc || '').split(',')[0];
      openItem(it, ['Polyphonic models', comp]); opened = true;
    } catch (e) { /* not there or offline: a random piece instead */ }
  }
  if (!opened) {
    const hit = want && S.flat.find(f => slug(f.item.title) === want);
    const pick = hit || await randomPick();
    openItem(pick.item, pick.trail);
  }
  /* the lyrics are measured in their own font: draw again once it has arrived */
  document.fonts?.ready.then(() => S.piece && !S.playing && render());
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();

if (prefs.timbre === 'voice') snd.prepare(); else if (snd.TIMBRES[prefs.timbre]) snd.warm(prefs.timbre);
/* the sound, chosen in the bar at the bottom (the same choice as Timbre in the Studio); Voice is sung by Chimera */
function buildSoundSel() {
  const sel = $('#soundSel'); if (!sel) return; sel.textContent = '';
  Object.entries(snd.TIMBRES).forEach(([k, v]) => sel.append(el('option', { value: k, selected: prefs.timbre === k }, tr(v.label))));
}
/* the sound is now chosen in the Sound window only (the list in the bar is gone) */
if ($('#soundSel')) { $('#soundSel').addEventListener('change', e => { prefs.timbre = e.target.value; voiceReady(); savePrefs(); buildStudio(); }); buildSoundSel(); }
window.cantare = { S, prefs, openItem, jrpGet };
