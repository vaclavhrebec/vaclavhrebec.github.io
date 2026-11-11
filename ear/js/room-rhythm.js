/* Room IV — rhythm: graded reading and dictation examples of about 50 notes */
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
    'Septuplets and everything combined'
  ];
  // metres: groups of Q (one quarter = two eighths) and D (dotted quarter = three eighths)
  const METRES = [
    { ts: [2, 4], g: 'QQ', lv: 1 }, { ts: [3, 4], g: 'QQQ', lv: 1 }, { ts: [4, 4], g: 'QQQQ', lv: 1, w: 1.5 },
    { ts: [3, 8], g: 'D', lv: 3, w: .5 }, { ts: [6, 8], g: 'DD', lv: 3, w: 1.5 },
    { ts: [9, 8], g: 'DDD', lv: 4 }, { ts: [12, 8], g: 'DDDD', lv: 4 },
    { ts: [5, 8], g: 'QD', lv: 6 }, { ts: [5, 8], g: 'DQ', lv: 6 }, { ts: [7, 8], g: 'QQD', lv: 6, w: 1.2 }, { ts: [7, 8], g: 'DQQ', lv: 6 }, { ts: [7, 8], g: 'QDQ', lv: 6, w: .6 }, { ts: [5, 4], g: 'QQQQQ', lv: 6, w: .6 },
    { ts: [11, 8], g: 'QQDQQ', lv: 7 }, { ts: [11, 8], g: 'DDDQ', lv: 7 }, { ts: [9, 8], g: 'QQQD', lv: 7 }, { ts: [8, 8], g: 'DDQ', lv: 7 },
    { ts: [13, 8], g: 'DDQQD', lv: 8, w: .6 }
  ];
  // cells: s = notation, g = group type, n = groups spanned, lv = first level, w = weight, a = alignment rule
  const CELLS = [
    // one quarter (Q)
    ['q', 'Q', 1, 1, 4], ['8 8', 'Q', 1, 1, 3], ['h', 'Q', 2, 1, 2, 'even'], ['w', 'Q', 4, 1, .6, 'bar'], ['rq', 'Q', 1, 1, .8],
    ['q. 8', 'Q', 2, 2, 1.5, 'even'], ['h.', 'Q', 3, 2, .6, 'bar'], ['r8 8', 'Q', 1, 2, 1], ['8 r8', 'Q', 1, 2, .5], ['rh', 'Q', 2, 2, .3, 'even'],
    ['16 16 16 16', 'Q', 1, 3, 2], ['8 16 16', 'Q', 1, 3, 2], ['16 16 8', 'Q', 1, 3, 2], ['8. 16', 'Q', 1, 3, 1.5],
    ['16 8 16', 'Q', 1, 4, 1.5], ['8 q 8', 'Q', 2, 4, 1.5], ['16 8.', 'Q', 1, 4, .6], ['r16 16 8', 'Q', 1, 4, .5], ['r8 16 16', 'Q', 1, 4, .6], ['q h q', 'Q', 4, 4, .5, 'bar'], ['q. q.', 'Q', 3, 4, .4, 'bar'],
    ['3[8 8 8]', 'Q', 1, 5, 2], ['3[q 8]', 'Q', 1, 5, 1], ['3[8 q]', 'Q', 1, 5, .7], ['3[8 r8 8]', 'Q', 1, 5, .5],
    ['3[q q q]', 'Q', 2, 6, 1, 'even'], ['3[16 16 16] 8', 'Q', 1, 6, .6], ['8 3[16 16 16]', 'Q', 1, 6, .6],
    ['5[16 16 16 16 16]', 'Q', 1, 7, 1], ['6[16 16 16 16 16 16]', 'Q', 1, 7, .7], ['3[16 16 16] 3[16 16 16]', 'Q', 1, 7, .4],
    ['7[16 16 16 16 16 16 16]', 'Q', 1, 8, 1], ['5[8 8 8 8 8]', 'Q', 2, 8, .6], ['3[8. 16 8]', 'Q', 1, 8, .5],
    // one dotted quarter (D)
    ['q 8', 'D', 1, 3, 3], ['8 8 8', 'D', 1, 3, 3], ['q.', 'D', 1, 3, 2], ['h.', 'D', 2, 3, .8, 'even'],
    ['8 q', 'D', 1, 4, 1.5], ['r8 8 8', 'D', 1, 4, 1], ['8. 16 8', 'D', 1, 4, 1.5], ['16 16 8 8', 'D', 1, 4, 1], ['8 16 16 8', 'D', 1, 4, 1], ['8 8 16 16', 'D', 1, 4, .7], ['rq 8', 'D', 1, 4, .5],
    ['2[8 8]', 'D', 1, 5, 1.5],
    ['4[8 8 8 8]', 'D', 1, 6, 1], ['16 16 16 16 16 16', 'D', 1, 6, .8],
    ['16 8 16 8', 'D', 1, 7, .6], ['8 16 8 16', 'D', 1, 7, .5],
    ['5[16 16 16 16 16]', 'D', 1, 8, .5], ['7[16 16 16 16 16 16 16]', 'D', 1, 8, .3]
  ].map(c => ({ s: c[0], g: c[1], n: c[2], lv: c[3], w: c[4], a: c[5] || null }));

  const NOM = { w: 4, h: 2, q: 1, '8': .5, '16': .25, '32': .125 };
  const DEF_M = { 2: 3, 3: 2, 4: 3, 5: 4, 6: 4, 7: 4 };
  let tupSeq = 0, beamSeq = 0;
  function parseCell(s, groupType) {
    const out = [];
    const re = /(\d)(?::(\d))?\[([^\]]+)\]|(r?)(w|h|q|8|16|32)(\.?)/g;
    let m;
    while ((m = re.exec(s))) {
      if (m[1]) {
        const n = +m[1];
        let mm = m[2] ? +m[2] : DEF_M[n];
        if (groupType === 'D' && n === 5) mm = 6;          // quintuplet in a dotted beat: 5 in the time of 6
        if (groupType === 'D' && n === 7) mm = 6;
        const id = ++tupSeq;
        m[3].trim().split(/\s+/).forEach(tok => {
          const t = /(r?)(w|h|q|8|16|32)(\.?)/.exec(tok);
          const nom = NOM[t[2]] * (t[3] ? 1.5 : 1);
          out.push({ rest: !!t[1], v: t[2], dot: t[3] ? 1 : 0, d: nom * mm / n, tup: { id, n, m: mm, ratio: !!m[2] || (groupType === 'D' && (n === 5 || n === 7)) } });
        });
      } else {
        const nom = NOM[m[5]] * (m[6] ? 1.5 : 1);
        out.push({ rest: !!m[4], v: m[5], dot: m[6] ? 1 : 0, d: nom, tup: null });
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
  const len = evs => evs.reduce((a, e) => a + e.d, 0);
  const GL = { Q: 1, D: 1.5 };

  function generate(level, target) {
    target = target || 50;
    const metres = METRES.filter(m => m.lv <= level);
    const metreW = metres.map(m => ({ ...m, w: (m.w || 1) * (m.lv === level ? 2.2 : 1) }));
    const cells = CELLS.filter(c => c.lv <= level).map(c => ({ ...c, w: c.w * (c.lv === level ? 2 : 1) }));
    const changing = level >= 7;
    let metre = E.wpick(level >= 6 ? metreW.filter(m => m.lv >= 6 || Math.random() < .3) : metreW);
    const bars = [];
    let notes = 0, t = 0, prevTs = null, last = null;
    for (let guard = 0; guard < 80 && (notes < target || !bars.length); guard++) {
      if (changing && bars.length && Math.random() < .4) metre = E.wpick(metreW);
      const ev = [];
      const G = metre.g.split('');
      let i = 0;
      while (i < G.length) {
        const type = G[i];
        let run = 0; while (i + run < G.length && G[i + run] === type) run++;
        const ok = cells.filter(c => c.g === type && c.n <= run &&
          (c.a !== 'bar' || (i === 0 && c.n === G.length)) &&
          (c.a !== 'even' || level >= 4 || i % 2 === 0) &&
          !(c.s === 'h.' && type === 'Q' && G.length !== 3 && i !== 0));
        const c = E.wpick(ok);
        const evs = parseCell(c.s, type);
        // ties (from level 4) between notes outside tuplets
        if (level >= 4 && last && !last.rest && !last.tup && !evs[0].rest && !evs[0].tup && Math.random() < .12) last.tie = true;
        evs.forEach(e => { e.t = t; t += e.d; ev.push(e); if (last && last.tie && !last._next) last._next = e; last = e; });
        i += c.n;
      }
      const bar = { ts: metre.ts, showTs: !prevTs || prevTs.join() !== metre.ts.join(), ev, groups: G };
      prevTs = metre.ts;
      bars.push(bar);
      notes += ev.filter((e, k) => !e.rest).length;
    }
    // the final note is never tied onward
    const fin = bars[bars.length - 1].ev; if (fin.length) fin[fin.length - 1].tie = false;
    // attacks: a note that continues a tie is not struck again
    bars.forEach(b => b.ev.forEach(e => { if (e.tie && e._next) e._next.held = true; }));
    const attacks = bars.reduce((a, b) => a + b.ev.filter(e => !e.rest && !e.held).length, 0);
    return { bars, attacks, level, dur: t };
  }
  E.rhythmGenerate = generate;

  const cfg = Object.assign({ level: 1, bpm: 72, metro: true, sound: 'sus', hide: false }, E.load('cfg.rhythm', {}));
  const save = () => E.save('cfg.rhythm', cfg);
  let ex = null, playing = false, shown = false;

  function groupStarts(bar, t0) {
    const out = []; let t = t0;
    bar.groups.forEach((g, i) => { out.push({ t, accent: i === 0 }); t += GL[g]; });
    return out;
  }
  function play(box) {
    if (E.practised) E.practised();   /* listening to a rhythm counts as practice for the day */
    const A = E.audio; A.stop();
    if (playing) { playing = false; updateBtns(box); clearMarks(); return; }
    playing = true; updateBtns(box);
    const q = 60 / cfg.bpm;
    const t0 = A.now() + .1;
    // count-in: one bar of the first metre
    const first = ex.bars[0];
    const ci = groupStarts(first, 0);
    const ciLen = first.groups.reduce((a, g) => a + GL[g], 0);
    ci.forEach(c => A.click(t0 + c.t * q, { f: c.accent ? 2000 : 1500, vol: c.accent ? .45 : .32 }));
    const start = t0 + ciLen * q;
    let barT = 0;
    ex.bars.forEach(b => {
      if (cfg.metro) groupStarts(b, barT).forEach(c => A.click(start + c.t * q, { f: c.accent ? 2000 : 1500, vol: c.accent ? .22 : .15 }));
      barT += b.groups.reduce((a, g) => a + GL[g], 0);
    });
    const marks = [];
    let hi = 0;
    ex.bars.forEach(b => b.ev.forEach(e => {
      if (e.rest) return;
      const id = 'h' + (hi++);
      if (e.held) { return; }
      let d = e.d, n = e; while (n.tie && n._next) { n = n._next; d += n.d; }
      const tt = start + e.t * q;
      if (cfg.sound === 'sus') A.tone(440, tt, Math.max(.08, d * q * .92), { timbre: 'organ', vol: .3 });
      else A.click(tt, { f: 880, vol: .55, d: .09 });
      marks.push({ id, at: (tt - A.get().currentTime) * 1000 });
    }));
    marks.forEach(m => A.later(() => mark(m.id), m.at));
    A.later(() => { playing = false; updateBtns(box); clearMarks(); }, (start + ex.dur * q - A.get().currentTime) * 1000 + 600);
  }
  function mark(id) {
    document.querySelectorAll('.rhythm .nh.on').forEach(n => n.classList.remove('on'));
    const n = document.getElementById(id); if (n) n.classList.add('on');
  }
  function clearMarks() { document.querySelectorAll('.rhythm .nh.on').forEach(n => n.classList.remove('on')); }
  function updateBtns(box) {
    const b = box.querySelector('#rh-play'); if (b) b.textContent = playing ? '■ ' + T('Stop') : '▶ ' + T('Play with count-in');
  }

  function draw(box) {
    box.innerHTML = '';
    const lvl = h('div', { class: 'levelbar wide' }, LEVELS.map((d, i) => h('button', {
      type: 'button', class: 'lv' + (i + 1 === cfg.level ? ' on' : '') + (i + 1 < cfg.level ? ' past' : ''), title: T(d),
      onclick: () => { cfg.level = i + 1; save(); E.audio.stop(); playing = false; ex = generate(cfg.level); shown = false; draw(box); }
    }, h('b', null, i + 1))));
    const sheet = h('div', { class: 'sheet' + (cfg.hide && !shown ? ' hidden' : '') });
    const info = h('div', { class: 'exinfo' });
    const panel = h('div', { class: 'panel' },
      h('div', { class: 'lvhead' }, h('span', null, T('Level'), ' ', h('b', null, cfg.level), ' · ', T(LEVELS[cfg.level - 1]))),
      lvl,
      h('div', { class: 'acts' },
        h('button', { id: 'rh-play', class: 'btn primary', type: 'button', onclick: () => play(box) }, '▶ ' + T('Play with count-in')),
        h('button', { class: 'btn', type: 'button', onclick: () => { E.audio.stop(); playing = false; ex = generate(cfg.level); shown = false; draw(box); } }, T('New example')),
        cfg.hide ? h('button', { class: 'btn', type: 'button', onclick: () => { shown = !shown; sheet.classList.toggle('hidden', !shown); } }, T('Show / hide notation')) : null),
      info);
    const tempoLbl = () => {
      const eighth = ex.bars.some(b => b.ts[1] === 8);
      return '<span class="q">♩</span> = ' + cfg.bpm + (eighth ? ' (<span class="q">♪</span> = ' + cfg.bpm * 2 + ')' : '');
    };
    const set = h('details', { class: 'settings', open: draw._open || null, ontoggle: e => draw._open = e.target.open },
      h('summary', null, T('Settings')),
      h('div', { class: 'setbody' },
        E.rangeField(T('Tempo'), cfg.bpm, 40, 160, 2, v => '♩ = ' + v, v => { cfg.bpm = v; save(); info.firstChild && (info.querySelector('.tempo').innerHTML = tempoLbl()); }),
        E.checkField(T('Metronome during playback'), cfg.metro, v => { cfg.metro = v; save(); }),
        E.selectField(T('Sound'), cfg.sound, [{ v: 'sus', l: T('sustained tone (hear the note lengths)') }, { v: 'perc', l: T('percussive click') }], v => { cfg.sound = v; save(); }),
        E.checkField(T('Dictation: hide the notation until I want to see it'), cfg.hide, v => { cfg.hide = v; save(); shown = false; draw(box); })));
    box.append(panel, sheet, set);
    if (!ex || ex.level !== cfg.level) ex = generate(cfg.level);
    const metres = [...new Set(ex.bars.map(b => b.ts.join('/')))];
    info.append(h('span', null, ex.bars.length + ' ' + T('bars')), h('span', null, ex.attacks + ' ' + T('notes')),
      h('span', null, T('Metre') + ': ' + metres.join(', ')), h('span', { class: 'tempo', html: tempoLbl() }));
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

  E.room({
    id: 'rhythm', num: 'IV', title: 'Rhythm',
    desc: 'Graded reading and dictation examples of about fifty notes: from simple metres to 7/8 and 11/8, syncopation, and tuplets from triplets to septuplets.',
    meta: '8 levels · count-in and metronome',
    lede: 'Read and clap the example, then play it to check yourself. For dictation, hide the notation, listen, write, and compare. Every press of “New example” creates a new one at the chosen level.',
    icon: () => {
      const ev = ['q', '8 8', '16 16 8', '3[8 8 8]'].flatMap(c => parseCell(c, 'Q'));
      return E.notation.rhythmSVG({ bars: [{ ts: [4, 4], showTs: true, ev }] }, 300).svg;
    },
    mount(box) { box.classList.add('rhythmroom'); draw(box); },
    leave() { playing = false; if (draw._ro) draw._ro.disconnect(); }
  });
})();
