/* Engraving: turns a piece into SVG. Units are staff spaces (distance between two staff lines); y grows downward. */
import { CLEFS, alterationOf, clefFor } from './music.js';
import { BRAVURA } from './bravura.js';
import { MS } from './manuscript.js';

/* notation font: 'manuscript' (shapes cut from a c.1500 choirbook) or 'bravura' (SMuFL). Chant always uses the plain forms. */
let FONT = 'manuscript';
export const setFont = k => { FONT = k === 'bravura' ? 'bravura' : 'manuscript'; };
const ms = style => FONT === 'manuscript' && style !== 'chant';
const mp = (k, x, y, sx = 1, sy = sx) => `<path d="${MS[k].d}" transform="translate(${f(x)} ${f(y)})${sx === 1 && sy === 1 ? '' : ` scale(${sx} ${sy})`}" class="fill" fill-rule="evenodd"/>`;
const stemPath = (x, y0, y1) => `<path d="M${f(x - .035)} ${f(y0)}L${f(x - .028)} ${f(y1)}H${f(x + .028)}L${f(x + .035)} ${f(y0)}Z" class="fill"/>`;
const flagPath = (x, y, up) => { const s = up ? 1 : -1; return `<path d="M${f(x - .03)} ${f(y)}C${f(x + .35)} ${f(y + s * .1)} ${f(x + .75)} ${f(y + s * .5)} ${f(x + .6)} ${f(y + s * 1.2)}C${f(x + .5)} ${f(y + s * .75)} ${f(x + .3)} ${f(y + s * .55)} ${f(x - .03)} ${f(y + s * .5)}Z" class="fill"/>`; };

const f = n => Math.round(n * 100) / 100;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- glyphs (Bravura outlines) ---------- */
const U = .004; /* one font unit in staff spaces */
const gw = c => BRAVURA[c].w * U;
/* glyph with its font origin at (x, y) */
const go = (c, x, y, sx = 1, cls = 'fill') => `<path d="${BRAVURA[c].d}" transform="translate(${f(x)} ${f(y)}) scale(${f(U * sx * 1e3) / 1e3} ${-f(U * sx * 1e3) / 1e3})" class="${cls}"/>`;
/* glyph with its bounding box centred on (cx, cy) */
const gc = (c, cx, cy, sx = 1, cls = 'fill') => {
  const g = BRAVURA[c];
  return go(c, cx - (g.x + g.w / 2) * U * sx, cy + (g.y + g.h / 2) * U * sx, sx, cls);
};

const CLEF_CODE = { mensural: { C: 'E905', F: 'E903', G: 'E900' }, chant: { C: 'E906', F: 'E902', G: 'E906' } };
const clefCode = (clef, style) => CLEF_CODE[style === 'chant' ? 'chant' : 'mensural'][clef.kind];
const msClef = (clef, style) => (ms(style) && (clef.kind === 'C' || clef.kind === 'F')) ? (clef.kind === 'C' ? 'clefC' : 'clefF') : null;
const clefWidth = (clef, style) => { const k = msClef(clef, style); return k ? MS[k].w : gw(clefCode(clef, style)); };

/* y: vertical position of the line the clef sits on */
function clefGlyph(clef, y, style, lines = 5) {
  const k = msClef(clef, style);
  let g = k ? mp(k, MS[k].w / 2, k === 'clefF' ? (lines - 1) / 2 : y) : go(clefCode(clef, style), 0, y);
  if (clef.shift) g += `<text x="${f(clefWidth(clef, style) / 2)}" y="${f(y + 2.55)}" class="clefnum" text-anchor="middle">8</text>`;
  return g;
}

const ACC_CODE = { b: 'E260', n: 'E261', '#': 'E262' };
/* x is the right edge of the sign */
const accidental = (acc, x, y, small, style = 'white') => {
  if (acc === 'b' && ms(style)) return mp('flat', x - MS.flat.w / 2 - (small ? .1 : 0), y, small ? .75 : 1);
  /* in chant the signs are smaller, in proportion to the square notes */
  const k = style === 'chant' ? (small ? .5 : .66) : (small ? .7 : 1);
  return go(ACC_CODE[acc], x - gw(ACC_CODE[acc]) * k, y, k);
};

/* a note head and stem; style: 'chant' | 'white' | 'black' */
function noteGlyph(n, x, y, up, style) {
  if (style === 'chant') {
    let g = `<rect x="${f(x - .5)}" y="${f(y - .44)}" width="1" height=".88" class="fill"/>`;
    if (n.v === 'L') g += `<path d="M${f(x + .43)} ${f(y)}v1.7" class="stroke thick"/>`;
    return g;
  }
  const black = style === 'black' || n.col;
  if (ms(style)) return msNote(n, x, y, up, black);
  let g = '', halfW, stem = null;
  if (n.v === 'Mx' || n.v === 'L' || n.v === 'B') {
    halfW = n.v === 'Mx' ? 1.05 : .6;
    g = `<rect x="${f(x - halfW)}" y="${f(y - .46)}" width="${f(halfW * 2)}" height=".92" class="${black ? 'fill' : 'hollow'}"/>`;
    if (n.v !== 'B') stem = up ? 'E93E' : 'E93F';
  } else {
    const head = n.v === 'S' ? (black ? 'E938' : 'E939') : n.v === 'M' ? (black ? 'E938' : 'E93C') : (black || n.v === 'Sm' || n.v === 'F' ? (style === 'white' ? 'E93D' : 'E938') : 'E938');
    g = gc(head, x, y);
    halfW = BRAVURA[head].w * U / 2;
    if (n.v === 'M') stem = up ? 'E93E' : 'E93F';
    if (n.v === 'Sm') stem = up ? 'E949' : 'E94A';
    if (n.v === 'F') stem = up ? 'E94B' : 'E94C';
  }
  if (stem) g += go(stem, up ? x + halfW - .13 : x - halfW, y);
  return g;
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
  const code = { Mx: 'E9F0', L: 'E9F2', B: 'E9F3', S: 'E9F4', M: 'E9F5', Sm: 'E9F6', F: 'E9F7' }[n.v];
  return go(code, x - gw(code) / 2, midLine);
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
      if (e.n.text) textW = Math.max(textW, e.n.text.length * .62 + (e.n.hyphen ? .6 : .3));
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
        c.need = 1 + (a && b && a.step === b.step ? .3 : 0) + (b && b.acc && !b.ficta ? .9 : 0);
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

/* ---------- a system (one line of music for one or more voices) ---------- */
function flatStep(bottom, lines) {
  const mid = bottom + lines - 1;
  let best = null;
  for (let s = bottom - 2; s <= bottom + 2 * (lines - 1) + 2; s++) if (((s % 7) + 7) % 7 === 6 && (best === null || Math.abs(s - mid) < Math.abs(best - mid))) best = s;
  return best;
}

const hasSign = piece => piece.kind !== 'chant' && !piece.talea;
const HEAD = (piece, clef) => clefWidth(clef, styleOf(piece)) + .5 + (piece.bflat ? 1.2 : 0) + (hasSign(piece) ? 2.1 : 0) + .6;
export const headWidth = (piece, clef) => HEAD(piece, clef);

/* Draw one staff for one voice over the given columns. Returns {svg, top, bottom} relative to the staff's top line. */
function drawStaff(piece, vi, cols, xs, opts) {
  const voice = piece.voices[vi], clef = clefFor(opts.clefs?.[vi] || voice.clef), lines = piece.lines, style = styleOf(piece);
  const state = opts.state?.[vi] || 'on'; /* on | mute | hide */
  const yOf = step => (lines - 1) - (step - clef.bottom) / 2;
  const mid = (lines - 1) / 2, restLine = lines > 4 ? 2 : 1;
  const total = xs.end;
  let svg = '';
  for (let k = 0; k < lines; k++) svg += `<path d="M0 ${k}H${f(total)}" class="staffline"/>`;
  svg += clefGlyph(clef, lines - clef.line, style, lines);
  const cw = clefWidth(clef, style);
  if (piece.bflat) {
    const y = yOf(flatStep(clef.bottom, lines) ?? clef.bottom + 2);
    svg += accidental('b', cw + .5 + .9, y, false, style);
  }
  if (hasSign(piece)) {
    const sx = HEAD(piece, clef) - .6 - 1.6;
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
  cols.forEach((c, k) => {
    const e = c.notes[vi];
    if (!e) return;
    const { n, i } = e;
    const x = xs.at[k];
    if (n.rest) {
      body += `<g class="note" data-v="${vi}" data-i="${i}" data-t="${n.t}" data-len="${n.len}">${restGlyph(n, x + .55, restLine, style)}</g>`;
      return;
    }
    const step = n.step + shift;
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
    top = Math.min(top, y - .7, stems && stemUp ? y - 3.4 : 99);
    const low = Math.max(y + .7, stems && !stemUp ? y + 3.4 : -99, style === 'chant' && n.v === 'L' ? y + 1.8 : -99);
    bottom = Math.max(bottom, low);
    lowest = Math.max(lowest, low);
    notesHere.push({ n, x, k });
    body += `<g class="note" data-v="${vi}" data-i="${i}" data-t="${n.t}" data-len="${n.len}">${g}<rect x="${f(x - .8)}" y="${f(Math.min(y, 0) - 1)}" width="1.6" height="${f(Math.abs(Math.max(y, lines - 1) - Math.min(y, 0)) + 2)}" class="hit"/></g>`;
  });
  /* text underlay */
  const base = Math.max(textY, lowest + 1.3);
  notesHere.forEach(({ n, x, k }, j) => {
    if (!n.text) return;
    words += `<text x="${f(x - .5)}" y="${f(base)}" class="lyric">${esc(n.text)}</text>`;
    if (n.hyphen) {
      const nxt = notesHere[j + 1];
      const x2 = nxt ? nxt.x - .5 : xs.end;
      const hx = (x - .5 + n.text.length * .62 + x2) / 2;
      if (x2 - (x - .5) > n.text.length * .62 + .7) words += `<text x="${f(hx)}" y="${f(base)}" class="lyric" text-anchor="middle">-</text>`;
    }
  });
  const hasWords = piece.voices[vi].lyrics && notesHere.some(e => e.n.text);
  bottom = Math.max(bottom, hasWords ? base + .6 : bottom);
  let cap = '';
  if (state === 'hide') {
    return { top: -.6, bottom: lines - 1 + 1.2, svg: svg.replace(/class="staffline"/g, 'class="staffline dim"') + `<text x="${f(total / 2)}" y="${f(mid + .35)}" class="hidden-note" text-anchor="middle">${opts.t?.hidden || 'improvise this voice'}</text>` };
  }
  const label = voice.name && opts.names ? `<text x="${f(HEAD(piece, clef))}" y="${f(top - .1)}" class="vname">${esc(voice.name)}</text>` : '';
  cap = label;
  return { top, bottom, svg: svg + `<g class="${state === 'mute' ? 'muted' : ''}">${body}${words}</g>` + cap };
}

/* Place the columns on lines of the given width (in staff spaces). Returns arrays of column ranges. */
export function breakLines(cols, width, headW) {
  const out = [];
  let start = 0, used = 0, head = 0;
  for (let k = 0; k < cols.length; k++) {
    if (!cols[k].ligature) head = k;
    const w = cols[k].need;
    if (k > start && used + w > width - headW) {
      /* never break inside a ligature: the whole syllable moves to the next line */
      const at = cols[k].ligature ? head : k;
      if (at > start) { out.push([start, at]); start = at; used = 0; for (let j = at; j < k; j++) used += cols[j].need; }
    }
    used += w;
  }
  if (start < cols.length) out.push([start, cols.length]);
  return out;
}

/* Engrave the systems for the voices `vidx` of a piece. */
export function engraveSystems(piece, vidx, width, opts = {}) {
  const cols = buildColumns(piece, vidx);
  const clefOf = vi => clefFor(opts.clefs?.[vi] || piece.voices[vi].clef);
  const headW = Math.max(...vidx.map(v => HEAD(piece, clefOf(v))));
  const ranges = breakLines(cols, width, headW);
  if (!ranges.length) ranges.push([0, 0]); /* nothing written yet: one empty staff */
  const gap = opts.gap ?? 2.4;
  return ranges.map(([a, b], si) => {
    const slice = cols.slice(a, b);
    const natural = slice.reduce((a, c) => a + c.need, 0);
    const last = b >= cols.length;
    const stretch = last || opts.justify === false ? 1 : Math.min(Math.max((width - headW) / natural, 1), piece.kind === 'chant' ? 1.4 : 2.6);
    const at = [];
    let x = headW;
    slice.forEach(c => { at.push(x + .35); x += c.need * (c.tight ? 1 : stretch); });
    const xs = { at, end: slice.length && !(last && opts.fullLast) ? Math.min(Math.max(x, headW + 2), width) : width };
    let y = 0, svg = '';
    const staves = vidx.map(vi => {
      const s = drawStaff(piece, vi, slice, xs, opts);
      const place = { vi, y: y - s.top };
      svg += `<g transform="translate(0 ${f(place.y)})" data-voice="${vi}">${s.svg}</g>`;
      y += (s.bottom - s.top) + gap;
      return place;
    });
    const h = y - gap;
    const t0 = slice.length ? slice[0].t : 0, t1 = b < cols.length ? cols[b].t : piece.end;
    return { svg, w: xs.end, h, t0, t1, from: a, to: b, staves };
  });
}

export function systemSVG(sys, scale, extraClass = '') {
  return `<svg class="system ${extraClass}" viewBox="0 0 ${f(sys.w)} ${f(sys.h)}" width="${f(sys.w * scale)}" height="${f(sys.h * scale)}" xmlns="http://www.w3.org/2000/svg">${sys.svg}</svg>`;
}

export { CLEFS };

/* small icons for the editing toolbar, drawn with the same glyphs */
export function glyphIcon(kind, arg) {
  if (kind === 'note') return `<svg class="glyph" viewBox="-1.4 -2.6 2.8 4.6" aria-hidden="true">${noteGlyph({ v: arg, col: false }, 0, .9, true, 'white')}</svg>`;
  if (kind === 'rest') return `<svg class="glyph" viewBox="-1 -1.6 2 3.2" aria-hidden="true">${restGlyph({ v: 'B' }, 0, .6)}</svg>`;
  if (kind === 'acc') return `<svg class="glyph" viewBox="-.9 -1.7 1.8 3.4" aria-hidden="true">${accidental(arg, .45, 0, false)}</svg>`;
  return '';
}
