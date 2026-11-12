/* Room III — key signatures in five clefs */
'use strict';
(function () {
  const h = E.h, T = E.t;
  const CLEFS = ['treble', 'bass', 'soprano', 'alto', 'tenor'];
  const CLEF_NAME = {
    treble: { en: 'treble clef (G)', de: 'Violinschlüssel', fr: 'clé de sol', cs: 'houslový klíč' },
    bass: { en: 'bass clef (F)', de: 'Bassschlüssel', fr: 'clé de fa', cs: 'basový klíč' },
    soprano: { en: 'soprano clef (C1)', de: 'Sopranschlüssel', fr: 'clé d’ut 1re ligne', cs: 'sopránový klíč' },
    alto: { en: 'alto clef (C3)', de: 'Altschlüssel', fr: 'clé d’ut 3e ligne', cs: 'altový klíč' },
    tenor: { en: 'tenor clef (C4)', de: 'Tenorschlüssel', fr: 'clé d’ut 4e ligne', cs: 'tenorový klíč' }
  };
  // tonic of the major key for -7..7 fifths, as {l,a}
  const majorTonic = k => { const p = { l: 0, a: 0, o: 4 }; let q = p; for (let i = 0; i < Math.abs(k); i++) q = E.addInterval(q, k > 0 ? 4 : 3, k > 0 ? 7 : 5); return q; };
  const minorTonic = k => E.addInterval(majorTonic(k), 5, 9);
  function keyName(k, mode) {
    const p = mode === 'minor' ? minorTonic(k) : majorTonic(k);
    let n = E.noteName(p);
    const L = E.lang;
    if (L === 'de') return mode === 'minor' ? n.toLowerCase() + '-Moll' : n + '-Dur';
    if (L === 'cs') return mode === 'minor' ? n.toLowerCase() + ' moll' : n + ' dur';
    if (L === 'fr') return n + (mode === 'minor' ? ' mineur' : ' majeur');
    return n + (mode === 'minor' ? ' minor' : ' major');
  }
  const accCount = k => k === 0 ? T('no accidentals') : Math.abs(k) + ' ' + (k > 0 ? (Math.abs(k) === 1 ? '♯' : '♯') : '♭');

  const cfg = Object.assign({ clefs: CLEFS.slice(), max: 7, mode: 'major' }, E.load('cfg.keys', {}));
  const save = () => E.save('cfg.keys', cfg);

  const spec = {
    id: 'keys', cols: 5,
    options: () => {
      const ks = [];
      for (let k = -cfg.max; k <= cfg.max; k++) ks.push(k);
      return ks.map(k => ({ id: String(k), label: cfg.mode === 'count' ? accCount(k) : keyName(k, cfg.mode), sub: cfg.mode === 'count' ? null : accCount(k) }));
    },
    ask() {
      const clef = E.pick(cfg.clefs.length ? cfg.clefs : CLEFS);
      let k; do { k = E.rand(2 * cfg.max + 1) - cfg.max; } while (spec._last && k === spec._last.k && clef === spec._last.clef && cfg.max > 0);
      spec._last = { k, clef };
      return { k, clef, answer: String(k) };
    },
    prompt: () => T({ major: 'Which major key has this signature?', minor: 'Which minor key has this signature?', count: 'How many accidentals, and which?' }[cfg.mode]),
    reveal: q => `<b>${keyName(q.k, 'major')}</b> / <b>${keyName(q.k, 'minor')}</b> · ${accCount(q.k)} · ${E.tn(CLEF_NAME[q.clef])}`,
    stage(q, el) {
      el.append(h('div', { class: 'keystage', html: q ? E.notation.keySigSVG(q.clef, q.k) : E.notation.keySigSVG('treble', 0) }),
        q ? h('div', { class: 'cap' }, E.tn(CLEF_NAME[q.clef])) : null);
    },
    settings(el, rerun) {
      el.append(
        E.selectField(T('Answer with'), cfg.mode, [{ v: 'major', l: T('the major key') }, { v: 'minor', l: T('the minor key') }, { v: 'count', l: T('the number of sharps or flats') }],
          v => { cfg.mode = v; save(); rerun(); }),
        E.rangeField(T('Up to'), cfg.max, 1, 7, 1, v => v + ' ♯/♭', v => { cfg.max = v; save(); rerun(); }),
        h('div', { class: 'sethead' }, T('Clefs')),
        E.chips(CLEFS.map(c => ({ id: c, label: E.tn(CLEF_NAME[c]), on: cfg.clefs.includes(c) })), (id, on) => {
          cfg.clefs = CLEFS.filter(x => x === id ? on : cfg.clefs.includes(x)); save();
        }));
    }
  };

  E.room({
    id: 'keys', num: 'III', title: 'Key signatures',
    desc: 'Read a key signature at a glance, in treble, bass, soprano, alto and tenor clef.',
    meta: '5 clefs · up to 7 sharps or flats',
    lede: 'A key signature appears in a random clef. Name the key. A silent exercise for the eye: speed comes with practice.',
    icon: () => E.notation.keySigSVG('alto', 3),
    spec,
    mount(box) { box.classList.add('quiz'); E.quiz(spec, box); }
  });
})();
