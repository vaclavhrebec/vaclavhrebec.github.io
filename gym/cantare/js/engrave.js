/* Engraving: turns a piece into SVG. Units are staff spaces (distance between two staff lines); y grows downward. */
import { CLEFS, alterationOf, clefFor } from './music.js';
import { BRAVURA } from './bravura.js';
import { MS } from './manuscript.js';

/* notation font: 'manuscript' (shapes cut from a c.1500 choirbook) or 'bravura' (SMuFL). Chant always uses the plain forms. */
let FONT = 'bravura';
export const setFont = () => { FONT = 'bravura'; }; /* Bravura for everything */
const ms = style => FONT === 'manuscript' && style !== 'chant';
const mp = (k, x, y, sx = 1, sy = sx) => `<path d="${MS[k].d}" transform="translate(${f(x)} ${f(y)})${sx === 1 && sy === 1 ? '' : ` scale(${sx} ${sy})`}" class="fill" fill-rule="evenodd"/>`;
const stemPath = (x, y0, y1) => `<path d="M${f(x - .035)} ${f(y0)}L${f(x - .028)} ${f(y1)}H${f(x + .028)}L${f(x + .035)} ${f(y0)}Z" class="fill"/>`;
const flagPath = (x, y, up) => { const s = up ? 1 : -1; return `<path d="M${f(x - .03)} ${f(y)}C${f(x + .35)} ${f(y + s * .1)} ${f(x + .75)} ${f(y + s * .5)} ${f(x + .6)} ${f(y + s * 1.2)}C${f(x + .5)} ${f(y + s * .75)} ${f(x + .3)} ${f(y + s * .55)} ${f(x - .03)} ${f(y + s * .5)}Z" class="fill"/>`; };

const f = n => Math.round(n * 100) / 100;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- glyphs (Bravura outlines) ---------- */
const U = .004; /* one font unit in staff spaces */
const gw = c => BRAVURA[c].w * U;
/* chant is written with Bravura's black mensural brevis */
const CHANT_W = BRAVURA.E952.w * U;
/* glyph with its font origin at (x, y) */
const go = (c, x, y, sx = 1, cls = 'fill') => `<path d="${BRAVURA[c].d}" transform="translate(${f(x)} ${f(y)}) scale(${f(U * sx * 1e3) / 1e3} ${-f(U * sx * 1e3) / 1e3})" class="${cls}"/>`;
/* glyph with its bounding box centred on (cx, cy) */
const gc = (c, cx, cy, sx = 1, cls = 'fill') => {
  const g = BRAVURA[c];
  return go(c, cx - (g.x + g.w / 2) * U * sx, cy + (g.y + g.h / 2) * U * sx, sx, cls);
};

/* Bravura's Petrucci clefs, for chant and mensural music alike; the C clef has its own form for each line */
const C_CLEF = ['E907', 'E908', 'E909', 'E90A', 'E90B'];
const clefCode = clef => clef.kind === 'C' ? C_CLEF[Math.min(Math.max(clef.line, 1), 5) - 1] : clef.kind === 'F' ? 'E904' : 'E901';
const msClef = (clef, style) => (ms(style) && (clef.kind === 'C' || clef.kind === 'F')) ? (clef.kind === 'C' ? 'clefC' : 'clefF') : null;
const GAMMA_W = 1.5;
const clefWidth = (clef, style) => { if (clef.kind === 'Γ') return GAMMA_W; const k = msClef(clef, style); return k ? MS[k].w : gw(clefCode(clef, style)); };

/* y: vertical position of the line the clef sits on */
function clefGlyph(clef, y, style, lines = 5) {
  /* the gamma ut clef: a Γ in Fondamento, as on the Guidonian hand page, standing on its line */
  if (clef.kind === 'Γ') return `<text x="${f(GAMMA_W / 2)}" y="${f(y + .92)}" class="gammaclef" text-anchor="middle">Γ</text>`;
  const k = msClef(clef, style);
  let g = k ? mp(k, MS[k].w / 2, k === 'clefF' ? (lines - 1) / 2 : y) : go(clefCode(clef, style), 0, y);
  if (clef.shift) g += `<text x="${f(clefWidth(clef, style) / 2)}" y="${f(y + 2.55)}" class="clefnum" text-anchor="middle">8</text>`;
  return g;
}

/* Bravura's Renaissance flat (b molle) and natural, and the sharp */
const ACC_CODE = { b: 'E9E0', n: 'E9E2', '#': 'E262' };
/* x is the right edge of the sign */
const accidental = (acc, x, y, small, style = 'white') => {
  if (acc === 'b' && ms(style)) return mp('flat', x - MS.flat.w / 2 - (small ? .1 : 0), y, small ? .75 : 1);
  /* in chant the signs are smaller, in proportion to the square notes */
  const k = style === 'chant' ? (small ? .5 : .66) : (small ? .7 : 1);
  return go(ACC_CODE[acc], x - gw(ACC_CODE[acc]) * k, y, k);
};

/* Bravura's mensural notes, each drawn whole (head, stem and flags in one glyph), as Bravura.otf has them.
   White notation and black (coloured) notation; the longa and maxima have the stem down, the minima and smaller up,
   and a note is mirrored top to bottom when its stem should go the other way. */
const WHITE = { Mx: 'E95C', L: 'E95D', B: 'E95E', S: 'E962', M: 'E95F', Sm: 'E960', F: 'E961' };
const BLACK = { Mx: 'E950', L: 'E951', B: 'E952', S: 'E953', M: 'E954', Sm: 'E955', F: 'E955' };
const STEM_DOWN = { Mx: 1, L: 1 }, STEM_UP = { M: 1, Sm: 1, F: 1 };
/* a whole glyph with its head centred on (x, y); flip mirrors it top to bottom about the head */
const gn = (c, x, y, flip) => {
  const u = f(U * 1e3) / 1e3;
  return `<path d="${BRAVURA[c].d}" transform="translate(${f(x - (BRAVURA[c].x + (c === 'E95C' || c === 'E950' ? BRAVURA[c].w : headW(c)) / 2) * U)} ${f(y)}) scale(${u} ${flip ? u : -u})" class="fill"/>`;
};
/* the head's width: the glyph's width, except where a stem stands outside the head */
const headW = c => BRAVURA[c].w;

/* a note; style: 'chant' | 'white' | 'black' */
function noteGlyph(n, x, y, up, style) {
  if (style === 'chant') return gn(n.v === 'L' ? 'E951' : 'E952', x, y, false);
  const black = style === 'black' || n.col;
  if (ms(style)) return msNote(n, x, y, up, black);
  const code = (black ? BLACK : WHITE)[n.v] || 'E95E';
  const flip = (STEM_DOWN[n.v] && up) || (STEM_UP[n.v] && !up);
  return gn(code, x, y, flip);
}

/* a note in the manuscript shapes */
function msNote(n, x, y, up, black) {
  let g = '', hw;
  if (n.v === 'Mx' || n.v === 'L' || n.v === 'B') {
    const k = black ? 'brevisBlack' : 'brevis', sx = n.v === 'Mx' ? 1.9 : 1;
    g = mp(k, x, y, sx, 1); hw = MS[k].w * sx / 2;
    if (n.v !== 'B') g += up ? stemPath(x + hw - .05, y - .4, y - 2.6) : stemPath(x + hw - .05, y + .4, y + 2.6);
    return g;
  }
  const k = black || n.v === 'Sm' || n.v === 'F' ? 'black' : 'semibrevis';
  g = mp(k, x, y); hw = MS[k].w / 2;
  if (n.v === 'S') return g;
  const sx = up ? x + hw * .55 : x - hw * .55;
  if (up) { g += stemPath(sx, y - .3, y - 3.3); if (n.v === 'Sm') g += flagPath(sx, y - 3.3, true); if (n.v === 'F') g += flagPath(sx, y - 3.3, true) + flagPath(sx, y - 2.7, true); }
  else { g += stemPath(sx, y + .3, y + 3.3); if (n.v === 'Sm') g += flagPath(sx, y + 3.3, false); if (n.v === 'F') g += flagPath(sx, y + 3.3, false) + flagPath(sx, y + 2.7, false); }
  return g;
}

/* mensural rests hang from, or stand on, the middle line */
function restGlyph(n, x, midLine, style = 'white') {
  if (ms(style) && (n.v === 'B' || n.v === 'L')) return n.v === 'B' ? mp('restBrevis', x, midLine + .5) : mp('restLonga', x, midLine + 1);
  const code = n.v === 'L' && n.dot ? 'E9F1' : { Mx: 'E9F0', L: 'E9F2', B: 'E9F3', S: 'E9F4', M: 'E9F5', Sm: 'E9F6', F: 'E9F7' }[n.v];
  return go(code, x - gw(code) / 2, midLine);
}

/* the width of a sung syllable in staff spaces (lyrics are set at 1.12 staff spaces) */
let measCtx = null;
const measCache = new Map();
function textWidth(t) {
  if (!t) return 0;
  const hit = measCache.get(t);
  if (hit != null) return hit;
  try {
    measCtx ||= document.createElement('canvas').getContext('2d');
    measCtx.font = '112px Fondamento, "Palatino Linotype", Palatino, Georgia, serif';
    const w = measCtx.measureText(t).width / 100;
    if (document.fonts?.status === 'loaded') measCache.set(t, w);
    return w;
  } catch (e) { return t.length * .62; }
}

/* ---------- column model ---------- */
const spacing = d => 1.4 + 1.15 * Math.log2(1 + d);

function glyphNeed(n, style) {
  if (n.rest) return 1.3;
  let w = n.v === 'Mx' ? 2.2 : style === 'chant' ? 1.1 : 1.25;
  if (n.acc && !n.ficta) w += 1;
  if (n.dot) w += .6;
  if (n.v === 'Sm' || n.v === 'F') w += .5;
  return w;
}

export const styleOf = piece => piece.kind === 'chant' ? 'chant' : piece.kind === 'fractus' ? 'black' : 'white';

/* Columns: one for each moment at which any of the chosen voices begins a note. */
export function buildColumns(piece, vidx) {
  const style = styleOf(piece);
  const times = [...new Set(vidx.flatMap(v => piece.voices[v].notes.map(n => Math.round(n.t * 1e4) / 1e4)))].sort((a, b) => a - b);
  const at = new Map(times.map((t, i) => [t, i]));
  const cols = times.map(t => ({ t, notes: Object.create(null), need: 0, ligature: false }));
  vidx.forEach(v => piece.voices[v].notes.forEach((n, i) => {
    const c = cols[at.get(Math.round(n.t * 1e4) / 1e4)];
    c.notes[v] = { n, i };
  }));
  const hasText = vidx.some(v => piece.voices[v].lyrics);
  cols.forEach((c, k) => {
    let need = 0, textW = 0;
    for (const v of vidx) {
      const e = c.notes[v];
      if (!e) continue;
      need = Math.max(need, glyphNeed(e.n, style));
      if (e.n.text) textW = Math.max(textW, textWidth(e.n.text) + (e.n.hyphen ? .8 : .3));
    }
    c.textW = textW;
    if (style === 'chant') {
      const e = c.notes[vidx[0]];
      c.ligature = !!(hasText && k > 0 && e && !e.n.rest && !e.n.text && !cols[k - 1].restHere);
      c.need = c.ligature ? 1.18 : Math.max(need + .5, textW + .15);
    } else {
      const next = k + 1 < cols.length ? cols[k + 1].t : c.t + Math.max(...vidx.map(v => (c.notes[v] ? c.notes[v].n.len : 0)), 1);
      c.need = Math.max(need + .45, textW + .15, spacing(next - c.t));
    }
    c.restHere = vidx.some(v => c.notes[v] && c.notes[v].n.rest);
  });
  /* chant: the notes of one syllable are a ligature, written touching each other
     (a small space only between repeated notes on the same pitch); the syllable's text may widen the whole group */
  if (style === 'chant') {
    let head = 0;
    cols.forEach((c, k) => {
      if (!c.ligature) head = k;
      const nx = cols[k + 1];
      if (nx && nx.ligature) {
        const a = c.notes[vidx[0]]?.n, b = nx.notes[vidx[0]]?.n;
        c.tight = true;
        c.need = CHANT_W + (a && b && a.step === b.step ? .3 : 0) + (b && b.acc && !b.ficta ? .9 : 0);
      } else {
        c.tight = false;
        let inner = 0;
        for (let j = head; j < k; j++) inner += cols[j].need;
        const e = c.notes[vidx[0]];
        c.need = Math.max((e ? glyphNeed(e.n, style) : 1) + .5, cols[head].textW + .15 - inner);
      }
    });
  }
  return cols;
}

/* ---------- clef changes in chant and cantus fractus ----------
   Chant is written without ledger lines: a note may sit on the lines or in the space just above or below the staff, never further.
   Where the melody goes beyond, the clef changes for a while and comes back; as few changes as possible, never inside a ligature
   if it can be helped, and always preferring the voice's own clef. Returns the clef for every note of the voice, or null. */
const CHANT_POOL = ['c1', 'c2', 'c3', 'c4', 'baritone', 'bass'];
export function clefPlan(piece, vi, opts = {}) {
  const style = styleOf(piece);
  if (style === 'white') return null;
  const voice = piece.voices[vi], notes = voice.notes, lines = piece.lines, shift = opts.shift || 0, top = 2 * (lines - 1);
  const main = clefFor(opts.clefs?.[vi] || voice.clef);
  const pool = [main, ...[...CHANT_POOL, ...(lines >= 5 ? ['c5', 'f5'] : [])].map(clefFor).filter(c => c.id !== main.id && c.line <= lines)];
  const idx = notes.map((n, i) => (n.rest ? -1 : i)).filter(i => i >= 0);
  if (!idx.length) return null;
  const fits = (c, st) => st - c.bottom >= -1 && st - c.bottom <= top + 1;
  if (idx.every(i => fits(main, notes[i].step + shift))) return null;
  const N = pool.length, INF = 1e9;
  const miss = (c, i) => (fits(c, notes[i].step + shift) ? 0 : 60 + Math.abs(notes[i].step + shift - c.bottom - top / 2));
  let cost = pool.map((c, k) => miss(c, idx[0]) + (k ? .8 : 0));
  const back = [];
  for (let j = 1; j < idx.length; j++) {
    const i = idx[j], n = notes[i];
    /* a change between two notes of one syllable breaks a ligature */
    const inSyl = voice.lyrics && !n.text && i === idx[j - 1] + 1;
    const pen = 1 + (inSyl ? (style === 'chant' ? 3 : .4) : 0);
    const nc = new Array(N).fill(INF), bk = new Array(N).fill(0);
    for (let k = 0; k < N; k++) {
      const here = miss(pool[k], i) + (k ? .01 : 0);
      for (let q = 0; q < N; q++) {
        const v = cost[q] + (q === k ? 0 : pen) + here;
        if (v < nc[k]) { nc[k] = v; bk[k] = q; }
      }
    }
    back.push(bk); cost = nc;
  }
  let k = cost.indexOf(Math.min(...cost));
  const pick = new Array(idx.length);
  for (let j = idx.length - 1; j >= 0; j--) { pick[j] = pool[k]; if (j) k = back[j - 1][k]; }
  const plan = new Array(notes.length);
  let j = 0, cur = pick[0];
  for (let i = 0; i < notes.length; i++) { if (j < idx.length && idx[j] === i) cur = pick[j++]; plan[i] = cur; }
  return plan;
}
/* room for a clef written inside a line (with the b molle after it, when the piece has one) */
const clefRoom = (piece, clef) => clefWidth(clef, styleOf(piece)) + .7 + (piece.bflat ? 1.3 : 0);
/* the clef in force at x (staff coordinates) on a staff of an engraved system */
export const clefAt = (st, x) => { let c = null; for (const g of st?.segs || []) if (g.x <= x) c = g.clef; return c; };

/* ---------- a system (one line of music for one or more voices) ---------- */
function flatStep(bottom, lines) {
  const mid = bottom + lines - 1;
  let best = null;
  for (let s = bottom - 2; s <= bottom + 2 * (lines - 1) + 2; s++) if (((s % 7) + 7) % 7 === 6 && (best === null || Math.abs(s - mid) < Math.abs(best - mid))) best = s;
  return best;
}

const hasSign = piece => piece.kind !== 'chant' && !piece.talea;
const HEAD = (piece, clef) => clefWidth(clef, styleOf(piece)) + .5 + (piece.bflat ? 1.2 : 0) + (hasSign(piece) ? 2.1 : 0) + 1;
export const headWidth = (piece, clef) => HEAD(piece, clef);

/* Draw one staff for one voice over the given columns. Returns {svg, top, bottom} relative to the staff's top line. */
function drawStaff(piece, vi, cols, xs, opts) {
  const voice = piece.voices[vi], lines = piece.lines, style = styleOf(piece);
  const plan = opts.plans?.[vi];
  /* the line begins with the clef of its first note */
  let clef = clefFor(opts.clefs?.[vi] || voice.clef);
  if (plan) { const e = cols.map(c => c.notes[vi]).find(e => e && !e.n.rest) || cols.map(c => c.notes[vi]).find(Boolean); if (e) clef = plan[e.i]; }
  const segs = [{ x: -99, clef }];
  const state = opts.state?.[vi] || 'on'; /* on | mute | hide */
  const yOf = step => (lines - 1) - (step - clef.bottom) / 2;
  const clefHere = (c, xc) => {
    let g = `<g transform="translate(${f(xc)} 0)">${clefGlyph(c, lines - c.line, style, lines)}</g>`;
    if (piece.bflat) g += accidental('b', xc + clefWidth(c, style) + .5 + .9, (lines - 1) - ((flatStep(c.bottom, lines) ?? c.bottom + 2) - c.bottom) / 2, false, style);
    return `<g class="clefchange">${g}</g>`;
  };
  const mid = (lines - 1) / 2, restLine = lines > 4 ? 2 : 1;
  const total = xs.end;
  let svg = '';
  for (let k = 0; k < lines; k++) svg += `<path d="M0 ${k}H${f(total)}" class="staffline"/>`;
  /* the end of the piece: a double bar, thin and thick */
  if (xs.final) svg += `<rect x="${f(total - .78)}" y="0" width=".13" height="${lines - 1}" class="fill"/><rect x="${f(total - .36)}" y="0" width=".36" height="${lines - 1}" class="fill"/>`;
  const cw = clefWidth(clef, style);
  /* the clef can be clicked: a palette of all the clefs opens */
  svg += `<g class="clef-hit" data-clef-vi="${vi}"><rect x="-.4" y="-1.2" width="${f(cw + .8)}" height="${f(lines + 1.4)}" fill="transparent"/>${clefGlyph(clef, lines - clef.line, style, lines)}</g>`;
  if (piece.bflat) {
    const y = yOf(flatStep(clef.bottom, lines) ?? clef.bottom + 2);
    svg += accidental('b', cw + .5 + .9, y, false, style);
  }
  if (hasSign(piece)) {
    const sx = HEAD(piece, clef) - 1.2 - 1.6;
    const code = piece.tempus === 'O' ? (piece.cut ? 'E912' : 'E911') : 'E915';
    if (ms(style) && piece.tempus === 'O') svg += piece.cut ? mp('signCut', sx + .8, mid, .75) : mp('signO', sx + .8, mid, .78);
    else svg += gc(code, sx + .8, mid, .78);
    if (piece.cut && piece.tempus !== 'O') svg += gc('E925', sx + .8, mid, .78);
  }
  let top = -.6, bottom = lines - 1 + .6;
  const shift = opts.shift || 0;
  let body = '', words = '';
  const textY = lines - 1 + 2.3;
  let lowest = lines - 1;
  const notesHere = [];
  /* long silences: a run of brevis and longa rests is gathered into longa rests (two spaces each)
     and a brevis rest for an odd one, set close together at the start of the run */
  const restGroup = new Map();
  if (style !== 'chant') {
    let run = [];
    const flush = () => {
      if (run.length >= 2) {
        const unit = run[0].n.v === 'B' ? run[0].n.len : run[0].n.len / 2;
        const total = run.reduce((a, r) => a + r.n.len, 0), N = Math.round(total / unit);
        if (Math.abs(N * unit - total) < 1e-6 && N >= 2) {
          const strokes = [...Array(Math.floor(N / 2)).fill('E9F2'), ...(N % 2 ? ['E9F3'] : [])];
          restGroup.set(run[0].k, strokes);
          run.slice(1).forEach(r => restGroup.set(r.k, null));
        }
      }
      run = [];
    };
    cols.forEach((c, k) => {
      const e = c.notes[vi];
      if (!e) return;
      const ok = e.n.rest && (e.n.v === 'B' || e.n.v === 'L') && !e.n.col;
      if (ok && run.length && run[run.length - 1].i === e.i - 1 && (e.n.v === 'L' ? e.n.len / 2 : e.n.len) === (run[0].n.v === 'L' ? run[0].n.len / 2 : run[0].n.len)) run.push({ k, i: e.i, n: e.n });
      else { flush(); if (ok) run.push({ k, i: e.i, n: e.n }); }
    });
    flush();
  }
  cols.forEach((c, k) => {
    const e = c.notes[vi];
    if (!e) return;
    const { n, i } = e;
    const x = xs.at[k];
    if (n.rest) {
      let g;
      if (restGroup.has(k)) {
        const strokes = restGroup.get(k);
        g = strokes ? strokes.map((code, j) => go(code, x + .45 + j * .5, restLine)).join('') : '';
      } else g = restGlyph(n, x + .55, restLine, style);
      body += `<g class="note" data-v="${vi}" data-i="${i}" data-t="${n.t}" data-len="${n.len}">${g}</g>`;
      return;
    }
    const step = n.step + shift;
    /* a change of clef inside the line, just before this note */
    let pre = '';
    if (plan && plan[i] !== clef) {
      const xc = x - .6 - clefRoom(piece, plan[i]) + .2;
      clef = plan[i]; segs.push({ x: xc, clef });
      pre = clefHere(clef, xc);
    }
    const y = yOf(step);
    const up = step <= clef.bottom + lines - 1 - (n.v === 'L' || n.v === 'Mx' ? 0 : 0) ? true : false; /* stem up on or below the middle line */
    const stemUp = n.v === 'L' || n.v === 'Mx' ? step <= clef.bottom + lines - 1 : step < clef.bottom + lines - 1;
    void up;
    let g = '';
    /* ledger lines */
    const ext = style === 'chant' ? 1.1 : 1.3;
    for (let p = -1; p >= Math.floor(y) ; p--) if (y <= p) g += `<path d="M${f(x - ext / 2 - .3)} ${p}h${f(ext + .6)}" class="staffline"/>`;
    for (let p = lines; p <= Math.ceil(y); p++) if (y >= p) g += `<path d="M${f(x - ext / 2 - .3)} ${p}h${f(ext + .6)}" class="staffline"/>`;
    const alt = n.acc;
    if (alt) g += n.ficta ? accidental(alt, x, y - 1.7, true, style) : accidental(alt, x - (style === 'chant' ? .6 : .75), y, false, style);
    const nx = x + (alt && !n.ficta ? 0 : 0);
    g += noteGlyph(n, nx, y, stemUp, style);
    if (n.dot) g += `<circle cx="${f(nx + .95)}" cy="${f(Number.isInteger(y) ? y - .5 : y)}" r=".16" class="fill"/>`;
    const stems = n.v !== 'B' && n.v !== 'S' && style !== 'chant';
    top = Math.min(top, y - .7, stems && stemUp ? y - 3.6 : 99);
    const low = Math.max(y + .7, stems && !stemUp ? y + 3.6 : -99, style === 'chant' && n.v === 'L' ? y + 2.7 : -99);
    bottom = Math.max(bottom, low);
    lowest = Math.max(lowest, low);
    notesHere.push({ n, x, k, i });
    body += pre + `<g class="note" data-v="${vi}" data-i="${i}" data-t="${n.t}" data-len="${n.len}">${g}<rect x="${f(x - .8)}" y="${f(Math.min(y, 0) - 1)}" width="1.6" height="${f(Math.abs(Math.max(y, lines - 1) - Math.min(y, 0)) + 2)}" class="hit"/></g>`;
  });
  /* text underlay */
  const base = Math.max(textY, lowest + 1.3);
  /* between the syllables of one word a stroke (the hyphen, drawn across the whole gap);
     after the last syllable of a word that carries more notes, a line along the baseline as long as the notes run */
  const dash = (x1, x2) => {
    if (x2 - x1 >= 1.1) words += `<path d="M${f(x1 + .3)} ${f(base - .3)}H${f(x2 - .3)}" class="lyric-line"/>`;
    else if (x2 - x1 >= .45) words += `<path d="M${f((x1 + x2) / 2 - .2)} ${f(base - .3)}h.4" class="lyric-line"/>`;
  };
  const extender = (x1, j) => {
    let last = -1;
    for (let m = j + 1; m < notesHere.length && !notesHere[m].n.text && (m === 0 || notesHere[m].i === notesHere[m - 1].i + 1); m++) last = m;
    if (last < 0) return;
    const x2 = notesHere[last].x + .5;
    if (x2 - x1 > .5) words += `<path d="M${f(x1 + .15)} ${f(base + .2)}H${f(x2)}" class="lyric-line"/>`;
  };
  /* a melisma carried over from the previous line */
  if (notesHere.length && !notesHere[0].n.text) {
    const notes = voice.notes;
    let i0 = notes.indexOf(notesHere[0].n), prev = null;
    for (let m = i0 - 1; m >= 0; m--) { if (notes[m].rest) break; if (notes[m].text) { prev = notes[m]; break; } }
    if (prev) {
      const nextText = notesHere.findIndex(e => e.n.text);
      if (prev.hyphen) dash(notesHere[0].x - 1.2, nextText >= 0 ? notesHere[nextText].x - .5 : xs.end);
      else extender(notesHere[0].x - .65, -1);
    }
  }
  notesHere.forEach(({ n, x }, j) => {
    if (!n.text) return;
    words += `<text x="${f(x - .5)}" y="${f(base)}" class="lyric">${esc(n.text)}</text>`;
    const end = x - .5 + textWidth(n.text);
    if (n.hyphen) {
      let m = j + 1;
      while (m < notesHere.length && !notesHere[m].n.text) m++;
      dash(end, m < notesHere.length ? notesHere[m].x - .5 : xs.end);
    } else extender(end, j);
  });
  const hasWords = piece.voices[vi].lyrics && notesHere.some(e => e.n.text);
  bottom = Math.max(bottom, hasWords ? base + .6 : bottom);
  let cap = '';
  if (state === 'hide') {
    /* a hidden voice keeps its staff, clef and place exactly as they were: only its notes and words are gone,
       so the eye can imagine them where they stood */
    return { top, bottom, svg, segs };
  }
  const label = voice.name && opts.names && !opts.initials ? `<text x="${f(HEAD(piece, clef))}" y="${f(top - .1)}" class="vname">${esc(voice.name.replace(/\s*\d+$/, ''))}${/\d+$/.test(voice.name) ? `<tspan class="vinum" dy=".3">${voice.name.match(/\d+$/)[0]}</tspan>` : ''}</text>` : '';
  cap = label;
  if (xs.custos && xs.custos[vi] != null) {
    /* the next line begins with another clef: it is announced here, before the custos, which then reads in it */
    const nc = plan && xs.custosI ? plan[xs.custosI[vi]] : null;
    if (nc && nc !== clef) {
      const xc = xs.end - 2.85 - clefRoom(piece, nc) + .1;
      clef = nc; segs.push({ x: xc, clef });
      body += clefHere(clef, xc);
    }
    const cy = yOf(xs.custos[vi] + shift);
    /* the zigzag is one space high and is centred on the pitch: it fills a space, or straddles a line */
    body += go('EA02', xs.end - 2.65, cy + .5, 1);
    /* ledger lines for a custos above or below the staff */
    for (let l = -1; l >= cy - .01 && l >= -6; l--) body += `<path d="M${f(xs.end - 2.85)} ${l}h2.2" class="staffline"/>`;
    for (let l = lines; l <= cy + .01 && l <= lines + 6; l++) body += `<path d="M${f(xs.end - 2.85)} ${l}h2.2" class="staffline"/>`;
  }
  return { top, bottom, segs, svg: svg + `<g class="${state === 'mute' ? 'muted' : ''}">${body}${words}</g>` + cap };
}

/* Place the columns on lines of the given width (in staff spaces). Returns arrays of column ranges. */
export function breakLines(cols, width, headW, firstIndent = 0) {
  const out = [];
  let start = 0, used = 0, head = 0;
  for (let k = 0; k < cols.length; k++) {
    if (!cols[k].ligature) head = k;
    const w = cols[k].need;
    if (k > start && used + w > width - headW - (out.length ? 0 : firstIndent)) {
      /* never break inside a ligature: the whole syllable moves to the next line */
      const at = cols[k].ligature ? head : k;
      if (at > start) { out.push([start, at]); start = at; used = 0; for (let j = at; j < k; j++) used += cols[j].need; }
    }
    used += w;
  }
  if (start < cols.length) out.push([start, cols.length]);
  return out;
}

/* the length of one brevis in minims: perfect (three semibreves) in tempus perfectum and in cantus fractus that runs in threes */
export const breveUnit = piece => (piece.tempus === 'O' || piece.ternary ? 6 : 4);

/* Engrave the systems for the voices `vidx` of a piece. */
export function engraveSystems(piece, vidx, width, opts = {}) {
  const cols = buildColumns(piece, vidx);
  const clefOf = vi => clefFor(opts.clefs?.[vi] || piece.voices[vi].clef);
  /* chant and cantus fractus: the clef changes that keep every note off ledger lines */
  const plans = {};
  vidx.forEach(v => { const pl = clefPlan(piece, v, opts); if (pl) plans[v] = pl; });
  if (Object.keys(plans).length) {
    opts = { ...opts, plans };
    cols.forEach((c, k) => {
      if (!k) return;
      let room = 0;
      for (const v in plans) {
        const e = c.notes[v];
        if (!e || e.n.rest) continue;
        const pl = plans[v], ns = piece.voices[v].notes;
        let p = e.i - 1; while (p >= 0 && ns[p].rest) p--;
        if (p >= 0 && pl[p] !== pl[e.i]) room = Math.max(room, clefRoom(piece, pl[e.i]));
      }
      cols[k - 1].need += room;
    });
  }
  const headW = Math.max(...vidx.map(v => Math.max(HEAD(piece, clefOf(v)), ...(plans[v] ? [...new Set(plans[v])].map(c => HEAD(piece, c)) : []))));
  /* the voices are named by an initial, as in a choirbook: S, A, T, B before the first staff of each voice */
  const initials = opts.names !== false && vidx.some(v => piece.voices[v].name);
  /* Mute and Hide for each voice sit in the margin, before its initial */
  const CTL = initials && opts.voiceCtl && vidx.length > 1 ? 1.9 : 0;
  const INDENT = initials ? 3.4 + CTL : 0;
  opts = { ...opts, initials };
  /* two or more voices are joined at the left by a brace, as in keyboard music */
  const BR = vidx.length > 1 && opts.brace !== false ? 2.1 : 0;
  /* room at the end of each line for the custos */
  const CUST = 3.2;
  const ranges = breakLines(cols, width - BR - CUST, headW, INDENT);
  if (!ranges.length) ranges.push([0, 0]); /* nothing written yet: one empty staff */
  const gap = opts.gap ?? 2.4;
  return ranges.map(([a, b], si) => {
    const slice = cols.slice(a, b);
    const natural = slice.reduce((a, c) => a + c.need, 0);
    const last = b >= cols.length;
    const ind = (si === 0 ? INDENT : 0) + BR;
    const stretch = last || opts.justify === false ? 1 : Math.min(Math.max((width - ind - headW - CUST) / natural, 1), piece.kind === 'chant' ? 1.4 : 2.6);
    const at = [];
    let x = headW;
    slice.forEach(c => { at.push(x + .35); x += c.need * (c.tight ? 1 : stretch); });
    const xs = { at, end: slice.length && !(last && opts.fullLast) ? Math.min(Math.max(x + (last ? .9 : CUST - .2), headW + 2), width - ind) : width - ind, final: last && slice.length > 0 };
    /* the custos: at the end of every line but the last, the pitch of each voice's next note */
    if (!last) {
      xs.custos = {}; xs.custosI = {};
      vidx.forEach(vi => { for (let k = b; k < cols.length; k++) { const e = cols[k].notes[vi]; if (e && !e.n.rest) { xs.custos[vi] = e.n.step; xs.custosI[vi] = e.i; break; } } });
    }
    let y = 0, svg = '';
    const staves = vidx.map(vi => {
      const s = drawStaff(piece, vi, slice, xs, opts);
      const place = { vi, y: y - s.top, segs: s.segs };
      let init = '';
      const nm = piece.voices[vi].name;
      if (si === 0 && CTL) {
        const cy = place.y + (piece.lines - 1) / 2, st = opts.state?.[vi] || 'on', k = 1.35 / 24;
        const icon = (act, dy, d) => `<g class="vctl${st === act ? ' on' : ''}" data-vi="${vi}" data-act="${act}"><rect x="0" y="${f(cy + dy - .85)}" width="1.7" height="1.7" rx=".35" class="vctl-bg"/><g transform="translate(.17 ${f(cy + dy - .68)}) scale(${k})">${d}</g></g>`;
        init += icon('mute', -1, '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>') +
                icon('hide', 1, '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><path d="M4 20L20 4"/>');
      }
      if (ind - BR && nm) init += `<text x="${f(CTL + (ind - BR - CTL) / 2 - .2)}" y="${f(place.y + (piece.lines - 1) / 2 + 1.45)}" class="vinit" text-anchor="middle">${esc(nm.trim()[0].toUpperCase())}${/\d+$/.test(nm.trim()) ? `<tspan class="vinum" dy=".35">${nm.trim().match(/\d+$/)[0]}</tspan>` : ''}</text>`;
      svg += init + `<g transform="translate(${f(ind)} ${f(place.y)})" data-voice="${vi}">${s.svg}</g>`;
      y += (s.bottom - s.top) + gap;
      return place;
    });
    const h = y - gap;
    if (BR && staves.length > 1) {
      const y0 = staves[0].y, y1 = staves[staves.length - 1].y + (piece.lines - 1);
      /* the staff lines reach back to a thin line that joins the staves; the brace stands just before it */
      const xl = ind - .45;
      const ext = staves.map(st => Array.from({ length: piece.lines }, (_, k) => `M${f(xl)} ${f(st.y + k)}H${f(ind + .05)}`).join('')).join('');
      svg = bracketSVG(xl - .55, y0, y1) +
        `<path d="${ext}" class="staffline"/>` +
        `<path d="M${f(xl)} ${f(y0)}V${f(y1)}" class="sysline" stroke="currentColor" stroke-width=".16" fill="none"/>` + svg;
    }
    const t0 = slice.length ? slice[0].t : 0, t1 = b < cols.length ? cols[b].t : piece.end;
    /* the breves are counted (perfect breves in tempus perfectum): the number of the breve each new line begins with,
       above its first staff; on the one long line, every fifth breve where it begins */
    let hh = h;
    if (opts.count !== false && slice.length) {
      const bu = breveUnit(piece), off = piece.beatOff || 0, marks = [];
      const xOf = t => { /* the place of a moment on this line */
        for (let i = 0; i < slice.length; i++) {
          if (Math.abs(slice[i].t - t) < 1e-6) return at[i] - .35;
          if (slice[i].t > t) { if (!i) return null; const [ta, xa] = [slice[i - 1].t, at[i - 1]]; return xa + (at[i] - xa) * (t - ta) / (slice[i].t - ta) - .35; }
        }
        return null;
      };
      if (opts.count > 0) {
        for (let k = opts.count; off + (k - 1) * bu < t1 - 1e-6; k += opts.count) { const x = xOf(off + (k - 1) * bu); if (x != null) marks.push([k, x + ind, 'start']); }
      } else if (si > 0 && t0 >= off - 1e-6) marks.push([Math.floor((t0 - off) / bu + 1e-6) + 1, BR && staves.length > 1 ? ind - 1.6 : ind + .1, 'start']);
      if (marks.length) {
        /* above the bracket of a score, else just above the staff */
        const lift = BR && staves.length > 1 && !(opts.count > 0) ? 1.75 : .75;
        const top = staves[0].y, pad = Math.max(0, lift + 1.15 - top);
        if (pad) { svg = `<g transform="translate(0 ${f(pad)})">${svg}</g>`; hh += pad; staves.forEach(st => { st.y += pad; }); }
        svg += marks.map(([k, x, a]) => `<text x="${f(x)}" y="${f(top + pad - lift)}" class="brevenum" text-anchor="${a}">${k}</text>`).join('');
      }
    }
    return { svg, w: xs.end + ind, h: hh, t0, t1, from: a, to: b, staves, ind, head: headW, xt: slice.map((c, i) => [c.t, at[i]]) };
  });
}

/* the old bracket of a score: one tall line before the staves, turning to the right at the top and with a small foot at the bottom,
   like a great C */
function bracketSVG(x, y0, y1) {
  const r = 1.1;
  return `<path d="M${f(x + 1.25)} ${f(y0 - 1.15)}Q${f(x)} ${f(y0 - 1.15)} ${f(x)} ${f(y0 - 1.15 + r)}V${f(y1 + 1.15 - r)}Q${f(x)} ${f(y1 + 1.15)} ${f(x + 1.25)} ${f(y1 + 1.15)}" class="bracket" fill="none" stroke="currentColor" stroke-width=".42" stroke-linecap="round"/>`;
}

/* a curly brace whose right edge stands at xR, from y0 to y1, `a` wide */
function braceSVG(xR, y0, y1, a) {
  const H = y1 - y0, m = (y0 + y1) / 2, xL = xR - a;
  const P = (x, y) => `${f(x)} ${f(y)}`;
  const d = `M${P(xR, y0)}` +
    `C${P(xR - .78 * a, y0 + .02 * H)} ${P(xR - .30 * a, y0 + .22 * H)} ${P(xR - .52 * a, y0 + .39 * H)}` +
    `C${P(xR - .60 * a, y0 + .45 * H)} ${P(xL + .20 * a, m - .025 * H)} ${P(xL, m)}` +
    `C${P(xL + .20 * a, m + .025 * H)} ${P(xR - .60 * a, y1 - .45 * H)} ${P(xR - .52 * a, y1 - .39 * H)}` +
    `C${P(xR - .30 * a, y1 - .22 * H)} ${P(xR - .78 * a, y1 - .02 * H)} ${P(xR, y1)}` +
    `C${P(xR - .55 * a, y1 - .035 * H)} ${P(xR - .08 * a, y1 - .22 * H)} ${P(xR - .30 * a, y1 - .40 * H)}` +
    `C${P(xR - .40 * a, y1 - .46 * H)} ${P(xL + .55 * a, m + .012 * H)} ${P(xL, m)}` +
    `C${P(xL + .55 * a, m - .012 * H)} ${P(xR - .40 * a, y0 + .46 * H)} ${P(xR - .30 * a, y0 + .40 * H)}` +
    `C${P(xR - .08 * a, y0 + .22 * H)} ${P(xR - .55 * a, y0 + .035 * H)} ${P(xR, y0)}Z`;
  return `<path d="${d}" class="brace" fill="currentColor"/>`;
}

export function systemSVG(sys, scale, extraClass = '') {
  return `<svg class="system ${extraClass}" viewBox="0 0 ${f(sys.w)} ${f(sys.h)}" width="${f(sys.w * scale)}" height="${f(sys.h * scale)}" xmlns="http://www.w3.org/2000/svg">${sys.svg}</svg>`;
}

export { CLEFS };

/* small icons for the editing toolbar, drawn with the same glyphs */
export function glyphIcon(kind, arg, arg2) {
  if (kind === 'note') return `<svg class="glyph" viewBox="-1.4 -2.6 2.8 4.6" aria-hidden="true">${noteGlyph({ v: arg, col: false }, 0, .9, true, 'white')}</svg>`;
  if (kind === 'clef') {
    const c = CLEFS[arg], st = arg2 || 'white', w = clefWidth(c, st);
    const lines = [0, 1, 2, 3, 4].map(k => `<path d="M-.3 ${k}H${f(w + 1.4)}" class="staffline"/>`).join('');
    return `<svg class="glyph clefpick" viewBox="-.5 -2.4 ${f(w + 2)} 8.8" aria-hidden="true">${lines}${clefGlyph(c, 5 - c.line, st, 5)}</svg>`;
  }
  if (kind === 'rest') return `<svg class="glyph" viewBox="-1 -1.6 2 3.2" aria-hidden="true">${restGlyph({ v: 'B' }, 0, .6)}</svg>`;
  if (kind === 'acc') return `<svg class="glyph" viewBox="-.9 -1.7 1.8 3.4" aria-hidden="true">${accidental(arg, .45, 0, false)}</svg>`;
  return '';
}
