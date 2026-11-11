/* Ear training — notation drawn as inline SVG.
   Units: SP = one staff space. Glyph outlines come from glyphs.js. */
'use strict';
(function () {
  const N = E.notation = {};
  const G = E.GLYPHS;
  const f = v => +v.toFixed(2);

  N.glyph = (name, x, y, size, SP, cls) =>
    `<path${cls ? ` class="${cls}"` : ''} d="${G[name].d}" transform="translate(${f(x)},${f(y)}) scale(${f(size * SP)})"/>`;
  N.line = (x1, y1, x2, y2, w, cls) =>
    `<line${cls ? ` class="${cls}"` : ''} x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke-width="${f(w)}"/>`;
  N.staff = (x0, x1, top, SP) => {
    let s = '';
    for (let i = 0; i < 5; i++) s += N.line(x0, top + i * SP, x1, top + i * SP, SP * .1, 'stl');
    return s;
  };
  N.head = (x, y, SP, hollow, cls) => hollow
    ? `<g${cls ? ` class="${cls}"` : ''}><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(SP * .66)}" ry="${f(SP * .47)}" transform="rotate(-20 ${f(x)} ${f(y)})"/>` +
      `<ellipse class="hole" cx="${f(x)}" cy="${f(y)}" rx="${f(SP * .5)}" ry="${f(SP * .22)}" transform="rotate(-38 ${f(x)} ${f(y)})"/></g>`
    : `<ellipse${cls ? ` class="${cls}"` : ''} cx="${f(x)}" cy="${f(y)}" rx="${f(SP * .66)}" ry="${f(SP * .47)}" transform="rotate(-20 ${f(x)} ${f(y)})"/>`;

  /* ---------- clefs ---------- */
  // bottom line pitch as diatonic number (octave*7 + letter), and how to draw
  N.CLEFS = {
    treble:  { bottom: 4 * 7 + 2, draw: (x, top, SP) => N.glyph('gclef', x, top + 4 * SP, 6, SP) },
    bass:    { bottom: 2 * 7 + 4, draw: (x, top, SP) => N.glyph('fclef', x, top + SP + .57 * 5.5 * SP, 5.5, SP) },
    soprano: { bottom: 4 * 7 + 0, draw: (x, top, SP) => N.glyph('cclef', x, top + 4 * SP + .37 * 5.1 * SP, 5.1, SP) },
    alto:    { bottom: 3 * 7 + 3, draw: (x, top, SP) => N.glyph('cclef', x, top + 2 * SP + .37 * 5.1 * SP, 5.1, SP) },
    tenor:   { bottom: 3 * 7 + 1, draw: (x, top, SP) => N.glyph('cclef', x, top + 1 * SP + .37 * 5.1 * SP, 5.1, SP) }
  };
  N.clefWidth = SP => SP * 3.6;

  /* ---------- key signatures ----------
     Positions as pitches (diatonic numbers), in the order the accidentals are written. */
  const d = (letter, oct) => oct * 7 + 'CDEFGAB'.indexOf(letter);
  const P = s => s.split(' ').map(x => d(x[0], +x[1]));
  const KEYPOS = {
    treble:  { sharp: P('F5 C5 G5 D5 A4 E5 B4'), flat: P('B4 E5 A4 D5 G4 C5 F4') },
    bass:    { sharp: P('F3 C3 G3 D3 A2 E3 B2'), flat: P('B2 E3 A2 D3 G2 C3 F2') },
    alto:    { sharp: P('F4 C4 G4 D4 A3 E4 B3'), flat: P('B3 E4 A3 D4 G3 C4 F3') },
    tenor:   { sharp: P('F3 C4 G3 D4 A3 E4 B3'), flat: P('B3 E4 A3 D4 G3 C4 F3') },
    soprano: { sharp: P('F4 C5 G4 D5 A4 E4 B4'), flat: P('B4 E5 A4 D5 G4 C5 F4') }
  };
  const ACC_CTR = { sharp: (G.sharp.bb[1] + G.sharp.bb[3]) / 2, natural: (G.natural.bb[1] + G.natural.bb[3]) / 2, flat: -.2 };
  N.acc = (kind, x, y, SP, size) => { size = size || 3; return N.glyph(kind, x, y - ACC_CTR[kind] * size * SP, size, SP); };
  N.yOf = (clef, dia, top, SP) => top + 4 * SP - (dia - N.CLEFS[clef].bottom) * SP / 2;
  N.keySig = function (clef, fifths, x, top, SP) {
    const kind = fifths > 0 ? 'sharp' : 'flat', n = Math.abs(fifths);
    let s = '';
    for (let i = 0; i < n; i++) s += N.acc(kind, x + i * SP * 1.15, N.yOf(clef, KEYPOS[clef][kind][i], top, SP), SP);
    return { svg: s, w: n * SP * 1.15 };
  };

  /* a complete key-signature picture */
  N.keySigSVG = function (clef, fifths) {
    const SP = 12, top = 2.6 * SP, x0 = SP * 1.2;
    const ks = N.keySig(clef, fifths, x0 + N.clefWidth(SP) + SP * .6, top, SP);
    const w = Math.max(x0 + N.clefWidth(SP) + SP * .6 + ks.w + SP * 2.5, SP * 15);
    const H = top + 4 * SP + 2.4 * SP;
    return `<svg class="score" viewBox="0 0 ${f(w)} ${f(H)}" role="img">` +
      N.staff(0, w, top, SP) + N.CLEFS[clef].draw(x0, top, SP) + ks.svg +
      N.line(w - SP * .08, top, w - SP * .08, top + 4 * SP, SP * .16, 'stl') + '</svg>';
  };

  /* small notes on a staff (for icons and reveals): notes = [{dia, acc?, chord?}] */
  N.notesSVG = function (clef, notes, o) {
    o = o || {};
    const SP = o.SP || 10, top = (o.pad || 3) * SP;
    let x = SP * 1;
    let s = '';
    const clefW = o.noClef ? 0 : N.clefWidth(SP);
    x += clefW + SP * 1.2;
    const items = [];
    notes.forEach(n => {
      if (n.chord && items.length) items[items.length - 1].push(n); else items.push([n]);
    });
    items.forEach(col => {
      const hasAcc = col.some(n => n.acc);
      if (hasAcc) x += SP * 1.4;
      col.forEach(n => {
        const y = N.yOf(clef, n.dia, top, SP);
        // ledger lines
        const st = Math.round((top + 4 * SP - y) / (SP / 2));
        for (let l = -2; l >= st; l -= 2) s += N.line(x - SP, top + 4 * SP - l * SP / 2, x + SP, top + 4 * SP - l * SP / 2, SP * .1, 'stl');
        for (let l = 10; l <= st; l += 2) s += N.line(x - SP, top + 4 * SP - l * SP / 2, x + SP, top + 4 * SP - l * SP / 2, SP * .1, 'stl');
        if (n.acc) s += N.acc(n.acc, x - SP * 2.1, y, SP, 2.8);
        s += N.head(x, y, SP, o.hollow);
      });
      x += SP * (o.gap || 3);
    });
    const w = Math.max(x + SP * .5, o.minW || 0);
    const H = top + 4 * SP + (o.padB || 3) * SP;
    return `<svg class="score" viewBox="0 0 ${f(w)} ${f(H)}" role="img">` + N.staff(0, w, top, SP) +
      (o.noClef ? '' : N.CLEFS[clef].draw(SP, top, SP)) + s + '</svg>';
  };

  /* ================= rhythm engraving on a one-line staff =================
     example = { bars: [{ ts:[n,d], showTs:bool, ev:[event] }] }
     event = { rest:bool, v:'w'|'h'|'q'|'8'|'16'|'32', dot:0|1, tie:bool (to next),
               beam:id|null, tup:{id,n,m}|null, t: start time in quarters (absolute), d: real duration } */
  const LEVELS = { w: 0, h: 0, q: 0, '8': 1, '16': 2, '32': 3 };
  N.rhythmSVG = function (ex, width) {
    const SP = 9;
    const W = Math.max(300, width);
    const lineGap = SP * 12;
    // natural widths
    const adv = e => SP * (1.5 + 3.0 * Math.pow(e.d, .62)) + (e.dot ? SP * .6 : 0);
    const bars = ex.bars.map((b, i) => {
      const lead = SP * 1.6 + (b.showTs ? SP * 3.2 : 0);
      const ws = b.ev.map(adv);
      return { b, i, lead, ws, nat: lead + ws.reduce((a, c) => a + c, 0) + SP * .6 };
    });
    // break into lines
    const lines = []; let cur = [], curW = 0;
    bars.forEach(B => {
      if (cur.length && curW + B.nat > W - SP * 2) { lines.push(cur); cur = []; curW = 0; }
      cur.push(B); curW += B.nat;
    });
    if (cur.length) lines.push(cur);
    let s = '';
    const heads = [];
    let y = SP * 6;
    lines.forEach((ln, li) => {
      const nat = ln.reduce((a, B) => a + B.nat, 0);
      const last = li === lines.length - 1;
      const avail = W - SP * 1.5;
      const extra = (last && nat < avail * .72) ? 0 : (avail - nat);
      const flex = ln.reduce((a, B) => a + B.ws.reduce((x, c) => x + c, 0), 0);
      const k = 1 + extra / flex;
      let x = SP * .5;
      const x0 = x;
      ln.forEach(B => {
        const b = B.b;
        // barline before (except very first)
        x += SP * .4;
        if (b.showTs) {
          const tx = x + SP * 1.2;
          s += `<text class="ts" x="${f(tx)}" y="${f(y - SP * .25)}" font-size="${f(SP * 2.3)}" text-anchor="middle">${b.ts[0]}</text>`;
          s += `<text class="ts" x="${f(tx)}" y="${f(y + SP * 1.85)}" font-size="${f(SP * 2.3)}" text-anchor="middle">${b.ts[1]}</text>`;
          x += SP * 3.2;
        }
        x += SP * 1.2;
        b.ev.forEach((e, j) => { e._x = x + SP * .2; e._y = y; x += B.ws[j] * k; });
        x += SP * .6 - SP * .4;
        const end = (B === ln[ln.length - 1]) && last;
        if (end) { s += N.line(x - SP * .7, y - 2 * SP, x - SP * .7, y + 2 * SP, SP * .12, 'stl') + N.line(x - SP * .15, y - 2 * SP, x - SP * .15, y + 2 * SP, SP * .45, 'stl'); }
        else s += N.line(x, y - 2 * SP, x, y + 2 * SP, SP * .12, 'stl');
      });
      s = N.line(x0, y, x, y, SP * .1, 'stl') + s;
      // draw events of this line
      ln.forEach(B => s += drawEvents(B.b.ev, SP, heads));
      y += lineGap;
    });
    // ties may cross lines: draw as two halves
    ex.bars.forEach(b => b.ev.forEach(e => {
      if (!e.tie || !e._next) return;
      const a = e, z = e._next;
      if (Math.abs(a._y - z._y) < 1) s += tieArc(a._x + SP * .5, z._x - SP * .5, a._y + SP * .75, SP);
      else { s += tieArc(a._x + SP * .5, a._x + SP * 3, a._y + SP * .75, SP); s += tieArc(z._x - SP * 3, z._x - SP * .5, z._y + SP * .75, SP); }
    }));
    const H = y - lineGap + SP * 5;
    return { svg: `<svg class="score rhythm" viewBox="0 0 ${f(W)} ${f(H)}" width="${f(W)}" height="${f(H)}" role="img">${s}</svg>`, heads };
  };
  function tieArc(x1, x2, y, SP) {
    const h = Math.min(SP * 1.1, (x2 - x1) * .18 + SP * .3);
    return `<path class="tie" d="M${f(x1)} ${f(y)} C${f(x1 + (x2 - x1) * .25)} ${f(y + h)} ${f(x1 + (x2 - x1) * .75)} ${f(y + h)} ${f(x2)} ${f(y)} C${f(x1 + (x2 - x1) * .75)} ${f(y + h * .7)} ${f(x1 + (x2 - x1) * .25)} ${f(y + h * .7)} ${f(x1)} ${f(y)}Z"/>`;
  }
  function flag(x, y, n, SP) {
    let s = '';
    for (let k = 0; k < n; k++) {
      const yy = y + k * SP * .8;
      s += `<path d="M${f(x)} ${f(yy)} C${f(x + SP * .15)} ${f(yy + SP * 1.1)} ${f(x + SP * 1.45)} ${f(yy + SP * 1.5)} ${f(x + SP * .95)} ${f(yy + SP * 2.9)} C${f(x + SP * 1.2)} ${f(yy + SP * 1.8)} ${f(x + SP * .5)} ${f(yy + SP * 1.35)} ${f(x)} ${f(yy + SP * 1.05)}Z"/>`;
    }
    return s;
  }
  function drawEvents(evs, SP, heads) {
    let s = '';
    const stemLen = SP * 3.4, hw = SP * .62;
    // rests and heads
    evs.forEach(e => {
      const x = e._x, y = e._y;
      if (e.rest) {
        if (e.v === 'w') s += `<rect x="${f(x - SP * .65)}" y="${f(y)}" width="${f(SP * 1.3)}" height="${f(SP * .55)}"/>`;
        else if (e.v === 'h') s += `<rect x="${f(x - SP * .65)}" y="${f(y - SP * .55)}" width="${f(SP * 1.3)}" height="${f(SP * .55)}"/>`;
        else {
          const g = { q: 'r4', '8': 'r8', '16': 'r16', '32': 'r32' }[e.v], sz = e.v === 'q' ? 5.6 : 5;
          const c = (G[g].bb[1] + G[g].bb[3]) / 2, w = (G[g].bb[2] + G[g].bb[0]) / 2;
          s += N.glyph(g, x - w * sz * SP, y - c * sz * SP, sz, SP, 'rest');
        }
        if (e.dot) s += `<circle cx="${f(x + SP * 1.1)}" cy="${f(y - SP * .5)}" r="${f(SP * .2)}"/>`;
        return;
      }
      const id = 'h' + heads.length;
      heads.push({ id, t: e.t });
      s += `<g id="${id}" class="nh">` + N.head(x, y, SP, e.v === 'h' || e.v === 'w') + '</g>';
      if (e.dot) s += `<circle cx="${f(x + SP * 1.25)}" cy="${f(y - SP * .5)}" r="${f(SP * .2)}"/>`;
      if (e.v !== 'w' && !e.beam) {
        s += N.line(x + hw, y - SP * .1, x + hw, y - stemLen, SP * .13);
        if (LEVELS[e.v] > 0) s += flag(x + hw, y - stemLen, LEVELS[e.v], SP);
      }
    });
    // beams
    const groups = {};
    evs.forEach(e => { if (e.beam && !e.rest) (groups[e.beam] = groups[e.beam] || []).push(e); });
    Object.values(groups).forEach(g => {
      const yb = g[0]._y - stemLen;
      if (g.length === 1) { // lone beamable note: give it a flag
        const e = g[0];
        s += N.line(e._x + hw, e._y - SP * .1, e._x + hw, yb, SP * .13) + flag(e._x + hw, yb, LEVELS[e.v], SP);
        return;
      }
      g.forEach(e => s += N.line(e._x + hw, e._y - SP * .1, e._x + hw, yb, SP * .13));
      const bt = SP * .5, gap = SP * .8;
      const bar = (xa, xb, lvl) => `<rect x="${f(xa)}" y="${f(yb + lvl * gap)}" width="${f(xb - xa)}" height="${f(bt)}"/>`;
      s += bar(g[0]._x + hw - SP * .06, g[g.length - 1]._x + hw + SP * .06, 0);
      for (let lvl = 2; lvl <= 3; lvl++) {
        let i = 0;
        while (i < g.length) {
          if (LEVELS[g[i].v] >= lvl) {
            let j = i; while (j + 1 < g.length && LEVELS[g[j + 1].v] >= lvl) j++;
            if (j > i) s += bar(g[i]._x + hw - SP * .06, g[j]._x + hw + SP * .06, lvl - 1);
            else {
              const leftStub = i > 0 && (i === g.length - 1 || g[i - 1].dot);
              const xa = g[i]._x + hw;
              s += leftStub ? bar(xa - SP * 1.1, xa + SP * .06, lvl - 1) : bar(xa - SP * .06, xa + SP * 1.1, lvl - 1);
            }
            i = j + 1;
          } else i++;
        }
      }
    });
    // tuplets
    const tups = {};
    evs.forEach(e => { if (e.tup) (tups[e.tup.id] = tups[e.tup.id] || []).push(e); });
    Object.values(tups).forEach(g => {
      const n = g[0].tup.n, m = g[0].tup.m;
      const label = g[0].tup.ratio ? n + ':' + m : String(n);
      const x1 = g[0]._x - SP * .4, x2 = g[g.length - 1]._x + hw + SP * .3;
      const beamedAll = g.every(e => !e.rest && e.beam && e.beam === g[0].beam) && g.length > 1;
      const yb = g[0]._y - stemLen - SP * (beamedAll ? .9 : 1.7);
      const xm = (x1 + x2) / 2;
      if (!beamedAll) {
        const tw = SP * (label.length * .55 + .6);
        s += `<path class="tbr" d="M${f(x1)} ${f(yb + SP * .6)} V${f(yb)} H${f(xm - tw / 2)} M${f(xm + tw / 2)} ${f(yb)} H${f(x2)} V${f(yb + SP * .6)}" fill="none" stroke-width="${f(SP * .1)}"/>`;
      }
      s += `<text class="tn" x="${f(xm)}" y="${f(yb + SP * .45)}" font-size="${f(SP * 1.5)}" text-anchor="middle">${label}</text>`;
    });
    return s;
  }
})();
