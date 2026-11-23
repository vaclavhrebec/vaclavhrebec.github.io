import { pieceFrom, stepName, midiOf } from '../../gym/cantare/js/music.js';
import { engraveSystems, systemSVG } from '../../gym/cantare/js/engrave.js';
import * as snd from '../../gym/cantare/js/audio.js';
import { bookPlan, bookOrder } from './book.js';
import { SCHOOLS, FAMILIES, RHYTHMS, DEFAULTS, makeRng, fromPiece, expand, engravable, context, rankVoices, candidates, applyFigure, diminuteVoice, stripAll, reduceVoice, snapshot, restore, countDims, smallest, violations } from './engine.js';
import { TREATISES } from './treatises.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const parse = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const JRP = '../gym/cantare/jrp/';
const SCAN = '<svg class="scanico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13"/></svg>';
const S = { st: null, undo: [], pre: null, sel: null, index: [], models: [], seed: (Math.random() * 1e9) | 0, playing: false, leaf: 0, exps: [] };

/* ---------- preferences: Cantare's own (theme, sound, pitch, volume) are taken as the starting point ---------- */
const FSTORE = 'fiorire:v1';
let cp = {}, fp = {};
try { cp = JSON.parse(localStorage.getItem('cantare-next:v1')) || {}; } catch (e) { /* none */ }
try { fp = JSON.parse(localStorage.getItem(FSTORE)) || {}; } catch (e) { /* none */ }
/* the same sounds as Cantare, in the same order; Chimera's voice first and by default */
const okTimbre = t => t && snd.TIMBRES[t];
const P = { theme: cp.theme === 'light' ? 'light' : 'dark', tempo: cp.tempo || 60, timbre: 'voice', a4: cp.a4 || 440, volume: cp.volume ?? .8, zoom: 12, view: 'score', click: false, loop: false, bookKind: cp.bookKind || 'it', ...fp };
if (!fp.voiceDefault) { P.timbre = 'voice'; P.voiceDefault = true; }
if (!okTimbre(P.timbre)) P.timbre = 'voice';
snd.setSound(cp.sound || {});
const savePrefs = () => { try { localStorage.setItem(FSTORE, JSON.stringify(P)); } catch (e) { /* ignore */ } };
function applyTheme() { document.documentElement.dataset.theme = P.theme; const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = P.theme === 'dark' ? '#000000' : '#ffffff'; }
applyTheme();
$('#toggleTheme').onclick = () => { P.theme = P.theme === 'dark' ? 'light' : 'dark'; applyTheme(); savePrefs(); };

/* ---------- the style the figures are made in ---------- */
const GROUPS = { medieval: 'Middle Ages', renaissance: 'Renaissance' };
function styleList() {
  const o = ['<option value="@ren">Renaissance, all manners mixed</option>', '<option value="@med">Middle Ages, all manners mixed</option>'];
  Object.entries(GROUPS).forEach(([g, gn]) => o.push(`<optgroup label="${gn}">` + Object.entries(SCHOOLS).filter(([, s]) => s.era === g).map(([k, s]) => `<option value="${k}">${esc(s.name)}</option>`).join('') + '</optgroup>'));
  $('#style').innerHTML = o.join('');
}
function setStyle(v) {
  const set = v === '@ren' ? Object.keys(SCHOOLS).filter(k => SCHOOLS[k].era === 'renaissance') : v === '@med' ? Object.keys(SCHOOLS).filter(k => SCHOOLS[k].era === 'medieval') : [v];
  $$('#schools input').forEach(x => { x.checked = set.includes(x.value); });
  P.style = v; savePrefs();
}

/* ---------- options ---------- */
function opts() {
  const num = id => +$('#' + id).value, chk = id => $('#' + id).checked;
  return { ...DEFAULTS, schools: $$('#schools input:checked').map(x => x.value), density: num('density'), maxSimul: num('maxSimul'), together: num('together'), minDur: num('minDur'), minValue: num('minValue'), maxLeap: num('maxLeap'), targetLeap: Math.max(3, num('maxLeap') + 1),
    noSeventh: chk('noSeventh'), consBeat: chk('consBeat'), passDiss: chk('passDiss'), noParallels: chk('noParallels'), noCross: chk('noCross'), noTritone: chk('noTritone'), keepRange: chk('keepRange'), keepFinal: chk('keepFinal'), cadences: chk('cadences') };
}
const toast = (m, ms = 2200) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), ms); };
const nextSeed = () => (S.seed = (S.seed * 1664525 + 1013904223) >>> 0);

/* ---------- loading pieces ---------- */
async function loadIndex() {
  const [search, lib] = await Promise.all([fetch(JRP + 'search.json').then(r => r.json()), fetch('../gym/cantare/data/library.json').then(r => r.json())]);
  S.index_ = search.map(([id, title, comp]) => ({ id, title, comp }));
  const poly = lib.find(g => g.group === 'Polyphonic models');
  (poly.subs || []).forEach(sub => (sub.items || []).forEach(it => { if (it.poly) S.models.push({ item: it, title: it.title, trail: ['Polyphonic models', sub.group] }); }));
  try { const extra = await fetch('data/models.json').then(r => r.ok ? r.json() : []); extra.forEach(it => { if (it.poly) S.models.push({ item: it, title: it.title, trail: ['Polyphonic models', 'Keyboard arrangements'] }); }); } catch { /* Fiorire-only models are optional */ }
  const comps = [...new Set(S.index_.map(x => x.comp))].sort((a, b) => a.localeCompare(b));
  $('#selComp').innerHTML = `<option value="@models">Polyphonic models</option>` + comps.map(c => `<option>${esc(c)}</option>`).join('');
  fillPieces();
}
function fillPieces() {
  const c = $('#selComp').value;
  const list = c === '@models' ? S.models.map((m, i) => ({ v: 'm' + i, t: m.title })) : S.index_.filter(x => x.comp === c).map(x => ({ v: 'j' + x.id, t: x.title }));
  $('#selPiece').innerHTML = list.map(x => `<option value="${x.v}">${esc(x.t)}</option>`).join('');
}
async function openChoice(v) {
  let item, trail = [];
  try { if (v[0] === 'm') { const m = S.models[+v.slice(1)]; item = JSON.parse(JSON.stringify(m.item)); trail = m.trail; } else item = await fetch(JRP + 'p/' + v.slice(1) + '.json').then(r => { if (!r.ok) throw 0; return r.json(); }); }
  catch { toast('Could not load that piece (offline?)'); return; }
  item.id ??= 1;
  const piece = pieceFrom(item, trail.length ? trail : [$('#selComp').selectedOptions[0]?.textContent || '']);
  stopPlayback(); S.st = fromPiece(piece); S.undo = []; S.pre = null; S.leaf = 0;
  closeSheet();
  const rank = rankVoices(S.st); S.st.voices.forEach((x, i) => { x.on = rank[i] === 0; });
  voiceList(); render(true);
  $('#trail').textContent = (piece.trail || []).join('  ›  '); $('#title').textContent = piece.title; $('#note').textContent = piece.note || '';
  $('#credit').innerHTML = piece.credit ? esc(piece.credit).replace('josquin.stanford.edu', '<a href="https://josquin.stanford.edu" target="_blank" rel="noopener">josquin.stanford.edu</a>') : '';
}
async function randomPiece() {
  const pool = S.index_.length + S.models.length, r = Math.floor(Math.random() * pool);
  if (r < S.index_.length) { const x = S.index_[r]; $('#selComp').value = x.comp; fillPieces(); $('#selPiece').value = 'j' + x.id; await openChoice('j' + x.id); }
  else { $('#selComp').value = '@models'; fillPieces(); const i = r - S.index_.length; $('#selPiece').value = 'm' + i; await openChoice('m' + i); }
}

/* ---------- voices ---------- */
function voiceList() {
  $('#voices').innerHTML = S.st.voices.map((v, i) => `<div class="vrow"><label><input type="checkbox" data-on="${i}" ${v.on ? 'checked' : ''}> <span class="nm">${esc(v.name || 'Voice ' + (i + 1))}</span> <span class="clef">${esc(v.clef)}</span></label><span class="cnt" data-cnt="${i}"></span><button data-mute="${i}" aria-pressed="${v.mute}" title="Silence this voice when playing">${v.mute ? '🔇' : '🔊'}</button><button data-plain="${i}" title="Remove the diminutions from this voice">✕</button></div>`).join('');
}
$('#voices').addEventListener('change', e => { const i = e.target.dataset.on; if (i != null) S.st.voices[i].on = e.target.checked; });
$('#voices').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.mute != null) { const v = S.st.voices[b.dataset.mute]; v.mute = !v.mute; b.setAttribute('aria-pressed', v.mute); b.textContent = v.mute ? '🔇' : '🔊'; render(); }
  if (b.dataset.plain != null) { push(); stripAll(S.st, +b.dataset.plain); render(); }
});

/* ---------- history and the buttons ---------- */
function push() { S.undo.push(snapshot(S.st)); if (S.undo.length > 60) S.undo.shift(); }
$('#btnUndo').onclick = () => { if (!S.undo.length) { toast('Nothing to undo'); return; } restore(S.st, S.undo.pop()); closeSheet(); render(); };
$('#btnPlain').onclick = () => { if (!countDims(S.st)) { toast('Already plain'); return; } push(); stripAll(S.st); render(); };
$('#btnReduce').onclick = () => { const vs = S.st.voices.filter(v => v.on); if (!vs.length) { toast('Tick a voice first'); return; } push(); vs.forEach(v => reduceVoice(v, 2)); render(); toast('Reduced to the skeleton'); };
function run() {
  const o = opts(), vs = S.st.voices.map((v, i) => [v, i]).filter(([v]) => v.on);
  if (!vs.length) { toast('Tick at least one voice to ornament'); return; }
  if (!o.schools.length) { toast('Tick at least one manner'); return; }
  S.pre = snapshot(S.st); push(); const rng = makeRng(nextSeed()); let n = 0;
  vs.map(x => [rng(), x]).sort((a, b) => a[0] - b[0]).forEach(([, [, i]]) => { n += diminuteVoice(S.st, i, o, rng); });
  render(); toast(n ? n + ' figures placed' : 'No figure would fit under these rules');
}
$('#btnDim').onclick = run;
$('#btnAgain').onclick = () => { if (S.pre) { restore(S.st, S.pre); S.undo.pop(); } run(); };

/* ---------- the score: Cantare's engraver, as a score or as a choir book ---------- */
let rt = 0;
function render(resetLeaf) {
  if (!S.st) return;
  const paper = $('#paper'), exps = S.st.voices.map(expand); S.exps = exps;
  const p = engravable(S.st, exps); S.p = p;
  const order = p.voices.map((_, i) => i), z = P.zoom, W = Math.max(200, paper.clientWidth - 4);
  const o = { names: true, state: S.st.voices.map(v => (v.mute ? 'mute' : '')) };
  paper.textContent = ''; S.systems = null; S.leaves = null;
  const book = P.view === 'book' && p.voices.length > 1;
  paper.className = book ? 'book' : 'paper'; $('#pager').hidden = !book;
  $('#vScore').setAttribute('aria-pressed', String(!book)); $('#vBook').setAttribute('aria-pressed', String(book));
  if (!book) {
    const systems = engraveSystems(p, order, W / z, o);
    const between = systems[0] && systems[0].staves.length > 1 ? `margin-bottom:${Math.max(18, Math.round(4.8 * z))}px` : '';
    systems.forEach((s, i) => { const d = document.createElement('div'); d.className = 'sys'; d.dataset.sys = i; d.style.cssText = between; d.append(parse(systemSVG(s, z))); paper.append(d); });
    S.systems = systems;
  } else {
    const R = Math.max(2, Math.ceil(p.voices.length / 2)), sc = Math.max(6, z * .8), paneW = Math.max(18, (W / 2 - 36) / sc), rows = R > 2 ? 1 : 2;
    const { plan, bp, sys } = bookPlan(p, paneW, rows, o);
    S.leaves = plan.leaves; if (resetLeaf) S.leaf = 0; S.leaf = Math.min(S.leaf, S.leaves.length - 1);
    const L = S.leaves[S.leaf]; $('#leafNo').textContent = `Leaf ${S.leaf + 1} of ${S.leaves.length}`;
    paper.style.setProperty('--rows', String(R));
    const bo = bookOrder(p, P.bookKind);
    bo.forEach(vi => {
      const pane = document.createElement('div'); pane.className = 'pane';
      if (vi >= 0 && vi < p.voices.length) {
        const v = p.voices[vi]; if (v.name) { const tg = document.createElement('span'); tg.className = 'tag'; tg.textContent = v.name; pane.append(tg); }
        sys[vi].filter(x => x.t0 >= L.t0 - 1e-6 && x.t0 < L.t1 - 1e-6).forEach(s => { const d = document.createElement('div'); d.className = 'sys'; d.append(parse(systemSVG(s, sc))); pane.append(d); });
      }
      paper.append(pane);
    });
    void bp;
  }
  S.index = [...paper.querySelectorAll('.note')].map(e => ({ e, t: +e.dataset.t, end: +e.dataset.t + +e.dataset.len, on: false }));
  paper.querySelectorAll('.note').forEach(e => { const x = S.exps[+e.dataset.v]?.[+e.dataset.i]; if (x && x.dim) e.classList.add('dim'); });
  markSel();
  S.st.voices.forEach((v, i) => { const c = $(`[data-cnt="${i}"]`); if (c) c.textContent = v.dims.size ? v.dims.size + ' figures' : ''; });
  const op = opts(), nd = countDims(S.st), bad = nd ? violations(S.st, op) : 0, sm = smallest(S.st);
  const names = { 1: 'minim', .5: 'semiminim', .25: 'fusa', .75: 'dotted semiminim' };
  $('#info').textContent = nd ? `${nd} figures · quickest note: ${names[sm] || sm + ' minims'} · ${bad ? bad + ' break the rules now switched on' : 'all obey the rules now switched on'}` : 'The model is plain. Press Diminute, or tap any note to choose a figure for it.';
  $('#btnUndo').disabled = !S.undo.length;
}
function markSel() {
  $$('#paper .note.sel').forEach(x => x.classList.remove('sel'));
  if (!S.sel) return;
  (S.exps[S.sel.v] || []).forEach((e, i) => { if (e.k === S.sel.k) $$(`#paper .note[data-v="${S.sel.v}"][data-i="${i}"]`).forEach(x => x.classList.add('sel')); });
}
window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => render(), 200); });
$('#vScore').onclick = () => { P.view = 'score'; savePrefs(); render(true); };
$('#vBook').onclick = () => { P.view = 'book'; savePrefs(); render(true); };
$('#zIn').onclick = () => { P.zoom = Math.min(40, P.zoom * 1.12); savePrefs(); render(); };
$('#zOut').onclick = () => { P.zoom = Math.max(6, P.zoom / 1.12); savePrefs(); render(); };
const leafGo = d => { if (!S.leaves) return; S.leaf = Math.max(0, Math.min(S.leaves.length - 1, S.leaf + d)); render(); };
$('#leafPrev').onclick = () => leafGo(-1); $('#leafNext').onclick = () => leafGo(1);
$('#paper').addEventListener('click', e => {
  const g = e.target.closest('.note'); if (!g) return;
  const vi = +g.dataset.v, x = S.exps[vi]?.[+g.dataset.i]; if (!x) return;
  S.sel = { v: vi, k: x.k }; markSel();
  if (!x.rest && !S.playing) { const c = snd.ensure(); playNote({ timbre: P.timbre, midi: midiOf(x, S.st.bflat), a4: P.a4, at: c.currentTime + .02, dur: .7, text: 'a', key: vi }); }
  openSheet();
});

/* ---------- the sheet for one note ---------- */
let showAll = false;
const pitchName = n => stepName(n.step) + ({ b: '♭', '#': '♯', n: '♮' }[n.acc] || '');
function closeSheet() { $('#sheet').hidden = true; S.sel = null; markSel(); }
$('#shClose').onclick = closeSheet;
function openSheet() {
  const { v: vi, k } = S.sel, v = S.st.voices[vi], n = v.base[k], first = S.exps[vi].find(x => x.k === k);
  $('#sheet').hidden = false;
  const lenNames = { 16: 'maxima', 8: 'longa', 4: 'breve', 2: 'semibreve', 1: 'minim', .5: 'semiminim', 12: 'dotted longa', 6: 'dotted breve', 3: 'dotted semibreve' };
  $('#shTitle').textContent = `${v.name || 'Voice ' + (vi + 1)} · ${n.rest ? 'rest' : pitchName(n)} · ${lenNames[n.len] || n.len + ' minims'}`;
  $('#shPlay').onclick = () => startPlayback(first ? first.t : 0);
  if (n.rest) { $('#shBody').innerHTML = '<p>A rest. Tap a note.</p>'; return; }
  const o = opts(); const ctx = context(S.st); ctx.rank = rankVoices(S.st);
  const rng = makeRng(nextSeed() ^ (k * 977));
  const list = candidates(ctx, vi, k, { ...o, schools: o.schools.length ? o.schools : Object.keys(SCHOOLS) }, rng, 12, showAll);
  S.cands = list;
  const cur = v.dims.get(k);
  let h = '';
  if (cur) h += `<button class="cand on" data-plain="1"><span class="nm">Plain again</span><span class="pt">now: ${esc(FAMILIES[cur.fam] || '')}, ${cur.notes.map(pitchName).join(' ')}</span></button>`;
  if (n.len < 2) h += '<p>A short note: there is little room for a figure.</p>';
  h += list.map((f, i) => `<button class="cand" data-i="${i}"><span class="nm">${esc(FAMILIES[f.fam])}</span><span class="pt">${esc(RHYTHMS[f.rh])} · ${f.notes.map(pitchName).join(' ')}${f.next ? ' → ' + pitchName(f.next) : ''}</span>${f.broken.length ? `<span class="bad">${esc(f.broken.join(', '))}</span>` : ''}</button>`).join('');
  if (!list.length) h += '<p>No figure fits this note under the rules now switched on.</p>';
  h += `<p><button class="btn small" id="shMore">Other figures</button> <button class="btn small" id="shAll">${showAll ? 'Only those that obey the rules' : 'Show those that break the rules too'}</button></p>`;
  $('#shBody').innerHTML = h;
}
$('#shBody').addEventListener('click', e => {
  if (e.target.closest('#shMore')) { openSheet(); return; }
  if (e.target.closest('#shAll')) { showAll = !showAll; openSheet(); return; }
  const b = e.target.closest('.cand'); if (!b || !S.sel) return;
  const { v: vi, k } = S.sel; push();
  if (b.dataset.plain) S.st.voices[vi].dims.delete(k); else applyFigure(S.st, vi, k, S.cands[+b.dataset.i]);
  render(); S.sel = { v: vi, k }; markSel(); const t = S.exps[vi].find(x => x.k === k); openSheet();
  if (!b.dataset.plain) startPlayback(Math.max(0, (t ? t.t : 0) - 4), (t ? t.t : 0) + S.st.voices[vi].base[k].len + 4);
});

/* ---------- playing: Cantare's sound engine, scheduled the way Cantare's player does it ---------- */
const spm = () => (60 / P.tempo) / 2; /* seconds per minim: the tempo is in semibreves per minute */
let clock = null, timer = 0, raf = 0, lastSys = -1;
function playNote(o) { snd.note(o); }
function setPlaying(on) {
  S.playing = on;
  $('#playIcon').innerHTML = on ? '<path d="M7 6h3v12H7zM14 6h3v12h-3z"/>' : '<path d="M8 5.500v13l10.500-6.500z"/>';
  $('#play').setAttribute('aria-label', on ? 'Pause' : 'Play');
}
/* ---------- the shape of the lines, as in Cantare: a voice sings each phrase (from rest to rest) on one breath;
   a phrase begins gently and grows, rising lines grow and falling ones soften, semiminims go in slurred pairs,
   and a phrase ending on a long note lets it die away */
function phrase(events, bflat) {
  const flowing = ['voice', 'lute', 'sackbut'].includes(P.timbre);
  const by = new Map();
  events.forEach(e => { if (!by.has(e.vi)) by.set(e.vi, []); by.get(e.vi).push(e); });
  by.forEach(list => {
    list.sort((a, b) => a.n.t - b.n.t);
    let ph = [];
    const shape = () => {
      if (!ph.length) return;
      const ms = ph.map(e => midiOf(e.n, bflat)), ws = ph.map(e => e.n.len);
      const mean = ms.reduce((a, m, i) => a + m * ws[i], 0) / ws.reduce((a, w) => a + w, 0), t0 = ph[0].n.t;
      ph.forEach((e, i) => {
        const rise = i ? Math.max(-3, Math.min(3, ms[i] - ms[i - 1])) : 0;
        let d = 1 + .09 * (ms[i] - mean) + .04 * rise - (i === ph.length - 1 && ph.length > 1 ? .15 : 0);
        const w = Math.min(1, (e.n.t - t0) / 4);
        e.dyn = (.8 + .2 * w) * (1 + w * (d - 1));
      });
      ph.forEach((a, i) => {
        const b = ph[i + 1];
        if (b && !a.pairB && a.n.v === 'Sm' && b.n.v === 'Sm' && Math.abs(((a.n.t % 1) + 1) % 1) < 1e-6) {
          a.pairA = true; b.pairB = true; a.dyn *= 1.06; b.dyn *= .84;
          const ineg = P.inegal === 'inegal' || P.inegal === 'contre' ? P.inegal : null;
          if (ineg && Math.abs(a.n.step - b.n.step) <= 1) { const r = P.inegalDeg === 'dotted' ? .75 : .6, d = (ineg === 'contre' ? 1 - r : r) - .5; a.dl = d; b.dt = d; b.dl = -d; }
        }
      });
      ph.forEach(e => { e.dyn = Math.max(.5, Math.min(1.7, e.dyn)); });
      ph.forEach((e, i) => { if (i + 1 < ph.length) e.swell = ph[i + 1].dyn / e.dyn; });
      const z = ph[ph.length - 1]; if (ph.length > 1 && z.n.len >= 2) z.fade = .65;
      ph = [];
    };
    list.forEach((e, i) => {
      const p = list[i - 1];
      const joined = p && Math.abs(p.n.t + p.n.len - e.n.t) < 1e-6;
      if (!joined) shape();
      if (joined) {
        e.joined = true;
        if (flowing) p.legato = true;
        if (P.timbre === 'voice') { e.tied = true; p.last = false; }
      }
      ph.push(e);
    });
    shape();
  });
}
/* exps: the voices to sound; follow: highlight the notes in the score and turn the leaves */
async function startPlayback(from = 0, until = Infinity, src = null) {
  stopPlayback(true);
  const ctx = snd.ensure(); snd.setVolume(P.volume);
  const follow = !src, exps = src ? src.exps : S.exps, bflat = src ? src.bflat : S.st.bflat, mute = src ? [] : S.st.voices.map(v => v.mute);
  const b = $('#play'); b.disabled = true;
  const events = []; exps.forEach((ex, vi) => { if (mute[vi]) return; ex.forEach(n => { if (!n.rest && n.t + n.len > from + 1e-6 && n.t < until) events.push({ vi, n }); }); });
  phrase(events, bflat);
  events.sort((a, c) => a.n.t - c.n.t);
  /* the voice sings on "a": its files for the pitches of the piece load first */
  const ready = P.timbre === 'voice' ? snd.prepare().then(() => snd.load(events.map(e => ({ u: snd.units(null), midi: midiOf(e.n, bflat) })))) : snd.warm(P.timbre);
  await Promise.race([ready, new Promise(r => setTimeout(r, 8000))]);
  b.disabled = false;
  const k = spm(), t0 = ctx.currentTime + .15, end = Math.min(until, Math.max(0, ...exps.map(ex => ex.length ? ex[ex.length - 1].t + ex[ex.length - 1].len : 0)));
  clock = { t0, from, k, end, follow };
  let ei = 0, bi = Math.ceil(from / 2 - 1e-9);
  const pump = () => {
    const horizon = ctx.currentTime + 1.2;
    while (ei < events.length && t0 + (events[ei].n.t - from) * k < horizon) {
      const e = events[ei++], { vi, n } = e, nt = n.t + (e.dt || 0); const cut = Math.max(0, from - nt), at = t0 + Math.max(0, nt - from) * k;
      const shaped = P.timbre !== 'organ';
      playNote({ timbre: P.timbre, midi: midiOf(n, bflat), a4: P.a4, at, text: 'a', value: n.len, dur: Math.max(.08, (n.len + (e.dl || 0) - cut) * k - (e.legato ? 0 : .03)),
        tied: !!e.tied && cut === 0, legato: !!e.legato, joined: !!e.joined && cut === 0, last: e.last !== false, key: vi,
        swell: shaped && e.legato ? e.swell : null, fade: shaped ? e.fade : null, lift: !!e.pairA,
        level: .2 / Math.sqrt(Math.max(1, exps.length)) * (shaped ? e.dyn || 1 : 1) });
    }
    while (P.click && bi * 2 < end && t0 + (bi * 2 - from) * k < horizon) { snd.click(t0 + (bi * 2 - from) * k, bi % 2 === 0); bi++; }
  };
  pump(); timer = setInterval(pump, 150); setPlaying(true); frame();
}
function stopPlayback(keep) {
  clearInterval(timer); cancelAnimationFrame(raf);
  if (!keep) snd.silence(); else if (clock) snd.silence();
  clock = null; setPlaying(false);
  (S.index || []).forEach(x => { if (x.on) { x.e.classList.remove('on'); x.on = false; } });
}
function frame() {
  if (!clock) return;
  const pos = clock.from + (snd.now() - clock.t0) / clock.k;
  if (pos >= clock.end + .5) { const f = clock.follow; stopPlayback(false); if (f && P.loop) startPlayback(0); return; }
  if (clock.follow) {
    for (const x of S.index) { const on = x.t <= pos && pos < x.end; if (on !== x.on) { x.on = on; x.e.classList.toggle('on', on); } }
    if (S.leaves) { const li = S.leaves.findIndex(l => pos >= l.t0 - 1e-6 && pos < l.t1); if (li >= 0 && li !== S.leaf) { S.leaf = li; const keep = clock; render(); S.index.forEach(x => { x.on = false; }); void keep; } }
    else if (S.systems) {
      const si = S.systems.findIndex(s => pos >= s.t0 && pos < s.t1);
      if (si >= 0 && si !== lastSys) { lastSys = si; const node = $('#paper').children[si]; if (node) { const r = node.getBoundingClientRect(); if (r.top < 120 || r.bottom > innerHeight - 140) scrollTo({ top: scrollY + r.top - 160, behavior: 'smooth' }); } }
    }
  }
  raf = requestAnimationFrame(frame);
}
const nowPos = () => (clock ? clock.from + (snd.now() - clock.t0) / clock.k : 0);
$('#play').onclick = () => { if (S.playing) stopPlayback(false); else { snd.ensure(); startPlayback(S.startAt || 0); } };
$('#rewind').onclick = () => { const was = S.playing; stopPlayback(false); S.startAt = 0; lastSys = -1; if (was) startPlayback(0); else scrollTo({ top: $('#paper').offsetTop - 140, behavior: 'smooth' }); };
$('#loopBtn').onclick = () => { P.loop = !P.loop; $('#loopBtn').setAttribute('aria-pressed', String(P.loop)); savePrefs(); };
$('#clickBtn').onclick = () => { P.click = !P.click; $('#clickBtn').setAttribute('aria-pressed', String(P.click)); savePrefs(); if (S.playing) { const p = nowPos(); startPlayback(p); } };
const restartHere = () => { if (S.playing && clock && clock.follow) { const p = nowPos(); startPlayback(Math.max(0, p)); } };
$('#tempo').value = P.tempo;
$('#tempo').addEventListener('change', e => { const v = +e.target.value; if (!v) { e.target.value = P.tempo; return; } P.tempo = Math.max(10, Math.min(300, Math.round(v))); e.target.value = P.tempo; savePrefs(); restartHere(); });
$('#pitchHz').value = P.a4;
$('#pitchHz').addEventListener('change', e => { const v = parseFloat(String(e.target.value).replace(',', '.')); if (!(v >= 380 && v <= 500)) { e.target.value = P.a4; return; } P.a4 = v; e.target.value = v; savePrefs(); restartHere(); });
/* the sound: one button naming the sound; its window holds the same sounds as Cantare, the volume, brightness, room and inégalité */
const SNDCARD = () => {
  const chip = (text, on, fn) => { const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.setAttribute('aria-pressed', String(!!on)); c.textContent = text; c.onclick = fn; return c; };
  const row = (label, ...kids) => { const r = document.createElement('div'); r.className = 'row'; if (label) { const l = document.createElement('label'); l.textContent = label; r.append(l); } r.append(...kids); return r; };
  const range = (v, fn) => { const i = document.createElement('input'); i.type = 'range'; i.min = 0; i.max = 100; i.value = v; i.oninput = e => fn(+e.target.value); return i; };
  const card = document.createElement('section'); card.className = 'card';
  card.append(Object.assign(document.createElement('h3'), { textContent: 'Sound' }),
    row('Timbre', ...Object.entries(snd.TIMBRES).map(([k, v]) => chip(v.label, P.timbre === k, () => { P.timbre = k; savePrefs(); snd.warm(k); showSound(); openSound(); }))),
    row('Volume', range(Math.round(P.volume * 100), v => { P.volume = v / 100; snd.setVolume(P.volume); savePrefs(); })),
    row('Brightness', range(snd.SOUND.bright, v => snd.setSound({ bright: v }))),
    row('Room', range(snd.SOUND.room, v => snd.setSound({ room: v }))),
    row('Inégalité', ...[['off', 'Equal'], ['inegal', 'Inégal (long–short, Bourgeois)'], ['contre', 'Contre-inégal (short–long)']].map(([k, n]) => chip(n, (P.inegal || 'off') === k, () => { P.inegal = k; savePrefs(); openSound(); }))),
    ...(P.inegal && P.inegal !== 'off' ? [row('Degree', ...[['gentle', 'Gentle (3 : 2)'], ['dotted', 'Dotted (3 : 1)']].map(([k, n]) => chip(n, (P.inegalDeg || 'gentle') === k, () => { P.inegalDeg = k; savePrefs(); openSound(); })))] : []),
    Object.assign(document.createElement('p'), { className: 'hint', textContent: 'Semiminims are always sung in pairs, as under one slur. Inégalité makes the pairs that move by step unequal: Bourgeois (1550) sings the first longer, as if dotted; contre-inégalité sings it shorter.' }));
  return card;
};
function openSound() {
  const pop = $('#optPop'); pop.textContent = '';
  const head = document.createElement('div'); head.className = 'pophead';
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.textContent = '×'; x.onclick = () => { pop.hidden = true; };
  head.append(x); pop.append(head, SNDCARD()); pop.hidden = false;
}
function showSound() { const n = (snd.TIMBRES[P.timbre] || {}).label || 'Sound'; $('#soundName').textContent = n; $('#soundBtn').title = 'Sound: ' + n; }
$('#soundBtn').onclick = () => { if (!$('#optPop').hidden) $('#optPop').hidden = true; else openSound(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#optPop').hidden = true; });
showSound();
/* Tap: the tempo follows two or more taps */
let taps = [];
$('#tap').onclick = () => {
  const t = performance.now(); taps = taps.filter(x => t - x < 4000); taps.push(t);
  if (taps.length >= 2) { const d = (taps[taps.length - 1] - taps[0]) / (taps.length - 1); const v = Math.max(10, Math.min(300, Math.round(60000 / d))); P.tempo = v; $('#tempo').value = v; savePrefs(); restartHere(); }
};
$('#clickBtn').setAttribute('aria-pressed', String(P.click)); $('#loopBtn').setAttribute('aria-pressed', String(P.loop));
snd.warm(P.timbre);
$('#rules').addEventListener('change', () => { if (S.st) render(); });
$('#density').oninput = e => $('#densityOut').textContent = e.target.value;
$('#together').oninput = e => $('#togetherOut').textContent = e.target.value;

/* ---------- catalogue ---------- */
const INTS = [[0, 'the same note'], [1, 'a step up'], [-1, 'a step down'], [2, 'a third up'], [-2, 'a third down'], [3, 'a fourth up'], [-3, 'a fourth down'], [4, 'a fifth up'], [-4, 'a fifth down'], [5, 'a sixth up'], [-5, 'a sixth down']];
let cSeed = 7;
function catalogue() {
  const rel = +$('#cInt').value, D = +$('#cDur').value, sch = $('#cSchool').value, fam = $('#cFam').value, rh = $('#cRh').value;
  const base = [{ step: 32, acc: '', len: D, rest: false }, { step: 32 + rel, acc: '', len: 4, rest: false }, { step: 32 + rel, acc: '', len: 8, rest: false }];
  const mini = { kind: 'mensural', lines: 5, tempus: 'C', abs: true, cut: false, ternary: false, bflat: false, voices: [{ clef: 'treble', name: '', notes: [] }] };
  const mk = () => ({ bflat: false, piece: mini, voices: [{ name: '', clef: 'treble', base: base.map(x => ({ ...x })), dims: new Map() }] });
  const st = mk(), ctx = context(st); ctx.rank = [0];
  const o = { ...DEFAULTS, schools: sch ? [sch] : Object.keys(SCHOOLS), minValue: .25, maxLeap: 3, targetLeap: 4, keepRange: false, noParallels: false, consBeat: false, passDiss: false, noCross: false, noSeventh: false, noTritone: false };
  const rng = makeRng(cSeed); let list = candidates(ctx, 0, 0, o, rng, 80, false);
  if (fam) list = list.filter(f => f.fam === fam); if (rh) list = list.filter(f => f.rh === rh);
  list = list.slice(0, 18);
  $('#cards').innerHTML = list.length ? '' : '<div class="card">No figure of that kind fits here. Try another length or interval.</div>';
  list.forEach((f, i) => {
    const s2 = mk(); applyFigure(s2, 0, 0, f); const exps = s2.voices.map(expand);
    const pc = engravable(s2, exps), sy = engraveSystems(pc, [0], 26, { names: false, count: false });
    const d = document.createElement('div'); d.className = 'fig';
    d.innerHTML = `<button class="chip pl" data-play="${i}">▶</button><h3>${esc(FAMILIES[f.fam])}</h3><div class="meta">${esc(RHYTHMS[f.rh])} · ${f.notes.length} notes · in the manner of ${esc(SCHOOLS[f.school].name)}</div>` + sy.map(s => `<div class="sys">${systemSVG(s, 11)}</div>`).join('');
    d.querySelectorAll('.note').forEach(e => { const x = exps[0][+e.dataset.i]; if (x && x.dim) e.classList.add('dim'); });
    d.querySelector('button').onclick = () => startPlayback(0, Infinity, { exps, bflat: false });
    $('#cards').appendChild(d);
  });
}

/* ---------- treatises ---------- */
function treatises() {
  const q = $('#tFilter').value.toLowerCase().trim();
  $('#treList').innerHTML = TREATISES.filter(t => !q || [t.y, t.a, t.t, t.p, t.k, t.n].join(' ').toLowerCase().includes(q)).map(t => `<article class="tre"><div class="yr">${esc(t.y)}</div><div><h3>${esc(t.t)} <a class="scan" href="${t.u}" target="_blank" rel="noopener" title="${esc(t.ul || 'Search on IMSLP')}" aria-label="Open the treatise: ${esc(t.ul || 'Search on IMSLP')}">${SCAN}</a></h3><div class="who">${esc(t.a)} · ${esc(t.p)}</div><p>${esc(t.n)}</p><div class="k">For: ${esc(t.k)} · <a href="${t.u}" target="_blank" rel="noopener">${esc(t.ul || 'Search on IMSLP')}</a></div></div></article>`).join('') || '<div class="card">Nothing found.</div>';
}
$('#tFilter').oninput = treatises;

/* ---------- about ---------- */
$('#aboutBody').innerHTML = `
<h2>What this is</h2>
<p>Fiorire (“to flower”) puts the art of diminution into a workshop, from the florid organum of the Middle Ages to the passaggi of 1600. Take a polyphonic model, choose which voices to ornament, and either let the engine place figures at random under rules you choose, or tap a single note and choose its figure yourself. Everything can be taken back: undo, <em>Plain</em> for the bare model, <em>Reduce</em> to strip the quick notes from a voice that already has them, or <em>Plain again</em> on one note.</p>
<h2>How the engine works</h2>
<p>A figure always begins on the original pitch, fills exactly the length of the note it replaces and runs toward the next note of the voice. It is grown from a <em>contour</em> (tirata, a scale run; gruppo, a turn; tremolo, an alternation; arco, an arch; passaggio, a mixed run) and a <em>rhythm</em> (even notes, a long note and then quick ones, dotted, snapped), and each “manner” prefers different mixes: how many notes, how quick, how much leaping, how much dotting. A figure is kept only if it passes every rule you switched on: leaps, the quickest note, consonance on the beat, dissonance off the beat only by step, no sevenths, no parallel fifths or octaves, no crossing of voices, and a stay within the voice’s range.</p>
<h2>What it is not (yet)</h2>
<p>The manners are modern descriptions of what the tutors teach, as the scholarship on them describes it. They are <strong>not</strong> transcriptions of the printed tables of any one book, and the catalogue shows generated figures, not quotations. Real tables, in particular Coclico’s examples in the chapter <em>De modo ornate canendi</em>, Ortiz’s glosas on cadences and Dalla Casa’s passaggi by interval, could be encoded one by one so that you could choose “this figure from this page”. That is the natural next step, and it needs the facsimiles read carefully.</p>
<p>The rules are a practical model of Renaissance counterpoint, not a complete one: they do not yet know about suspensions in the model, musica ficta in the figures, or the text underlay a singer would have to fit.</p>
<h2>Credits</h2>
<p>The polyphonic models come from the Josquin Research Project (josquin.stanford.edu; CC BY-NC 4.0) and from the collection of <a href="../gym/cantare/">Cantare super librum</a>, which converted them to its own notation. The notation, the font and the sounds are those of Cantare: music in <a href="https://github.com/steinbergmedia/bravura" target="_blank" rel="noopener">Bravura</a> by Steinberg Media Technologies (SIL Open Font License 1.1); the voice sung by <a href="https://github.com/jamesondh/chimera-vocal-synth" target="_blank" rel="noopener">CHIMERA</a>, a physical voice synthesiser by Jameson Hodge (MIT License); organ, sackbut, recorders and harpsichord recorded by <a href="https://versilian-studios.com/vcsl/" target="_blank" rel="noopener">Versilian Studios</a> (VCSL and VSCO 2 CE, public domain); regal, cornett, crumhorn and chalumeau modelled after the Synthesis ToolKit (Cook and Scavone).</p>
<p class="small">A project by Václav Hřebec. The treatise notes are short and cautious; check a title page before you cite any of this.</p>`;

/* ---------- catalogue controls and schools ---------- */
/* each manner with a small book icon that opens its treatise */
const SRC = { adorg: 'Ad organum faciendum', notredame: 'De mensuris et discantu', trecento: 'Pomerium', coclico: 'Compendium musices', finck: 'Practica musica', ganassi: 'Opera intitulata Fontegara', ortiz: 'Trattado de glosas', dallacasa: 'Ricercate, passaggi et cadentie', bovicelli: 'Regole, passaggi di musica', caccini: 'Le nuove musiche' };
const treOf = k => TREATISES.find(t => SRC[k] && t.t.startsWith(SRC[k]));
$('#schools').innerHTML = Object.entries(SCHOOLS).map(([k, s]) => { const t = treOf(k); return `<label><input type="checkbox" value="${k}" ${DEFAULTS.schools.includes(k) ? 'checked' : ''}> ${esc(s.name)}${t ? `&nbsp;<a class="scan" href="${t.u}" target="_blank" rel="noopener" title="${esc(t.a + ', ' + t.t + ': ' + (t.ul || 'Search on IMSLP'))}" aria-label="Open the treatise">${SCAN}</a>` : ''}</label>`; }).join('');
styleList(); $('#style').value = P.style || '@ren'; setStyle($('#style').value); $('#style').onchange = e => setStyle(e.target.value);
$('#cSchool').innerHTML = '<option value="">all</option>' + Object.entries(SCHOOLS).map(([k, s]) => `<option value="${k}">${esc(s.name)}</option>`).join('');
$('#cFam').innerHTML += Object.entries(FAMILIES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
$('#cRh').innerHTML += Object.entries(RHYTHMS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
$('#cInt').innerHTML = INTS.map(([v, t]) => `<option value="${v}" ${v === 1 ? 'selected' : ''}>${t}</option>`).join('');
$$('#cat select').forEach(s => s.onchange = () => { cSeed = 7; catalogue(); });
$('#cMore').onclick = () => { cSeed = nextSeed(); catalogue(); };
$('#coclicoNote').innerHTML = 'Coclico (<em>Compendium musices</em>, Nuremberg 1552) treats ornamenting in its chapter <em>De modo ornate canendi</em>; the <a href="https://nbn-resolving.org/urn:nbn:de:bvb:12-bsb00103405-2" target="_blank" rel="noopener">facsimile from the Bayerische Staatsbibliothek</a> is online. The “Coclico” manner here only models its plain, short, stepwise figures.';

/* ---------- tabs ---------- */
function tab(name) { document.body.dataset.tab = name; $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name)); $$('.pane').forEach(p => p.classList.toggle('on', p.id === name)); if (name === 'cat' && !$('#cards').children.length) catalogue(); if (name === 'work') render(); scrollTo(0, 0); }
$$('.tab').forEach(t => t.onclick = () => { closeSheet(); tab(t.dataset.tab); });
document.addEventListener('click', e => { const a = e.target.closest('[data-goto]'); if (a) { e.preventDefault(); tab(a.dataset.goto); } });
$('#selComp').onchange = () => { fillPieces(); openChoice($('#selPiece').value); };
$('#selPiece').onchange = () => openChoice($('#selPiece').value);
$('#btnRandom').onclick = randomPiece;

treatises();
loadIndex().then(() => { $('#selComp').value = '@models'; fillPieces(); const i = S.models.findIndex(m => /Mille regretz/.test(m.title)); $('#selPiece').value = 'm' + Math.max(0, i); return openChoice($('#selPiece').value); });
document.body.dataset.tab = 'work';
window.fiorire = { S, opts, catalogue, P };
