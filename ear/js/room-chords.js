/* Room V — chords */
'use strict';
(function () {
  const h = E.h, T = E.t;
  const GROUPS = [
    { id: 'tri', name: { en: 'Triads', de: 'Dreiklänge', fr: 'Accords de trois sons', cs: 'Kvintakordy' } },
    { id: 'sev', name: { en: 'Seventh chords', de: 'Septakkorde', fr: 'Accords de septième', cs: 'Septakordy' } },
    { id: 'jazz', name: { en: 'Extended and jazz chords', de: 'Erweiterte und Jazzakkorde', fr: 'Accords enrichis et jazz', cs: 'Rozšířené a jazzové akordy' } },
    { id: 'spec', name: { en: 'Special chords', de: 'Besondere Akkorde', fr: 'Accords particuliers', cs: 'Zvláštní akordy' } }
  ];
  // [id, group, semitones above the bass (voicing), en, de, fr, cs, invertible]
  const C = [
    ['maj', 'tri', [0, 4, 7], 'major triad', 'Dur-Dreiklang', 'accord parfait majeur', 'durový kvintakord', 1],
    ['min', 'tri', [0, 3, 7], 'minor triad', 'Moll-Dreiklang', 'accord parfait mineur', 'mollový kvintakord', 1],
    ['dim', 'tri', [0, 3, 6], 'diminished triad', 'verminderter Dreiklang', 'accord de quinte diminuée', 'zmenšený kvintakord', 1],
    ['aug', 'tri', [0, 4, 8], 'augmented triad', 'übermäßiger Dreiklang', 'accord de quinte augmentée', 'zvětšený kvintakord', 0],
    ['sus2', 'tri', [0, 2, 7], 'suspended second (sus2)', 'Sus2-Akkord', 'accord sus2', 'akord sus2', 0],
    ['sus4', 'tri', [0, 5, 7], 'suspended fourth (sus4)', 'Sus4-Akkord', 'accord sus4', 'akord sus4', 0],
    ['dom7', 'sev', [0, 4, 7, 10], 'dominant seventh', 'Dominantseptakkord', 'septième de dominante', 'dominantní septakord', 1],
    ['maj7', 'sev', [0, 4, 7, 11], 'major seventh (maj7)', 'großer Durseptakkord (maj7)', 'septième majeure (maj7)', 'velký septakord (maj7)', 1],
    ['min7', 'sev', [0, 3, 7, 10], 'minor seventh (m7)', 'kleiner Mollseptakkord (m7)', 'septième mineure (m7)', 'malý mollový septakord (m7)', 1],
    ['hdim7', 'sev', [0, 3, 6, 10], 'half-diminished seventh (m7♭5)', 'halbverminderter Septakkord (m7♭5)', 'septième semi-diminuée (m7♭5)', 'malý zmenšený septakord (m7♭5)', 1],
    ['dim7', 'sev', [0, 3, 6, 9], 'diminished seventh', 'verminderter Septakkord', 'septième diminuée', 'zmenšený septakord', 0],
    ['mmaj7', 'sev', [0, 3, 7, 11], 'minor-major seventh (m maj7)', 'Moll-Dur-Septakkord (m maj7)', 'mineur septième majeure (m maj7)', 'velký mollový septakord (m maj7)', 1],
    ['augmaj7', 'sev', [0, 4, 8, 11], 'augmented major seventh (maj7♯5)', 'übermäßiger großer Septakkord (maj7♯5)', 'septième majeure quinte augmentée', 'velký zvětšený septakord (maj7♯5)', 1],
    ['aug7', 'sev', [0, 4, 8, 10], 'augmented seventh (7♯5)', 'übermäßiger Dominantseptakkord (7♯5)', 'septième de dominante quinte augmentée (7♯5)', 'zvětšený dominantní septakord (7♯5)', 1],
    ['7sus4', 'sev', [0, 5, 7, 10], 'dominant seventh sus4', 'Dominantseptakkord mit Quartvorhalt (7sus4)', 'septième de dominante sus4', 'dominantní septakord sus4', 0],
    ['6', 'jazz', [0, 4, 7, 9], 'major sixth (6)', 'Dur mit Sexte (6)', 'majeur sixte ajoutée (6)', 'dur se sextou (6)', 0],
    ['m6', 'jazz', [0, 3, 7, 9], 'minor sixth (m6)', 'Moll mit großer Sexte (m6)', 'mineur sixte ajoutée (m6)', 'moll se sextou (m6)', 0],
    ['add9', 'jazz', [0, 4, 7, 14], 'added ninth (add9)', 'Dur mit None (add9)', 'majeur neuvième ajoutée (add9)', 'dur s nonou (add9)', 0],
    ['69', 'jazz', [0, 4, 9, 14, 19], 'six-nine (6/9)', 'Sext-Non-Akkord (6/9)', 'sixte-neuvième (6/9)', 'akord 6/9', 0],
    ['dom9', 'jazz', [0, 4, 10, 14, 19], 'dominant ninth (9)', 'Dominantnonakkord (9)', 'neuvième de dominante (9)', 'dominantní nonový akord (9)', 0],
    ['maj9', 'jazz', [0, 4, 11, 14, 19], 'major ninth (maj9)', 'großer Nonakkord (maj9)', 'neuvième majeure (maj9)', 'velký nonový akord (maj9)', 0],
    ['min9', 'jazz', [0, 3, 10, 14, 19], 'minor ninth (m9)', 'Moll-Nonakkord (m9)', 'neuvième mineure (m9)', 'mollový nonový akord (m9)', 0],
    ['7b9', 'jazz', [0, 4, 10, 13, 19], 'dominant seventh flat nine (7♭9)', 'Dominantseptakkord mit kleiner None (7♭9)', 'septième de dominante neuvième mineure (7♭9)', 'dominantní septakord s malou nonou (7♭9)', 0],
    ['7s9', 'jazz', [0, 4, 10, 15, 19], 'dominant seventh sharp nine (7♯9, “Hendrix chord”)', 'Dominantseptakkord mit übermäßiger None (7♯9, „Hendrix-Akkord“)', 'septième de dominante neuvième augmentée (7♯9, « accord Hendrix »)', 'dominantní septakord se zvětšenou nonou (7♯9, „Hendrixův akord“)', 0],
    ['9s11', 'jazz', [0, 4, 10, 14, 18], 'lydian dominant (9♯11)', 'lydischer Dominantakkord (9♯11)', 'dominante lydienne (9♯11)', 'lydický dominantní akord (9♯11)', 0],
    ['maj7s11', 'jazz', [0, 4, 11, 14, 18], 'lydian major seventh (maj7♯11)', 'lydischer großer Septakkord (maj7♯11)', 'septième majeure lydienne (maj7♯11)', 'lydický velký septakord (maj7♯11)', 0],
    ['min11', 'jazz', [0, 3, 10, 14, 17], 'minor eleventh (m11)', 'Moll-Undezimakkord (m11)', 'onzième mineure (m11)', 'mollový undecimový akord (m11)', 0],
    ['dom13', 'jazz', [0, 4, 10, 14, 21], 'dominant thirteenth (13)', 'Dominant-Tredezimakkord (13)', 'treizième de dominante (13)', 'dominantní tercdecimový akord (13)', 0],
    ['alt', 'jazz', [0, 4, 10, 15, 20], 'altered dominant (7alt: ♯9 ♭13)', 'alterierter Dominantakkord (7alt: ♯9 ♭13)', 'dominante altérée (7alt : ♯9 ♭13)', 'alterovaný dominantní akord (7alt: ♯9 ♭13)', 0],
    ['tristan', 'spec', [0, 6, 10, 15], 'Tristan chord (Wagner)', 'Tristan-Akkord (Wagner)', 'accord de Tristan (Wagner)', 'tristanovský akord (Wagner)', 0],
    ['prometheus', 'spec', [0, 6, 10, 16, 21, 26], 'Prometheus chord (Scriabin’s “mystic chord”)', 'Prometheus-Akkord (Skrjabins „mystischer Akkord“)', 'accord de Prométhée (« accord mystique » de Scriabine)', 'Prométheův akord (Skrjabinův „mystický akord“)', 0],
    ['petrushka', 'spec', [0, 4, 7, 18, 22, 25], 'Petrushka chord (Stravinsky)', 'Petruschka-Akkord (Strawinsky)', 'accord de Petrouchka (Stravinsky)', 'petruškovský akord (Stravinskij)', 0],
    ['sowhat', 'spec', [0, 5, 10, 15, 19], '“So What” chord (Bill Evans)', '„So What“-Akkord (Bill Evans)', 'accord « So What » (Bill Evans)', 'akord „So What“ (Bill Evans)', 0],
    ['quartal', 'spec', [0, 5, 10, 15], 'quartal chord (stacked fourths)', 'Quartenakkord', 'accord de quartes superposées', 'kvartový akord', 0],
    ['farben', 'spec', [0, 8, 11, 16, 21], 'Farben chord (Schoenberg, op. 16 no. 3)', 'Farben-Akkord (Schönberg, op. 16 Nr. 3)', 'accord de « Farben » (Schoenberg, op. 16 no 3)', 'akord „Farben“ (Schönberg, op. 16 č. 3)', 0],
    ['frenchsixth', 'spec', [0, 4, 6, 10], 'French augmented sixth', 'französischer übermäßiger Sextakkord', 'sixte augmentée française', 'francouzský zvětšený sextakord', 0],
    ['wholetone', 'spec', [0, 2, 4, 6, 8, 10], 'whole-tone chord', 'Ganztonakkord', 'accord par tons', 'celotónový akord', 0],
  ].map(a => ({ id: a[0], g: a[1], iv: a[2], name: { en: a[3], de: a[4], fr: a[5], cs: a[6] }, inv: a[7] }));
  const BY = Object.fromEntries(C.map(c => [c.id, c]));
  const BASIC = ['maj', 'min', 'dim', 'aug'];

  const cfg = Object.assign({ on: BASIC.slice(), how: 'both', inv: false, dur: 1.8 }, E.load('cfg.chords', {}));
  const save = () => E.save('cfg.chords', cfg);

  function voicing(ch, inv) {
    let v = ch.iv.slice();
    for (let i = 0; i < inv; i++) { const x = v.shift(); v.push(x + 12); }
    const b = v[0]; return v.map(x => x - b);
  }
  function play(q, id) {
    const ch = BY[id || q.ch.id];
    const v = id ? voicing(ch, 0) : q.v;
    const A = E.audio; A.stop();
    let t = A.now();
    const step = .32;
    if (cfg.how === 'arp' || cfg.how === 'both') { v.forEach((s, i) => A.tone(E.mtof(q.bass + s), t + i * step, Math.max(.5, (v.length - i) * step + .4), { vol: .26 })); t += v.length * step + .7; }
    if (cfg.how === 'block' || cfg.how === 'both') v.forEach(s => A.tone(E.mtof(q.bass + s), t, cfg.dur, { vol: .24 }));
  }

  const spec = {
    id: 'chords', cols: 3, groupHeads: true,
    options: () => GROUPS.flatMap(g => C.filter(c => c.g === g.id && cfg.on.includes(c.id)).map(c => ({ id: c.id, label: E.tn(c.name), group: E.tn(g.name) }))),
    ask() {
      const ids = cfg.on.length ? cfg.on : BASIC;
      const ch = BY[E.pick(ids)];
      const inv = cfg.inv && ch.inv ? E.rand(ch.iv.length) : 0;
      const v = voicing(ch, inv);
      const span = v[v.length - 1];
      const lo = 43, hi = Math.max(lo, 79 - span);              // keep the chord between G2 and G5
      const bass = Math.min(hi, lo + E.rand(Math.max(1, Math.min(14, hi - lo + 1))));
      return { ch, v, inv, bass, answer: ch.id };
    },
    play: q => play(q),
    compare: (q, id) => play(q, id),
    prompt: () => T('Which chord is it?'),
    reveal(q) {
      const invName = q.inv ? ' · ' + T(['', 'first inversion', 'second inversion', 'third inversion', 'fourth inversion'][q.inv]) : (q.ch.inv && cfg.inv ? ' · ' + T('root position') : '');
      return `${T('It was')}${E.colon()}<b>${E.tn(q.ch.name)}</b>${invName}`;
    },
    settings(el, rerun) {
      GROUPS.forEach(g => {
        const ids = C.filter(c => c.g === g.id).map(c => c.id);
        el.append(h('div', { class: 'sethead' }, E.tn(g.name), ' ',
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = cfg.on.filter(x => !ids.includes(x)).concat(ids); save(); rerun(); } }, T('all')),
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = cfg.on.filter(x => !ids.includes(x)); save(); rerun(); } }, T('none'))),
          E.chips(C.filter(c => c.g === g.id).map(c => ({ id: c.id, label: E.tn(c.name), on: cfg.on.includes(c.id) })), (id, on) => {
            cfg.on = C.map(c => c.id).filter(x => x === id ? on : cfg.on.includes(x)); save(); rerun();
          }));
      });
      el.append(
        E.selectField(T('Playback'), cfg.how, [{ v: 'both', l: T('broken, then together') }, { v: 'block', l: T('together only') }, { v: 'arp', l: T('broken only') }], v => { cfg.how = v; save(); }),
        E.checkField(T('Inversions (triads and seventh chords)'), cfg.inv, v => { cfg.inv = v; save(); }));
    }
  };

  E.room({
    id: 'chords', num: 'V', title: 'Chords',
    desc: 'Triads, seventh chords, jazz harmony and famous sonorities such as the Tristan and Prometheus chords.',
    meta: '{n} chord types · inversions', metaVars: { n: C.length },
    lede: 'A chord sounds, broken and then together. Choose its type. In the settings you can add seventh chords, jazz chords and special chords, and switch inversions on.',
    icon: () => E.notation.notesSVG('treble', [{ dia: 30 }, { dia: 32, chord: 1 }, { dia: 34, chord: 1 }, { dia: 36, chord: 1 }], { SP: 9, minW: 150 }),
    spec,
    mount(box) { box.classList.add('quiz'); E.quiz(spec, box); }
  });
})();
