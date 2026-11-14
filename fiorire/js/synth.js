/* Fiorire: a small synthesiser. Organ (sustained) or lute-like (plucked); pitch a' = 440, 415 or 466. */
import { midiOf } from '../../gym/cantare/js/music.js';
let ctx = null, master = null, stopAt = 0, timers = [];
const ensure = () => { if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination); } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
export function stop() { if (!master) return; const m = master; master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination); m.gain.cancelScheduledValues(0); m.gain.setTargetAtTime(0, ctx.currentTime, .03); timers.forEach(clearTimeout); timers = []; }
export function play(exps, state, { from = 0, until = Infinity, minim = .5, timbre = 'organ', a4 = 440, mute = [] , onEnd } = {}) {
  const c = ensure(); stop(); const t0 = c.currentTime + .08; let last = 0;
  exps.forEach((ex, vi) => {
    if (mute[vi]) return;
    ex.forEach(n => {
      if (n.rest || n.t < from - 1e-9 || n.t >= until) return;
      const f = a4 * Math.pow(2, (midiOf(n, state.bflat) - 69) / 12), st = t0 + (n.t - from) * minim, d = n.len * minim;
      last = Math.max(last, st + d);
      const g = c.createGain(), o1 = c.createOscillator(), o2 = c.createOscillator(), fl = c.createBiquadFilter();
      fl.type = 'lowpass'; fl.frequency.value = timbre === 'organ' ? 1800 : 2600;
      o1.type = timbre === 'organ' ? 'sine' : 'triangle'; o2.type = timbre === 'organ' ? 'triangle' : 'sawtooth'; o1.frequency.value = f; o2.frequency.value = f * (timbre === 'organ' ? 2 : 1.003);
      const g2 = c.createGain(); g2.gain.value = timbre === 'organ' ? .22 : .12; o2.connect(g2); g2.connect(fl); o1.connect(fl); fl.connect(g); g.connect(master);
      const peak = .16 / Math.sqrt(exps.length);
      g.gain.setValueAtTime(0, st);
      if (timbre === 'organ') { g.gain.linearRampToValueAtTime(peak, st + .02); g.gain.setValueAtTime(peak, st + Math.max(.03, d - .06)); g.gain.linearRampToValueAtTime(0, st + d - .005 + .03); }
      else { g.gain.linearRampToValueAtTime(peak * 1.6, st + .006); g.gain.exponentialRampToValueAtTime(.0008, st + Math.min(Math.max(d, .35) * 1.1, 2.2)); }
      o1.start(st); o2.start(st); const e = st + Math.max(d, .35) * 1.2 + .1; o1.stop(e); o2.stop(e);
    });
  });
  if (onEnd) timers.push(setTimeout(onEnd, (last - c.currentTime) * 1000 + 100));
}
