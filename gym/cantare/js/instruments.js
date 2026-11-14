/* Instruments from recordings and from physical models.

   Recordings: Versilian Studios, VCSL (Renaissance organ, Baroque recorders, Italian harpsichord) and VSCO 2
   Community Edition (old trombone, for the sackbut). Both are public domain (CC0). Every note was measured; the
   files lie in audio/<bank>/<midi>.mp3 with the measured pitch in map.json, and each note is retuned to the a′
   the user sets. A held note loops a steady stretch of its recording; the loop was cross-faded into the file when the
   bank was built (map.json gives its start and end), so the jump back is seamless.

   Models: pm-worklet.js (crumhorn, chalumeau, cornett, regal), one small simulation per note. */

const BANKS = { organ: 'organ8', plenum: 'plenum', sackbut: 'sackbut', recorder: 'recorder', harpsichord: 'harpsichord' };
const MODELS = new Set(['chalumeau', 'crumhorn', 'cornett', 'regal']);
/* loudness matched to the synthesised sounds (measured steady level of each bank) */
export const GAIN = { organ8: 1.5, plenum: 2.3, sackbut: 4.4, recorder: 3.9, harpsichord: 3.5, model: 3 };

const BASE = new URL('../audio/', import.meta.url).href;
const state = {};

export const bankOf = t => BANKS[t] || null;
export const isModel = t => MODELS.has(t);
export const bank = b => state[b];

export function loadBank(ctx, b) {
  if (state[b] && state[b].promise) return state[b].promise;
  const st = state[b] = { bufs: {}, loops: {}, map: null };
  st.promise = fetch(BASE + b + '/map.json').then(r => r.json()).then(map =>
    Promise.all(map.notes.map(n => fetch(BASE + b + '/' + n.m + '.mp3').then(r => r.arrayBuffer())
      .then(a => new Promise((ok, no) => ctx.decodeAudioData(a, ok, no)))
      .then(buf => { st.bufs[n.m] = buf; if (map.loop) st.loops[n.m] = n.le ? [Math.round(n.ls * buf.sampleRate), Math.round(n.le * buf.sampleRate)] : findLoop(buf, n.hz); })
      .catch(() => {}))).then(() => { st.map = map; }))
    .catch(() => { delete state[b]; });
  return st.promise;
}

/* the recorded note nearest to a pitch (the shift stays small: the banks have a note every two or three semitones) */
export function nearest(st, midi) {
  let best = null;
  for (const n of st.map.notes) if (st.bufs[n.m] && (!best || Math.abs(n.m - midi) < Math.abs(best.m - midi))) best = n;
  return best;
}

/* A loop in the steady part of a note: it starts on an upward zero crossing about a second in, and ends on the
   upward zero crossing near the end of the file whose next two periods look most like the two after the start. */
function findLoop(buf, hz) {
  const d = buf.getChannelData(0), sr = buf.sampleRate, n = d.length, P = sr / hz;
  const up = (from, to) => { const r = []; for (let i = Math.max(1, from); i < Math.min(n - 1, to); i++) if (d[i - 1] < 0 && d[i] >= 0) r.push(i); return r; };
  const s0 = Math.floor(Math.min(1.0 * sr, n * .3));
  const s = up(s0, s0 + Math.ceil(P * 2) + 2)[0] || s0;
  const w = Math.max(64, Math.min(2048, Math.round(P * 2)));
  const e0 = n - Math.floor(.3 * sr) - w;
  let best = Infinity, e = e0;
  for (const c of up(e0 - Math.ceil(P * 3), e0 + 1)) {
    let err = 0;
    for (let k = 0; k < w; k++) { const v = d[s + k] - d[c + k]; err += v * v; }
    if (err < best) { best = err; e = c; }
  }
  return e > s + sr * .25 ? [s, e] : [Math.floor(n * .3), Math.floor(n * .8)];
}

/* the worklet with the physical models, loaded once */
let pm = null, pmReady = false;
export function loadModels(ctx) {
  if (pm) return pm;
  if (!ctx.audioWorklet) { pm = Promise.resolve(); return pm; }
  pm = ctx.audioWorklet.addModule(new URL('./pm-worklet.js', import.meta.url).href).then(() => { pmReady = true; }).catch(() => {});
  return pm;
}
export const modelsReady = () => pmReady;

/* everything an instrument needs before it can play (resolves at once for the synthesised sounds) */
export function warm(ctx, t) {
  const b = bankOf(t);
  if (b) return loadBank(ctx, b);
  if (isModel(t)) return loadModels(ctx);
  return Promise.resolve();
}
