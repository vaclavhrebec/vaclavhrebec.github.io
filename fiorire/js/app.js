import { pieceFrom, stepName } from '../../gym/cantare/js/music.js';
import { SCHOOLS, FAMILIES, RHYTHMS, DEFAULTS, makeRng, fromPiece, expand, context, rankVoices, candidates, applyFigure, diminuteVoice, stripAll, reduceVoice, snapshot, restore, countDims, smallest, violations } from './engine.js';
import { engrave } from './render.js';
import { play, stop } from './synth.js';
import { TREATISES } from './treatises.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const JRP = '../gym/cantare/jrp/';
const S = { st: null, undo: [], pre: null, sel: null, index: [], models: [], seed: (Math.random() * 1e9) | 0, playing: false };

/* ---------- options ---------- */
function opts() {
  const num = id => +$('#' + id).value, chk = id => $('#' + id).checked;
  return { ...DEFAULTS, schools: $$('#schools input:checked').map(x => x.value), density: num('density'), minDur: num('minDur'), minValue: num('minValue'), maxLeap: num('maxLeap'), targetLeap: Math.max(3, num('maxLeap') + 1),
    noSeventh: chk('noSeventh'), consBeat: chk('consBeat'), passDiss: chk('passDiss'), noParallels: chk('noParallels'), noCross: chk('noCross'), noTritone: chk('noTritone'), keepRange: chk('keepRange'), keepFinal: chk('keepFinal'), cadences: chk('cadences') };
}
const toast = (m, ms = 2200) => { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, ms); };
const nextSeed = () => (S.seed = (S.seed * 1664525 + 1013904223) >>> 0);

/* ---------- loading pieces ---------- */
async function loadIndex() {
  const [search, lib] = await Promise.all([fetch(JRP + 'search.json').then(r => r.json()), fetch('../gym/cantare/data/library.json').then(r => r.json())]);
  S.index = search.map(([id, title, comp]) => ({ id, title, comp }));
  const poly = lib.find(g => g.group === 'Polyphonic models');
  (poly.subs || []).forEach(sub => (sub.items || []).forEach(it => { if (it.poly) S.models.push({ item: it, title: it.title }); }));
  const comps = [...new Set(S.index.map(x => x.comp))].sort((a, b) => a.localeCompare(b));
  $('#selComp').innerHTML = `<option value="@models">Polyphonic models</option>` + comps.map(c => `<option>${esc(c)}</option>`).join('');
  fillPieces();
}
function fillPieces() {
  const c = $('#selComp').value;
  const list = c === '@models' ? S.models.map((m, i) => ({ v: 'm' + i, t: m.title })) : S.index.filter(x => x.comp === c).map(x => ({ v: 'j' + x.id, t: x.title }));
  $('#selPiece').innerHTML = list.map(x => `<option value="${x.v}">${esc(x.t)}</option>`).join('');
}
async function openChoice(v) {
  let item;
  try { item = v[0] === 'm' ? JSON.parse(JSON.stringify(S.models[+v.slice(1)].item)) : await fetch(JRP + 'p/' + v.slice(1) + '.json').then(r => { if (!r.ok) throw 0; return r.json(); }); }
  catch { toast('Could not load that piece (offline?)'); return; }
  item.id ??= 1;
  const piece = pieceFrom(item, []);
  S.st = fromPiece(piece); S.undo = []; S.pre = null; S.sel = null; closeSheet(); stop();
  const rank = rankVoices(S.st); S.st.voices.forEach((x, i) => { x.on = rank[i] === 0; });
  voiceList(); render();
  $('#credit').innerHTML = esc(S.st.title) + (S.st.credit ? ' · ' + esc(S.st.credit) : '') + ' · Licence for the Josquin Research Project encodings: CC BY-NC 4.0.';
}
async function randomPiece() {
  const pool = S.index.length + S.models.length, r = Math.floor(Math.random() * pool);
  if (r < S.index.length) { const x = S.index[r]; $('#selComp').value = x.comp; fillPieces(); $('#selPiece').value = 'j' + x.id; await openChoice('j' + x.id); }
  else { $('#selComp').value = '@models'; fillPieces(); const i = r - S.index.length; $('#selPiece').value = 'm' + i; await openChoice('m' + i); }
}

/* ---------- voices ---------- */
function voiceList() {
  $('#voices').innerHTML = S.st.voices.map((v, i) => `<div class="vrow"><label><input type="checkbox" data-on="${i}" ${v.on ? 'checked' : ''}> <span class="nm">${esc(v.name || 'Voice ' + (i + 1))}</span> <span class="clef">${esc(v.clef)}</span></label><span class="cnt" data-cnt="${i}"></span><button data-mute="${i}" aria-pressed="${v.mute}" title="Silence this voice when playing">${v.mute ? '🔇' : '🔊'}</button><button data-plain="${i}" title="Remove the diminutions from this voice">✕</button></div>`).join('');
}
$('#voices').addEventListener('change', e => { const i = e.target.dataset.on; if (i != null) S.st.voices[i].on = e.target.checked; });
$('#voices').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.mute != null) { const v = S.st.voices[b.dataset.mute]; v.mute = !v.mute; b.setAttribute('aria-pressed', v.mute); b.textContent = v.mute ? '🔇' : '🔊'; }
  if (b.dataset.plain != null) { push(); stripAll(S.st, +b.dataset.plain); render(); }
});

/* ---------- history ---------- */
function push() { S.undo.push(snapshot(S.st)); if (S.undo.length > 60) S.undo.shift(); }
$('#btnUndo').onclick = () => { if (!S.undo.length) { toast('Nothing to undo'); return; } restore(S.st, S.undo.pop()); S.sel = null; closeSheet(); render(); };
$('#btnPlain').onclick = () => { if (!countDims(S.st)) { toast('Already plain'); return; } push(); stripAll(S.st); render(); };
$('#btnReduce').onclick = () => { const vs = S.st.voices.filter(v => v.on); if (!vs.length) { toast('Tick a voice first'); return; } push(); vs.forEach(v => reduceVoice(v, 2)); render(); toast('Reduced to the skeleton'); };
function run() {
  const o = opts(), vs = S.st.voices.map((v, i) => [v, i]).filter(([v]) => v.on);
  if (!vs.length) { toast('Tick at least one voice to ornament'); return; }
  if (!o.schools.length) { toast('Tick at least one manner'); return; }
  S.pre = snapshot(S.st); push(); const rng = makeRng(nextSeed()); let n = 0;
  vs.forEach(([, i]) => { n += diminuteVoice(S.st, i, o, rng); });
  render(); toast(n ? n + ' figures placed' : 'No figure would fit under these rules');
}
$('#btnDim').onclick = run;
$('#btnAgain').onclick = () => { if (S.pre) { restore(S.st, S.pre); S.undo.pop(); } run(); };

/* ---------- score ---------- */
let rt = 0;
function render() {
  if (!S.st) return;
  const exps = S.st.voices.map(expand), wrap = $('#scoreWrap');
  const W = Math.max(660, wrap.clientWidth - 8), sp = wrap.clientWidth < 500 ? 7 : 8;
  const r = engrave(exps, S.st.voices, { width: W, sp, bflat: S.st.bflat, sel: S.sel });
  $('#score').innerHTML = r.svg; S.exps = exps;
  S.st.voices.forEach((v, i) => { const c = $(`[data-cnt="${i}"]`); if (c) c.textContent = v.dims.size ? v.dims.size + ' figures' : ''; });
  const o = opts(), nd = countDims(S.st), bad = nd ? violations(S.st, o) : 0, sm = smallest(S.st);
  const names = { 1: 'minim', .5: 'semiminim', .25: 'fusa', .75: 'dotted semiminim' };
  $('#info').textContent = nd ? `${nd} figures · quickest note: ${names[sm] || sm + ' minims'} · ${bad ? bad + ' break the rules now switched on' : 'all obey the rules now switched on'}` : 'The model is plain. Press Diminute, or tap any note to choose a figure for it.';
  $('#btnUndo').disabled = !S.undo.length;
}
window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 150); });
$('#score').addEventListener('click', e => {
  const g = e.target.closest('.n'); if (!g) { closeSheet(); return; }
  S.sel = { v: +g.dataset.v, k: +g.dataset.k }; $$('#score .n.sel').forEach(x => x.classList.remove('sel'));
  $$(`#score .n[data-v="${S.sel.v}"][data-k="${S.sel.k}"]`).forEach(x => x.classList.add('sel'));
  openSheet();
});

/* ---------- the sheet for one note ---------- */
let showAll = false;
const pitchName = n => stepName(n.step) + ({ b: '♭', '#': '♯', n: '♮' }[n.acc] || '');
function closeSheet() { $('#sheet').hidden = true; S.sel = null; $$('#score .n.sel').forEach(x => x.classList.remove('sel')); }
$('#shClose').onclick = closeSheet;
function openSheet() {
  const { v: vi, k } = S.sel, v = S.st.voices[vi], n = v.base[k], ex = S.exps[vi], first = ex.find(x => x.k === k);
  $('#sheet').hidden = false;
  const lenNames = { 16: 'maxima', 8: 'longa', 4: 'breve', 2: 'semibreve', 1: 'minim', .5: 'semiminim', 12: 'dotted longa', 6: 'dotted breve', 3: 'dotted semibreve' };
  $('#shTitle').textContent = `${v.name || 'Voice ' + (vi + 1)} · ${n.rest ? 'rest' : pitchName(n)} · ${lenNames[n.len] || n.len + ' minims'}`;
  $('#shPlay').onclick = () => playFrom(first ? first.t : 0);
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
  render(); const t = S.exps[vi].find(x => x.k === k); S.sel = { v: vi, k };
  $$(`#score .n[data-v="${vi}"][data-k="${k}"]`).forEach(x => x.classList.add('sel')); openSheet();
  if (!b.dataset.plain) playFrom(Math.max(0, (t ? t.t : 0) - 4), (t ? t.t : 0) + S.st.voices[vi].base[k].len + 4);
});

/* ---------- playing ---------- */
function playFrom(from = 0, until = Infinity) {
  const o = { from, until, minim: 60 / +$('#tempo').value, timbre: $('#timbre').value, a4: +$('#pitch').value, mute: S.st.voices.map(v => v.mute), onEnd: () => { S.playing = false; $('#btnPlay').textContent = '▶ Play'; } };
  S.playing = true; $('#btnPlay').textContent = '■ Stop'; play(S.exps || S.st.voices.map(expand), S.st, o);
}
$('#btnPlay').onclick = () => { if (S.playing) { stop(); S.playing = false; $('#btnPlay').textContent = '▶ Play'; } else playFrom(0); };
$('#tempo').oninput = e => $('#tempoOut').textContent = e.target.value;
$('#density').oninput = e => $('#densityOut').textContent = e.target.value;
$('#rules').addEventListener('change', () => { if (S.st) render(); });

/* ---------- catalogue ---------- */
const INTS = [[0, 'the same note'], [1, 'a step up'], [-1, 'a step down'], [2, 'a third up'], [-2, 'a third down'], [3, 'a fourth up'], [-3, 'a fourth down'], [4, 'a fifth up'], [-4, 'a fifth down'], [5, 'a sixth up'], [-5, 'a sixth down']];
let cSeed = 7;
function catalogue() {
  const rel = +$('#cInt').value, D = +$('#cDur').value, sch = $('#cSchool').value, fam = $('#cFam').value, rh = $('#cRh').value;
  const base = [{ step: 32, acc: '', len: D, rest: false }, { step: 32 + rel, acc: '', len: 4, rest: false }, { step: 32 + rel, acc: '', len: 8, rest: false }];
  const mk = () => ({ bflat: false, voices: [{ name: '', clef: 'treble', base: base.map(x => ({ ...x })), dims: new Map() }] });
  const st = mk(), ctx = context(st); ctx.rank = [0];
  const o = { ...DEFAULTS, schools: sch ? [sch] : Object.keys(SCHOOLS), minValue: .25, maxLeap: 3, targetLeap: 4, keepRange: false, noParallels: false, consBeat: false, passDiss: false, noCross: false, noSeventh: false, noTritone: false };
  const rng = makeRng(cSeed); let list = candidates(ctx, 0, 0, o, rng, 80, false);
  if (fam) list = list.filter(f => f.fam === fam); if (rh) list = list.filter(f => f.rh === rh);
  list = list.slice(0, 18);
  $('#cards').innerHTML = list.length ? '' : '<div class="card">No figure of that kind fits here. Try another length or interval.</div>';
  list.forEach((f, i) => {
    const s2 = mk(); applyFigure(s2, 0, 0, f); const exps = s2.voices.map(expand);
    const r = engrave(exps, s2.voices, { width: 300, sp: 7 });
    const d = document.createElement('div'); d.className = 'fig';
    d.innerHTML = `<button class="btn small pl" data-play="${i}">▶</button><h3>${esc(FAMILIES[f.fam])}</h3><div class="meta">${esc(RHYTHMS[f.rh])} · ${f.notes.length} notes · in the manner of ${esc(SCHOOLS[f.school].name)}</div>${r.svg}`;
    d.querySelector('button').onclick = () => { S.playing = false; play(exps, s2, { minim: 60 / +$('#tempo').value, timbre: $('#timbre').value, a4: +$('#pitch').value }); };
    $('#cards').appendChild(d);
  });
}

/* ---------- treatises ---------- */
function treatises() {
  const q = $('#tFilter').value.toLowerCase().trim();
  $('#treList').innerHTML = TREATISES.filter(t => !q || [t.y, t.a, t.t, t.p, t.k, t.n].join(' ').toLowerCase().includes(q)).map(t => `<article class="tre"><div class="yr">${esc(t.y)}</div><div><h3>${esc(t.t)}</h3><div class="who">${esc(t.a)} · ${esc(t.p)}</div><p>${esc(t.n)}</p><div class="k">For: ${esc(t.k)} · <a href="${t.u}" target="_blank" rel="noopener">${esc(t.ul || 'Search on IMSLP')}</a></div></div></article>`).join('') || '<div class="card">Nothing found.</div>';
}
$('#tFilter').oninput = treatises;

/* ---------- about ---------- */
$('#aboutBody').innerHTML = `
<h2>What this is</h2>
<p>Fiorire (“to flower”) puts the Renaissance art of diminution into a workshop. Take a polyphonic model, choose which voices to ornament, and either let the engine place figures at random under rules you choose, or tap a single note and choose its figure yourself. Everything can be taken back: undo, <em>Plain</em> for the bare model, <em>Reduce</em> to strip the quick notes from a voice that already has them, or <em>Plain again</em> on one note.</p>
<h2>How the engine works</h2>
<p>A figure always begins on the original pitch, fills exactly the length of the note it replaces and runs toward the next note of the voice. It is grown from a <em>contour</em> (tirata, a scale run; gruppo, a turn; tremolo, an alternation; arco, an arch; passaggio, a mixed run) and a <em>rhythm</em> (even notes, a long note and then quick ones, dotted, snapped), and each “manner” prefers different mixes: how many notes, how quick, how much leaping, how much dotting. A figure is kept only if it passes every rule you switched on: leaps, the quickest note, consonance on the beat, dissonance off the beat only by step, no sevenths, no parallel fifths or octaves, no crossing of voices, and a stay within the voice’s range.</p>
<h2>What it is not (yet)</h2>
<p>The manners are modern descriptions of what the tutors teach, as the scholarship on them describes it. They are <strong>not</strong> transcriptions of the printed tables of any one book, and the catalogue shows generated figures, not quotations. Real tables, in particular Coclico’s examples in the chapter <em>De modo ornate canendi</em>, Ortiz’s glosas on cadences and Dalla Casa’s passaggi by interval, could be encoded one by one so that you could choose “this figure from this page”. That is the natural next step, and it needs the facsimiles read carefully.</p>
<p>The rules are a practical model of Renaissance counterpoint, not a complete one: they do not yet know about suspensions in the model, musica ficta in the figures, or the text underlay a singer would have to fit.</p>
<h2>Credits</h2>
<p>The polyphonic models come from the Josquin Research Project (josquin.stanford.edu; CC BY-NC 4.0) and from the collection of <a href="../gym/cantare/">Cantare super librum</a>, which converted them to its own notation. Accidentals are drawn from the Bravura font (SIL Open Font Licence).</p>
<p class="small">A project by Václav Hřebec. The treatise notes are short and cautious; check a title page before you cite any of this.</p>`;

/* ---------- catalogue controls and schools ---------- */
$('#schools').innerHTML = Object.entries(SCHOOLS).map(([k, s]) => `<label><input type="checkbox" value="${k}" ${DEFAULTS.schools.includes(k) ? 'checked' : ''}> ${esc(s.name)}</label>`).join('');
$('#cSchool').innerHTML = '<option value="">all</option>' + Object.entries(SCHOOLS).map(([k, s]) => `<option value="${k}">${esc(s.name)}</option>`).join('');
$('#cFam').innerHTML += Object.entries(FAMILIES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
$('#cRh').innerHTML += Object.entries(RHYTHMS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
$('#cInt').innerHTML = INTS.map(([v, t]) => `<option value="${v}" ${v === 1 ? 'selected' : ''}>${t}</option>`).join('');
$$('#cat select').forEach(s => s.onchange = () => { cSeed = 7; catalogue(); });
$('#cMore').onclick = () => { cSeed = nextSeed(); catalogue(); };
$('#coclicoNote').innerHTML = 'Coclico (<em>Compendium musices</em>, Nuremberg 1552) treats ornamenting in its chapter <em>De modo ornate canendi</em>; the <a href="https://nbn-resolving.org/urn:nbn:de:bvb:12-bsb00103405-2" target="_blank" rel="noopener">facsimile from the Bayerische Staatsbibliothek</a> is online. The “Coclico” manner here only models its plain, short, stepwise figures.';

/* ---------- tabs ---------- */
function tab(name) { $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name)); $$('.pane').forEach(p => p.classList.toggle('on', p.id === name)); if (name === 'cat' && !$('#cards').children.length) catalogue(); if (name === 'work') render(); scrollTo(0, 0); }
$$('.tab').forEach(t => t.onclick = () => { closeSheet(); tab(t.dataset.tab); });
document.addEventListener('click', e => { const a = e.target.closest('[data-goto]'); if (a) { e.preventDefault(); tab(a.dataset.goto); } });
$('#selComp').onchange = () => { fillPieces(); openChoice($('#selPiece').value); };
$('#selPiece').onchange = () => openChoice($('#selPiece').value);
$('#btnRandom').onclick = randomPiece;

treatises();
loadIndex().then(() => { $('#selComp').value = '@models'; fillPieces(); const i = S.models.findIndex(m => /Mille regretz/.test(m.title)); $('#selPiece').value = 'm' + Math.max(0, i); return openChoice($('#selPiece').value); });
window.fiorire = { S, opts, catalogue };
