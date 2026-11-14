/* Sound: a small additive/subtractive synthesiser with a church-like room. */
import { midiOf, hz } from './music.js';
import { word } from './latin.js';
import * as I from './instruments.js';

export const TIMBRES = {
  voice: { label: 'Voice' },
  organ: { label: 'Organ, Principal 8′' },
  plenum: { label: 'Organ, full (plenum)' },
  regal: { label: 'Regal' },
  recorder: { label: 'Recorders' },
  cornett: { label: 'Cornett' },
  sackbut: { label: 'Sackbut' },
  crumhorn: { label: 'Crumhorn' },
  chalumeau: { label: 'Chalumeau' },
  harpsichord: { label: 'Harpsichord (Italian)' },
  lute: { label: 'Lute' },
  flute: { label: 'Open flute 8′' },
  gedackt: { label: 'Gedackt 8′ (stopped flute)' },
  sine: { label: 'Sine' },
  custom: { label: 'Your own (drawbars)' },
};

/* The organ registers of the first Cantare: the strength of each harmonic (1 = the note itself, 2 = its octave, …).
   They speak with the pipe settings below; Your own takes the drawbars. */
export const FEET = ['8′', '4′', '2⅔′', '2′', '1⅗′', '1⅓′', '1⅐′', '1′', '8/9′', '4/5′', '8/11′', '2/3′'];
export const SOUND = { bright: 50, room: 40, atk: 120, rel: 150, chiff: 7, ens: .3, wind: 10, scoop: 5, draw: [100, 71, 55, 48, 37, 22, 12, 8, 0, 0, 0, 0] };
export const REG = {
  gedackt: [1, .03, .28, .02, .1, .01, .035],
  flute: [1, .35, .12, .05, .02],
  sine: [1],
  get custom() { return SOUND.draw.map(v => v / 100); },
};
export const drawOf = k => Array.from({ length: 12 }, (_, i) => Math.round(((REG[k] || [])[i] || 0) * 100));

/* Vowel formants (Hz, relative level) for a sung Latin vowel. */
const VOWELS = {
  a: [[800, 1], [1150, .5], [2800, .15]], e: [[420, 1], [2050, .45], [2800, .2]],
  i: [[300, 1], [2300, .35], [3000, .25]], o: [[450, 1], [800, .4], [2830, .1]], u: [[325, 1], [700, .3], [2700, .05]],
};
export const vowelOf = t => { const m = /[aeiouyáéíóúæœ]/i.exec((t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')); const c = m ? m[0].toLowerCase() : 'a'; return c === 'y' ? 'i' : c === 'æ' ? 'e' : c === 'œ' ? 'e' : c; };

/* Voice bank: Latin syllables sung by Chimera's physical vocal-tract model (MIT, Jameson Hodge), rendered offline with its CLI
   at every pitch of the bank, for a male and a female body. Each syllable is sung as two rendered halves:
   CV, its onset consonants and its vowel, held so that it can loop ("kw.i", "stɾ.a", ".a"), and
   VC, the held vowel closing into its final consonants or a diphthong's glide ("u.s", "a.ŋk", "aʊ.").
   The files are fetched as a piece needs them. */
const BANK = { map: null, buf: {}, pending: {} };
const BASE = new URL('../audio/voice/', import.meta.url).href;   /* next to this file, from any page that uses it */
export function prepare() {
  ensure();
  if (!BANK.ready) BANK.ready = fetch(BASE + 'map.json').then(r => r.json()).then(m => { BANK.map = m; }).catch(() => {});
  return BANK.ready;
}
const bodyOf = midi => (midi < 57 ? 'male' : 'female');
/* the bank's unit for a syllable half, or the nearest one it has: fewer onset consonants (from the front), fewer coda consonants (from the end) */
function cvUnit(on, v) {
  const u = BANK.map && BANK.map.cv.units; if (!u) return null;
  for (let k = 0; k <= on.length; k++) { const key = on.slice(k).join('') + '.' + v; if (u[key]) return key; }
  const plain = '.' + ({ aʊ: 'a', eɪ: 'ɛ' }[v] || v); return u[plain] ? plain : '.a';
}
function vcUnit(v, co) {
  const u = BANK.map && BANK.map.vc.units; if (!u) return null;
  if (!co.length && !u[v + '.']) return null;
  for (let k = co.length; k >= 1; k--) { const key = v + '.' + co.slice(0, k).join(''); if (u[key]) return key; }
  return u[v + '.'] ? v + '.' : null;
}
/* the halves a syllable needs: {cv, vc} (vc null for an open syllable) */
export function units(syl) {
  if (!syl) return { cv: cvUnit([], 'a'), vc: null };
  return { cv: cvUnit(syl.on, syl.v), vc: vcUnit(syl.v, syl.co) };
}
/* fetch the files of these halves for these pitches; resolves when they are in */
export async function load(list) {
  await prepare(); if (!BANK.map) return;
  const want = new Set();
  for (const { u, midi } of list) {
    if (!u) continue;
    const b = bodyOf(midi)[0];
    if (u.cv) want.add(`${b}_cv${BANK.map.cv.units[u.cv][0]}`);
    if (u.vc) want.add(`${b}_vc${BANK.map.vc.units[u.vc][0]}`);
  }
  await Promise.all([...want].map(f => {
    if (BANK.buf[f]) return null;
    if (!BANK.pending[f]) BANK.pending[f] = fetch(BASE + f + '.mp3').then(r => r.arrayBuffer()).then(a => ctx.decodeAudioData(a)).then(x => { BANK.buf[f] = x; }).catch(() => { delete BANK.pending[f]; });
    return BANK.pending[f];
  }));
}
export const loaded = (u, midi) => !!(BANK.map && u && u.cv && BANK.buf[`${bodyOf(midi)[0]}_cv${BANK.map.cv.units[u.cv][0]}`]);
/* how long before its beat a syllable's onset consonants begin */
export function leadOf(u, midi) {
  if (!BANK.map || !u || !u.cv) return 0;
  const e = BANK.map.cv.units[u.cv]; return e ? e[bodyOf(midi) === 'male' ? 1 : 2] : 0;
}
function nearest(ps, midi) { let k = 0; ps.forEach((p, i) => { if (Math.abs(p - midi) < Math.abs(ps[k] - midi)) k = i; }); return k; }

/* One sung note from the bank. tied: it continues its syllable on the vowel (no onset, no accent);
   last: the syllable ends with this note, so its coda (or glide) closes it, finishing at `close`. Returns when the coda's sound ends, or 0 for an open syllable. */
function bankNote({ midi, f0, at, end, env, sources, tied, u, last, close }) {
  const m = BANK.map; if (!m || !u || !u.cv) return false;
  const body = bodyOf(midi), ps = m[body], k = nearest(ps, midi), b = body[0];
  const cvE = m.cv.units[u.cv], buf = BANK.buf[`${b}_cv${cvE[0]}`]; if (!buf) return false;
  const fp = 440 * Math.pow(2, (ps[k] - 69) / 12), rate = f0 / fp;
  const slot = k * m.cv.slot, beat = slot + m.cv.pre;
  const lead = cvE[body === 'male' ? 1 : 2] + .02;
  const vib = src => { const v = ctx.createOscillator(); v.frequency.value = 5.2;
    const vg = ctx.createGain(); vg.gain.setValueAtTime(tied ? 14 : 0, at); vg.gain.linearRampToValueAtTime(14, at + (tied ? .01 : .5));
    v.connect(vg); vg.connect(src.detune); v.start(Math.max(ctx.currentTime, at - lead)); v.stop(end + 1); };
  /* the vowel: the attack (its onset consonants before the beat), then the held vowel looped a whole number of periods */
  const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
  const n = Math.max(1, Math.round((m.cv.loop[1] - m.cv.loop[0]) * fp));
  src.loop = true; src.loopStart = beat + m.cv.loop[0]; src.loopEnd = beat + m.cv.loop[0] + n / fp;
  const vg = ctx.createGain(); src.connect(vg); vg.connect(env); vib(src);
  let t1 = at, off = beat + m.cv.loop[0];
  if (!tied) { t1 = at - lead / rate; off = beat - lead; }
  if (t1 < ctx.currentTime) { off += (ctx.currentTime - t1) * rate; t1 = ctx.currentTime; }
  src.start(t1, off);
  /* the coda: the second half, at this note's pitch, placed so that its last consonant ends at `close`;
     the held vowel crosses into it shortly before the coda begins */
  const vcE = last && u.vc && m.vc.units[u.vc], vbuf = vcE && BANK.buf[`${b}_vc${vcE[0]}`];
  if (vbuf) {
    const tc = vcE[body === 'male' ? 1 : 3], te = vcE[body === 'male' ? 2 : 4];
    const T = close - te / rate;                          /* when the half's beat would fall */
    const sw = Math.max(at + .06, T + (tc - .07) / rate);  /* the crossing */
    const c = ctx.createBufferSource(); c.buffer = vbuf; c.playbackRate.value = rate;
    const cg = ctx.createGain(); cg.gain.setValueAtTime(0, sw - .03); cg.gain.linearRampToValueAtTime(1, sw + .03);
    c.connect(cg); cg.connect(env); vib(c);
    vg.gain.setValueAtTime(1, sw - .03); vg.gain.linearRampToValueAtTime(0, sw + .03);
    c.start(sw - .03, k * m.vc.slot + Math.max(0, (sw - .03 - T) * rate));
    const stop = T + m.vc.slot / rate;
    c.stop(stop + .05); src.stop(sw + .1);
    return stop;
  }
  src.stop(end + .3);
  return 0;
}
let ctx = null, master = null, dry = null, wet = null, shelf = null;

/* Lute: a plucked gut string (Karplus–Strong with a tuned all-pass), strung in double courses: two strings a few cents
   apart, and in the bass an octave string beside the fundamental, as on a Renaissance lute. A thumb-and-finger pluck a
   little away from the bridge; a slur (a tied note) is only a soft left-hand sound. Rendered once per pitch and kept. */
const LUTE = new Map();
function luteString(f, secs, bright, seed) {
  const sr = ctx.sampleRate, n = Math.floor(sr * secs), out = new Float32Array(n);
  const P = sr / f, N = Math.max(2, Math.floor(P - .5)), frac = P - N - .5, a = (1 - frac) / (1 + frac);
  const buf = new Float32Array(N); let r = seed;
  const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647 * 2 - 1; };
  for (let i = 0; i < N; i++) buf[i] = rnd();
  /* pluck position about a seventh of the string: a comb, then a softening for gut and flesh */
  const pp = Math.max(1, Math.round(N / 7)); const tmp = buf.slice(); for (let i = 0; i < N; i++) buf[i] = tmp[i] - .85 * tmp[(i + pp) % N];
  for (let pass = 0; pass < (bright ? 1 : 3); pass++) for (let i = 1; i < N; i++) buf[i] = .5 * (buf[i] + buf[i - 1]);
  /* the loop: an averaging filter and a loss tuned so low strings ring longer (about 3 s) than high ones */
  const t60 = Math.max(1.8, 6.5 - (Math.log2(f / 98)) * 1.3), loss = Math.pow(10, -3 / (t60 * f));
  let idx = 0, prev = 0, apx = 0, apy = 0;
  for (let i = 0; i < n; i++) {
    const x = buf[idx], nxt = buf[(idx + 1) % N];
    const lp = loss * (.5 * x + .5 * nxt) * (bright ? 1 : .998);
    const y = a * lp + apx - a * apy; apx = lp; apy = y;   /* tuning all-pass */
    buf[idx] = y; out[i] = x; idx = (idx + 1) % N; prev = y;
  }
  void prev;
  return out;
}
function luteBuffer(f0, soft) {
  const key = Math.round(f0 * 10) + (soft ? 's' : '');
  if (LUTE.has(key)) return LUTE.get(key);
  const secs = Math.min(6, Math.max(2.5, 3.6 - Math.log2(f0 / 98) * .6)), sr = ctx.sampleRate, n = Math.floor(sr * secs);
  const b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
  const c1 = luteString(f0, secs, !soft, 12345), c2 = luteString(f0 * Math.pow(2, 3 / 1200), secs, !soft, 777);
  const oct = f0 < 196 ? luteString(f0 * 2 * Math.pow(2, -2 / 1200), secs, !soft, 4242) : null;
  for (let i = 0; i < n; i++) d[i] = .5 * c1[i] + .45 * c2[i] + (oct ? .3 * oct[i] : 0);
  let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(d[i])); if (m) for (let i = 0; i < n; i++) d[i] /= m;
  LUTE.set(key, b);
  return b;
}

export function ensure() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = .8;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
  dry = ctx.createGain(); wet = ctx.createGain(); dry.gain.value = .75; wet.gain.value = roomLevel();
  const room = ctx.createConvolver(); room.buffer = impulse(ctx, 2.4);
  /* brightness: a gentle shelf over everything above 1.5 kHz */
  shelf = ctx.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 1500; shelf.gain.value = shelfDb();
  dry.connect(comp); wet.connect(room); room.connect(comp); comp.connect(shelf); shelf.connect(master); master.connect(ctx.destination);
  return ctx;
}

function impulse(c, seconds) {
  const n = Math.floor(c.sampleRate * seconds), b = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
  }
  return b;
}

export const now = () => (ctx ? ctx.currentTime : 0);
const roomLevel = () => SOUND.room / 100 * .9;
const shelfDb = () => (SOUND.bright - 50) / 50 * 9;
/* change the sound settings; the room and the brightness follow at once */
export function setSound(o) {
  Object.assign(SOUND, o);
  if (ctx) { wet.gain.setTargetAtTime(roomLevel(), ctx.currentTime, .03); shelf.gain.setTargetAtTime(shelfDb(), ctx.currentTime, .03); }
}
export const setVolume = v => { if (master) master.gain.value = v; };

/* every note of a playback passes through one gate, so that Stop silences at once
   even the notes already scheduled ahead; a new gate opens for what follows */
let gate = null;
function openGate() {
  gate = ctx.createGain(); gate.gain.value = 1; gate.connect(dry); gate.connect(wet);
  gate.click = ctx.createGain(); gate.click.connect(master);
}
export function silence() {
  if (!ctx || !gate) return;
  const g = gate, t = ctx.currentTime;
  [g.gain, g.click.gain].forEach(p => { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.linearRampToValueAtTime(0, t + .012); });
  setTimeout(() => { try { g.disconnect(); g.click.disconnect(); } catch (e) { /* gone */ } }, 120);
  openGate();
}
function out(node, gain) {
  if (!gate) openGate();
  const g = ctx.createGain(); g.gain.value = gain;
  node.connect(g); g.connect(gate);
  return g;
}


/* One note. `bars` are the organ's drawbar levels; other timbres ignore them. */
/* tied: the note continues a syllable (a ligature, a melisma), so it glides in from the note before without a new attack;
   legato: the next note is tied to this one, so this one fades into it. A note that is not tied carries a gentle accent.
   value: the note's length in minims. For the voice, the lute and the sackbut the lines are sung legato and the accent
   follows the note value: a breve or longer gets a small accent, a semibreve less, a minim very little, semiminims and
   fusae almost none. joined: the note follows another note of its line without a rest. The organ keeps its own speech. */
export const XF = .09;
const FLOW = new Set(['voice', 'lute', 'sackbut']);
/* Recorded and modelled instruments play once they have loaded; until then (and where the browser cannot run the
   models) the synthesised sound of a related instrument stands in, so that nothing is ever silent. */
const STAND_IN = { plenum: 'organ', recorder: 'flute', harpsichord: 'lute', crumhorn: 'regal', cornett: 'sackbut' };
export function warm(t) { return I.warm(ensure(), t); }
export function note(args) {
  ensure();
  const r = instrumentNote(args);
  if (r) return r;
  const t = args.timbre || 'organ';
  if (I.bankOf(t) || I.isModel(t)) I.warm(ctx, t);
  return synthNote(STAND_IN[t] ? { ...args, timbre: STAND_IN[t] } : args);
}

function instrumentNote({ timbre = 'organ', midi, a4 = 440, at, dur, level = .22, tied = false, legato = false, value = null }) {
  const b = I.bankOf(timbre);
  if (b) {
    const st = I.bank(b);
    if (!st || !st.map) return null;
    const n = I.nearest(st, midi);
    return n ? sampleNote(st, n, b, { timbre, midi, a4, at, dur, level, tied, legato, value }) : null;
  }
  if (I.isModel(timbre) && I.modelsReady()) return modelNote({ timbre, midi, a4, at, dur, level, tied, legato });
  return null;
}

function sampleNote(st, n, b, { timbre, midi, a4, at, dur, level, tied, legato, value }) {
  const buf = st.bufs[n.m], sr = buf.sampleRate, plucked = !st.map.loop;
  if (tied && !plucked) { at -= XF / 2; dur += XF / 2; }
  if (legato && !plucked) dur += XF / 2;
  const end = at + dur;
  const src = ctx.createBufferSource(); src.buffer = buf;
  src.playbackRate.value = hz(midi, a4) / n.hz;
  let offset = 0;
  if (!plucked) {
    const L = st.loops[n.m];
    src.loop = true; src.loopStart = L[0] / sr; src.loopEnd = L[1] / sr;
    if (tied) offset = Math.min(.3, L[0] / sr);          /* a continuing syllable: no new attack */
  }
  const env = ctx.createGain(), g = env.gain;
  const flow = (timbre === 'sackbut' || timbre === 'recorder') && value != null;
  const acc = flow ? .15 * Math.min(1, value / 4) : 0;
  const rel = plucked ? .1 : timbre === 'organ' || timbre === 'plenum' ? .09 : .12;
  const fall0 = legato && !plucked ? end - XF : end, fall1 = legato && !plucked ? end : end + rel;
  g.setValueAtTime(0, at);
  if (tied && !plucked) g.linearRampToValueAtTime(1, at + XF);
  else { g.linearRampToValueAtTime(1 + acc, at + .006); if (acc) g.linearRampToValueAtTime(1, Math.min(at + .2, Math.max(at + .01, fall0 - .01))); }
  g.setValueAtTime(1, Math.max(at + .012, fall0));
  g.linearRampToValueAtTime(0, Math.max(at + .02, fall1));
  src.connect(env);
  src.start(at, offset);
  src.stop(Math.max(at + .03, fall1) + .05);
  return out(env, level * I.GAIN[b]);
}

const BREATH = { chalumeau: .8, crumhorn: .82, cornett: .85, regal: .8 };
const SPEAK = { chalumeau: .05, crumhorn: .03, cornett: .04, regal: .012 };
function modelNote({ timbre, midi, a4, at, dur, level, tied, legato }) {
  if (tied) { at -= XF / 2; dur += XF / 2; }
  if (legato) dur += XF / 2;
  const end = at + dur, rel = timbre === 'regal' ? .05 : .08, stop = legato ? end + .02 : end + rel;
  let node;
  try {
    node = new AudioWorkletNode(ctx, 'pm', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [1],
      processorOptions: { type: timbre, f0: hz(midi, a4), end: stop + .15, seed: (Math.random() * 1e6) | 0 } });
  } catch (e) { return null; }
  const b = node.parameters.get('breath'), P = BREATH[timbre], atk = tied ? XF : SPEAK[timbre];
  b.setValueAtTime(0, at);
  b.linearRampToValueAtTime(P * (tied ? 1 : 1.08), at + atk);
  b.linearRampToValueAtTime(P, at + atk + .12);
  b.setValueAtTime(P, Math.max(at + atk + .13, legato ? end - XF : end));
  b.linearRampToValueAtTime(0, Math.max(at + atk + .15, stop));
  const env = ctx.createGain(); env.gain.value = 1; node.connect(env);
  return out(env, level * I.GAIN.model);
}

function synthNote({ timbre = 'organ', midi, a4 = 440, at, dur, level = .22, text, tied = false, legato = false, value = null, joined = false, u = null, last = true, close = null }) {
  ensure();
  const f0 = hz(midi, a4), vowel = vowelOf(text);
  if (timbre === 'voice' && BANK.map) {
    const unit = u || units(word([text || 'a'])[0]);
    /* the accent follows the note value (as for the other flowing sounds); a quick note inside a line on a syllable
       without onset consonants glides in from the note before */
    const acc = value != null ? .15 * Math.min(1, value / 4) : .3, glide = tied || (joined && value != null && value < 2 && unit.cv && unit.cv[0] === '.');
    if (loaded(unit, midi)) return sungNote({ midi, f0, at, dur, level, tied: glide, legato, u: unit, last, close, acc });
    if (!u) load([{ u: unit, midi }]);
  }
  if (tied) { at -= XF / 2; dur += XF / 2; }
  if (legato) dur += XF / 2;
  const end = at + dur;
  const flow = FLOW.has(timbre) && value != null;
  const acc = flow ? .15 * Math.min(1, value / 4) : .3;      /* breve .15 · semibreve .075 · minim .04 · semiminim .02 */
  const nz = flow ? Math.min(1, acc / .15) : 1;               /* consonant and tongue noise scale with the accent */
  const soft = flow && joined && value < 2;                   /* a quick note inside a line: no new onset */
  const env = ctx.createGain();
  const reg = REG[timbre];
  const atk = reg ? Math.max(.005, SOUND.atk / 1000) : timbre === 'organ' ? .045 : timbre === 'voice' ? .1 : timbre === 'sackbut' ? .08 : .055, rel = reg ? Math.max(.01, SOUND.rel / 1000) : timbre === 'organ' ? .09 : .15;
  /* every point of the envelope later than the one before, also for very short notes */
  const fall0 = legato ? end - XF : end - rel, fall1 = legato ? end : end + rel * .5;
  const rise = Math.min(tied ? at + XF : at + atk, fall0 - .005);
  env.gain.setValueAtTime(0, at);
  if (tied) env.gain.linearRampToValueAtTime(1, Math.max(at + .005, rise));
  else {
    env.gain.linearRampToValueAtTime(1 + acc, Math.max(at + .005, rise));
    const settle = Math.min(rise + .18, fall0 - .002);
    if (settle > rise) env.gain.linearRampToValueAtTime(1, settle);
  }
  env.gain.setValueAtTime(1, Math.max(at + .01, fall0));
  env.gain.linearRampToValueAtTime(0, Math.max(at + .02, fall1));
  const stop = legato ? end + .02 : end + rel;
  const sources = [];
  const sink = out(env, timbre === 'voice' ? level * 2.6 : timbre === 'lute' ? level * 1.9 : level);

  const noise = (dur, hp, q, g0) => {
    if (tied) return; g0 *= nz; if (g0 < .002) return;
    const nb = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = nb;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = hp; bp.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(g0, at); g.gain.exponentialRampToValueAtTime(.0005, at + dur);
    src.connect(bp); bp.connect(g); g.connect(env); src.start(at); src.stop(at + dur);
  };
  const wave = amps => { const re = new Float32Array(amps.length + 1), im = new Float32Array(amps.length + 1); amps.forEach((v, i) => { im[i + 1] = v; }); return ctx.createPeriodicWave(re, im); };
  const vibrato = (o, rate, depth, delay) => {
    const v = ctx.createOscillator(); v.frequency.value = rate;
    const vg = ctx.createGain(); vg.gain.setValueAtTime(tied ? f0 * depth : 0, at); vg.gain.linearRampToValueAtTime(f0 * depth, at + (tied ? .01 : delay + .25));
    v.connect(vg); vg.connect(o.frequency); sources.push(v);
  };

  if (timbre === 'organ') {
    /* Principal 8′: a flue pipe, a clear singing tone with a soft chiff on the speech. Two slightly detuned pipes breathe. */
    const w = wave([1, .62, .34, .26, .1, .12, .05, .06, .02, .03]);
    [-1.5, 1.5].forEach(c => { const o = ctx.createOscillator(); o.setPeriodicWave(w); o.frequency.value = f0; o.detune.value = c;
      const g = ctx.createGain(); g.gain.value = .5; o.connect(g); g.connect(env); sources.push(o); });
    noise(.07, Math.min(f0 * 4, 5000), 1.2, .09);
  } else if (timbre === 'regal') {
    /* Regal: a beating reed on a tiny resonator, nasal and buzzing, all harmonics. */
    const amps = Array.from({ length: 24 }, (_, i) => 1 / Math.pow(i + 1, .85) * (i % 2 ? 1 : .9));
    const o = ctx.createOscillator(); o.setPeriodicWave(wave(amps)); o.frequency.value = f0;
    const bp = ctx.createBiquadFilter(); bp.type = 'peaking'; bp.frequency.value = Math.max(1400, f0 * 6); bp.Q.value = 3; bp.gain.value = 9;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
    o.connect(bp); bp.connect(lp); lp.connect(env); sources.push(o);
    noise(.05, 2500, .8, .05);
  } else if (timbre === 'sackbut') {
    /* Sackbut: a soft, round brass tone that opens as the lips settle. */
    const amps = Array.from({ length: 16 }, (_, i) => Math.pow(.78, i));
    const o = ctx.createOscillator(); o.setPeriodicWave(wave(amps)); o.frequency.setValueAtTime(tied || soft ? f0 : f0 * (1 - .1 * acc), at); o.frequency.linearRampToValueAtTime(f0, at + .07);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.4;
    lp.frequency.setValueAtTime(tied || soft ? Math.min(f0 * 6, 2600) : Math.min(f0 * 6, 2600) * (flow ? 1 - acc * 4 : .37), at); lp.frequency.linearRampToValueAtTime(Math.min(f0 * 6, 2600), at + .16);
    o.connect(lp); lp.connect(env); sources.push(o); vibrato(o, 4.6, .0025, .3);
    noise(.05, Math.min(f0 * 3, 3000), 1.5, .04);
  } else if (timbre === 'chalumeau') {
    /* Chalumeau: single reed on a cylindrical bore, so odd harmonics only, hollow below and bright above. */
    const amps = [1, 0, .42, 0, .22, 0, .12, 0, .06, 0, .03];
    const o = ctx.createOscillator(); o.setPeriodicWave(wave(amps)); o.frequency.value = f0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.max(1600, f0 * 8);
    o.connect(lp); lp.connect(env); sources.push(o); vibrato(o, 4.2, .0015, .5);
    noise(.06, Math.min(f0 * 5, 5000), .8, .05);
  } else if (reg) {
    /* a pipe of the chosen register: its harmonics, tilted by the brightness; two pipes a little apart (ensemble),
       a chiff of wind on the speech, a breath of wind under the tone, and a small scoop up to the pitch */
    const tilt = reg.map((a, i) => a * Math.pow(2, (SOUND.bright / 100 - .5) * i * .55)).map((a, i) => (f0 * (i + 1) < 12000 ? a : 0));
    const max = Math.max(...tilt, 1e-6), w = wave(tilt.map(a => a / max));
    const spread = SOUND.ens, pair = spread > 0 ? [-spread / 2, spread / 2] : [0];
    pair.forEach(c => {
      const o = ctx.createOscillator(); o.setPeriodicWave(w); o.detune.value = c;
      const sc = SOUND.scoop;
      o.frequency.setValueAtTime(tied ? f0 : f0 * Math.pow(2, -sc / 1200), at); o.frequency.linearRampToValueAtTime(f0, at + Math.min(.12, atk + .03));
      const g = ctx.createGain(); g.gain.value = 1 / pair.length; o.connect(g); g.connect(env); sources.push(o);
    });
    if (SOUND.chiff > 0) noise(.06 + SOUND.chiff / 2000, Math.min(f0 * 4, 5000), 1.2, SOUND.chiff / 100 * .5);
    if (SOUND.wind > 0) {
      const nb = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * Math.min(dur + .3, 12)), ctx.sampleRate), d = nb.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = nb;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(f0 * 2, 4000); bp.Q.value = 2;
      const g = ctx.createGain(); g.gain.value = SOUND.wind / 100 * .04;
      src.connect(bp); bp.connect(g); g.connect(env); src.start(at); src.stop(stop + .05);
    }
  } else if (timbre === 'lute') {
    /* the string rings and dies away by itself; the hand damps it when the note ends. A tied note is a slur, softer. */
    const src = ctx.createBufferSource(); src.buffer = luteBuffer(f0, tied || (flow && value <= .5));
    const body1 = ctx.createBiquadFilter(); body1.type = 'peaking'; body1.frequency.value = 115; body1.Q.value = 1.2; body1.gain.value = 5;
    const body2 = ctx.createBiquadFilter(); body2.type = 'peaking'; body2.frequency.value = 270; body2.Q.value = 1.4; body2.gain.value = 3.5;
    const rose = ctx.createBiquadFilter(); rose.type = 'peaking'; rose.frequency.value = 2600; rose.Q.value = 1; rose.gain.value = -3;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    src.connect(body1); body1.connect(body2); body2.connect(rose); rose.connect(lp); lp.connect(env);
    const t1 = at + (tied ? XF / 2 : 0), lvl = tied ? .55 : flow ? .8 + acc * 1.35 : 1;
    env.gain.cancelScheduledValues(at); env.gain.setValueAtTime(0, at); env.gain.linearRampToValueAtTime(lvl, t1 + .004);
    const damp = Math.max(t1 + .03, end);
    env.gain.setValueAtTime(lvl, damp); env.gain.linearRampToValueAtTime(0, damp + .12);
    src.start(t1); src.stop(Math.min(damp + .15, t1 + src.buffer.duration)); src.own = true; sources.push(src);
  } else {
    /* Voice (until the bank has loaded): a glottal buzz shaped by the formants of the syllable's vowel, with a gentle vibrato. */
    const o = ctx.createOscillator(); o.setPeriodicWave(wave(Array.from({ length: 30 }, (_, i) => 1 / (i + 1))));
    o.frequency.value = f0; vibrato(o, 5.3, .005, .2);
    const f = VOWELS[vowel] || VOWELS.a, tone = f0 > 330 ? 1.3 : 1;
    f.forEach(([fr, q]) => {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(fr * tone, 4000); bp.Q.value = 6;
      const g = ctx.createGain(); g.gain.value = q * 2; o.connect(bp); bp.connect(g); g.connect(env);
    });
    sources.push(o);
  }
  sources.forEach(s => { if (s.own) return; if (!s.buffer) s.start(at); s.stop(stop + .05); });
  return sink;
}

/* a note sung from the bank: the attack's consonants come before the beat; only a syllable's first note carries an accent */
function sungNote({ midi, f0, at, dur, level, tied, legato, u, last, close, acc }) {
  if (tied) { at -= XF / 2; dur += XF / 2; }
  if (legato) dur += XF / 2;
  const end = at + dur, env = ctx.createGain(), g = env.gain;
  const lead = leadOf(u, midi) + .02;
  if (tied) { g.setValueAtTime(0, at); g.linearRampToValueAtTime(1, at + XF); }
  else {
    g.setValueAtTime(1, Math.max(ctx.currentTime, at - lead));
    g.setValueAtTime(1, at); g.linearRampToValueAtTime(1 + acc, at + .08); g.linearRampToValueAtTime(1, Math.min(at + .26, Math.max(at + .09, end - .01)));
  }
  const stop = bankNote({ midi, f0, at, end, env, tied, u, last, close: close == null ? end : Math.max(at + .1, close) });
  if (stop) { g.setValueAtTime(1, stop - .03); g.linearRampToValueAtTime(0, stop); }
  else if (legato) {
    /* flowing into the next syllable: the vowel gives way where that syllable's onset consonants begin */
    const f = close == null ? end : Math.min(end, Math.max(at + .1, close + .02));
    g.setValueAtTime(1, Math.max(at + .01, f - XF)); g.linearRampToValueAtTime(0, Math.max(at + .02, f));
  }
  else { g.setValueAtTime(1, Math.max(at + .01, end - .12)); g.linearRampToValueAtTime(0, Math.max(at + .02, end + .06)); }
  return out(env, level * 2.6);
}

/* ---------- a held voice, for live playing (the Guidonian hand) ----------
   An open-ended sung note: it starts on a syllable with its onset consonants, holds the vowel as long as the hand
   holds the place, glides when the hand moves to another note on the same syllable (a melisma), closes the syllable
   with its coda and sings the next one with its onset when the text moves on, and ends with the coda when released.
   Returns null until the voice bank's map has loaded; say() and sing() return false when a syllable's files are
   not in yet (load() them first). */
export function hold({ a4 = 440, level = .2 } = {}) {
  ensure();
  if (!BANK.map) { prepare(); return null; }
  const m = BANK.map;
  const env = ctx.createGain(); env.gain.value = 1;
  const sink = out(env, level * 2.6);
  let cur = null, dead = false;
  const fpOf = (body, k) => 440 * Math.pow(2, (m[body][k] - 69) / 12);
  function vowelSrc(u, midi, t, onset) {
    const body = bodyOf(midi), k = nearest(m[body], midi), b = body[0];
    const cvE = m.cv.units[u.cv], buf = cvE && BANK.buf[`${b}_cv${cvE[0]}`]; if (!buf) return null;
    const fp = fpOf(body, k), f0 = hz(midi, a4), rate = f0 / fp;
    const beat = k * m.cv.slot + m.cv.pre, n = Math.max(1, Math.round((m.cv.loop[1] - m.cv.loop[0]) * fp));
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
    src.loop = true; src.loopStart = beat + m.cv.loop[0]; src.loopEnd = beat + m.cv.loop[0] + n / fp;
    const g = ctx.createGain(); g.gain.setValueAtTime(onset ? 1 : 0, t); if (!onset) g.gain.linearRampToValueAtTime(1, t + .06);
    const v = ctx.createOscillator(); v.frequency.value = 5.2;
    const vg = ctx.createGain(); vg.gain.setValueAtTime(onset ? 0 : 14, t); vg.gain.linearRampToValueAtTime(14, t + (onset ? .5 : .02));
    v.connect(vg); vg.connect(src.detune); src.connect(g); g.connect(env);
    /* played live, the onset consonant is shortened so the new pitch arrives at once */
    const lead = onset ? Math.min(cvE[body === 'male' ? 1 : 2], .05) + .01 : 0;
    src.start(t, onset ? beat - lead : beat + m.cv.loop[0]); v.start(t);
    return { src, g, v, u, midi, body, k, rate, fp };
  }
  function fade(x, t, d = .06) {
    if (!x) return;
    x.g.gain.cancelScheduledValues(t); x.g.gain.setValueAtTime(x.g.gain.value, t); x.g.gain.linearRampToValueAtTime(0, t + d);
    try { x.src.stop(t + d + .05); x.v.stop(t + d + .05); } catch (e) { /* stopped */ }
  }
  /* the end of the syllable being held: its coda at the held pitch; returns how long it takes (0 for an open syllable) */
  function coda(x, t, max = Infinity) {
    const vcE = x && x.u.vc && m.vc.units[x.u.vc], vbuf = vcE && BANK.buf[`${x.body[0]}_vc${vcE[0]}`];
    if (!vbuf) { fade(x, t); return 0; }
    const tc = vcE[x.body === 'male' ? 1 : 3], te = vcE[x.body === 'male' ? 2 : 4];
    const c = ctx.createBufferSource(); c.buffer = vbuf; c.playbackRate.value = x.src.playbackRate.value;
    const cg = ctx.createGain(); cg.gain.setValueAtTime(0, t); cg.gain.linearRampToValueAtTime(1, t + .05);
    c.connect(cg); cg.connect(env);
    const from = x.k * m.vc.slot + Math.max(0, tc - .09), len = Math.min(max, (te - Math.max(0, tc - .09)) / c.playbackRate.value);
    if (len < max) { c.start(t, from); c.stop(t + len + .04); }
    else { c.start(t, from); cg.gain.setValueAtTime(1, t + len * .6); cg.gain.linearRampToValueAtTime(0, t + len); c.stop(t + len + .02); }   /* only touched */
    fade(x, t, .05);
    return len;
  }
  return {
    get alive() { return !dead; },
    get midi() { return cur && cur.midi; },
    /* begin (or begin again) a syllable on a pitch, with its onset consonants */
    sing(u, midi) {
      if (dead) return false;
      const t = ctx.currentTime + .005, x = vowelSrc(u, midi, t, true); if (!x) return false;
      if (cur) fade(cur, t, .04);
      cur = x; return true;
    },
    /* move to another pitch on the same vowel: a glide within the bank's pitch, otherwise a new pitch slot faded in */
    glide(midi) {
      if (dead || !cur || midi === cur.midi) return true;
      const t = ctx.currentTime, body = bodyOf(midi);
      if (body === cur.body && Math.abs(m[body][cur.k] - midi) <= 2) {
        const r = hz(midi, a4) / cur.fp;
        cur.src.playbackRate.cancelScheduledValues(t); cur.src.playbackRate.setValueAtTime(cur.src.playbackRate.value, t);
        cur.src.playbackRate.exponentialRampToValueAtTime(r, t + .025); cur.midi = midi; return true;
      }
      const x = vowelSrc(cur.u, midi, t, false); if (!x) return false;
      fade(cur, t, .06); cur = x; return true;
    },
    /* the text moves on: close the syllable held now and sing the next one on this pitch */
    say(u, midi) {
      if (dead) return false;
      midi = midi == null ? cur && cur.midi : midi; if (midi == null) return false;
      /* the end of the old syllable is only touched (60 ms), overlapping the new one, so the new pitch is not late */
      const t = ctx.currentTime + .005, d = cur ? coda(cur, t, .06) : 0;
      const x = vowelSrc(u, midi, t + Math.min(d, .03), true); if (!x) { cur = null; return false; }
      cur = x; return true;
    },
    /* let go: the syllable ends with its coda, then silence */
    release() {
      if (dead) return; dead = true;
      const t = ctx.currentTime, d = cur ? coda(cur, t) : 0;
      setTimeout(() => { try { sink.disconnect(); } catch (e) { /* gone */ } }, (d + .4) * 1000);
      cur = null;
    },
  };
}
export const bankReady = () => !!BANK.map;

export function click(at, strong) {
  ensure();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = strong ? 1500 : 1000; o.type = 'square';
  g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(strong ? .18 : .1, at + .002); g.gain.exponentialRampToValueAtTime(.0001, at + .05);
  if (!gate) openGate();
  o.connect(g); g.connect(gate.click); o.start(at); o.stop(at + .08);
}

export function pitchOf(n, bflat, shift) { return midiOf(n, bflat, shift); }
