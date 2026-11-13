/* Sound: a small additive/subtractive synthesiser with a church-like room. */
import { midiOf, hz } from './music.js';

export const TIMBRES = {
  voice: { label: 'Voice (sung by Chimera)' },
  sackbut: { label: 'Sackbut' },
  lute: { label: 'Lute' },
  organ: { label: 'Organ, Principal 8′' },
  regal: { label: 'Regal' },
  chalumeau: { label: 'Chalumeau' },
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

/* Voice bank: vowels sung by Chimera's physical vocal-tract model (MIT, Jameson Hodge), rendered offline, one file per body and vowel. */
const BANK = { map: null, buf: {}, pending: {} };
export function prepare(base = 'audio/voice/') {
  ensure();
  const get = async (k, f, b) => { if (BANK.buf[k] || BANK.pending[k]) return; BANK.pending[k] = 1;
    try { BANK.buf[k] = await ctx.decodeAudioData(await (await fetch(base + f)).arrayBuffer()); } catch (e) { /* the formant voice stands in */ } };
  return (async () => {
    if (!BANK.map) { try { BANK.map = await (await fetch(base + 'map.json')).json(); } catch (e) { return; } }
    await Promise.all(['male', 'female'].flatMap(b => 'aeiou'.split('').map(v => get(b + v, `${b}_${v}.mp3`))));
  })();
}
function bankNote(midi, f0, vowel, at, env, sources, tied) {
  const m = BANK.map; if (!m) return false;
  const body = midi < 57 ? 'male' : 'female', buf = BANK.buf[body + vowel]; if (!buf) return false;
  const ps = m[body]; let k = 0; ps.forEach((p, i) => { if (Math.abs(p - midi) < Math.abs(ps[k] - midi)) k = i; });
  const fp = 440 * Math.pow(2, (ps[k] - 69) / 12), slot = k * m.slot;
  const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = f0 / fp;
  const n = Math.max(1, Math.round((m.loop[1] - m.loop[0]) * fp));
  src.loop = true; src.loopStart = slot + m.loop[0]; src.loopEnd = slot + m.loop[0] + n / fp;
  const v = ctx.createOscillator(); v.frequency.value = 5.2;
  const vg = ctx.createGain(); vg.gain.setValueAtTime(tied ? 14 : 0, at); vg.gain.linearRampToValueAtTime(14, at + (tied ? .01 : .5));
  v.connect(vg); vg.connect(src.detune); sources.push(v);
  /* a note tied into a ligature starts inside the sustained vowel, with no new onset */
  src.connect(env); src.start(at, tied ? slot + m.loop[0] : slot + m.lead - .03); sources.push(src);
  return true;
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
   legato: the next note is tied to this one, so this one fades into it. A note that is not tied carries a gentle accent. */
export const XF = .09;
export function note({ timbre = 'organ', midi, a4 = 440, at, dur, level = .22, text, tied = false, legato = false }) {
  ensure();
  const f0 = hz(midi, a4), vowel = vowelOf(text);
  if (tied) { at -= XF / 2; dur += XF / 2; }
  if (legato) dur += XF / 2;
  const end = at + dur;
  const env = ctx.createGain();
  const reg = REG[timbre];
  const atk = reg ? Math.max(.005, SOUND.atk / 1000) : timbre === 'organ' ? .045 : timbre === 'voice' ? .1 : timbre === 'sackbut' ? .08 : .055, rel = reg ? Math.max(.01, SOUND.rel / 1000) : timbre === 'organ' ? .09 : .15;
  /* every point of the envelope later than the one before, also for very short notes */
  const fall0 = legato ? end - XF : end - rel, fall1 = legato ? end : end + rel * .5;
  const rise = Math.min(tied ? at + XF : at + atk, fall0 - .005);
  env.gain.setValueAtTime(0, at);
  if (tied) env.gain.linearRampToValueAtTime(1, Math.max(at + .005, rise));
  else {
    env.gain.linearRampToValueAtTime(1.3, Math.max(at + .005, rise));
    const settle = Math.min(rise + .18, fall0 - .002);
    if (settle > rise) env.gain.linearRampToValueAtTime(1, settle);
  }
  env.gain.setValueAtTime(1, Math.max(at + .01, fall0));
  env.gain.linearRampToValueAtTime(0, Math.max(at + .02, fall1));
  const stop = legato ? end + .02 : end + rel;
  const sources = [];
  const sink = out(env, timbre === 'voice' ? level * 2.6 : timbre === 'lute' ? level * 1.9 : level);

  const noise = (dur, hp, q, g0) => {
    if (tied) return;
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
    const o = ctx.createOscillator(); o.setPeriodicWave(wave(amps)); o.frequency.setValueAtTime(tied ? f0 : f0 * .985, at); o.frequency.linearRampToValueAtTime(f0, at + .07);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.4;
    lp.frequency.setValueAtTime(tied ? Math.min(f0 * 6, 2600) : f0 * 2.2, at); lp.frequency.linearRampToValueAtTime(Math.min(f0 * 6, 2600), at + .16);
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
    const src = ctx.createBufferSource(); src.buffer = luteBuffer(f0, tied);
    const body1 = ctx.createBiquadFilter(); body1.type = 'peaking'; body1.frequency.value = 115; body1.Q.value = 1.2; body1.gain.value = 5;
    const body2 = ctx.createBiquadFilter(); body2.type = 'peaking'; body2.frequency.value = 270; body2.Q.value = 1.4; body2.gain.value = 3.5;
    const rose = ctx.createBiquadFilter(); rose.type = 'peaking'; rose.frequency.value = 2600; rose.Q.value = 1; rose.gain.value = -3;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    src.connect(body1); body1.connect(body2); body2.connect(rose); rose.connect(lp); lp.connect(env);
    const t1 = at + (tied ? XF / 2 : 0), lvl = tied ? .55 : 1;
    env.gain.cancelScheduledValues(at); env.gain.setValueAtTime(0, at); env.gain.linearRampToValueAtTime(lvl, t1 + .004);
    const damp = Math.max(t1 + .03, end);
    env.gain.setValueAtTime(lvl, damp); env.gain.linearRampToValueAtTime(0, damp + .12);
    src.start(t1); src.stop(Math.min(damp + .15, t1 + src.buffer.duration)); src.own = true; sources.push(src);
  } else if (bankNote(midi, f0, vowel, at, env, sources, tied)) {
    /* sung by Chimera */
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

export function click(at, strong) {
  ensure();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = strong ? 1500 : 1000; o.type = 'square';
  g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(strong ? .18 : .1, at + .002); g.gain.exponentialRampToValueAtTime(.0001, at + .05);
  if (!gate) openGate();
  o.connect(g); g.connect(gate.click); o.start(at); o.stop(at + .08);
}

export function pitchOf(n, bflat, shift) { return midiOf(n, bflat, shift); }
