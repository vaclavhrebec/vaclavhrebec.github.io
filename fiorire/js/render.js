/* Fiorire: a small engraver for white-mensural-style notation (diamond heads, square breves) on five-line staves. */
import { CLEFS } from '../../gym/cantare/js/music.js';
import { BRAVURA } from '../../gym/cantare/js/bravura.js';

const VALS = [16, 8, 4, 2, 1, .5, .25];
function shape(len) { let base = VALS.find(v => Math.abs(len - v) < 1e-9), dot = false; if (!base) { base = VALS.find(v => Math.abs(len - 1.5 * v) < 1e-9); dot = !!base; } if (!base) { base = VALS.find(v => v <= len + 1e-9) || .25; } return { base, dot }; }
const acc = (kind, x, y, k) => { const g = BRAVURA[kind === 'b' ? 'E260' : kind === '#' ? 'E262' : 'E261']; return g ? `<path d="${g.d}" transform="translate(${x} ${y}) scale(${k} ${-k})"/>` : ''; };

export function engrave(exps, voices, o) {
  const sp = o.sp || 8, W = o.width || 700, k = sp / 250;
  const times = [...new Set(exps.flatMap(v => v.map(n => +n.t.toFixed(4))))].sort((a, b) => a - b);
  const end = Math.max(0, ...exps.map(v => v.length ? v[v.length - 1].t + v[v.length - 1].len : 0));
  const colOf = new Map(times.map((t, i) => [t, i]));
  const hasAcc = times.map(() => false);
  exps.forEach(v => v.forEach(n => { if (!n.rest && /[b#n]/.test(n.acc || '')) hasAcc[colOf.get(+n.t.toFixed(4))] = true; }));
  const colW = times.map((t, i) => { const g = (times[i + 1] ?? end) - t; return sp * (2 + 1.15 * Math.log2(1 + g / .25)) + (hasAcc[i] ? sp * 1.1 : 0); });
  const left = sp * 6.2, usable = Math.max(sp * 12, W - left - sp);
  const systems = []; let cur = { a: 0, w: 0 };
  for (let i = 0; i < times.length; i++) { if (cur.w + colW[i] > usable && i > cur.a) { systems.push({ a: cur.a, b: i }); cur = { a: i, w: 0 }; } cur.w += colW[i]; }
  systems.push({ a: cur.a, b: times.length });
  const nV = exps.length, vh = sp * 11.5, sysH = nV * vh + sp * 2.5;
  let svg = '', y0 = 0;
  const bottomOf = voices.map(v => CLEFS[v.clef]?.bottom ?? 30);
  systems.forEach(sy => {
    const xs = []; let x = left; for (let i = sy.a; i < sy.b; i++) { xs[i] = x; x += colW[i]; }
    const xEnd = x;
    const tA = times[sy.a], tB = sy.b < times.length ? times[sy.b] : end + 1e-6;
    /* beat ticks every 8 minims */
    for (let m = Math.ceil(tA / 8) * 8; m < tB - 1e-9; m += 8) { let i = sy.a; while (i < sy.b - 1 && times[i + 1] <= m + 1e-9) i++; const xx = times[i] >= m - 1e-9 ? xs[i] - sp * .45 : xs[i] + colW[i] - sp * .2; svg += `<line class="tick" x1="${xx}" x2="${xx}" y1="${y0 + sp * 3.3}" y2="${y0 + (nV - 1) * vh + sp * 7.6}"/>`; }
    voices.forEach((v, vi) => {
      const top = y0 + vi * vh + sp * 3.6, ybot = top + 4 * sp, b = bottomOf[vi];
      const Y = s => ybot - (s - b) * sp / 2;
      for (let l = 0; l < 5; l++) svg += `<line class="staff" x1="${sp * 1}" x2="${xEnd}" y1="${top + l * sp}" y2="${top + l * sp}"/>`;
      const cl = CLEFS[v.clef] || { kind: 'G', line: 2 }; const clY = ybot - (cl.line - 1) * sp;
      svg += `<text class="clef" x="${sp * 2.2}" y="${clY + sp * .85}" font-size="${sp * 3}">${cl.kind === 'Γ' ? 'Γ' : cl.kind}</text>`;
      svg += `<text class="vname" x="${sp * 0.2}" y="${top + sp * 2.6}" font-size="${sp * 1.2}">${(v.name || '')[0] || ''}</text>`;
      if (o.bflat) { const bs = [6, 13, 20, 27, 34].map(s => s + 0).reduce((p, s) => Math.abs(Y(s) - (top + 2 * sp)) < Math.abs(Y(p) - (top + 2 * sp)) ? s : p); svg += `<g class="sig">${acc('b', sp * 4.8, Y(bs), k)}</g>`; }
      const ex = exps[vi];
      for (let ni = 0; ni < ex.length; ni++) {
        const n = ex[ni], ci = colOf.get(+n.t.toFixed(4)); if (ci < sy.a || ci >= sy.b) continue;
        const cx = xs[ci] + sp * (hasAcc[ci] ? 2.1 : 1);
        const cls = (n.dim ? 'dim' : '') + (o.sel && o.sel.v === vi && o.sel.k === n.k && !n.dim ? ' sel' : '') + (o.sel && o.sel.v === vi && o.sel.k === n.k && n.dim ? ' sel' : '');
        const tag = `class="n ${cls}" data-v="${vi}" data-k="${n.k}" data-t="${n.t}"`;
        if (n.rest) {
          const L = n.len;
          if (L >= 8) { const nb = Math.round(L / 4); svg += `<g ${tag}><rect class="restbar" x="${cx - sp * 1.2}" y="${top + sp * 1.5}" width="${sp * 2.4}" height="${sp}" /><text class="rnum" x="${cx}" y="${top - sp * .4}" font-size="${sp * 1.1}">${nb}</text></g>`; }
          else if (L >= 4) svg += `<g ${tag}><rect class="restr" x="${cx - sp * .25}" y="${top + sp}" width="${sp * .5}" height="${sp}"/></g>`;
          else if (L >= 2) svg += `<g ${tag}><rect class="restr" x="${cx - sp * .6}" y="${top + 2 * sp}" width="${sp * 1.2}" height="${sp * .5}"/></g>`;
          else svg += `<g ${tag}><rect class="restr" x="${cx - sp * .5}" y="${top + 2.5 * sp}" width="${sp}" height="${sp * .5}"/></g>`;
          continue;
        }
        const cy = Y(n.step), { base, dot } = shape(n.len), hw = sp * .78, hh = sp * .5;
        let g = '';
        for (let ly = top - sp; ly >= cy - sp * .01 && cy < top - sp * .4; ly -= sp) g += `<line class="ledger" x1="${cx - sp * 1.1}" x2="${cx + sp * 1.1}" y1="${ly}" y2="${ly}"/>`;
        for (let ly = ybot + sp; ly <= cy + sp * .01 && cy > ybot + sp * .4; ly += sp) g += `<line class="ledger" x1="${cx - sp * 1.1}" x2="${cx + sp * 1.1}" y1="${ly}" y2="${ly}"/>`;
        if (/[b#n]/.test(n.acc || '')) g += `<g class="acc">${acc(n.acc, cx - sp * 1.5, cy, k)}</g>`;
        const down = cy < top + 2 * sp, fill = base <= .5;
        if (base >= 4) g += `<rect class="head ${base >= 8 ? 'long' : ''}" x="${cx - hw}" y="${cy - hh}" width="${hw * 2}" height="${hh * 2}"/>${base >= 8 ? `<line class="stem" x1="${cx + hw}" y1="${cy}" x2="${cx + hw}" y2="${cy + sp * 3}"/>` : ''}`;
        else {
          g += `<path class="head ${fill ? 'full' : ''}" d="M${cx - hw} ${cy} L${cx} ${cy - hh * 1.05} L${cx + hw} ${cy} L${cx} ${cy + hh * 1.05} Z"/>`;
          if (base <= 1) { const sx = down ? cx - hw * .55 : cx + hw * .55, sy1 = down ? cy + sp * .2 : cy - sp * .2, sy2 = down ? cy + sp * 3.2 : cy - sp * 3.2; g += `<line class="stem" x1="${sx}" y1="${sy1}" x2="${sx}" y2="${sy2}"/>`; if (base <= .25) g += `<path class="flag" d="M${sx} ${sy2} q${sp * .9} ${down ? -sp * .6 : sp * .6} ${sp * .5} ${down ? -sp * 1.5 : sp * 1.5}"/>`; }
        }
        if (dot) g += `<circle class="dot" cx="${cx + hw + sp * .55}" cy="${cy - (Math.round((ybot - cy) / sp * 2) % 2 === 0 ? sp * .5 : 0)}" r="${sp * .17}"/>`;
        svg += `<g ${tag}>${g}<rect class="hit" x="${cx - sp * 1.3}" y="${cy - sp}" width="${sp * 2.6}" height="${sp * 2}"/></g>`;
      }
    });
    y0 += sysH;
  });
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" class="score" viewBox="0 0 ${W} ${y0 + sp}" width="${W}" height="${y0 + sp}">${svg}</svg>`, height: y0 };
}
