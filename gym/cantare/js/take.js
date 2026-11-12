/* Writing out the singing. While the music plays with the microphone open, every frame's reading is kept with the
   moment of the piece it belongs to (in semiminimae, u). Clean readings that agree make a sung note; the notes are put
   on a grid of fusae, long ones on strong beats, and written with mensural values. The result is a voice of its own
   (notes with t and len in minimae, as the rest of the app keeps them), drawn in red under or over the music. */
import { median, spellMidi } from './mic.js';

/* the values a sung length (in semiminimae) is written with, longest first; in tempus perfectum the brevis holds three semibreves */
function values(rest, O) {
  if (rest) return O ? [[24, 'L'], [12, 'B'], [4, 'S'], [2, 'M'], [1, 'Sm'], [.5, 'F']] : [[16, 'L'], [8, 'B'], [4, 'S'], [2, 'M'], [1, 'Sm'], [.5, 'F']];
  return O ? [[24, 'L'], [12, 'B'], [6, 'S', 1], [4, 'S'], [3, 'M', 1], [2, 'M'], [1.5, 'Sm', 1], [1, 'Sm'], [.5, 'F']]
    : [[16, 'L'], [12, 'B', 1], [8, 'B'], [6, 'S', 1], [4, 'S'], [3, 'M', 1], [2, 'M'], [1.5, 'Sm', 1], [1, 'Sm'], [.5, 'F']];
}

/* Where a sung beginning or end is written (on a grid of fusae). Each place costs its distance, measured against the
   note's length (a long note may be well off and still mean the beat), plus how weak the place is: semibreve 0, minima
   0.5, semiminima 1.2, fusa 2.4, the last two more for a longer note. So long notes land on strong beats and a quick run
   can still be written in fusae. */
function snap(u, len, lo) {
  const L = Math.min(len, 8), sig = .25 + .2 * L;
  let best = Math.max(lo, Math.round(u * 2) / 2), bc = Infinity;
  for (let g = Math.max(lo, Math.floor((u - 3) * 2) / 2); g <= u + 3; g += .5) {
    const lv = g % 4 === 0 ? 0 : g % 2 === 0 ? .5 : g % 1 === 0 ? 1.2 + .3 * L : 2.4 + .6 * L;
    const cost = (g - u) * (g - u) / (sig * sig) + lv;
    if (cost < bc) { bc = cost; best = g; }
  }
  return best;
}

/* The delay left over (speakers, Bluetooth, the singer): sung notes mostly begin on the beat, so the average distance
   of their beginnings from the nearest minima (or semibreve) is that delay. Used when it is clear. */
function delay(segs, c) {
  const st = segs.map(g => g.u0);
  if (st.length < 4) return null;
  for (const P of [4, 2]) {
    let sx = 0, sy = 0;
    st.forEach(u => { sx += Math.cos(2 * Math.PI * u / P); sy += Math.sin(2 * Math.PI * u / P); });
    const R = Math.hypot(sx, sy) / st.length;
    if (R >= .55) {
      const d = Math.atan2(sy, sx) / (2 * Math.PI) * P;
      if (d * c > -.12 && d * c < .45) return d;
    }
  }
  return null;
}

export function createTake() {
  const T = { on: false, frames: [], parts: [], sig: '', from: 0, done: 0, stopU: undefined, version: 0 };

  T.clear = () => { T.on = false; T.frames = []; T.parts = []; T.sig = ''; T.stopU = undefined; T.version++; };
  T.start = fromU => { T.clear(); T.on = true; T.from = fromU; T.done = Math.floor(fromU * 2 + 1e-6); };

  /* every frame: the raw reading (not the smoothed dot), so a note is caught the moment it is clean.
     ctx: { c: seconds per semiminima, shown: the pitch the dot follows, peak, O: tempus perfectum, dia, bflat, cal, lag } */
  T.record = (u, mm, q, rms, onset, ctx) => {
    if (!T.on || u < T.from) return false;
    let v = mm !== null && q < .3 && rms >= .12 * ctx.peak ? mm : null;
    /* a reading an octave or two off the note being followed is that note's overtone or undertone */
    if (v !== null && ctx.shown !== null && Math.abs(v - ctx.shown) > 9) {
      const w = v + 12 * Math.round((ctx.shown - v) / 12);
      if (Math.abs(w - ctx.shown) < 1) v = w;
    }
    T.frames.push({ u, m: v, o: onset });
    if (Math.floor(u * 2) > T.done) { T.done = Math.floor(u * 2); return T.quantize(false, ctx); }
    return false;
  };
  T.finish = (stopU, ctx) => { if (!T.on || !T.frames.length) return false; T.stopU = stopU; return T.quantize(true, ctx); };

  /* the written pitch of a sung one: the nearest semitone, or with Diatonic the nearest note of the scale */
  const pitch = (m, ctx) => {
    if (!ctx.dia) return Math.round(m);
    const pcs = ctx.bflat ? [0, 2, 4, 5, 7, 9, 10] : [0, 2, 4, 5, 7, 9, 11];
    let best = Math.round(m), bd = 99;
    for (let k = Math.floor(m) - 2; k <= Math.ceil(m) + 2; k++) if (pcs.includes(((k % 12) + 12) % 12) && Math.abs(k - m) < bd) { bd = Math.abs(k - m); best = k; }
    return best;
  };

  /* The sung notes: a note begins with three clean readings that agree (or at a fresh attack, which also splits a note
     held on one pitch), and lasts through short breaks in the readings. */
  function segments(c, ctx) {
    const segs = [], hold = .16 / c; /* a break shorter than 160 ms does not end a note */
    let cur = null, cand = [], attack = null;
    for (const fr of T.frames) {
      if (fr.o) attack = fr.u;
      if (fr.m === null) { if (cur && fr.u - cur.u1 > hold) cur = null; continue; }
      const fresh = attack !== null && cur && attack > cur.u0 + .5;
      if (cur && !fresh && Math.abs(fr.m - cur.mid) < .75) {
        cur.u1 = fr.u; cur.ms.push(fr.m);
        if (cur.ms.length <= 12 || cur.ms.length % 4 === 0) cur.mid = median(cur.ms.slice(-24));
        cand = [];
        continue;
      }
      if (cand.length && Math.abs(fr.m - cand[0].m) >= .75) cand = [];
      cand.push(fr);
      if (cand.length >= 3) {
        let u0 = cand[0].u;
        if (attack !== null && attack <= u0 && u0 - attack < .12 / c) u0 = attack; /* the attack is the more exact start */
        cur = { u0, u1: fr.u, ms: cand.map(x => x.m), mid: median(cand.map(x => x.m)) };
        segs.push(cur); cand = []; attack = null;
      }
    }
    return segs.filter(g => g.u1 - g.u0 >= .06 / c).map(g => ({ u0: g.u0, u1: g.u1, m: pitch(median(g.ms), ctx) }));
  }

  /* returns true when what is written has changed */
  T.quantize = (last, ctx) => {
    const c = ctx.c, segs = segments(c, ctx);
    const est = ctx.cal != null ? null : delay(segs, c);
    const d = ctx.cal != null ? 0 : est !== null ? est : (ctx.lagGuess || 0) / c;
    if (last && est !== null && ctx.learn) ctx.learn(est * c);
    const ev = [];
    let lo = Math.floor(T.from + 1e-6);
    const nlen = k => (segs[k + 1] ? segs[k + 1].u0 : segs[k].u1) - segs[k].u0;
    segs.forEach((g, i) => {
      const len = nlen(i), a = snap(g.u0 - d, len, lo);
      let b = Math.max(a + .5, snap(g.u1 + .15 - d, len, a + .5));
      const nx = segs[i + 1];
      /* a gap of one semiminima or less is a breath, not a rest */
      if (nx) { const na = snap(nx.u0 - d, nlen(i + 1), a + .5); if (na - b <= 1) b = na; }
      /* still sounding when the music stopped: it lasts to the end */
      else if (last && T.stopU !== undefined && T.frames[T.frames.length - 1].u - g.u1 < .6) b = Math.max(b, Math.round(T.stopU));
      const p = ev[ev.length - 1];
      if (p && a < p.b) p.b = a;
      if (p && p.b <= p.a) ev.pop();
      ev.push({ a, b, m: g.m });
      lo = a + .5;
    });
    const parts = [];
    ev.forEach((e, i) => {
      const prev = ev[i - 1];
      if (prev && e.a > prev.b) {
        let u = prev.b;
        for (const [len, dd] of values(true, ctx.O)) while (e.a - u >= len) { parts.push({ u, len, d: dd, p: false, m: null, tie: false }); u += len; }
      }
      let u = e.a, left = e.b - e.a, first = true;
      for (const [len, dd, dot] of values(false, ctx.O)) while (left >= len) { parts.push({ u, len, d: dd, p: !!dot, m: e.m, tie: !first }); u += len; left -= len; first = false; }
    });
    const sig = parts.map(q => [q.u, q.d, q.p ? 1 : 0, q.m, q.tie ? 1 : 0].join(':')).join(' ');
    if (sig === T.sig && !last) return false;
    T.sig = sig; T.parts = parts; T.version++;
    return true;
  };

  /* the take as notes the engraver draws: t and len in minimae, step as the app counts it (28 = c′) */
  T.notes = (bflat) => T.parts.map(q => {
    if (q.m === null) return { v: q.d, rest: true, step: 0, acc: '', dot: false, col: false, ficta: false, t: q.u / 2, len: q.len / 2, sung: true };
    const sp = spellMidi(q.m), sig = bflat && sp.L === 6 ? -1 : 0;
    const acc = sp.alt === sig ? '' : sp.alt < 0 ? 'b' : sp.alt > 0 ? '#' : 'n';
    return { v: q.d, rest: false, step: sp.s, acc, dot: q.p, col: false, ficta: false, t: q.u / 2, len: q.len / 2, tie: q.tie, midi: q.m, sung: true };
  });
  return T;
}
