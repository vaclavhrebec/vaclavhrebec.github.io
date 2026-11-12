/* Room X — metre.
   A few bars of music play: a melody over a bass that moves with the bars. The player names the metre,
   either as a modern time signature or as a mensuration sign. Accents can be clear or subtle. */
'use strict';
(function () {
  const h = E.h, T = E.t;
  /* groups: the beats of a bar, in eighths (simple beats are 2 eighths, compound 3); acc: strength per group */
  const METRES = [
    { id: '24', label: '2/4', groups: [2, 2] },
    { id: '34', label: '3/4', groups: [2, 2, 2] },
    { id: '44', label: '4/4', groups: [2, 2, 2, 2] },
    { id: '68', label: '6/8', groups: [3, 3] },
    { id: '98', label: '9/8', groups: [3, 3, 3] },
    { id: '128', label: '12/8', groups: [3, 3, 3, 3] },
    { id: '54', label: '5/4', groups: [2, 2, 2, 2, 2], sub: '3 + 2', strong: [0, 3] },
    { id: '58', label: '5/8', groups: [3, 2], sub: '3 + 2' },
    { id: '78', label: '7/8', groups: [2, 2, 3], sub: '2 + 2 + 3' }
  ];
  /* mensuration: what one breve holds. O: three semibreves; C: two; ⊙: three semibreves of three minims; C·: two of three.
     Played as the bar of a breve, with the minim as the unit */
  const MENS = [
    { id: 'O', label: 'O', sub: { en: 'tempus perfectum', de: 'tempus perfectum', fr: 'tempus perfectum', cs: 'tempus perfectum' }, groups: [2, 2, 2] },
    { id: 'C', label: 'C', sub: { en: 'tempus imperfectum', de: 'tempus imperfectum', fr: 'tempus imperfectum', cs: 'tempus imperfectum' }, groups: [2, 2] },
    { id: 'Od', label: '⊙', sub: { en: 'perfectum, prolatio maior', de: 'perfectum, prolatio maior', fr: 'perfectum, prolatio maior', cs: 'perfectum, prolatio maior' }, groups: [3, 3, 3] },
    { id: 'Cd', label: 'C·', sub: { en: 'imperfectum, prolatio maior', de: 'imperfectum, prolatio maior', fr: 'imperfectum, prolatio maior', cs: 'imperfectum, prolatio maior' }, groups: [3, 3] }
  ];
  const cfg = Object.assign({ on: ['34', '44', '68'], sign: 'modern', acc: 'clear', tempo: 1 }, E.load('cfg.metre', {}));
  const save = () => E.save('cfg.metre', cfg);
  const list = () => cfg.sign === 'mens' ? MENS : METRES.filter(m => cfg.on.includes(m.id));

  /* a passage: each bar = its groups; each group filled with a little rhythm (in eighths) */
  const SIMPLE = [[2], [1, 1], [2], [1, 1], [1.5, .5]], COMP = [[3], [2, 1], [1, 1, 1], [3], [2, 1]];
  const SCALE = [0, 2, 4, 5, 7, 9, 11, 12, 14];
  /* how strong each group of the bar is: 2 the downbeat, 1 a secondary accent, 0 a weak beat */
  function accentOf(m, gi) {
    if (gi === 0) return 2;
    if (m.strong) return m.strong.includes(gi) ? 1 : 0;
    if (m.groups.some(g => g !== m.groups[0])) return 1;        // irregular metres: every group starts with an accent
    return m.groups.length === 4 && gi === 2 ? 1 : 0;           // 4/4 and 12/8: the middle of the bar
  }
  function make(m) {
    const bars = m.groups.length >= 4 ? 3 : 4, out = [];
    let deg = 4 + E.rand(3);
    const harm = [0, 3, 4, 0, 5, 3, 4, 0];               // I IV V I vi IV V I: one chord per bar
    for (let b = 0; b < bars; b++) {
      m.groups.forEach((g, gi) => {
        let pat = E.pick(g === 3 ? COMP : SIMPLE);
        if (b === bars - 1 && gi === m.groups.length - 1) pat = [g];
        pat.forEach((d, k) => {
          deg = Math.max(0, Math.min(SCALE.length - 1, deg + E.pick([-1, 1, 1, -1, 0, 2, -2])));
          out.push({ bar: b, d, acc: k === 0 ? accentOf(m, gi) : -1, pitch: SCALE[deg], harm: harm[b % harm.length], first: gi === 0 && k === 0 });
        });
      });
    }
    return out;
  }
  function play(q) {
    const A = E.audio; A.stop();
    const eighth = (cfg.sign === 'mens' ? .26 : .21) / cfg.tempo;
    let t = A.now() + .1;
    const tonic = q.tonic, clear = cfg.acc === 'clear';
    q.ev.forEach(e => {
      const dur = e.d * eighth;
      const v = clear ? (e.acc === 2 ? .36 : e.acc === 1 ? .28 : e.acc === 0 ? .2 : .14) : (e.acc >= 1 ? .22 : .19);
      A.tone(E.mtof(tonic + 12 + e.pitch), t, dur * .9, { vol: v });
      if (e.first) {                                         // the bass and the harmony change with the bar
        const barLen = q.m.groups.reduce((a, g) => a + g, 0) * eighth;
        const r = tonic - 12 + [0, 2, 4, 5, 7, 9, 11][e.harm];
        A.tone(E.mtof(r), t, barLen * .95, { vol: clear ? .26 : .2 });
        const third = [0, 3, 4].includes(e.harm) ? 4 : 3;      // I, IV, V major; vi minor
        [third, 7].forEach(s => A.tone(E.mtof(r + 12 + s), t, barLen * .9, { vol: .08 }));
      } else if (clear && e.acc >= 0 && e.acc < 2) {
        A.tone(E.mtof(tonic - 12 + [0, 2, 4, 5, 7, 9, 11][e.harm] + 7), t, e.d * eighth * .7, { vol: .1 });
      }
      t += dur;
    });
  }
  const spec = {
    id: 'metre', cols: 3,
    options: () => list().map(m => ({ id: m.id, label: m.label, sub: m.sub ? (typeof m.sub === 'string' ? m.sub : E.tn(m.sub)) : null })),
    ask() {
      const m = E.pick(list());
      return { m, ev: make(m), tonic: 55 + E.rand(8), answer: m.id };
    },
    play: q => play(q),
    prompt: () => cfg.sign === 'mens' ? T('Which mensuration is it?') : T('Which metre is it?'),
    reveal: q => `${T('It was')}${E.colon()}<b>${q.m.label}</b>${q.m.sub ? ' (' + (typeof q.m.sub === 'string' ? q.m.sub : E.tn(q.m.sub)) + ')' : ''}`,
    settings(el, rerun) {
      el.append(E.selectField(T('Answer with'), cfg.sign, [{ v: 'modern', l: T('time signatures') }, { v: 'mens', l: T('mensuration signs (O, C, ⊙, C·)') }], v => { cfg.sign = v; save(); rerun(); }));
      if (cfg.sign !== 'mens') el.append(h('div', { class: 'sethead' }, T('Time signatures')),
        E.chips(METRES.map(m => ({ id: m.id, label: m.label + (m.sub ? ' (' + m.sub + ')' : ''), on: cfg.on.includes(m.id) })), (id, on) => {
          cfg.on = METRES.map(m => m.id).filter(x => x === id ? on : cfg.on.includes(x)); if (!cfg.on.length) cfg.on = ['34', '44']; save(); rerun();
        }));
      el.append(
        E.selectField(T('Accents'), cfg.acc, [{ v: 'clear', l: T('clear: strong beats are louder') }, { v: 'subtle', l: T('subtle: only the bass and the harmony show the bar') }], v => { cfg.acc = v; save(); }),
        E.rangeField(T('Tempo'), cfg.tempo, .7, 1.5, .05, v => Math.round(v * 100) + ' %', v => { cfg.tempo = v; save(); }),
        h('p', { class: 'note' }, T('Mensuration signs are played with the minim as the pulse: O and C sound like 3/2 and 2/2, ⊙ and C· like 9/4 and 6/4.')));
    }
  };
  E.room({
    id: 'metre', num: 'X', title: 'Metre',
    desc: 'Hear a few bars and name the metre: duple, triple, compound and irregular time, or the mensuration signs of Renaissance music.',
    meta: '9 time signatures · 4 mensuration signs',
    lede: 'A few bars play, a melody over a bass that changes with each bar. Name the metre. In the settings you can add irregular metres, make the accents subtle, or answer with mensuration signs.',
    icon: () => '<svg viewBox="0 0 150 90" class="score"><text x="40" y="44" font-size="36" text-anchor="middle">6</text><text x="40" y="78" font-size="36" text-anchor="middle">8</text><text x="105" y="66" font-size="46" text-anchor="middle">⊙</text></svg>',
    spec,
    mount(box) { box.classList.add('quiz'); E.quiz(spec, box); }
  });
})();
