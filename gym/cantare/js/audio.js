/* Sound: a small additive/subtractive synthesiser with a church-like room. */
import { midiOf, hz } from './music.js';

export const TIMBRES = {
  organ: { label: 'Organ, Principal 8′' },
  regal: { label: 'Regal' },
  chalumeau: { label: 'Chalumeau' },
  sackbut: { label: 'Sackbut' },
  voice: { label: 'Voice' },
};

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
function bankNote(midi, f0, vowel, at, env, sources) {
  const m = BANK.map; if (!m) return false;
  const body = midi < 57 ? 'male' : 'female', buf = BANK.buf[body + vowel]; if (!buf) return false;
  const ps = m[body]; let k = 0; ps.forEach((p, i) => { if (Math.abs(p - midi) < Math.abs(ps[k] - midi)) k = i; });
  const fp = 440 * Math.pow(2, (ps[k] - 69) / 12), slot = k * m.slot;
  const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = f0 / fp;
  const n = Math.max(1, Math.round((m.loop[1] - m.loop[0]) * fp));
  src.loop = true; src.loopStart = slot + m.loop[0]; src.loopEnd = slot + m.loop[0] + n / fp;
  const v = ctx.createOscillator(); v.frequency.value = 5.2;
  const vg = ctx.createGain(); vg.gain.setValueAtTime(0, at); vg.gain.linearRampToValueAtTime(14, at + .5);
  v.connect(vg); vg.connect(src.detune); sources.push(v);
  src.connect(env); src.start(at, slot + m.lead - .03); sources.push(src);
  return true;
}

let ctx = null, master = null, dry = null, wet = null;

export function ensure() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = .8;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
  dry = ctx.createGain(); wet = ctx.createGain(); dry.gain.value = .75; wet.gain.value = .35;
  const room = ctx.createConvolver(); room.buffer = impulse(ctx, 2.4);
  dry.connect(comp); wet.connect(room); room.connect(comp); comp.connect(master); master.connect(ctx.destination);
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
export const setVolume = v => { if (master) master.gain.value = v; };

function out(node, gain) {
  const g = ctx.createGain(); g.gain.value = gain;
  node.connect(g); g.connect(dry); g.connect(wet);
  return g;
}


/* One note. `bars` are the organ's drawbar levels; other timbres ignore them. */
export function note({ timbre = 'organ', midi, a4 = 440, at, dur, level = .22, text }) {
  ensure();
  const f0 = hz(midi, a4), end = at + dur, vowel = vowelOf(text);
  const env = ctx.createGain();
  const atk = timbre === 'organ' ? .045 : timbre === 'voice' ? .1 : timbre === 'sackbut' ? .08 : .055, rel = timbre === 'organ' ? .09 : .15;
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(1, at + atk);
  env.gain.setValueAtTime(1, Math.max(at + atk, end - rel));
  env.gain.linearRampToValueAtTime(0, end + rel * .5);
  const stop = end + rel;
  const sources = [];
  const sink = out(env, timbre === 'voice' ? level * 2.6 : level);

  const noise = (dur, hp, q, g0) => {
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
    const vg = ctx.createGain(); vg.gain.setValueAtTime(0, at); vg.gain.linearRampToValueAtTime(f0 * depth, at + delay + .25);
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
    const o = ctx.createOscillator(); o.setPeriodicWave(wave(amps)); o.frequency.setValueAtTime(f0 * .985, at); o.frequency.linearRampToValueAtTime(f0, at + .07);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.4;
    lp.frequency.setValueAtTime(f0 * 2.2, at); lp.frequency.linearRampToValueAtTime(Math.min(f0 * 6, 2600), at + .16);
    o.connect(lp); lp.connect(env); sources.push(o); vibrato(o, 4.6, .0025, .3);
    noise(.05, Math.min(f0 * 3, 3000), 1.5, .04);
  } else if (timbre === 'chalumeau') {
    /* Chalumeau: single reed on a cylindrical bore, so odd harmonics only, hollow below and bright above. */
    const amps = [1, 0, .42, 0, .22, 0, .12, 0, .06, 0, .03];
    const o = ctx.createOscillator(); o.setPeriodicWave(wave(amps)); o.frequency.value = f0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.max(1600, f0 * 8);
    o.connect(lp); lp.connect(env); sources.push(o); vibrato(o, 4.2, .0015, .5);
    noise(.06, Math.min(f0 * 5, 5000), .8, .05);
  } else if (bankNote(midi, f0, vowel, at, env, sources)) {
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
  sources.forEach(s => { if (!s.buffer) s.start(at); s.stop(stop + .05); });
  return sink;
}

export function click(at, strong) {
  ensure();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = strong ? 1500 : 1000; o.type = 'square';
  g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(strong ? .18 : .1, at + .002); g.gain.exponentialRampToValueAtTime(.0001, at + .05);
  o.connect(g); g.connect(master); o.start(at); o.stop(at + .08);
}

export function pitchOf(n, bflat, shift) { return midiOf(n, bflat, shift); }
