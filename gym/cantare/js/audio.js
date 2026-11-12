/* Sound: a small additive/subtractive synthesiser with a church-like room. */
import { midiOf, hz } from './music.js';

export const TIMBRES = {
  organ: { label: 'Organ' },
  sackbut: { label: 'Sackbut' },
  chalumeau: { label: 'Chalumeau' },
  voice: { label: 'Voice' },
};

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

const ORGAN_DRAWBARS = { 1: 1, 2: .55, 3: .3, 4: .22, 6: .12, 8: .08 };

/* One note. `bars` are the organ's drawbar levels; other timbres ignore them. */
export function note({ timbre = 'organ', midi, a4 = 440, at, dur, level = .22, bars = ORGAN_DRAWBARS }) {
  ensure();
  const f0 = hz(midi, a4), end = at + dur;
  const env = ctx.createGain();
  const atk = timbre === 'organ' ? .035 : timbre === 'voice' ? .09 : .06, rel = timbre === 'organ' ? .09 : .15;
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(1, at + atk);
  env.gain.setValueAtTime(1, Math.max(at + atk, end - rel));
  env.gain.linearRampToValueAtTime(0, end + rel * .5);
  const stop = end + rel;
  const sources = [];
  const sink = out(env, level);

  if (timbre === 'organ') {
    for (const [h, a] of Object.entries(bars)) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f0 * +h;
      const g = ctx.createGain(); g.gain.value = a * .5; o.connect(g); g.connect(env); sources.push(o);
    }
  } else if (timbre === 'sackbut') {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
    lp.frequency.setValueAtTime(f0 * 2, at); lp.frequency.linearRampToValueAtTime(Math.min(f0 * 7, 3200), at + .12);
    o.connect(lp); lp.connect(env); sources.push(o);
  } else if (timbre === 'chalumeau') {
    for (let h = 1; h <= 9; h += 2) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f0 * h;
      const g = ctx.createGain(); g.gain.value = .6 / h; o.connect(g); g.connect(env); sources.push(o);
    }
    const even = ctx.createOscillator(); even.type = 'sine'; even.frequency.value = f0 * 2;
    const eg = ctx.createGain(); eg.gain.value = .05; even.connect(eg); eg.connect(env); sources.push(even);
  } else {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0;
    const vib = ctx.createOscillator(); vib.frequency.value = 5.2;
    const vg = ctx.createGain(); vg.gain.value = f0 * .004; vib.connect(vg); vg.connect(o.frequency); sources.push(vib);
    [[650, 1.0], [1080, .6], [2600, .25]].forEach(([fr, q]) => {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = 5;
      const g = ctx.createGain(); g.gain.value = q; o.connect(bp); bp.connect(g); g.connect(env);
    });
    sources.push(o);
  }
  sources.forEach(s => { s.start(at); s.stop(stop + .05); });
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
