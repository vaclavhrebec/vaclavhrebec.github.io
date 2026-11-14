/* Fiorire: the choir-book layout of Cantare super librum (lines and leaves planned so that every voice shows the same stretch of time).
   planBook and splitRestsAt are Cantare's own, unchanged. */
import { buildColumns, headWidth, engraveSystems } from '../../gym/cantare/js/engrave.js';
import { clefFor, lengthOf } from '../../gym/cantare/js/music.js';

export function planBook(p, paneW, rows, opts) {
  const meas = p.voices.map((v, i) => {
    const cols = buildColumns(p, [i]);
    const pre = [0]; cols.forEach(c => pre.push(pre.at(-1) + c.need));
    const head = headWidth(p, clefFor(opts.clefs?.[i] || v.clef)) + .4;
    return { v, cols, pre, cap: Math.max(4, (paneW - 3.4 - head) * .97) };
  });
  const lowerIdx = (cols, t) => { let lo = 0, hi = cols.length; while (lo < hi) { const m = (lo + hi) >> 1; if (cols[m].t < t - 1e-6) lo = m + 1; else hi = m; } return lo; };
  /* the room one voice needs between two moments; a voice still silent or still holding a note at the start gets a little lead */
  const need = (m, s, e) => {
    const a = lowerIdx(m.cols, s), b = lowerIdx(m.cols, e);
    let w = m.pre[b] - m.pre[a];
    const first = a < m.cols.length ? m.cols[a].t : e;
    if (first > s + 1e-6 && first < e) w += 1.8;
    return w;
  };
  /* how many voices hold a sounding note across the moment t (a line or page should rather turn where none does) */
  const held = t => p.voices.reduce((k, v) => k + (v.notes.some(n => !n.rest && n.t < t - 1e-6 && n.t + n.len > t + 1e-6) ? 1 : 0), 0);
  const end = p.end;
  const times = [...new Set(meas.flatMap(m => m.cols.map(c => Math.round(c.t * 1e4) / 1e4)).concat([Math.round(end * 1e4) / 1e4]))].sort((a, b) => a - b);
  const starts = [0];
  let s = 0;
  while (s < end - 1e-6) {
    let k = times.findIndex(t => t > s + 1e-6);
    if (k < 0) break;
    const fit = [];
    for (; k < times.length; k++) {
      const e = times[k];
      if (fit.length && !meas.every(m => need(m, s, e) <= m.cap)) break;
      fit.push(e);
    }
    let e = fit[fit.length - 1];
    if (e < end - 1e-6 && fit.length > 1) {
      /* among the last good places, the latest where no voice is holding a note over the turn */
      const span = e - s;
      const good = fit.filter(t => t - s >= span * .82);
      const best = Math.min(...good.map(held));
      e = good.filter(t => held(t) === best).at(-1);
    }
    if (e >= end - 1e-6) break;
    starts.push(e); s = e;
  }
  const leaves = [];
  for (let i = 0; i < starts.length; i += rows) leaves.push({ t0: starts[i], t1: i + rows < starts.length ? starts[i + rows] : Infinity, lines: starts.slice(i, i + rows) });
  return { starts, leaves };
}
/* a copy of the piece in which every rest that runs over one of the moments is cut there into rests of the usual values */
export function splitRestsAt(p, cuts) {
  const tp = p.talea || p.abs ? 'C' : p.tempus;
  const VALS = ['L', 'B', 'S', 'M', 'Sm', 'F'].map(v => ({ v, len: lengthOf({ v }, tp) })).sort((a, b) => b.len - a.len);
  const restsOf = (n, src, t, d) => {
    const out = [];
    let left = d;
    for (const x of VALS) while (left >= x.len - 1e-6) { out.push({ ...n, v: x.v, dot: false, col: false, alt: false, t, len: x.len, src }); t += x.len; left -= x.len; }
    if (left > 1e-6) out.push({ ...n, t, len: left, src }); /* an odd remainder keeps the last piece */
    return out;
  };
  const cutsIn = (a, b) => cuts.filter(c => c > a + 1e-6 && c < b - 1e-6);
  return { ...p, voices: p.voices.map(v => ({ ...v, notes: v.notes.flatMap((n, i) => {
    if (!n.rest) return [n];
    const cs = cutsIn(n.t, n.t + n.len);
    if (!cs.length) return [n];
    const pts = [n.t, ...cs, n.t + n.len];
    return pts.slice(1).flatMap((b, j) => restsOf(n, i, pts[j], b - pts[j]));
  }) })) };
}

/* the places of the voices in the opening of the book (Italian book: Tenor below left; German book: Bassus below left) */
export function bookOrder(p, kind = 'it') {
  let order = p.voices.length === 3 ? [0, 1, 2, -1] : kind === 'de' && p.voices.length === 4 ? [0, 1, 3, 2] : [0, 1, 2, 3];
  /* more than four voices: the highest voices at the top of the opening, then the alti, the tenors and the bassi,
     two side by side in each row (left page, right page) */
  if (p.voices.length > 4) {
    const GROUP = [[/^(cantus|superius|discantus|soprano)/i, 0], [/^(altus|contratenor altus|alto)/i, 1], [/^contratenor bassus/i, 3], [/^tenor/i, 2], [/^(bassus|bass|contratenor bassus)/i, 3]];
    const mean = v => { const ns = v.notes.filter(n => !n.rest); return ns.length ? ns.reduce((a, n) => a + n.step, 0) / ns.length : 0; };
    const known = p.voices.map(v => { const g = GROUP.find(([re]) => re.test((v.name || '').trim())); return g ? g[1] : null; });
    const rank = p.voices.map((v, i) => {
      if (known[i] != null && !/^(quintus|sextus|vagans|contratenor$)/i.test((v.name || '').trim())) return known[i];
      /* a voice without a telling name goes with the known voice nearest in range */
      let best = 2, d = 1e9; p.voices.forEach((w, j) => { if (j !== i && known[j] != null && !/^(quintus|sextus|vagans|contratenor$)/i.test((w.name || '').trim())) { const e = Math.abs(mean(w) - mean(v)); if (e < d) { d = e; best = known[j]; } } });
      return best;
    });
    order = p.voices.map((_, i) => i).sort((a, b) => rank[a] - rank[b] || mean(p.voices[b]) - mean(p.voices[a]) || a - b);
    if (order.length % 2) order.push(-1);
  }
  return order;
}

/* all the lines of all the voices, planned for panes `paneW` wide (in staff spaces) with `rows` lines to a leaf */
export function bookPlan(p, paneW, rows, opts) {
  const plan = planBook(p, paneW, rows, opts);
  const bp = splitRestsAt(p, plan.starts);
  const sys = bp.voices.map((_, i) => engraveSystems(bp, [i], paneW, { ...opts, names: false, breaks: plan.starts.slice(1) }));
  return { plan, bp, sys };
}
