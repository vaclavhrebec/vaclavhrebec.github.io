/* The Euler lattice (Tonnetz) in 2, 3 and 4 dimensions, with listening exercises.
   Every point is a pure ratio 3^a · 5^b · 7^c · 11^d, folded into one octave above c′. */
(function () {
  'use strict';
  const TU = window.TUNING;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  /* ---------- ratios and names ---------- */
  const PR = [3, 5, 7, 11];
  /* the note name of 3^a·5^b·7^c·11^d: letter from the fifths and thirds, plus Helmholtz–Ellis-style comma marks */
  const LET = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
  function name(v) {
    const [a, b, c, d] = v;
    const k = a + 4 * b;                         /* position on the line of fifths (C = 0); a major third is four fifths up … */
    const idx = k + 1, l = ((idx % 7) + 7) % 7, acc = Math.floor(idx / 7);
    let n = LET[l] + (acc > 0 ? '♯'.repeat(acc) : acc < 0 ? '♭'.repeat(-acc) : '');
    /* … minus a syntonic comma per third */
    const marks = [];
    if (b) marks.push((b > 0 ? '−' : '+') + (Math.abs(b) > 1 ? Math.abs(b) : '') + 'S');
    if (c) marks.push((c > 0 ? '↓' : '↑') + (Math.abs(c) > 1 ? Math.abs(c) : '') + '7');
    if (d) marks.push((d > 0 ? '↑' : '↓') + (Math.abs(d) > 1 ? Math.abs(d) : '') + '11');
    return {n, m: marks.join(' ')};
  }
  /* the letter name of a 7- or 11-step: the harmonic seventh is written as a (lowered) minor seventh, 11 as a raised fourth */
  function cents(v) {
    const x = PR.reduce((s, p, i) => s + (v[i] || 0) * 1200 * Math.log2(p), 0);
    return ((x % 1200) + 1200) % 1200;
  }
  function nameFull(v) {
    /* letters for 7 and 11: 7/4 → B♭ (minor seventh above C), 11/8 → F♯ (augmented fourth) */
    const base = [v[0] - 2 * (v[2] || 0) - (v[3] || 0), v[1], 0, 0];
    const nm = name(base), mk = [];
    if (v[1]) mk.push((v[1] > 0 ? '−' : '+') + (Math.abs(v[1]) > 1 ? Math.abs(v[1]) : '') + 'S');
    if (v[2]) mk.push((v[2] > 0 ? '−' : '+') + (Math.abs(v[2]) > 1 ? Math.abs(v[2]) : '') + 'Z');
    if (v[3]) mk.push((v[3] > 0 ? '+' : '−') + (Math.abs(v[3]) > 1 ? Math.abs(v[3]) : '') + 'U');
    return {n: nm.n, m: mk.join(' ')};
  }
  function ratio(v) {
    let num = 1, den = 1;
    PR.forEach((p, i) => { const e = v[i] || 0; if (e > 0) num *= Math.pow(p, e); else den *= Math.pow(p, -e); });
    while (num / den >= 2) den *= 2;
    while (num / den < 1) num *= 2;
    const g = (x, y) => y ? g(y, x % y) : x, k = g(num, den);
    return (num / k) + ':' + (den / k);
  }
  const hz = (v, oct) => cOne() * Math.pow(2, cents(v) / 1200 + (oct || 0));
  const cOne = () => TU.S.a4 * Math.pow(2, -9 / 12);          /* c′, equal-tempered from the chosen a′ */

  function play(vs, dur, gap, vol) {
    TU.stopAll();
    const c = TU.ac(), t0 = c.currentTime + .05;
    vs.forEach((v, i) => TU.tone(hz(v.v || v, v.o || 0), t0 + (gap ? i * gap : 0), dur, vol || (vs.length > 2 && !gap ? .1 : .15)));
  }
  function chord(vs, dur) { play(vs, dur || 2.6, 0); }

  /* ---------- 2D: fifths across, major thirds up (triangular layout, every triangle a triad) ---------- */
  const A2 = {a: [-4, 3], b: [-2, 2]};
  let trail = [];
  function draw2D() {
    const s = 84;
    const P = (a, b) => [(a + b * .5) * s, -b * s * .866];
    /* the drawing's own extent, with room for the circles and the legend underneath */
    const xs = [], ys = [];
    for (let a = A2.a[0]; a <= A2.a[1]; a++) for (let b = A2.b[0]; b <= A2.b[1]; b++) { const p = P(a, b); xs.push(p[0]); ys.push(p[1]); }
    const x0 = Math.min(...xs) - 30, y0 = Math.min(...ys) - 30, W = Math.max(...xs) + 30 - x0, H = Math.max(...ys) + 30 - y0 + 34;
    let o = `<svg viewBox="${x0} ${y0} ${W} ${H}" class="lat" role="img" aria-label="Euler lattice">`;
    /* triangles */
    for (let a = A2.a[0]; a < A2.a[1]; a++) for (let b = A2.b[0]; b <= A2.b[1]; b++) {
      if (b < A2.b[1]) {                      /* major: root, fifth, third */
        const p = [P(a, b), P(a + 1, b), P(a, b + 1)];
        o += `<polygon class="tri maj" data-ch="${a},${b},M" points="${p.map(x => x.join(',')).join(' ')}"><title>${name([a, b]).n} major</title></polygon>`;
      }
      if (b > A2.b[0]) {                      /* minor: root, minor third (= fifth up, third down), fifth */
        const p = [P(a, b), P(a + 1, b), P(a + 1, b - 1)];
        o += `<polygon class="tri min" data-ch="${a},${b},m" points="${p.map(x => x.join(',')).join(' ')}"><title>${name([a, b]).n} minor</title></polygon>`;
      }
    }
    /* edges */
    for (let a = A2.a[0]; a <= A2.a[1]; a++) for (let b = A2.b[0]; b <= A2.b[1]; b++) {
      const p = P(a, b);
      if (a < A2.a[1]) { const q = P(a + 1, b); o += `<line class="e5" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`; }
      if (b < A2.b[1]) { const q = P(a, b + 1); o += `<line class="e3" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`; }
      if (b < A2.b[1] && a > A2.a[0]) { const q = P(a - 1, b + 1); o += `<line class="em" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`; }
    }
    /* the walk */
    if (trail.length > 1) o += `<polyline class="trail" points="${trail.map(v => P(v[0], v[1]).join(',')).join(' ')}"/>`;
    /* nodes */
    for (let a = A2.a[0]; a <= A2.a[1]; a++) for (let b = A2.b[0]; b <= A2.b[1]; b++) {
      const p = P(a, b), nm = name([a, b]);
      o += `<g class="nd${a === 0 && b === 0 ? ' one' : ''}" data-v="${a},${b}" tabindex="0" role="button" aria-label="${nm.n} ${ratio([a, b])}">
        <circle cx="${p[0]}" cy="${p[1]}" r="23"/><text x="${p[0]}" y="${p[1] + (nm.m ? 1 : 5)}" class="nn">${nm.n}</text>${nm.m ? `<text x="${p[0]}" y="${p[1] + 14}" class="nm">${nm.m}</text>` : ''}<title>${ratio([a, b])} · ${cents([a, b]).toFixed(1)} c</title></g>`;
    }
    o += `<g class="axes"><text x="${x0 + 8}" y="${y0 + H - 10}"><tspan class="k5">— 3:2 fifth</tspan>   <tspan class="k3">— 5:4 major third</tspan>   <tspan class="km">- - 6:5 minor third</tspan>   ▲ major triad   ▼ minor triad</text></g>`;
    $('#lat2d').innerHTML = o + '</svg>';
    $('#lat2d').querySelectorAll('.nd').forEach(g => {
      const go = () => { const v = g.dataset.v.split(',').map(Number); walkTo(v); play([v], 1.4); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    $('#lat2d').querySelectorAll('.tri').forEach(tr => tr.addEventListener('click', () => {
      const [a, b, k] = tr.dataset.ch.split(','), A = +a, B = +b;
      const vs = k === 'M' ? [[A, B], [A, B + 1], [A + 1, B]] : [[A, B], [A + 1, B - 1], [A + 1, B]];
      /* voice the triad upwards from the root */
      chord(stack(vs), 2.8);
      tr.classList.add('lit'); setTimeout(() => tr.classList.remove('lit'), 900);
    }));
  }
  /* put chord members in ascending order inside about an octave and a half */
  function stack(vs) {
    let prev = -1, o = -1;
    return vs.map((v, i) => { let c = cents(v) + 1200 * o; while (c <= prev) { c += 1200; o++; } prev = c; return {v, o}; });
  }
  function walkTo(v) {
    trail.push(v); if (trail.length > 24) trail.shift();
    const st = trail[0], d = cents(v) - cents(st);
    const nm = name(v);
    $('#walk').innerHTML = `<b>${nm.n}</b> ${nm.m ? `<span class="nm2">${nm.m}</span>` : ''} = ${ratio(v)} · ${cents(v).toFixed(1)} c above C` +
      (Math.abs(v[1]) ? ` · ${Math.abs(v[1]) === 1 ? 'one syntonic comma' : Math.abs(v[1]) + ' syntonic commas'} ${v[1] > 0 ? 'lower' : 'higher'} than the Pythagorean ${nm.n}` : '');
    draw2D();
  }

  /* ---------- 3D: + the harmonic seventh 7:4; 4D: + the eleventh harmonic 11:8 (shown as layers) ---------- */
  const V3 = {rx: -0.38, ry: 0.42};
  let layer11 = 0, dims = 3;
  function draw3D() {
    const W = 760, H = 440, cx = W / 2, cy = H / 2 + 6, s = dims === 4 ? 76 : 100;
    const pts = [];
    if (dims === 4) [-1, 0, 1].forEach(d => { for (let a = -1; a <= 1; a++) for (let b = 0; b <= 1; b++) for (let c = 0; c <= 1; c++) pts.push([a, b, c, d]); });
    else for (let a = -2; a <= 2; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) pts.push([a, b, c, 0]);
    const cosx = Math.cos(V3.rx), sinx = Math.sin(V3.rx), cosy = Math.cos(V3.ry), siny = Math.sin(V3.ry);
    /* 3 along x, 5 along y, 7 along z; the 11-layers are pushed apart along a fourth direction drawn as an offset */
    function proj(v) {
      let x = v[0] + v[1] * .5, y = v[1] * .866, z = v[2];
      const x1 = x * cosy + z * siny, z1 = -x * siny + z * cosy;
      const y1 = y * cosx - z1 * sinx, z2 = y * sinx + z1 * cosx;
      /* the 11-copies sit side by side, each turned the same way: a fourth direction seen as a row of spaces */
      const f = 1 / (1 + z2 * .08);
      return [cx + (dims === 4 ? v[3] * 250 : 0) + x1 * s * f, cy - y1 * s * f, z2];
    }
    const key = v => v.join(',');
    const P = new Map(pts.map(v => [key(v), proj(v)]));
    let o = `<svg viewBox="0 0 ${W} ${H}" class="lat l3" role="img" aria-label="Lattice in ${dims} dimensions">`;
    const edges = [];
    pts.forEach(v => [[1, 0, 0, 0, 'e5'], [0, 1, 0, 0, 'e3'], [0, 0, 1, 0, 'e7'], [0, 0, 0, 1, 'e11']].forEach(([da, db, dc, dd, cl]) => {
      const w = [v[0] + da, v[1] + db, v[2] + dc, v[3] + dd];
      if (!P.has(key(w))) return;
      if (cl === 'e11' && (v[1] || v[2])) return;      /* show the 11-links only along the line of fifths, or the picture drowns */
      edges.push([P.get(key(v)), P.get(key(w)), cl]);
    }));
    edges.sort((x, y) => (x[0][2] + x[1][2]) - (y[0][2] + y[1][2])).reverse();
    edges.forEach(([p, q, cl]) => { o += `<line class="${cl}" x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}"/>`; });
    pts.map(v => [v, P.get(key(v))]).sort((x, y) => y[1][2] - x[1][2]).forEach(([v, p]) => {
      const nm = nameFull(v), r = (dims === 4 ? 13 : 16) / (1 + p[2] * .08);
      const cls = 'nd' + (v.every(x => !x) ? ' one' : '') + (v[2] ? ' z7' : '') + (v[3] ? ' z11' : '');
      o += `<g class="${cls}" data-v="${v.join(',')}" tabindex="0" role="button" aria-label="${nm.n} ${ratio(v)}"><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r.toFixed(1)}"/>` +
        `<text x="${p[0].toFixed(1)}" y="${(p[1] + 4).toFixed(1)}" class="nn" style="font-size:${(dims === 4 ? 11 : 13) / (1 + p[2] * .08)}px">${nm.n}</text><title>${ratio(v)} · ${cents(v).toFixed(1)} c${nm.m ? ' · ' + nm.m : ''}</title></g>`;
    });
    if (dims === 4) [-1, 0, 1].forEach(d => { o += `<text class="lay" x="${cx + d * 250}" y="${H - 14}">${d === 0 ? 'no 11' : d > 0 ? '× 11:8' : '× 8:11'}</text>`; });
    o += `<g class="axes"><text x="16" y="22"><tspan class="k5">— 3:2</tspan>  <tspan class="k3">— 5:4</tspan>  <tspan class="k7">— 7:4</tspan>${dims === 4 ? '  <tspan class="k11">— 11:8</tspan>' : ''}</text><text x="16" y="42" class="hint">drag to turn</text></g>`;
    $('#lat3d').innerHTML = o + '</svg>';
    $('#lat3d').querySelectorAll('.nd').forEach(g => {
      const go = () => { const v = g.dataset.v.split(',').map(Number); play([v], 1.4); const nm = nameFull(v); $('#walk3').innerHTML = `<b>${nm.n}</b> ${nm.m ? `<span class="nm2">${nm.m}</span>` : ''} = ${ratio(v)} · ${cents(v).toFixed(1)} c above C`; };
      g.addEventListener('click', go);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }
  function drag3D() {
    const el = $('#lat3d'); let d = null;
    el.addEventListener('pointerdown', e => { if (e.target.closest('.nd')) return; d = {x: e.clientX, y: e.clientY, rx: V3.rx, ry: V3.ry}; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => { if (!d) return; V3.ry = d.ry + (e.clientX - d.x) / 160; V3.rx = Math.max(-1.4, Math.min(1.4, d.rx + (e.clientY - d.y) / 160)); draw3D(); });
    el.addEventListener('pointerup', () => { d = null; });
    el.addEventListener('pointercancel', () => { d = null; });
  }

  /* ---------- demos ---------- */
  const DEMO = {
    pump: () => {
      /* C – Am – Dm – G – C, every step pure with the common tones kept: the final C is a syntonic comma lower */
      const steps = [[[0, 0], [0, 1], [1, 0]], [[-1, 1], [0, 0], [0, 1]], [[-2, 1], [-3, 1], [-1, 1]], [[-3, 1], [-3, 2], [-2, 1]], [[-4, 1], [-4, 2], [-3, 1]]];
      TU.stopAll(); const c = TU.ac(), t0 = c.currentTime + .05;
      steps.forEach((ch, i) => stack(ch).forEach(x => TU.tone(hz(x.v, x.o - 1), t0 + i * 1.5, 1.45, .1)));
      TU.tone(hz([0, 0], -1), t0 + steps.length * 1.5, 1.6, .1); TU.tone(hz([0, 0], 0), t0 + steps.length * 1.5, 1.6, .1);
      trail = [[0, 0], [-1, 1], [-2, 1], [-3, 1], [-4, 1]]; draw2D();
      $('#walk').innerHTML = 'C → A minor → D minor → G major → C major, every chord pure, every common tone held: the last C (−S) is 21.5 c lower than the first. At the end the original C sounds again for comparison.';
    },
    sev: () => chord(stack([[0, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]]), 3.2),
    sevET: () => { TU.stopAll(); const c = TU.ac(), t0 = c.currentTime + .05; [0, 400, 700, 1000].forEach(x => TU.tone(cOne() * Math.pow(2, x / 1200 - 1), t0, 3.2, .1)); },
    sevs: () => { TU.stopAll(); const c = TU.ac(), t0 = c.currentTime + .05; [[16 / 9, 'Pythagorean 16:9'], [9 / 5, 'just 9:5'], [Math.pow(2, 10 / 12), 'equal 1000 c'], [7 / 4, 'harmonic 7:4']].forEach(([r], i) => { TU.tone(cOne() / 2, t0 + i * 1.7, 1.6, .13); TU.tone(cOne() / 2 * r, t0 + i * 1.7, 1.6, .13); }); },
    sub: () => chord(stack([[0, 0, 0], [-1, 0, 1], [1, 0, 0]]), 3),
    otonal: () => chord([{v: [0, 0, 0, 0], o: -1}, {v: [0, 1, 0, 0], o: -1}, {v: [1, 0, 0, 0], o: -1}, {v: [0, 0, 1, 0], o: -1}, {v: [2, 0, 0, 0], o: 0}, {v: [0, 0, 0, 1], o: 0}], 3.4),
    eleven: () => { TU.stopAll(); const c = TU.ac(), t0 = c.currentTime + .05; [[4 / 3, 0], [11 / 8, 1.8], [Math.SQRT2, 3.6], [45 / 32, 5.4]].forEach(([r, at]) => { TU.tone(cOne() / 2, t0 + at, 1.7, .13); TU.tone(cOne() / 2 * r, t0 + at, 1.7, .13); }); }
  };

  /* ---------- exercise: which way did the music move in the lattice? ---------- */
  const STEPS2 = [['5', [1, 0, 0], 'fifth up (× 3:2)'], ['5d', [-1, 0, 0], 'fifth down (× 2:3)'], ['3', [0, 1, 0], 'major third up (× 5:4)'], ['3d', [0, -1, 0], 'major third down (× 4:5)'], ['m', [1, -1, 0], 'minor third up (× 6:5)'], ['md', [-1, 1, 0], 'minor third down (× 5:6)']];
  const STEPS3 = [['7', [0, 0, 1], 'harmonic seventh up (× 7:4)'], ['7d', [0, 0, -1], 'harmonic seventh down (× 4:7)']];
  const Q = {lvl: '2', cur: null, ok: 0, n: 0, mode: 'interval'};
  function newQ() {
    const pool = Q.lvl === '3' ? STEPS2.concat(STEPS3) : STEPS2;
    const st = pool[Math.floor(Math.random() * pool.length)];
    const from = [Math.floor(Math.random() * 3) - 1, Math.floor(Math.random() * 2) - 1, 0];
    Q.cur = {st, from, to: from.map((x, i) => x + st[1][i])};
    Q.answered = false;
    hearQ();
    $('#qfb').textContent = ''; $('#qfb').className = 'qfb';
    $('#qans').innerHTML = pool.map(s => `<button type="button" class="btn ans" data-k="${s[0]}">${esc(s[2])}</button>`).join('');
    $('#qans').querySelectorAll('.ans').forEach(b => b.onclick = () => answer(b));
  }
  function hearQ() {
    if (!Q.cur) return;
    const a = Q.cur.from, b = Q.cur.to;
    /* the two notes one after the other, then together, placed so the interval moves the right way */
    const ca = cents(a), cb = cents(b), up = Q.cur.st[0].length === 1;
    let ob = 0;
    if (up && cb <= ca) ob = 1;
    if (!up && cb >= ca) ob = -1;
    TU.stopAll(); const c = TU.ac(), t0 = c.currentTime + .05;
    TU.tone(hz(a, -1), t0, 1.1, .15); TU.tone(hz(b, ob - 1), t0 + 1.1, 1.1, .15);
    TU.tone(hz(a, -1), t0 + 2.4, 1.8, .12); TU.tone(hz(b, ob - 1), t0 + 2.4, 1.8, .12);
  }
  function answer(btn) {
    if (Q.answered) return; Q.answered = true;
    const ok = btn.dataset.k === Q.cur.st[0];
    Q.n++; if (ok) Q.ok++;
    btn.classList.add(ok ? 'right' : 'wrong');
    if (!ok) $('#qans').querySelector(`[data-k="${Q.cur.st[0]}"]`).classList.add('right');
    const na = name(Q.cur.from), nb = nameFull(Q.cur.to);
    $('#qfb').className = 'qfb ' + (ok ? 'ok' : 'bad');
    $('#qfb').innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> ${na.n}${na.m ? ' (' + na.m + ')' : ''} → ${nb.n}${nb.m ? ' (' + nb.m + ')' : ''}: ${esc(Q.cur.st[2])}. <span class="sc">${Q.ok} / ${Q.n}</span>`;
  }

  /* ---------- exercise: pure or tempered? ---------- */
  const PT = [['fifth', 3 / 2, 700], ['major third', 5 / 4, 400], ['minor third', 6 / 5, 300], ['major sixth', 5 / 3, 900], ['harmonic seventh vs. equal minor seventh', 7 / 4, 1000]];
  const R = {cur: null, ok: 0, n: 0};
  function newR() {
    const it = PT[Math.floor(Math.random() * PT.length)], pureFirst = Math.random() < .5;
    R.cur = {it, pureFirst}; R.answered = false; hearR();
    $('#rfb').textContent = ''; $('#rfb').className = 'qfb';
    $('#rq').textContent = it[0] + ': which one is pure?';
    $('#rans').querySelectorAll('.ans').forEach(b => { b.classList.remove('right', 'wrong'); b.onclick = () => answerR(b); });
  }
  function hearR() {
    if (!R.cur) return;
    const [nm, r, et] = R.cur.it, root = cOne() / 2 * Math.pow(2, (Math.floor(Math.random() * 7) - 3) / 12);
    TU.stopAll(); const c = TU.ac(), t0 = c.currentTime + .05;
    const pure = root * r, temp = root * Math.pow(2, et / 1200);
    const [x, y] = R.cur.pureFirst ? [pure, temp] : [temp, pure];
    TU.tone(root, t0, 2, .14); TU.tone(x, t0, 2, .14);
    TU.tone(root, t0 + 2.4, 2, .14); TU.tone(y, t0 + 2.4, 2, .14);
  }
  function answerR(b) {
    if (R.answered) return; R.answered = true;
    const ok = (b.dataset.k === 'A') === R.cur.pureFirst;
    R.n++; if (ok) R.ok++;
    b.classList.add(ok ? 'right' : 'wrong');
    const [nm, r, et] = R.cur.it, diff = 1200 * Math.log2(r) - et;
    $('#rfb').className = 'qfb ' + (ok ? 'ok' : 'bad');
    $('#rfb').innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> The pure one was ${R.cur.pureFirst ? 'the first' : 'the second'}: ${esc(nm)} pure ${(1200 * Math.log2(r)).toFixed(1)} c, equal-tempered ${et} c (${diff > 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)} c). Listen for the beating in the tempered one. <span class="sc">${R.ok} / ${R.n}</span>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('#lat2d')) return;
    draw2D(); draw3D(); drag3D();
    document.querySelectorAll('[data-dims]').forEach(b => b.addEventListener('click', () => {
      dims = +b.dataset.dims;
      document.querySelectorAll('[data-dims]').forEach(x => x.setAttribute('aria-pressed', x === b));
      $('#txt3').hidden = dims !== 3; $('#txt4').hidden = dims !== 4;
      draw3D();
    }));
    document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => DEMO[b.dataset.demo]()));
    $('#clearWalk').onclick = () => { trail = []; $('#walk').textContent = ''; draw2D(); };
    $('#qstart').onclick = () => newQ();
    $('#qagain').onclick = () => hearQ();
    $('#qlvl').onchange = e => { Q.lvl = e.target.value; Q.ok = Q.n = 0; newQ(); };
    $('#rstart').onclick = () => newR();
    $('#ragain').onclick = () => hearR();
  });
})();
