/* Improvising canons: sing the dux, the comites follow; everything is written on staves as you sing. */
import { pieceFrom, fitClef, clefFor, CLEF_ORDER } from '../cantare/js/music.js';
import { engraveSystems, systemSVG, glyphIcon } from '../cantare/js/engrave.js';
import { analyse, rules, nextSteps, MOTION_NAME, INTERVAL_NAME } from './rules.js';

const $ = id => document.getElementById(id);
const escH = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- the canons: for each number of voices, the dispositions that leave the dux the most freedom ----------
   each comes enters one note after the one before; the numbers are its interval to the dux in steps of the scale.
   Worked out by rules.js: every disposition with comites within an octave of the dux was tried, and these are the
   freest (the growth of the number of correct melodies per note), both with real intervals (unison, fourth, fifth,
   octave: the comes copies your voice exactly) and with intervals in steps of the scale. */
const CANONS = {
  2: [[0], [7], [-7], [4], [-4], [3], [-3], [2], [-2], [5], [-5], [1], [-1], [6], [-6]],
  3: [[-4, 3], [7, -4], [7, 3], [-7, 4], [-7, 7], [-7, 2], [-2, 5], [-2, 3], [-2, -4], [5, 3], [5, -4]],
  4: [[7, -4, 3], [-7, 4, -3], [7, 3, -4], [-7, -3, 4], [-2, 5, 3], [7, -2, 5], [-2, 5, -4], [-7, 2, -5], [-2, -4, -6], [2, -5, 4]],
  5: [[7, -7, -3, 4], [7, -7, 4, -3], [-7, 7, -4, 3], [-2, 5, -4, 3], [7, -2, 5, 3], [7, -2, -4, 3], [5, -2, -4, 3], [7, 5, -4, 3]],
};
/* real intervals: semitones and pure ratio */
const REAL = { 0: [0, 1], 3: [5, 4 / 3], '-3': [-5, 3 / 4], 4: [7, 3 / 2], '-4': [-7, 2 / 3], 7: [12, 2], '-7': [-12, 1 / 2] };
const isReal = ts => ts.every(t => t in REAL);
const key = ts => ts.join(',');
const voicesOf = ts => [[0, 0], ...ts.map((t, i) => [i + 1, t])];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function canonName(ts) {
  if (ts.length === 1) return ts[0] === 0 ? 'At the unison' : 'At the ' + INTERVAL_NAME(ts[0]);
  return cap(ts.map(INTERVAL_NAME).join(', then '));
}
const ANALYSES = new Map();
const analysisOf = ts => { const k = key(ts); if (!ANALYSES.has(k)) ANALYSES.set(k, analyse(voicesOf(ts))); return ANALYSES.get(k); };

/* ---------- settings ---------- */
const UNIT_MIN = { L: 8, B: 4, S: 2, M: 1 };
const UNIT_NAME = { L: 'longa', B: 'brevis', S: 'semibrevis', M: 'minima' };
const UNIT_PL = { L: 'longae', B: 'breves', S: 'semibreves', M: 'minimae' };
const DEF = { n: 2, canon: { 2: '4', 3: '-4,3', 4: '7,-4,3', 5: '7,-7,-3,4' }, unit: 'S', minim: 120, metro: true, metroVol: 60, beat: 'palm',
  mode: 'voice', tune: 'pure', snap: false, ref: 440, hear: false, speakers: false, vol: 70, lat: null, gains: [80, 80, 80, 80], start: 'auto', bb: false, rules: false };
let S = { ...DEF, canon: { ...DEF.canon } };
try {
  const old = JSON.parse(localStorage.getItem('canon-settings') || '{}');
  Object.assign(S, old);
  S.canon = { ...DEF.canon, ...(old.canon || {}) };
  /* the earlier page: a preset and an entry in beats */
  const P = { u: 0, '5u': 4, '5d': -4, '4u': 3, '4d': -3, '8u': 7, '8d': -7, d2u: 1, d2d: -1, d3u: 2, d3d: -2, d6u: 5, d6d: -5, d7u: 6, d7d: -6 };
  if (old.preset && !old.canon) { if (old.preset in P) { S.n = 2; S.canon[2] = String(P[old.preset]); } }
  if (!Array.isArray(S.gains) || S.gains.length < 4) S.gains = [...(S.gains || []), 80, 80, 80, 80].slice(0, 4);
} catch (e) { /* storage may be blocked */ }
const save = () => { try { localStorage.setItem('canon-settings', JSON.stringify(S)); } catch (e) { /* ignore */ } };
const curTs = () => { const k = S.canon[S.n]; const ts = (CANONS[S.n] || []).find(t => key(t) === k); return ts || CANONS[S.n][0]; };
const spm = () => 60 / S.minim;                       /* seconds per minim */
const unitSec = () => UNIT_MIN[S.unit] * spm();
const slotMin = () => (S.unit === 'M' ? 1 : 2);       /* the grid the singing is read in: semibreves, or minims */
const slotSec = () => slotMin() * spm();

/* ---------- the toolbar ---------- */
const COLORS = ['var(--accent)', 'var(--v2)', 'var(--v3)', '#b07a2a', '#7d5aa6'];
function dispSVG(ts) {
  /* when each voice enters (left to right) and how high it sings (up and down); the dux in red */
  const vs = voicesOf(ts), W = 130, H = 46, n = vs.length, cw = (W - 8) / (n + 1);
  const lo = Math.min(...vs.map(v => v[1])), hi = Math.max(...vs.map(v => v[1])), y = t => hi === lo ? H / 2 : 6 + (hi - t) / (hi - lo) * (H - 12);
  let o = `<svg class="disp" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  vs.forEach(([d, t], i) => { o += `<rect x="${4 + d * cw}" y="${y(t) - 2.5}" width="${W - 8 - d * cw}" height="5" fill="${COLORS[i]}" opacity="${i ? .85 : 1}"/>`; });
  return o + '</svg>';
}
const FREE_MAX = 7.5;
const freeBars = l => `<span class="free" title="Freedom of the dux: about ${l.toFixed(1)} good continuations per note">${[1, 2, 3, 4, 5].map(k => `<i class="${l / FREE_MAX * 5 >= k - .5 ? 'on' : ''}"></i>`).join('')}</span>`;
function buildTools() {
  const nv = $('nv'); nv.innerHTML = '';
  [2, 3, 4, 5].forEach(n => { const b = document.createElement('button'); b.className = 'b'; b.type = 'button'; b.textContent = n; b.setAttribute('aria-pressed', String(S.n === n)); b.onclick = () => { S.n = n; save(); afterCanon(); }; nv.append(b); });
  const box = $('canons'); box.innerHTML = '';
  const list = CANONS[S.n].map(ts => ({ ts, l: analysisOf(ts).lambda })).sort((a, b) => b.l - a.l);
  const cur = key(curTs());
  list.forEach(({ ts, l }) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cn-b'; b.setAttribute('aria-pressed', String(key(ts) === cur));
    b.innerHTML = dispSVG(ts) + `<span class="nm">${escH(canonName(ts))}</span><span class="kind"><span>${isReal(ts) ? 'Real intervals' : 'Scale steps'}</span>${freeBars(l)}</span>`;
    b.onclick = () => { S.canon[S.n] = key(ts); save(); afterCanon(); };
    box.append(b);
  });
  const ts = curTs();
  $('chosen').innerHTML = `<b>${escH(canonName(ts))}.</b> ` + ts.map((t, i) => `Comes ${i + 1} enters ${i + 1} ${i ? UNIT_PL[S.unit] : UNIT_NAME[S.unit]} after you, at the ${escH(INTERVAL_NAME(t))}.`).join(' ');
}
function afterCanon() {
  buildTools(); renderVoices(); sendConfig(); duxClef = null; render(true); renderRules();
}

/* ---------- the rules of the chosen canon ---------- */
const SHORT = { 0: 'stay', 1: '2nd ↑', '-1': '2nd ↓', 2: '3rd ↑', '-2': '3rd ↓', 3: '4th ↑', '-3': '4th ↓', 4: '5th ↑', '-4': '5th ↓', 5: '6th ↑', 7: '8ve ↑', '-7': '8ve ↓' };
let RULES = null;
function stepFigure(m, clef) {
  /* the step drawn on a little staff: the note you stand on, then the note you go to */
  const c = clefFor(clef), from = c.bottom + 4 - (m > 0 ? Math.min(3, Math.ceil(m / 2)) : Math.max(-3, Math.floor(m / 2)));
  const p = pieceFrom({ title: '', c: clef, n: `${from}S ${from + m}S` }, []);
  p.talea = true;
  const sys = engraveSystems(p, [0], 16, { names: false, fullLast: true })[0];
  return `<figure class="mv" data-m="${m}">${systemSVG(sys, 6.4)}<figcaption>${SHORT[m]}</figcaption></figure>`;
}
function renderRules() {
  const box = $('rules'); box.hidden = !S.rules;
  $('rulesBtn').setAttribute('aria-expanded', String(!!S.rules));
  $('rulesBtn').textContent = S.rules ? 'Hide the rules' : 'Show me the rules';
  if (!S.rules) return;
  const ts = curTs(), A = analysisOf(ts), R = RULES = rules(A);
  const clef = duxClef || 'c4';
  const allowed = [...R.allowed].sort((a, b) => a - b);
  const pair = ([a, b]) => `${MOTION_NAME[a]}, then ${MOTION_NAME[b]}`;
  box.innerHTML = `<h3>${escH(canonName(ts))}</h3>
    <p class="sub">For a dux that sings one note every ${UNIT_NAME[S.unit]}, so that each new note sounds against the comites. The steps your melody may take:</p>
    <div class="moves" id="moves">${allowed.map(m => stepFigure(m, clef)).join('')}</div>
    <p class="nextline" id="nextline"></p>
    ${R.pairs.length ? `<h4>Never one after the other</h4><ul class="cols">${R.pairs.map(p => `<li>${pair(p)}</li>`).join('')}</ul>` : ''}
    ${R.triples.length ? `<details><summary>And never these three in a row (${R.triples.length})</summary><ul class="cols">${R.triples.map(([a, b, c]) => `<li>${MOTION_NAME[a]}, ${MOTION_NAME[b]}, ${MOTION_NAME[c]}</li>`).join('')}</ul></details>` : ''}
    <p class="note">Worked out note by note: every voice sounds only thirds, fifths, sixths, octaves or unisons against the lowest one (a fourth only between two upper voices), and no two voices move in fifths, octaves or unisons one after another. Steps are counted in the scale: mind mi contra fa (B against F).${A.D > 1 ? ' While you sing, the steps possible from where you stand light up.' : ' While you sing, the steps possible from where you stand light up.'}</p>`;
  liveRules();
}
let lastLive = '';
function liveRules() {
  if (!S.rules || !$('moves')) return;
  const ts = curTs(), A = analysisOf(ts);
  /* the dux's last steps, one per unit */
  const per = UNIT_MIN[S.unit] / slotMin(), notes = [];
  for (let k = 0; k * per < DUX.length; k++) notes.push(DUX[k * per]);
  const ms = [];
  for (let i = notes.length - A.D; i < notes.length; i++) { const a = notes[i - 1], b = notes[i]; if (i < 1 || !a || !b) { ms.length = 0; continue; } ms.push(b.step - a.step); }
  const nx = running && ms.length >= A.D ? nextSteps(A, ms) : null;
  const sig = running + '|' + (nx ? nx.join() : 'n');
  if (sig === lastLive) return; lastLive = sig;
  $('moves').classList.toggle('live', !!nx);
  document.querySelectorAll('#moves .mv').forEach(f => f.classList.toggle('ok', !!nx && nx.includes(+f.dataset.m)));
  $('nextline').textContent = !running ? '' : nx ? (nx.length ? 'Now you may: ' + [...nx].sort((a, b) => a - b).map(m => MOTION_NAME[m]).join(', ') + '.' : 'Your last steps broke a rule of this canon (see below). Go on with any of the steps above and try again.') : 'Sing a few notes, and the possible steps light up.';
}

/* ---------- the voices (volume of each comes) ---------- */
function renderVoices() {
  const ul = $('voices'); ul.innerHTML = '';
  curTs().forEach((t, i) => {
    const li = document.createElement('li'); li.style.setProperty('--c', COLORS[i + 1]);
    li.innerHTML = `<span class="sw"></span><span><span class="nm">Comes ${i + 1}</span><span class="ds">${escH(INTERVAL_NAME(t))}</span></span><span><input type="range" min="0" max="100" value="${S.gains[i]}" aria-label="Volume of comes ${i + 1}"></span>`;
    li.querySelector('input').addEventListener('input', e => { S.gains[i] = +e.target.value; save(); sendConfig(); });
    ul.append(li);
  });
}

/* ---------- the time bar ---------- */
function buildUnits() {
  const box = $('units'); box.innerHTML = '';
  ['L', 'B', 'S', 'M'].forEach(u => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'b'; b.title = cap(UNIT_NAME[u]);
    b.setAttribute('aria-pressed', String(S.unit === u)); b.innerHTML = glyphIcon('note', u) + `<span>${cap(UNIT_NAME[u])}</span>`;
    b.onclick = () => { if (running) stop(); S.unit = u; save(); buildUnits(); buildTools(); sendConfig(); render(true); renderRules(); };
    box.append(b);
  });
  $('hintUnit').textContent = UNIT_NAME[S.unit];
  /* short names on a narrow screen */
  if (innerWidth < 560) box.querySelectorAll('span').forEach(s => { s.textContent = s.textContent.slice(0, 1) === 'S' ? 'S' : s.textContent.slice(0, 1); });
}
function syncTime() {
  $('tempo').value = S.minim;
  $('metroBtn').setAttribute('aria-pressed', String(!!S.metro));
  $('handBtn').setAttribute('aria-pressed', String(S.beat !== 'none'));
  const h = $('tactusHand'); h.hidden = S.beat === 'none'; h.dataset.style = S.beat === 'baton' ? 'baton' : 'palm';
}
const setTempo = v => { S.minim = Math.max(20, Math.min(300, Math.round(v) || 120)); save(); syncTime(); sendConfig(); };
$('tempo').addEventListener('change', e => setTempo(+e.target.value));
let taps = [];
$('tap').addEventListener('click', () => {
  const t = performance.now(); taps = taps.filter(x => t - x < 3000); taps.push(t);
  if (taps.length >= 2) setTempo(60000 / ((taps.at(-1) - taps[0]) / (taps.length - 1)));
});
$('metroBtn').addEventListener('click', () => { S.metro = !S.metro; save(); syncTime(); applyVolumes(); });
$('handBtn').addEventListener('click', () => { S.beat = { palm: 'baton', baton: 'none', none: 'palm' }[S.beat] || 'palm'; save(); syncTime(); });
$('rulesBtn').addEventListener('click', () => { S.rules = !S.rules; save(); renderRules(); });

/* ---------- audio ---------- */
let ctx = null, node = null, master = null, metroBus = null, src = null, stream = null, running = false;
const status = (t, err) => { const s = $('status'); s.textContent = t || ''; s.className = err ? 'err' : ''; };
async function ensureAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    const url = URL.createObjectURL(new Blob([$('worklet').textContent], { type: 'application/javascript' }));
    await ctx.audioWorklet.addModule(url);
    node = new AudioWorkletNode(ctx, 'canon', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
    node.port.onmessage = onMsg;
    master = ctx.createGain();
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -3; lim.knee.value = 4; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
    node.connect(master).connect(lim).connect(ctx.destination);
    metroBus = ctx.createGain(); metroBus.connect(ctx.destination);
    if (S.lat == null) { S.lat = Math.round(((ctx.baseLatency || 0.01) + (ctx.outputLatency || 0.02)) * 1000 + 15); syncSettings(); save(); }
  }
  if (ctx.state !== 'running') await ctx.resume();
  applyVolumes(); sendConfig();
}
async function openMic() {
  closeMic();
  stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: S.speakers, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
  src = ctx.createMediaStreamSource(stream); src.connect(node);
}
function closeMic() {
  if (src) { try { src.disconnect(); } catch (e) { /* ignore */ } src = null; }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
}
function sendConfig() {
  if (!node) return;
  const ts = curTs(), sr = ctx.sampleRate, minDelay = Math.round(0.06 * sr) + 3 * 512, n = ts.length;
  const voices = ts.map((t, i) => {
    const real = REAL[t];
    const ratio = real ? (t === 0 ? 1 : S.tune === 'pure' ? real[1] : Math.pow(2, real[0] / 12)) : 1;
    const delay = Math.max(minDelay, ((i + 1) * unitSec() - (S.lat || 0) / 1000) * sr);
    const pan = n === 1 ? .35 : -.55 + 1.1 * i / (n - 1), a = (pan + 1) * Math.PI / 4;
    return { delay, ratio, dia: real ? null : t, gain: Math.pow(S.gains[i] / 100, 1.6) * 1.4, pl: Math.cos(a) * 1.41, pr: Math.sin(a) * 1.41 };
  });
  node.port.postMessage({ type: 'config', voices, mode: S.mode, snap: S.snap, ref: S.ref, hear: S.hear ? 0.8 : 0, start: S.start === 'auto' ? -1 : +S.start, bb: !!S.bb });
}
function applyVolumes() {
  if (!master) return;
  master.gain.setTargetAtTime(Math.pow(S.vol / 100, 1.5) * 6.6, ctx.currentTime, 0.02);
  metroBus.gain.setTargetAtTime(S.metro ? Math.pow(S.metroVol / 100, 1.5) * 0.9 : 0, ctx.currentTime, 0.02);
}

/* ---------- metronome: a click on every semibrevis (every minim when the comes follows after a minim); a stronger one where a new note of the dux begins ---------- */
let T0 = 0, nextClick = 0, clickNo = 0, schedTimer = null;
function click(t, acc, bus) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'triangle'; o.frequency.value = acc ? 1760 : 1320;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(acc ? 0.9 : 0.5, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(bus); o.start(t); o.stop(t + 0.06);
}
function sched() {
  const per = UNIT_MIN[S.unit] / slotMin();
  while (nextClick < ctx.currentTime + 0.12) { click(nextClick, per > 1 && clickNo % per === 0, metroBus); clickNo++; nextClick = T0 + clickNo * slotSec(); }
}
function startMetro() { T0 = ctx.currentTime + 0.25; nextClick = T0; clickNo = 0; sched(); schedTimer = setInterval(sched, 25); }
function stopMetro() { clearInterval(schedTimer); schedTimer = null; }

/* ---------- start / stop ---------- */
async function start() {
  if (!window.isSecureContext || !navigator.mediaDevices) { status('The microphone needs a secure (https) page.', true); return; }
  try {
    status('Starting…');
    await ensureAudio();
    node.port.postMessage({ type: 'reset' }); node.port.postMessage({ type: 'mute', on: false });
    await openMic();
    SLOTS = []; DUX = []; trV = 0; lastLive = '';
    startMetro(); running = true;
    $('start').classList.add('on'); $('start').querySelector('span').textContent = 'Stop';
    $('start').querySelector('svg').innerHTML = '<path d="M2 2h10v10H2Z"/>';
    $('hint').hidden = true; $('tactusHand').classList.add('beating');
    status(S.speakers ? 'Listening. With speakers, keep the volume low.' : `Listening. Sing one note every ${UNIT_NAME[S.unit]}.`);
    render(true); liveRules();
  } catch (e) {
    status(e && e.name === 'NotAllowedError' ? 'The microphone was not allowed. Allow it in the browser and try again.' : 'Could not start: ' + (e.message || e), true);
    stop();
  }
}
function stop() {
  stopMetro(); closeMic(); running = false;
  if (node) node.port.postMessage({ type: 'reset' });
  $('start').classList.remove('on'); $('start').querySelector('span').textContent = 'Start';
  $('start').querySelector('svg').innerHTML = '<path d="M2 1 13 7 2 13Z"/>';
  $('tactusHand').classList.remove('beating'); poseHand(.5);
  if (!$('status').classList.contains('err')) status('');
  lastLive = 'x'; liveRules();
}
$('start').addEventListener('click', () => (running ? stop() : start()));
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)) { e.preventDefault(); running ? stop() : start(); }
});

/* ---------- clap test ---------- */
let onsets = null;
$('clap').addEventListener('click', async () => {
  if (onsets) return;
  if (running) stop();
  const msg = $('clapMsg');
  try { await ensureAudio(); node.port.postMessage({ type: 'mute', on: true }); await openMic(); } catch (e) { msg.textContent = 'The microphone is needed for the test.'; return; }
  onsets = [];
  const gap = 0.6, t0 = ctx.currentTime + 0.8, clicks = [];
  const bus = ctx.createGain(); bus.gain.value = 0.9; bus.connect(ctx.destination);
  for (let i = 0; i < 8; i++) { clicks.push(t0 + i * gap); click(t0 + i * gap, i === 0, bus); }
  node.port.postMessage({ type: 'onsets', on: true });
  msg.textContent = 'Clap with each click…';
  setTimeout(() => {
    node.port.postMessage({ type: 'onsets', on: false });
    const d = [];
    for (const c of clicks.slice(2)) {
      let best = null;
      for (const o of onsets) { const x = o - c; if (x > -0.08 && x < 0.5 && (best === null || Math.abs(x - 0.1) < Math.abs(best - 0.1))) best = x; }
      if (best !== null) d.push(best);
    }
    onsets = null; closeMic(); node.port.postMessage({ type: 'mute', on: false });
    if (d.length < 3) { msg.textContent = 'Not enough claps were heard. Try again, a little louder.'; return; }
    d.sort((a, b) => a - b);
    S.lat = Math.max(0, Math.min(500, Math.round(d[Math.floor(d.length / 2)] * 1000))); save(); syncSettings(); sendConfig();
    msg.textContent = `Measured ${S.lat} ms.`;
  }, (0.8 + 8 * gap + 0.6) * 1000);
});

/* ---------- reading the singing: one note for each semibrevis (or minim) ---------- */
let SLOTS = [], DUX = [], trV = 0, level = 0, dirty = false;
const SCN = [0, 2, 4, 5, 7, 9, 11], SCB = [0, 2, 4, 5, 7, 9, 10];
const scale = () => (S.bb ? SCB : SCN);
function degreeOf(m, sc) {
  const oct = Math.floor(m / 12), pc = m - oct * 12; let bi = 0, bd = 1e9;
  for (let d = 0; d < 7; d++) { const dd = Math.abs(sc[d] - pc); if (dd < bd) { bd = dd; bi = d; } }
  if (Math.abs(sc[0] + 12 - pc) < bd) return (oct + 1) * 7;
  return oct * 7 + bi;
}
const stepMidi = (step, sc) => 12 * (Math.floor(step / 7) + 1) + sc[((step % 7) + 7) % 7]; /* step: C4 = 28 */
function slotNote(arr) {
  /* the note of a slot: the middle of what was sung after the first fifth of it (the arrival) */
  const from = Math.floor(arr.length * .2), ms = arr.slice(from).filter(m => m !== null);
  if (ms.length < Math.max(2, (arr.length - from) * .35)) return null;
  ms.sort((a, b) => a - b);
  const m = ms[ms.length >> 1];
  return { step: degreeOf(m + trV, scale()) - 7, attack: arr.slice(0, Math.max(2, from)).some(x => x === null) };
}
function onMsg(e) {
  const d = e.data;
  if (d.type === 'p') {
    level = Math.max(d.lv, level * 0.85);
    if (!running) return;
    const rel = d.t - T0 - (S.lat || 0) / 1000, k = Math.floor(rel / slotSec() + 0.06);
    if (k < 0) return;
    while (SLOTS.length <= k) SLOTS.push([]);
    SLOTS[k].push(d.f > 0 ? 69 + 12 * Math.log2(d.f / S.ref) : null);
    /* a finished slot becomes a note */
    for (let i = DUX.length; i < k; i++) { DUX[i] = slotNote(SLOTS[i]); dirty = true; }
  } else if (d.type === 'tr') trV = d.tr;
  else if (d.type === 'on' && onsets) onsets.push(d.t);
}

/* ---------- writing it on staves ---------- */
let duxClef = null;
const CLEFS_POOL = ['treble', 'c1', 'c2', 'c3', 'c4', 'baritone', 'bass'];
const clefs = {};
function fitStaffClef(steps, cur, guess) {
  if (!steps.length) return cur || guess;
  const c = clefFor(cur || guess), lo = Math.min(...steps), hi = Math.max(...steps);
  if (cur && lo - c.bottom >= -3 && hi - c.bottom <= 11) return cur;
  return fitClef(steps, 5, cur || guess, CLEFS_POOL).id;
}
const nearestClef = bottom => CLEFS_POOL.map(clefFor).sort((a, b) => Math.abs(a.bottom - bottom) - Math.abs(b.bottom - bottom))[0].id;
function tokens(notes) {
  /* notes per slot (step/acc or null), joined into longer values where the same note is held */
  const sm = slotMin(), runs = [];
  notes.forEach(n => {
    const last = runs.at(-1);
    if (last && ((n === null && last.n === null) || (n && last.n && !n.attack && n.step === last.n.step && n.acc === last.n.acc))) last.len += sm;
    else runs.push({ n, len: sm });
  });
  const out = [];
  runs.forEach(({ n, len }) => {
    for (const [v, val] of (n ? [[8, 'L'], [6, 'B.'], [4, 'B'], [3, 'S.'], [2, 'S'], [1, 'M']] : [[8, 'L'], [4, 'B'], [2, 'S'], [1, 'M']])) {
      while (len >= v) { out.push(n ? `${n.step}${n.acc || ''}${val}` : `r${val}`); len -= v; }
    }
  });
  return out.join(' ');
}
function comesNote(n, t) {
  if (!n) return null;
  const sc = scale(), step = n.step + t, real = REAL[t];
  if (!real) return { step, acc: '', attack: n.attack };
  const want = stepMidi(n.step, sc) + real[0], has = stepMidi(step, sc), deg = ((step % 7) + 7) % 7;
  const acc = want === has ? '' : want > has ? (S.bb && deg === 6 ? 'n' : '#') : 'b';
  return { step, acc, attack: n.attack };
}
let lastRender = 0;
function render(force) {
  const box = $('staves'), W = box.clientWidth || 600;
  const ts = curTs(), sm = slotMin(), per = UNIT_MIN[S.unit] / sm;
  /* the slots to show: the newest ones, beginning on a whole unit */
  const z = Math.max(8.5, Math.min(11, W / 64));
  const minimsShown = Math.max(8, Math.min(48, Math.round(W / (z * 3.4))));
  const nShow = Math.max(per, Math.floor(minimsShown / sm / per) * per);
  const total = running ? SLOTS.length : DUX.length;
  const startK = Math.max(0, Math.ceil((total - nShow) / per) * per);
  /* the dux's note in slot k: finished, still being sung, or not yet */
  const noteAt = k => (k < DUX.length ? DUX[k] : running && k === SLOTS.length - 1 && SLOTS[k] ? slotNote(SLOTS[k]) : undefined);
  /* the voices, highest on top */
  const sung = DUX.filter(Boolean).map(n => n.step);
  if (!duxClef) duxClef = S.duxClef || 'c4';
  duxClef = fitStaffClef(sung.slice(-24), duxClef, 'c4');
  if (duxClef !== S.duxClef) { S.duxClef = duxClef; save(); }
  const voices = [{ t: 0, d: 0, nm: 'Dux' }, ...ts.map((t, i) => ({ t, d: i + 1, nm: `Comes ${i + 1}` }))];
  const order = [...voices].sort((a, b) => b.t - a.t || a.d - b.d);
  const poly = order.map(v => {
    const shown = [];
    for (let j = 0; j < nShow; j++) {
      const k = startK + j - v.d * per;
      if (k < 0) { if (startK + j < total) shown.push(null); continue; }
      const n = noteAt(k);
      if (n === undefined) break;
      shown.push(v.t && n ? comesNote(n, v.t) : n);
    }
    const guess = nearestClef(clefFor(duxClef).bottom + v.t);
    const id = `${key(ts)}|${v.d}`;
    clefs[id] = v.t ? fitStaffClef(shown.filter(Boolean).map(n => n.step), clefs[id], guess) : duxClef;
    return { c: clefs[id], nm: v.nm, n: tokens(shown) };
  });
  /* an empty staff still needs something to stand on: a rest that fills the line */
  poly.forEach(v => { if (!v.n) v.n = 'rS'; });
  const p = pieceFrom({ title: '', t: 'C', b: S.bb ? 1 : 0, poly }, []);
  p.talea = true;
  p.voices.forEach((v, i) => { v.name = poly[i].nm; });
  let svg = '';
  try {
    engraveSystems(p, p.voices.map((v, i) => i), (W - 6) / z, { names: true, fullLast: true }).slice(0, 1).forEach(s => { svg += systemSVG(s, z); });
  } catch (e) { console.error(e); }
  box.innerHTML = svg;
  lastRender = performance.now();
}

/* ---------- the tactus hand: down on the first minim of every semibrevis, up on the second ---------- */
const thArm = $('thArm');
function poseHand(lift) { thArm.style.transform = `rotate(${(lift - .5) * (S.beat === 'palm' ? 9 : 8)}deg)`; }
const ease = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
function frame() {
  requestAnimationFrame(frame);
  if (running && ctx) {
    const t = ctx.currentTime - (ctx.outputLatency || 0) - T0, ph = ((t / (2 * spm())) % 1 + 1) % 1;
    poseHand(ph < .5 ? ease(.32, .5, ph) : 1 - ease(.82, 1, ph));
    if (dirty || performance.now() - lastRender > 220) { dirty = false; render(); liveRules(); }
  }
  $('meter').style.width = Math.min(100, Math.sqrt(level) * 140) + '%';
  if (!running) level *= 0.9;
}
requestAnimationFrame(frame);
addEventListener('resize', () => { buildUnits(); render(true); });

/* ---------- the settings ---------- */
function syncSettings() {
  $('snap').checked = S.snap; $('ref').value = S.ref; $('hear').checked = S.hear; $('speakers').checked = S.speakers; $('vol').value = S.vol; $('metroVol').value = S.metroVol;
  $('lat').value = S.lat ?? 45; $('latR').value = S.lat ?? 45;
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === S.mode));
  document.querySelectorAll('[data-tune]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tune === S.tune));
  $('snapRow').style.opacity = S.mode === 'organ' ? 1 : .5;
  $('startNote').value = S.start; $('bb').checked = S.bb;
}
const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
on('startNote', 'change', e => { S.start = e.target.value; save(); sendConfig(); });
on('bb', 'change', e => { S.bb = e.target.checked; save(); sendConfig(); render(true); });
on('metroVol', 'input', e => { S.metroVol = +e.target.value; save(); applyVolumes(); });
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { S.mode = b.dataset.mode; save(); syncSettings(); sendConfig(); }));
document.querySelectorAll('[data-tune]').forEach(b => b.addEventListener('click', () => { S.tune = b.dataset.tune; save(); syncSettings(); sendConfig(); }));
on('snap', 'change', e => { S.snap = e.target.checked; save(); sendConfig(); });
on('ref', 'change', e => { S.ref = Math.max(380, Math.min(480, +e.target.value || 440)); e.target.value = S.ref; save(); sendConfig(); });
on('hear', 'change', e => { S.hear = e.target.checked; save(); sendConfig(); });
on('speakers', 'change', async e => { S.speakers = e.target.checked; save(); if (running) { try { await openMic(); } catch (err) { /* ignore */ } } });
on('vol', 'input', e => { S.vol = +e.target.value; save(); applyVolumes(); });
const setLat = v => { S.lat = Math.max(0, Math.min(500, Math.round(v) || 0)); $('lat').value = S.lat; $('latR').value = S.lat; save(); sendConfig(); };
on('latR', 'input', e => setLat(+e.target.value));
on('lat', 'change', e => setLat(+e.target.value));

/* ---------- patterns to practise (two voices): [interval, comes after 1 or 2 notes, dux in steps (C4 = 28)], each checked ---------- */
const PATTERNS = [[0,1,[28,26,28,26,24,26,24,22,24,22,20,22]],[0,2,[28,27,26,29,28,27,30,29,28,31,30,29]],[7,1,[28,26,28,26,24,26,24,22,24,22,20,22]],[7,2,[28,27,26,29,28,27,30,29,28,31,30,29]],[-7,1,[28,26,28,26,24,26,24,22,24,22,20,22]],[-7,2,[28,27,26,29,28,27,30,29,28,31,30,29]],[4,1,[28,27,29,28,30,29,31,30,32,31,33,32]],[4,2,[28,26,27,25,26,24,25,23,24,22,23,21]],[-4,1,[32,30,31,29,30,28,29,27,28,26,27,25]],[-4,2,[32,31,33,32,34,33,35,34,36,35,37,36]],[3,1,[32,30,31,29,30,28,29,27,28,26,27,25]],[3,2,[32,31,33,32,34,33,35,34,36,35,37,36]],[-3,1,[28,27,29,28,30,29,31,30,32,31,33,32]],[-3,2,[28,26,27,25,26,24,25,23,24,22,23,21]],[1,1,[28,27,26,27,26,25,26,25,24,25,24,23]],[1,2,[28,26,27,25,26,24,25,23,24,22,23,21]],[-1,1,[28,27,28,29,28,29,30,29,30,31,30,31]],[-1,2,[28,27,29,28,30,29,31,30,32,31,33,32]],[2,1,[31,33,30,32,29,31,28,30,27,29,26,28]],[2,2,[28,27,26,27,26,25,26,25,24,25,24,23]],[-2,1,[28,26,29,27,30,28,31,29,32,30,33,31]],[-2,2,[28,27,26,27,26,25,26,25,24,25,24,23]],[5,1,[32,33,31,32,30,31,29,30,28,29,27,28]],[5,2,[28,27,26,27,26,25,26,25,24,25,24,23]],[-5,1,[32,34,33,35,34,36,35,37,36,38,37,39]],[-5,2,[28,27,28,29,28,29,30,29,30,31,30,31]],[6,1,[28,27,28,29,28,29,30,29,30,31,30,31]],[6,2,[28,27,29,28,30,29,31,30,32,31,33,32]],[-6,1,[28,27,26,27,26,25,26,25,24,25,24,23]],[-6,2,[28,26,27,25,26,24,25,23,24,22,23,21]]];
const LET = 'CDEFGAB';
const pmidi = D => stepMidi(D, SCN);
function patTokens(dux, d, t) {
  const c = dux.map(D => comesNote({ step: D, attack: true }, t));
  return [dux.map(D => `${D}S`).join(' ') + ' ' + Array(d).fill('rS').join(' '),
    Array(d).fill('rS').join(' ') + ' ' + c.map(n => `${n.step}${n.acc}S`).join(' ')];
}
function patSVG(t, d, dux) {
  const [a, b] = patTokens(dux, d, t);
  const all = dux.concat(dux.map(D => D + t));
  const ca = fitClef(dux, 5, 'c4', CLEFS_POOL).id, cb = fitClef(dux.map(D => D + t), 5, 'c4', CLEFS_POOL).id;
  const p = pieceFrom({ title: '', t: 'C', poly: t >= 0 ? [{ c: cb, n: b }, { c: ca, n: a }] : [{ c: ca, n: a }, { c: cb, n: b }] }, []);
  p.talea = true; void all;
  const s = engraveSystems(p, [0, 1], 46, { names: false, fullLast: true })[0];
  return systemSVG(s, 6.3);
}
let patCtx = null;
function hearPattern(t, d, dux) {
  patCtx = patCtx || new (window.AudioContext || window.webkitAudioContext)();
  const c = patCtx; if (c.state === 'suspended') c.resume();
  const beat = 2 * spm(), t0 = c.currentTime + .08, ref = S.ref || 440, f = m => ref * Math.pow(2, (m - 69) / 12);
  const tone = (m, at, len, g0) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o.frequency.value = f(m);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(g0, at + .03); g.gain.setValueAtTime(g0, at + len - .06); g.gain.linearRampToValueAtTime(0, at + len);
    o.connect(g).connect(c.destination); o.start(at); o.stop(at + len + .02);
  };
  dux.forEach((D, i) => tone(pmidi(D), t0 + i * beat, beat * .96, .16));
  dux.forEach((D, i) => { const n = comesNote({ step: D }, t); tone(pmidi(n.step) + (n.acc === '#' ? 1 : n.acc === 'b' ? -1 : 0), t0 + (i + d) * beat, beat * .96, .12); });
}
function renderPatterns() {
  const box = $('patList');
  box.innerHTML = PATTERNS.map(([t, d, dux], k) => `<div class="pat"><h4>${escH(canonName([t]))}</h4><div class="ds">comes ${d} ${d === 1 ? 'semibrevis' : 'semibreves'} later · ${t in REAL ? 'real interval' : 'in steps of the scale'}</div>${patSVG(t, d, dux)}<div class="ds">${dux.map(D => LET[D % 7]).join(' ')}</div>
    <div class="acts"><button class="b" type="button" data-hear="${k}">Hear it</button><button class="b" type="button" data-use="${k}">Use these settings</button></div></div>`).join('');
  box.querySelectorAll('[data-hear]').forEach(b => { b.onclick = () => hearPattern(...PATTERNS[+b.dataset.hear]); });
  box.querySelectorAll('[data-use]').forEach(b => { b.onclick = () => {
    const [t, d] = PATTERNS[+b.dataset.use];
    S.n = 2; S.canon[2] = String(t); S.unit = d === 1 ? 'S' : 'B'; save(); buildUnits(); afterCanon();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }; });
}

/* ---------- the library of canons (from the Josquin Research Project) ---------- */
let LIB = null;
const PRE_T = { u: 0, '5u': 4, '5d': -4, '4u': 3, '4d': -3, '8u': 7, '8d': -7 };
function renderLib() {
  const q = $('libSearch').value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean), body = $('libBody');
  if (!LIB) { body.innerHTML = '<p class="note">Loading…</p>'; return; }
  body.innerHTML = LIB.map((g, gi) => {
    const items = g.items.map((it, ii) => [it, ii]).filter(([it]) => { const h = (it.t + ' ' + it.w + ' ' + it.f.join(' ') + ' ' + it.e).toLowerCase(); return words.every(w => h.includes(w)); });
    if (!items.length) return '';
    return `<details${q ? ' open' : ''}><summary>${escH(g.g)}<small>${items.length}</small></summary>` + items.map(([it, ii]) => {
      const lines = it.f.length ? it.f : (it.e ? [it.e] : []);
      return `<div class="cn"><h4>${escH(it.t)}</h4><div class="w">${escH(it.w)}${it.v ? ' · ' + escH(it.v) : ''}</div>` +
        (lines.length ? `<ul>${lines.map(l => `<li>${escH(l)}</li>`).join('')}</ul>` : '') +
        `<div class="acts">${g.p in PRE_T ? `<button class="b" type="button" data-prac="${gi}:${ii}" title="Set this page to the interval and the entry of this canon">Practise</button>` : ''}` +
        `<a href="../cantare/#jrp:${encodeURIComponent(it.id)}" target="_blank" rel="noopener">See the score</a></div></div>`;
    }).join('') + '</details>';
  }).join('') || '<p class="note">Nothing found.</p>';
  body.querySelectorAll('[data-prac]').forEach(b => { b.onclick = () => {
    const [gi, ii] = b.dataset.prac.split(':').map(Number), g = LIB[gi], it = g.items[ii];
    S.n = 2; S.canon[2] = String(PRE_T[g.p]);
    if (it.d) { /* the entry in breves: the nearest of longa, brevis, semibrevis, minima */
      const m = it.d * 4; S.unit = Object.keys(UNIT_MIN).sort((a, b2) => Math.abs(Math.log(UNIT_MIN[a] / m)) - Math.abs(Math.log(UNIT_MIN[b2] / m)))[0];
    }
    save(); buildUnits(); afterCanon();
    $('lib').close(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }; });
}
function openLib(e) {
  if (e) e.preventDefault();
  $('lib').showModal();
  if (!LIB) fetch('library.json').then(r => r.json()).then(d => { LIB = d; renderLib(); }).catch(() => { $('libBody').innerHTML = '<p class="note">Could not load the library (offline?).</p>'; });
  else renderLib();
  $('libCredit').hidden = false;
  $('libCredit').innerHTML = 'From the Josquin Research Project (<a href="https://josquin.stanford.edu" target="_blank" rel="noopener">josquin.stanford.edu</a>), CC BY-NC 4.0.';
}
$('openLib').onclick = openLib; $('openLib2').onclick = openLib;
$('libClose').onclick = () => $('lib').close();
$('lib').addEventListener('click', e => { if (e.target === $('lib')) $('lib').close(); });
$('libSearch').addEventListener('input', renderLib);

$('yr').textContent = new Date().getFullYear();
syncSettings(); syncTime(); buildUnits(); buildTools(); renderVoices(); poseHand(.5); render(true); renderRules();
try { renderPatterns(); } catch (e) { console.error(e); }
window.canonPage = { S, render, get DUX() { return DUX; }, set DUX(v) { DUX = v; }, get SLOTS() { return SLOTS; }, liveRules, analysisOf, curTs };
