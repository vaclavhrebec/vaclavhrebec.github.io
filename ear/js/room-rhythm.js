/* Room III — rhythm: graded and freely mixed reading and dictation examples; one hand, two hands, polyrhythm */
'use strict';
(function () {
  const h = E.h, T = E.t;

  const LEVELS = [
    'Quarters, eighths, half and whole notes in 2/4, 3/4 and 4/4',
    'Dotted quarters and rests',
    'Sixteenths; compound time (3/8, 6/8)',
    'Syncopations and ties; 9/8 and 12/8',
    'Triplets and duplets',
    'Irregular bars (5/8, 7/8, 5/4); quarter-note triplets, quadruplets, sixteenth triplets',
    'Changing and asymmetric metres (9/8 = 2+2+2+3, 11/8, 8/8); quintuplets and sextuplets',
    'Septuplets and pointed rhythms inside triplets',
    'Thirty-second notes, half-note triplets, 2/2, 3/2 and 6/4',
    'Ties over bar lines, syncopation across the bar line',
    'Nonuplets and quintuplets, septuplets over several beats',
    'Everything combined in changing metres'
  ];
  /* The features that can be mixed. lv = the level at which it appears; ex = a small example (bars separated by ;). */
  const FEATURES = [
    { g: 'Metres', k: 'm_simple', lv: 1, t: 'Simple metres: 2/4, 3/4, 4/4', ex: '3/4|q q q' },
    { g: 'Metres', k: 'm_comp', lv: 3, t: 'Compound metres: 3/8, 6/8', ex: '6/8|q. q.' },
    { g: 'Metres', k: 'm_comp2', lv: 4, t: 'Compound metres: 9/8, 12/8', ex: '9/8|q. q. q.' },
    { g: 'Metres', k: 'm_half', lv: 9, t: 'Half-note metres: 2/2, 3/2, 6/4', ex: '3/2|h h h' },
    { g: 'Metres', k: 'm_odd', lv: 6, t: 'Irregular bars: 5/8, 7/8, 5/4, 7/4', ex: '7/8|q q q.' },
    { g: 'Metres', k: 'm_asym', lv: 7, t: 'Asymmetric bars: 8/8, 9/8 (2+2+2+3), 10/8, 11/8, 13/8', ex: '11/8|q q q. q q' },
    { g: 'Metres', k: 'm_change', lv: 7, t: 'Metre changes from bar to bar', ex: '3/4|q q q;5/8|q q q.' },
    { g: 'Notes and rests', k: 'rests', lv: 1, t: 'Rests', ex: '4/4|q rq h' },
    { g: 'Notes and rests', k: 'dot', lv: 2, t: 'Dotted notes (dotted quarter, dotted half)', ex: '4/4|q. 8 h' },
    { g: 'Notes and rests', k: 's16', lv: 3, t: 'Sixteenth notes', ex: '2/4|16 16 16 16 8 8' },
    { g: 'Notes and rests', k: 'pointed', lv: 3, t: 'Pointed rhythms (dotted eighth + sixteenth, and the reverse)', ex: '2/4|8. 16 16 8.' },
    { g: 'Notes and rests', k: 'sync', lv: 4, t: 'Syncopations', ex: '2/4|8 q 8' },
    { g: 'Notes and rests', k: 'n32', lv: 9, t: 'Thirty-second notes', ex: '2/4|32 32 32 32 16 16 q' },
    { g: 'Ties', k: 'tie_in', lv: 4, t: 'Ties inside a bar', ex: '4/4|q q~ q q' },
    { g: 'Ties', k: 'tie_bar', lv: 10, t: 'Ties over the bar line', ex: '3/4|q q q~;3/4|h q' },
    { g: 'Tuplets', k: 'duplet', lv: 5, t: 'Duplets (two in the time of three)', ex: '6/8|2[8 8] q.' },
    { g: 'Tuplets', k: 'trip8', lv: 5, t: 'Eighth-note triplets', ex: '2/4|3[8 8 8] 3[8 8 8]' },
    { g: 'Tuplets', k: 'tripq', lv: 6, t: 'Quarter-note triplets', ex: '4/4|3[q q q] q q' },
    { g: 'Tuplets', k: 'triph', lv: 9, t: 'Half-note triplets', ex: '4/4|3[h h h]' },
    { g: 'Tuplets', k: 'trip16', lv: 6, t: 'Sixteenth-note triplets', ex: '2/4|3[16 16 16] 3[16 16 16] 8 8' },
    { g: 'Tuplets', k: 'trip32', lv: 9, t: 'Thirty-second-note triplets', ex: '2/4|3[32 32 32] 3[32 32 32] 8 q' },
    { g: 'Tuplets', k: 'tripdot', lv: 8, t: 'Pointed triplets (dotted notes inside a triplet)', ex: '2/4|3[8. 16 8] q' },
    { g: 'Tuplets', k: 'quad', lv: 6, t: 'Quadruplets (four in the time of three)', ex: '6/8|4[8 8 8 8] q.' },
    { g: 'Tuplets', k: 'quint', lv: 7, t: 'Quintuplets', ex: '2/4|5[16 16 16 16 16] q' },
    { g: 'Tuplets', k: 'sext', lv: 7, t: 'Sextuplets', ex: '2/4|6[16 16 16 16 16 16] q' },
    { g: 'Tuplets', k: 'sept', lv: 8, t: 'Septuplets', ex: '2/4|7[16 16 16 16 16 16 16] q' },
    { g: 'Tuplets', k: 'nonup', lv: 11, t: 'Nonuplets (nine in the time of eight)', ex: '2/4|9:8[16 16 16 16 16 16 16 16 16]' }
  ];
  // metres: groups of Q (one quarter = two eighths) and D (dotted quarter = three eighths); k = feature, lv = first level
  const METRES = [
    { ts: [2, 4], g: 'QQ', lv: 1, k: 'm_simple' }, { ts: [3, 4], g: 'QQQ', lv: 1, k: 'm_simple' }, { ts: [4, 4], g: 'QQQQ', lv: 1, k: 'm_simple', w: 1.5 },
    { ts: [3, 8], g: 'D', lv: 3, k: 'm_comp', w: .5 }, { ts: [6, 8], g: 'DD', lv: 3, k: 'm_comp', w: 1.5 },
    { ts: [9, 8], g: 'DDD', lv: 4, k: 'm_comp2' }, { ts: [12, 8], g: 'DDDD', lv: 4, k: 'm_comp2' },
    { ts: [5, 8], g: 'QD', lv: 6, k: 'm_odd' }, { ts: [5, 8], g: 'DQ', lv: 6, k: 'm_odd' }, { ts: [7, 8], g: 'QQD', lv: 6, k: 'm_odd', w: 1.2 }, { ts: [7, 8], g: 'DQQ', lv: 6, k: 'm_odd' }, { ts: [7, 8], g: 'QDQ', lv: 6, k: 'm_odd', w: .6 }, { ts: [5, 4], g: 'QQQQQ', lv: 6, k: 'm_odd', w: .6 }, { ts: [7, 4], g: 'QQQQQQQ', lv: 6, k: 'm_odd', w: .4 },
    { ts: [11, 8], g: 'QQDQQ', lv: 7, k: 'm_asym' }, { ts: [11, 8], g: 'DDDQ', lv: 7, k: 'm_asym' }, { ts: [9, 8], g: 'QQQD', lv: 7, k: 'm_asym' }, { ts: [8, 8], g: 'DDQ', lv: 7, k: 'm_asym' }, { ts: [10, 8], g: 'DDQQ', lv: 7, k: 'm_asym', w: .7 },
    { ts: [13, 8], g: 'DDQQD', lv: 8, k: 'm_asym', w: .6 },
    { ts: [2, 2], g: 'QQQQ', lv: 9, k: 'm_half' }, { ts: [3, 2], g: 'QQQQQQ', lv: 9, k: 'm_half' }, { ts: [6, 4], g: 'QQQQQQ', lv: 9, k: 'm_half' }
  ];
  /* cells: [notation, group type, groups spanned, first level, weight, alignment rule, feature(s) needed] */
  const CELLS = [
    // one quarter (Q)
    ['q', 'Q', 1, 1, 4], ['8 8', 'Q', 1, 1, 3], ['h', 'Q', 2, 1, 2, 'even'], ['w', 'Q', 4, 1, .6, 'bar'], ['rq', 'Q', 1, 1, .8, null, 'rests'],
    ['q. 8', 'Q', 2, 2, 1.5, 'even', 'dot'], ['h.', 'Q', 3, 2, .6, 'bar', 'dot'], ['r8 8', 'Q', 1, 2, 1, null, 'rests'], ['8 r8', 'Q', 1, 2, .5, null, 'rests'], ['rh', 'Q', 2, 2, .3, 'even', 'rests'],
    ['16 16 16 16', 'Q', 1, 3, 2, null, 's16'], ['8 16 16', 'Q', 1, 3, 2, null, 's16'], ['16 16 8', 'Q', 1, 3, 2, null, 's16'], ['8. 16', 'Q', 1, 3, 1.5, null, 'pointed'],
    ['16 8 16', 'Q', 1, 4, 1.5, null, 'sync+s16'], ['8 q 8', 'Q', 2, 4, 1.5, null, 'sync'], ['16 8.', 'Q', 1, 4, .6, null, 'pointed'], ['r16 16 8', 'Q', 1, 4, .5, null, 'rests+s16'], ['r8 16 16', 'Q', 1, 4, .6, null, 'rests+s16'], ['q h q', 'Q', 4, 4, .5, 'bar', 'sync'], ['q. q.', 'Q', 3, 4, .4, 'bar', 'sync+dot'],
    ['3[8 8 8]', 'Q', 1, 5, 2, null, 'trip8'], ['3[q 8]', 'Q', 1, 5, 1, null, 'trip8'], ['3[8 q]', 'Q', 1, 5, .7, null, 'trip8'], ['3[8 r8 8]', 'Q', 1, 5, .5, null, 'trip8+rests'],
    ['3[q q q]', 'Q', 2, 6, 1, 'even', 'tripq'], ['3[16 16 16] 8', 'Q', 1, 6, .6, null, 'trip16'], ['8 3[16 16 16]', 'Q', 1, 6, .6, null, 'trip16'],
    ['5[16 16 16 16 16]', 'Q', 1, 7, 1, null, 'quint'], ['6[16 16 16 16 16 16]', 'Q', 1, 7, .7, null, 'sext'], ['3[16 16 16] 3[16 16 16]', 'Q', 1, 7, .4, null, 'trip16'],
    ['7[16 16 16 16 16 16 16]', 'Q', 1, 8, 1, null, 'sept'], ['5[8 8 8 8 8]', 'Q', 2, 8, .6, 'even', 'quint'], ['3[8. 16 8]', 'Q', 1, 8, .5, null, 'tripdot'],
    ['32 32 32 32 16 16', 'Q', 1, 9, 1, null, 'n32'], ['16 32 32 8', 'Q', 1, 9, .8, null, 'n32'], ['8 32 32 16', 'Q', 1, 9, .8, null, 'n32'], ['16. 32 8', 'Q', 1, 9, .6, null, 'n32'], ['8. 32 32', 'Q', 1, 9, .6, null, 'n32'],
    ['3[32 32 32] 3[32 32 32] 8', 'Q', 1, 9, .6, null, 'trip32'], ['3[h h h]', 'Q', 4, 9, .8, 'bar', 'triph'], ['3[h q]', 'Q', 2, 9, .5, 'even', 'triph'], ['3[q h]', 'Q', 2, 9, .5, 'even', 'triph'],
    ['3[q. 8 q]', 'Q', 2, 10, .5, 'even', 'tripdot'], ['8 q q 8', 'Q', 3, 10, .6, 'bar', 'sync'], ['8 h 8', 'Q', 3, 10, .6, 'bar', 'sync'],
    ['5[q q q q q]', 'Q', 4, 11, .6, 'bar', 'quint'], ['7[8 8 8 8 8 8 8]', 'Q', 2, 11, .6, 'even', 'sept'], ['7[q q q q q q q]', 'Q', 4, 11, .4, 'bar', 'sept'],
    ['6[8 8 8 8 8 8]', 'Q', 2, 11, .6, 'even', 'sext'], ['9:8[16 16 16 16 16 16 16 16 16]', 'Q', 2, 11, .8, 'even', 'nonup'], ['4[q q q q]', 'Q', 3, 11, .5, 'bar', 'quad'],
    ['5:3[q q q q q]', 'Q', 3, 12, .4, 'bar', 'quint'],
    // one dotted quarter (D)
    ['q 8', 'D', 1, 3, 3], ['8 8 8', 'D', 1, 3, 3], ['q.', 'D', 1, 3, 2], ['h.', 'D', 2, 3, .8, 'even'],
    ['8 q', 'D', 1, 4, 1.5, null, 'sync'], ['r8 8 8', 'D', 1, 4, 1, null, 'rests'], ['8. 16 8', 'D', 1, 4, 1.5, null, 'pointed'], ['16 16 8 8', 'D', 1, 4, 1, null, 's16'], ['8 16 16 8', 'D', 1, 4, 1, null, 's16'], ['8 8 16 16', 'D', 1, 4, .7, null, 's16'], ['rq 8', 'D', 1, 4, .5, null, 'rests'],
    ['2[8 8]', 'D', 1, 5, 1.5, null, 'duplet'],
    ['4[8 8 8 8]', 'D', 1, 6, 1, null, 'quad'], ['16 16 16 16 16 16', 'D', 1, 6, .8, null, 's16'], ['2[q q]', 'D', 2, 6, .8, 'even', 'duplet'],
    ['16 8 16 8', 'D', 1, 7, .6, null, 'sync+s16'], ['8 16 8 16', 'D', 1, 7, .5, null, 'sync+s16'],
    ['5[16 16 16 16 16]', 'D', 1, 8, .5, null, 'quint'], ['7[16 16 16 16 16 16 16]', 'D', 1, 8, .3, null, 'sept'],
    ['8. 32 32 8', 'D', 1, 9, .6, null, 'n32'], ['32 32 32 32 16 16 8', 'D', 1, 9, .6, null, 'n32']
  ].map(c => ({ s: c[0], g: c[1], n: c[2], lv: c[3], w: c[4], a: c[5] || null, k: c[6] || null }));

  /* polyrhythms: both hands fill the same bar, in different divisions. a and b are the two lines. */
  const POLY = [
    { lv: 1, name: '3:2', ts: [2, 4], g: 'QQ', a: '3[q q q]', b: 'q q' },
    { lv: 1, name: '2:3', ts: [6, 8], g: 'DD', a: 'q q q', b: 'q. q.' },
    { lv: 2, name: '3:2', ts: [2, 4], g: 'QQ', a: '3[8 8 8] 3[8 8 8]', b: '8 8 8 8' },
    { lv: 2, name: '4:3', ts: [3, 4], g: 'QQQ', a: '4[q q q q]', b: 'q q q' },
    { lv: 2, name: '3:4', ts: [4, 4], g: 'QQQQ', a: '3[h h h]', b: 'q q q q' },
    { lv: 3, name: '5:4', ts: [4, 4], g: 'QQQQ', a: '5[q q q q q]', b: 'q q q q' },
    { lv: 3, name: '5:4', ts: [2, 4], g: 'QQ', a: '5[16 16 16 16 16] 5[16 16 16 16 16]', b: '16 16 16 16 16 16 16 16' },
    { lv: 3, name: '3:2', ts: [3, 4], g: 'QQQ', a: '3[q q q] q', b: 'q q q' , skip: 1 },
    { lv: 4, name: '5:3', ts: [3, 4], g: 'QQQ', a: '5:3[q q q q q]', b: 'q q q' },
    { lv: 4, name: '7:4', ts: [4, 4], g: 'QQQQ', a: '7[q q q q q q q]', b: 'q q q q' },
    { lv: 4, name: '5:2', ts: [2, 4], g: 'QQ', a: '5:2[q q q q q]', b: 'q q' },
    { lv: 4, name: '7:4', ts: [2, 4], g: 'QQ', a: '7[16 16 16 16 16 16 16] 7[16 16 16 16 16 16 16]', b: '16 16 16 16 16 16 16 16' }
  ].filter(p => !p.skip);

  const NOM = { w: 4, h: 2, q: 1, '8': .5, '16': .25, '32': .125 };
  const DEF_M = { 2: 3, 3: 2, 4: 3, 5: 4, 6: 4, 7: 4 };
  const GL = { Q: 1, D: 1.5 };
  let tupSeq = 0, beamSeq = 0;
  function parseCell(s, groupType) {
    const out = [];
    const re = /(\d)(?::(\d))?\[([^\]]+)\](~?)|(r?)(w|h|q|8|16|32)(\.?)(~?)/g;
    let m;
    while ((m = re.exec(s))) {
      if (m[1]) {
        const n = +m[1];
        let mm = m[2] ? +m[2] : DEF_M[n];
        if (groupType === 'D' && n === 5 && !m[2]) mm = 6;          // quintuplet in a dotted beat: 5 in the time of 6
        if (groupType === 'D' && n === 7 && !m[2]) mm = 6;
        const id = ++tupSeq;
        const toks = m[3].trim().split(/\s+/);
        toks.forEach((tok, ti) => {
          const t = /(r?)(w|h|q|8|16|32)(\.?)(~?)/.exec(tok);
          const nom = NOM[t[2]] * (t[3] ? 1.5 : 1);
          out.push({ rest: !!t[1], v: t[2], dot: t[3] ? 1 : 0, d: nom * mm / n, tie: !!t[4] || (ti === toks.length - 1 && !!m[4]), tup: { id, n, m: mm, ratio: !!m[2] || (groupType === 'D' && (n === 5 || n === 7)) } });
        });
      } else {
        const nom = NOM[m[6]] * (m[7] ? 1.5 : 1);
        out.push({ rest: !!m[5], v: m[6], dot: m[7] ? 1 : 0, d: nom, tie: !!m[8], tup: null });
      }
    }
    // beams: consecutive notes of an eighth or shorter
    let cur = null;
    out.forEach(e => {
      if (!e.rest && NOM[e.v] <= .5) { if (!cur) cur = ++beamSeq; e.beam = cur; }
      else cur = null;
    });
    return out;
  }
  /* beams again, for a whole bar: broken by rests, longer notes and the beats of the bar (beat in quarters) */
  function rebeam(evs, beat) {
    const t0 = evs.length ? evs[0].t : 0;
    let cur = null, lastBeat = -1;
    evs.forEach(e => {
      if (!e.rest && NOM[e.v] <= .5) {
        const bt = Math.floor((e.t - t0 + 1e-6) / beat);
        if (!cur || bt !== lastBeat) cur = ++beamSeq;
        e.beam = cur; lastBeat = bt;
      } else { cur = null; delete e.beam; }
    });
  }
  const len = evs => evs.reduce((a, e) => a + e.d, 0);
  /* the grouping of a bar into beats, for the metronome and the accents */
  function groupsFor(ts) {
    const n = ts[0], d = ts[1];
    if (d === 4) return 'Q'.repeat(n);
    if (d === 2) return 'Q'.repeat(2 * n);
    if (d === 8) {
      if (n % 3 === 0) return 'D'.repeat(n / 3);
      const r = n % 3, k = Math.floor(n / 3);
      return r === 2 ? 'D'.repeat(k) + 'Q' : 'D'.repeat(Math.max(0, k - 1)) + 'QQ';
    }
    return 'Q'.repeat(Math.max(1, Math.round(n * 4 / d)));
  }
  const barLen = b => b.len != null ? b.len : b.groups.reduce((a, g) => a + GL[g], 0);
  /* tie links: the next sounding note continues a tied note and is not struck again */
  function link(evs) {
    evs.forEach(e => { delete e._next; delete e.held; });
    evs.forEach((e, i) => {
      if (!e.tie) return;
      const n = evs[i + 1];
      if (n && !n.rest && !e.rest) { e._next = n; n.held = true; } else e.tie = false;
    });
  }
  E.rhythmLib = { parseCell, rebeam, groupsFor, link, NOM, DEF_M, barLen, FEATURES, GL };

  /* one line of bars. o: level, feats (a Set: free mix, else the level decides), target (notes), seq (a fixed list of metres) */
  function genBars(o) {
    const feats = o.feats || null, level = o.level || 12, target = o.target || 50;
    const loose = feats ? feats.has('sync') : level >= 4;
    const on = c => feats ? (!c.k || c.k.split('+').every(x => feats.has(x))) : c.lv <= level;
    let pool = METRES.filter(m => feats ? feats.has(m.k) : m.lv <= level);
    if (!pool.length) pool = METRES.filter(m => m.k === 'm_simple');
    const metreW = pool.map(m => ({ ...m, w: (m.w || 1) * (!feats && m.lv === level ? 2.2 : 1) }));
    const cells = CELLS.filter(on).map(c => ({ ...c, w: c.w * (feats ? (c.k ? 2.2 : 1) : (c.lv === level ? 2 : 1)) }));
    const changing = feats ? feats.has('m_change') : level >= 7;
    const tieIn = feats ? feats.has('tie_in') : level >= 4, tieBar = feats ? feats.has('tie_bar') : level >= 4;
    const pIn = .13, pBar = feats ? .32 : (level >= 10 ? .3 : .12);
    const used = new Set();
    const seq = o.seq || null;
    let metre = seq ? seq[0] : E.wpick(!feats && level >= 6 ? metreW.filter(m => m.lv >= 6 || Math.random() < .3) : metreW);
    const bars = [];
    let notes = 0, t = 0, prevTs = null, last = null;
    for (let guard = 0; guard < 80 && (seq ? bars.length < seq.length : (notes < target || !bars.length)); guard++) {
      if (seq) metre = seq[bars.length];
      else if (changing && bars.length && Math.random() < .4) { const nm = E.wpick(metreW); if (nm.ts.join() !== metre.ts.join() || nm.g !== metre.g) used.add('m_change'); metre = nm; }
      if (metre.k) used.add(metre.k);
      const ev = [];
      const G = metre.g.split('');
      let i = 0;
      while (i < G.length) {
        const type = G[i];
        let run = 0; while (i + run < G.length && G[i + run] === type) run++;
        const ok = cells.filter(c => c.g === type && c.n <= run &&
          (c.a !== 'bar' || (i === 0 && c.n === G.length)) &&
          (c.a !== 'even' || loose || i % 2 === 0) &&
          !(c.s === 'h.' && type === 'Q' && G.length !== 3 && i !== 0));
        const c = E.wpick(ok.length ? ok : CELLS.filter(x => x.g === type && x.n === 1 && !x.k && !x.a && x.lv <= 3).map(x => ({ ...x })));
        if (c.k) c.k.split('+').forEach(x => used.add(x));
        const evs = parseCell(c.s, type);
        // ties between notes outside tuplets
        if (last && !last.rest && !last.tup && !evs[0].rest && !evs[0].tup) {
          const atBar = i === 0;
          if (atBar ? (tieBar && Math.random() < pBar) : (tieIn && Math.random() < pIn)) { last.tie = true; used.add(atBar ? 'tie_bar' : 'tie_in'); }
        }
        evs.forEach(e => { e.t = t; t += e.d; ev.push(e); last = e; });
        i += c.n;
      }
      const bar = { ts: metre.ts, showTs: !prevTs || prevTs.join() !== metre.ts.join(), ev, groups: G, len: G.reduce((a, g) => a + GL[g], 0), metre };
      prevTs = metre.ts;
      bars.push(bar);
      notes += ev.filter(e => !e.rest).length;
    }
    const all = bars.flatMap(b => b.ev);
    if (all.length) all[all.length - 1].tie = false;   // the final note is never tied onward
    link(all);
    return { bars, used, dur: t };
  }
  /* a free mix: of several tries the one that shows most of the chosen features */
  function genBest(o) {
    if (!o.feats) return genBars(o);
    let best = null, bs = -1;
    for (let k = 0; k < 10; k++) {
      const g = genBars(o);
      let sc = 0; o.feats.forEach(f => { if (g.used.has(f)) sc++; });
      sc += Math.random() * .5;
      if (sc > bs) { bs = sc; best = g; }
    }
    return best;
  }
  const shift = (b, t) => { b.ev.forEach(e => e.t += t); if (b.ev2) b.ev2.forEach(e => e.t += t); };
  const attacksOf = bars => bars.reduce((a, b) => a + b.ev.concat(b.ev2 || []).filter(e => !e.rest && !e.held).length, 0);

  function generate(level, target, feats) {
    const g = genBest({ level, target, feats });
    return { bars: g.bars, attacks: attacksOf(g.bars), level, dur: g.dur, hands: 1 };
  }
  E.rhythmGenerate = generate;
  /* two hands: the left hand follows the same bars, with its own rhythm */
  function generateTwo(level, target, feats, simple) {
    const A = genBest({ level, target: Math.round(target * .7), feats });
    let lf = feats, ll = level;
    if (simple) { if (feats) lf = new Set(['dot', 'rests'].filter(k => feats.has(k))); else ll = Math.max(1, level - 3); }
    const B = genBars({ level: ll, feats: lf, seq: A.bars.map(b => b.metre) });
    A.bars.forEach((b, i) => { b.ev2 = B.bars[i].ev; });
    return { bars: A.bars, attacks: attacksOf(A.bars), level, dur: A.dur, hands: 2 };
  }
  function generatePoly(lv, nbars) {
    const pool = POLY.filter(p => p.lv <= lv).map(p => ({ ...p, w: p.lv === lv ? 2 : 1 }));
    const bars = []; let t = 0, prev = null, lastName = null;
    for (let i = 0; i < nbars; i++) {
      if (i && i % 2 === 1 && Math.random() < .35 && bars.length) {   // a plain bar between, in the metre of the last
        const m = bars[bars.length - 1].metre;
        const A = genBars({ level: Math.min(3, lv + 1), seq: [m] }), B = genBars({ level: Math.min(3, lv + 1), seq: [m] });
        const b = A.bars[0]; b.ev2 = B.bars[0].ev; b.showTs = false; shift(b, t); b.plain = true;
        t += b.len; bars.push(b); continue;
      }
      let p = E.wpick(pool);
      for (let g = 0; g < 4 && p.name === lastName && pool.length > 1; g++) p = E.wpick(pool);
      lastName = p.name;
      let a = p.a, b = p.b; if (Math.random() < .5) { const x = a; a = b; b = x; }
      const ea = parseCell(a, p.g[0]), eb = parseCell(b, p.g[0]);
      let ta = t, tb = t; ea.forEach(e => { e.t = ta; ta += e.d; }); eb.forEach(e => { e.t = tb; tb += e.d; });
      const G = p.g.split(''), L = G.reduce((x, g) => x + GL[g], 0);
      rebeam(ea, p.g[0] === 'D' ? 1.5 : 1); rebeam(eb, p.g[0] === 'D' ? 1.5 : 1);
      const showTs = !prev || prev.join() !== p.ts.join(); prev = p.ts;
      bars.push({ ts: p.ts, showTs, ev: ea, ev2: eb, groups: G, len: L, metre: p, poly: p.name });
      t += L;
    }
    return { bars, attacks: attacksOf(bars), level: lv, dur: t, hands: 2, poly: true };
  }

  const cfg = Object.assign({ level: 1, mode: 'level', feats: ['m_simple', 'rests'], hands: 'one', leftSimple: true, polyLv: 1, polyBars: 8, len: 50,
    bpm: 72, metro: true, countin: true, sound: 'click', hear: 'both', follow: true, hide: false }, E.load('cfg.rhythm', {}));
  if (cfg.sound === 'perc') cfg.sound = 'click'; else if (cfg.sound === 'sus') cfg.sound = 'tone';
  if (cfg.level > 12) cfg.level = 12;
  const save = () => E.save('cfg.rhythm', cfg);
  let ex = null, playing = false, shown = false, own = null, ownName = '';

  function make() {
    own = null;
    const feats = cfg.mode === 'mix' ? new Set(cfg.feats.length ? cfg.feats : ['m_simple']) : null;
    if (cfg.hands === 'poly') return generatePoly(cfg.polyLv, cfg.polyBars);
    if (cfg.hands === 'two') return generateTwo(cfg.level, cfg.len, feats, cfg.leftSimple);
    return generate(cfg.level, cfg.len, feats);
  }

  function groupStarts(bar, t0) {
    const out = []; let t = t0;
    bar.groups.forEach((g, i) => { out.push({ t, accent: i === 0 }); t += GL[g]; });
    return out;
  }
  function setOn(id, on) { const n = document.getElementById(id); if (n) n.classList.toggle('on', on); }
  function play(box) {
    if (E.practised) E.practised();   /* listening to a rhythm counts as practice for the day */
    const A = E.audio; A.stop();
    if (playing) { playing = false; updateBtns(box); clearMarks(); return; }
    playing = true; updateBtns(box);
    const q = 60 / cfg.bpm;
    const t0 = A.now() + .1;
    // count-in: one bar of the first metre
    const first = ex.bars[0];
    const ciLen = cfg.countin ? barLen(first) : 0;
    if (cfg.countin) groupStarts(first, 0).forEach(c => A.click(t0 + c.t * q, { f: c.accent ? 2000 : 1500, vol: c.accent ? .45 : .32 }));
    const start = t0 + ciLen * q;
    let barT = 0;
    ex.bars.forEach(b => {
      if (cfg.metro) groupStarts(b, barT).forEach(c => A.click(start + c.t * q, { f: c.accent ? 2000 : 1500, vol: c.accent ? .22 : .15 }));
      barT += barLen(b);
    });
    const marks = [];
    const voices = [{ get: b => b.ev, pre: '', f: 3600, hz: 440, v: .7 }];
    if (ex.bars.some(b => b.ev2)) voices.push({ get: b => b.ev2 || [], pre: 'b', f: 1100, hz: 220, v: .9 });
    voices.forEach((V, vi) => {
      const audible = cfg.sound !== 'off' && (cfg.hear === 'both' || (cfg.hear === 'right') === (vi === 0));
      let hi = 0;
      ex.bars.flatMap(V.get).forEach(e => {
        if (e.rest) return;
        const id = V.pre + 'h' + (hi++);
        if (e.held) return;
        let d = e.d, n = e, k = hi;
        const ids = [id];
        while (n.tie && n._next) { n = n._next; d += n.d; ids.push(V.pre + 'h' + (k++)); }
        const tt = start + e.t * q;
        if (audible) {
          if (cfg.sound === 'tone') A.tone(V.hz, tt, Math.max(.08, d * q * .92), { timbre: 'organ', vol: vi ? .22 : .28 });
          else A.tick(tt, { f: V.f, vol: V.v });
        }
        marks.push({ ids, at: (tt - A.get().currentTime) * 1000, d: d * q * 1000 });
      });
    });
    if (cfg.follow) marks.forEach(m => {
      A.later(() => m.ids.forEach(id => setOn(id, true)), m.at);
      A.later(() => m.ids.forEach(id => setOn(id, false)), m.at + Math.max(110, m.d * .96));
    });
    A.later(() => { playing = false; updateBtns(box); clearMarks(); }, (start + ex.dur * q - A.get().currentTime) * 1000 + 600);
  }
  function clearMarks() { document.querySelectorAll('.rhythm .nh.on').forEach(n => n.classList.remove('on')); }
  function updateBtns(box) {
    const b = box.querySelector('#rh-play'); if (b) b.textContent = playing ? '■ ' + T('Stop') : '▶ ' + T(cfg.countin ? 'Play with count-in' : 'Play');
  }
  const featsOfLevel = L => FEATURES.filter(f => f.lv <= L).map(f => f.k);

  /* a small notation example for a feature button */
  function sample(spec) {
    const bars = []; let t = 0, ts = null;
    spec.split(';').forEach((part, i) => {
      const [tsS, body] = part.split('|'), m = /(\d+)\/(\d+)/.exec(tsS);
      const bts = [+m[1], +m[2]], G = groupsFor(bts);
      const ev = parseCell(body, G[0]);
      ev.forEach(e => { e.t = t; t += e.d; });
      rebeam(ev, G[0] === 'D' ? 1.5 : 1);
      bars.push({ ts: bts, showTs: i === 0 || ts.join() !== bts.join(), ev, groups: G.split(''), len: G.split('').reduce((a, g) => a + GL[g], 0) });
      ts = bts;
    });
    link(bars.flatMap(b => b.ev));
    return E.notation.rhythmSVG({ bars }, bars.length > 1 ? 340 : 160).svg;
  }

  function draw(box) {
    box.innerHTML = '';
    const again = () => { E.audio.stop(); playing = false; ex = make(); shown = false; draw(box); };
    const lvl = h('div', { class: 'levelbar wide twelve' }, LEVELS.map((d, i) => h('button', {
      type: 'button', class: 'lv' + (i + 1 === cfg.level ? ' on' : '') + (i + 1 < cfg.level ? ' past' : ''), title: T(d),
      onclick: () => { cfg.level = i + 1; cfg.mode = 'level'; save(); again(); }
    }, h('b', null, i + 1))));
    const seg = (items, cur, cb) => h('div', { class: 'seg' }, items.map(([v, l]) => h('button', { type: 'button', class: 'mini' + (v === cur ? ' on' : ''), onclick: () => cb(v) }, T(l))));
    const sheet = h('div', { class: 'sheet' + (cfg.hide && !shown ? ' hidden' : '') });
    const info = h('div', { class: 'exinfo' });

    /* the mixer: every feature a button with a small example */
    const mixer = h('div', { class: 'mixer' });
    const groups = [...new Set(FEATURES.map(f => f.g))];
    const featBtn = f => {
      const b = h('button', { type: 'button', class: 'featbtn' + (cfg.feats.includes(f.k) ? ' on' : ''), 'aria-pressed': cfg.feats.includes(f.k) ? 'true' : 'false',
        onclick: () => { cfg.feats = cfg.feats.includes(f.k) ? cfg.feats.filter(x => x !== f.k) : cfg.feats.concat(f.k); cfg.mode = 'mix'; save(); again(); } },
        h('span', { class: 'fex', html: sample(f.ex) }), h('span', { class: 'ft' }, T(f.t)));
      return b;
    };
    mixer.append(
      h('div', { class: 'mixtools' },
        h('span', null, T('Choose what is in the example:')),
        h('button', { type: 'button', class: 'mini', onclick: () => { cfg.feats = []; cfg.mode = 'mix'; save(); again(); } }, T('clear')),
        h('select', { class: 'mini', onchange: e => { if (e.target.value) { cfg.feats = featsOfLevel(+e.target.value); cfg.mode = 'mix'; save(); again(); } } },
          h('option', { value: '' }, T('everything up to level…')), LEVELS.map((d, i) => h('option', { value: i + 1 }, T('Level') + ' ' + (i + 1)))),
        h('button', { type: 'button', class: 'mini', onclick: () => {
          const pool = FEATURES.filter(f => !f.k.startsWith('m_')).map(f => f.k), pick = [];
          while (pick.length < 4) { const k = pool[Math.floor(Math.random() * pool.length)]; if (!pick.includes(k)) pick.push(k); }
          cfg.feats = ['m_simple', ...pick]; cfg.mode = 'mix'; save(); again(); } }, '🎲 ' + T('surprise me'))),
      ...groups.map(g => h('div', { class: 'featgroup' }, h('h3', null, T(g)), h('div', { class: 'featlist' }, FEATURES.filter(f => f.g === g).map(featBtn)))));

    const lvhead = cfg.mode === 'mix'
      ? h('div', { class: 'lvhead' }, h('span', null, h('b', null, T('Your own mix')), ' · ', cfg.feats.length + ' ' + T('features')))
      : h('div', { class: 'lvhead' }, h('span', null, T('Level'), ' ', h('b', null, cfg.level), ' · ', T(LEVELS[cfg.level - 1])));
    const polyBox = cfg.hands === 'poly' ? h('div', { class: 'hrow' },
      h('span', null, T('Polyrhythm difficulty')), seg([[1, '1'], [2, '2'], [3, '3'], [4, '4']].map(([v, l]) => [v, l]), cfg.polyLv, v => { cfg.polyLv = v; save(); again(); })) : null;
    const handsBox = h('div', { class: 'hrow' },
      h('span', null, T('Hands')),
      seg([['one', 'One hand'], ['two', 'Two hands'], ['poly', 'Polyrhythm']], cfg.hands, v => { cfg.hands = v; save(); again(); }),
      cfg.hands === 'two' ? E.checkField(T('Left hand simpler'), cfg.leftSimple, v => { cfg.leftSimple = v; save(); again(); }) : null);
    const modeBox = h('div', { class: 'hrow' },
      h('span', null, T('Build the example')),
      seg([['level', 'By level'], ['mix', 'Mix my own']], cfg.mode, v => { cfg.mode = v; save(); again(); }));
    const panel = h('div', { class: 'panel' },
      lvhead,
      cfg.mode === 'mix' || cfg.hands === 'poly' ? null : lvl,
      cfg.hands === 'poly' ? null : modeBox,
      cfg.mode === 'mix' && cfg.hands !== 'poly' ? mixer : null,
      handsBox, polyBox,
      h('div', { class: 'acts' },
        h('button', { id: 'rh-play', class: 'btn primary', type: 'button', onclick: () => play(box) }, '▶ ' + T(cfg.countin ? 'Play with count-in' : 'Play')),
        h('button', { class: 'btn', type: 'button', onclick: again }, T('New example')),
        cfg.hide ? h('button', { class: 'btn', type: 'button', onclick: () => { shown = !shown; sheet.classList.toggle('hidden', !shown); } }, T('Show / hide notation')) : null),
      info);
    const tempoLbl = () => {
      const eighth = ex.bars.some(b => b.ts[1] === 8);
      return '<span class="q">♩</span> = ' + cfg.bpm + (eighth ? ' (<span class="q">♪</span> = ' + cfg.bpm * 2 + ')' : '');
    };
    const importer = h('details', { class: 'settings', open: draw._open2 || null, ontoggle: e => draw._open2 = e.target.open },
      h('summary', null, T('Your own example: from a file or from text')),
      h('div', { class: 'setbody import' },
        h('p', { class: 'note' }, T('Open a MusicXML (.musicxml, .xml, .mxl) or MIDI file, or a text file in the format below. A book of rhythm exercises can be turned into this text by Claude: send it the photo together with the prompt you can copy here.')),
        h('div', { class: 'hrow' },
          h('input', { type: 'file', id: 'rh-file', accept: '.txt,.xml,.musicxml,.mxl,.mid,.midi,text/plain,application/xml', onchange: e => loadFile(e.target.files[0], box) }),
          h('button', { type: 'button', class: 'mini', onclick: async e => { try { await navigator.clipboard.writeText(E.rhythmImport ? E.rhythmImport.PROMPT : ''); e.target.textContent = '✓ ' + T('Copied'); } catch (x) { e.target.textContent = T('Copy failed'); } } }, T('Copy the prompt for Claude'))),
        h('textarea', { id: 'rh-text', rows: 6, spellcheck: 'false', placeholder: 'tempo: 80\nR: 4/4 | q 8 8 q q | 3[8 8 8] q h\nL: 4/4 | h h | q q q q' }),
        h('div', { class: 'hrow' },
          h('button', { type: 'button', class: 'btn', onclick: () => loadText(box.querySelector('#rh-text').value, box, T('your text')) }, T('Use this text')),
          h('span', { class: 'err', id: 'rh-err' })),
        h('details', null, h('summary', null, T('The text format')), h('pre', { class: 'fmt' }, E.rhythmImport ? E.rhythmImport.HELP : ''))));
    const set = h('details', { class: 'settings', open: draw._open || null, ontoggle: e => draw._open = e.target.open },
      h('summary', null, T('Settings')),
      h('div', { class: 'setbody' },
        E.rangeField(T('Tempo'), cfg.bpm, 40, 160, 2, v => '♩ = ' + v, v => { cfg.bpm = v; save(); info.firstChild && (info.querySelector('.tempo').innerHTML = tempoLbl()); }),
        E.rangeField(T('Length of the example (notes)'), cfg.len, 12, 120, 2, v => String(v), v => { cfg.len = v; save(); }),
        E.selectField(T('Sound'), cfg.sound, [{ v: 'click', l: T('click, without pitch') }, { v: 'tone', l: T('sustained tone (hear the note lengths)') }, { v: 'off', l: T('no sound (only the metronome and the colours)') }], v => { cfg.sound = v; save(); }),
        cfg.hands !== 'one' || (ex && ex.hands === 2) ? E.selectField(T('Play'), cfg.hear, [{ v: 'both', l: T('both hands') }, { v: 'right', l: T('right hand only (upper line)') }, { v: 'left', l: T('left hand only (lower line)') }], v => { cfg.hear = v; save(); }) : null,
        E.checkField(T('Colour the note that is sounding'), cfg.follow, v => { cfg.follow = v; save(); }),
        E.checkField(T('Count-in before the example'), cfg.countin, v => { cfg.countin = v; save(); updateBtns(box); }),
        E.checkField(T('Metronome during playback'), cfg.metro, v => { cfg.metro = v; save(); }),
        E.checkField(T('Dictation: hide the notation until I want to see it'), cfg.hide, v => { cfg.hide = v; save(); shown = false; draw(box); })));
    box.append(panel, sheet, importer, set);
    if (!ex) ex = make();
    const metres = [...new Set(ex.bars.map(b => b.ts.join('/')))];
    info.append(...[h('span', null, ex.bars.length + ' ' + T('bars')), h('span', null, ex.attacks + ' ' + T('notes')),
      h('span', null, T('Metre') + ': ' + metres.join(', ')), h('span', { class: 'tempo', html: tempoLbl() }),
      ownName ? h('span', null, '📄 ' + ownName) : null,
      ex.hands === 2 ? h('span', null, T('upper line: right hand · lower line: left hand')) : null,
      ex.poly ? h('span', null, T('Polyrhythm') + ': ' + [...new Set(ex.bars.filter(b => b.poly).map(b => b.poly))].join(', ')) : null].filter(Boolean));
    const render = () => {
      const w = Math.min(1100, sheet.clientWidth - 2);
      const r = E.notation.rhythmSVG(ex, w);
      sheet.innerHTML = r.svg + '<div class="veil">' + T('Notation hidden. Listen, write it down, then show it.') + '</div>';
    };
    render();
    if (draw._ro) draw._ro.disconnect();
    let lastW = sheet.clientWidth;
    draw._ro = new ResizeObserver(() => { if (Math.abs(sheet.clientWidth - lastW) > 30) { lastW = sheet.clientWidth; render(); } });
    draw._ro.observe(sheet);
  }

  /* an example from outside: a file or pasted text */
  function useOwn(res, name, box) {
    if (res.bpm) cfg.bpm = Math.max(40, Math.min(160, Math.round(res.bpm)));
    ex = res.ex; ownName = name; shown = false; E.audio.stop(); playing = false;
    draw(box);
    const e = document.getElementById('rh-err'); if (e) e.textContent = '';
  }
  async function loadFile(file, box) {
    if (!file) return;
    const err = document.getElementById('rh-err');
    try {
      if (!E.rhythmImport) throw new Error('The import code could not be loaded.');
      useOwn(await E.rhythmImport.fromFile(file), file.name, box);
    } catch (e) { if (err) err.textContent = T(e.message); }
  }
  function loadText(text, box, name) {
    const err = document.getElementById('rh-err');
    try { useOwn(E.rhythmImport.fromText(text), name, box); }
    catch (e) { if (err) err.textContent = e.message; }
  }

  E.room({
    id: 'rhythm', num: 'III', title: 'Rhythm',
    desc: 'Graded or freely mixed reading and dictation examples: from simple metres to 11/8, syncopation, ties over the bar line and tuplets up to nonuplets. For one hand, two hands or polyrhythm, and from your own files.',
    meta: '12 levels · mix your own · two hands',
    lede: 'Read and clap the example, then play it to check yourself: you hear clicks without a pitch, and the note that sounds is coloured. Choose a level, or press the buttons for everything you want to practise. For dictation, hide the notation, listen, write, and compare. Every press of “New example” creates a new one.',
    icon: () => {
      const ev = ['q', '8 8', '16 16 8', '3[8 8 8]'].flatMap(c => parseCell(c, 'Q'));
      return E.notation.rhythmSVG({ bars: [{ ts: [4, 4], showTs: true, ev }] }, 300).svg;
    },
    mount(box) { box.classList.add('rhythmroom'); ex = null; draw(box); },
    leave() { playing = false; if (draw._ro) draw._ro.disconnect(); }
  });
})();
