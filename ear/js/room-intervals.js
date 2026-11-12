/* Room I — intervals */
'use strict';
(function () {
  const h = E.h, T = E.t;
  // id, semitones, diatonic steps, names
  const IV = [
    ['P1', 0, 0, 'unison', 'Prime', 'unisson', 'prima'],
    ['m2', 1, 1, 'minor second', 'kleine Sekunde', 'seconde mineure', 'malá sekunda'],
    ['M2', 2, 1, 'major second', 'große Sekunde', 'seconde majeure', 'velká sekunda'],
    ['m3', 3, 2, 'minor third', 'kleine Terz', 'tierce mineure', 'malá tercie'],
    ['M3', 4, 2, 'major third', 'große Terz', 'tierce majeure', 'velká tercie'],
    ['P4', 5, 3, 'perfect fourth', 'reine Quarte', 'quarte juste', 'čistá kvarta'],
    ['TT', 6, 3, 'tritone', 'Tritonus', 'triton', 'tritón'],
    ['P5', 7, 4, 'perfect fifth', 'reine Quinte', 'quinte juste', 'čistá kvinta'],
    ['m6', 8, 5, 'minor sixth', 'kleine Sexte', 'sixte mineure', 'malá sexta'],
    ['M6', 9, 5, 'major sixth', 'große Sexte', 'sixte majeure', 'velká sexta'],
    ['m7', 10, 6, 'minor seventh', 'kleine Septime', 'septième mineure', 'malá septima'],
    ['M7', 11, 6, 'major seventh', 'große Septime', 'septième majeure', 'velká septima'],
    ['P8', 12, 7, 'octave', 'Oktave', 'octave', 'oktáva'],
    ['m9', 13, 8, 'minor ninth', 'kleine None', 'neuvième mineure', 'malá nona'],
    ['M9', 14, 8, 'major ninth', 'große None', 'neuvième majeure', 'velká nona'],
    ['m10', 15, 9, 'minor tenth', 'kleine Dezime', 'dixième mineure', 'malá decima'],
    ['M10', 16, 9, 'major tenth', 'große Dezime', 'dixième majeure', 'velká decima'],
    ['P11', 17, 10, 'perfect eleventh', 'reine Undezime', 'onzième juste', 'čistá undecima'],
    ['A11', 18, 10, 'augmented eleventh', 'übermäßige Undezime', 'onzième augmentée', 'zvětšená undecima'],
    ['P12', 19, 11, 'perfect twelfth', 'reine Duodezime', 'douzième juste', 'čistá duodecima'],
    ['m13', 20, 12, 'minor thirteenth', 'kleine Tredezime', 'treizième mineure', 'malá tercdecima'],
    ['M13', 21, 12, 'major thirteenth', 'große Tredezime', 'treizième majeure', 'velká tercdecima'],
    ['m14', 22, 13, 'minor fourteenth', 'kleine Quartdezime', 'quatorzième mineure', 'malá kvartdecima'],
    ['M14', 23, 13, 'major fourteenth', 'große Quartdezime', 'quatorzième majeure', 'velká kvartdecima'],
    ['P15', 24, 14, 'double octave', 'Doppeloktave', 'double octave', 'dvojitá oktáva']
  ].map(a => ({ id: a[0], semi: a[1], steps: a[2], name: { en: a[3], de: a[4], fr: a[5], cs: a[6] } }));
  E.INTERVALS = IV;
  const BY = Object.fromEntries(IV.map(i => [i.id, i]));
  const SIMPLE = ['m2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];
  const ROOTS = [[0, 0], [0, 1], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [3, 1], [4, 0], [5, -1], [5, 0], [6, -1], [6, 0]];

  const cfg = Object.assign({ on: SIMPLE.slice(), dirs: ['up', 'down', 'harm'], dur: .9 }, E.load('cfg.intervals', {}));
  const save = () => E.save('cfg.intervals', cfg);

  function playIv(lowMidi, semi, dir) {
    const A = E.audio; A.stop();
    const t = A.now(), d = cfg.dur;
    const a = E.mtof(lowMidi), b = E.mtof(lowMidi + semi);
    if (dir === 'harm') { A.tone(a, t, d * 1.8); A.tone(b, t, d * 1.8); }
    else if (dir === 'up') { A.tone(a, t, d); A.tone(b, t + d * 1.05, d * 1.2); }
    else { A.tone(b, t, d); A.tone(a, t + d * 1.05, d * 1.2); }
  }

  const spec = {
    id: 'intervals', cols: 4,
    options: () => IV.filter(i => cfg.on.includes(i.id)).map(i => ({ id: i.id, label: E.tn(i.name) })),
    ask() {
      const iv = BY[E.pick(cfg.on.length ? cfg.on : SIMPLE)];
      const dir = E.pick(cfg.dirs.length ? cfg.dirs : ['up']);
      // lower note between G2 and the point where the upper note stays below A5
      let root;
      for (let k = 0; k < 40; k++) {
        const r = ROOTS[E.rand(ROOTS.length)];
        const p = { l: r[0], a: r[1], o: 3 + (Math.random() < .5 ? 0 : 1) };
        const m = E.midiOf(p);
        if (m >= 45 && m + iv.semi <= 81) { root = p; break; }
      }
      root = root || { l: 0, a: 0, o: 4 };
      const top = E.addInterval(root, iv.steps, iv.semi);
      return { answer: iv.id, iv, dir, root, top, low: E.midiOf(root) };
    },
    play: q => playIv(q.low, q.iv.semi, q.dir),
    compare: (q, id) => playIv(q.low, BY[id].semi, q.dir),
    prompt: q => T({ up: 'Ascending interval. Which one is it?', down: 'Descending interval. Which one is it?', harm: 'Harmonic interval. Which one is it?' }[q.dir]),
    reveal(q) {
      const a = E.noteName(q.root), b = E.noteName(q.top);
      const pair = q.dir === 'down' ? b + ' – ' + a : a + ' – ' + b;
      return `${T('It was')}${E.colon()}<b>${E.tn(q.iv.name)}</b> (${pair}, ${q.iv.semi} ${T(q.iv.semi === 1 ? 'semitone' : 'semitones')})`;
    },
    settings(el, rerun) {
      el.append(h('div', { class: 'sethead' }, T('Intervals')),
        E.chips(IV.map(i => ({ id: i.id, label: E.tn(i.name), on: cfg.on.includes(i.id) })), (id, on) => {
          cfg.on = IV.map(i => i.id).filter(x => x === id ? on : cfg.on.includes(x)); save(); rerun();
        }),
        h('div', { class: 'presets' },
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = SIMPLE.slice(); save(); rerun(); } }, T('Within the octave')),
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = IV.filter(i => i.semi > 0).map(i => i.id); save(); rerun(); } }, T('Up to two octaves')),
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = ['m3', 'M3', 'P4', 'P5', 'P8']; save(); rerun(); } }, T('Beginners'))),
        h('div', { class: 'sethead' }, T('Direction')),
        E.chips([{ id: 'up', label: T('ascending'), on: cfg.dirs.includes('up') }, { id: 'down', label: T('descending'), on: cfg.dirs.includes('down') }, { id: 'harm', label: T('harmonic (together)'), on: cfg.dirs.includes('harm') }],
          (id, on) => { cfg.dirs = ['up', 'down', 'harm'].filter(x => x === id ? on : cfg.dirs.includes(x)); save(); }),
        E.rangeField(T('Note length'), cfg.dur, .4, 1.6, .1, v => v.toFixed(1) + ' s', v => { cfg.dur = v; save(); }));
    }
  };

  E.room({
    id: 'intervals', num: 'I', title: 'Intervals',
    desc: 'Hear two notes, melodic or together, and name the interval. From seconds to the double octave.',
    meta: 'Melodic and harmonic · up to two octaves',
    lede: 'Two notes sound, one after the other or together. Choose the interval. After a mistake you can compare your answer with the correct one.',
    icon: () => E.notation.notesSVG('treble', [{ dia: 30 }, { dia: 34 }], { SP: 9, gap: 4, minW: 150 }),
    spec,
    mount(box) { box.classList.add('quiz'); E.quiz(spec, box); }
  });
})();
