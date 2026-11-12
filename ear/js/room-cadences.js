/* Room IX — cadences, progressions, ground basses and clausulae.
   Chords are written as Roman numerals in a key (upper case major, lower case minor, ° diminished,
   6 / 64 for inversions) and voiced in four parts with smooth voice leading.
   Clausulae are written out note by note in two or three voices. */
'use strict';
(function () {
  const h = E.h, T = E.t;
  const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
  const GROUPS = [
    { id: 'cad', name: { en: 'Cadences', de: 'Kadenzen', fr: 'Cadences', cs: 'Kadence' } },
    { id: 'prog', name: { en: 'Progressions', de: 'Akkordfolgen', fr: 'Enchaînements', cs: 'Harmonické postupy' } },
    { id: 'ground', name: { en: 'Ground basses and schemata', de: 'Ostinatobässe und Satzmodelle', fr: 'Basses obstinées et schémas', cs: 'Ostinátní basy a modely' } },
    { id: 'claus', name: { en: 'Clausulae (Renaissance)', de: 'Klauseln (Renaissance)', fr: 'Clausules (Renaissance)', cs: 'Klauzule (renesance)' } }
  ];
  /* [id, group, en, de, fr, cs, progression or null, mode ('M' major, 'm' minor, '' either)] */
  const ITEMS = [
    ['auth', 'cad', 'authentic cadence (V–I)', 'authentische Kadenz (V–I)', 'cadence parfaite (V–I)', 'autentická kadence (V–I)', null, ''],
    ['plagal', 'cad', 'plagal cadence (IV–I)', 'plagale Kadenz (IV–I)', 'cadence plagale (IV–I)', 'plagální kadence (IV–I)', null, ''],
    ['half', 'cad', 'half cadence (… V)', 'Halbschluss (… V)', 'demi-cadence (… V)', 'polověta (… V)', null, ''],
    ['decept', 'cad', 'deceptive cadence (V–vi)', 'Trugschluss (V–vi)', 'cadence rompue (V–vi)', 'klamná kadence (V–vi)', null, ''],
    ['phryg', 'cad', 'Phrygian half cadence (iv6–V)', 'phrygischer Halbschluss (iv6–V)', 'demi-cadence phrygienne (iv6–V)', 'frygická polověta (iv6–V)', null, 'm'],
    ['p1451', 'prog', 'I–IV–V–I', 'I–IV–V–I', 'I–IV–V–I', 'I–IV–V–I', 'I IV V I', 'M'],
    ['p1645', 'prog', 'I–vi–IV–V', 'I–vi–IV–V', 'I–vi–IV–V', 'I–vi–IV–V', 'I vi IV V', 'M'],
    ['p1625', 'prog', 'I–vi–ii–V', 'I–vi–ii–V', 'I–vi–ii–V', 'I–vi–ii–V', 'I vi ii V', 'M'],
    ['p1564', 'prog', 'I–V–vi–IV', 'I–V–vi–IV', 'I–V–vi–IV', 'I–V–vi–IV', 'I V vi IV', 'M'],
    ['p251', 'prog', 'ii6–V–I', 'ii6–V–I', 'ii6–V–I', 'ii6–V–I', 'I ii6 V I', 'M'],
    ['p1415', 'prog', 'I–IV–I–V', 'I–IV–I–V', 'I–IV–I–V', 'I–IV–I–V', 'I IV I V', 'M'],
    ['pmanti', 'ground', 'passamezzo antico', 'Passamezzo antico', 'passamezzo antico', 'passamezzo antico', 'i VII i V III VII i V i', 'm'],
    ['pmmod', 'ground', 'passamezzo moderno', 'Passamezzo moderno', 'passamezzo moderno', 'passamezzo moderno', 'I IV I V I IV I V I', 'M'],
    ['romanesca', 'ground', 'romanesca', 'Romanesca', 'romanesca', 'romanesca', 'III VII i V III VII i V i', 'm'],
    ['folia', 'ground', 'folia', 'Folia', 'folia', 'folia', 'i V i VII III VII i V', 'm'],
    ['lament', 'ground', 'lament bass (descending tetrachord)', 'Lamentobass (absteigender Tetrachord)', 'basse de lamento (tétracorde descendant)', 'lamentový bas (sestupný tetrachord)', 'i v6 iv6 V', 'm'],
    ['pachelbel', 'ground', 'Pachelbel’s canon', 'Pachelbels Kanon', 'canon de Pachelbel', 'Pachelbelův kánon', 'I V vi iii IV I IV V', 'M'],
    ['cvera', 'claus', 'clausula vera (major sixth to octave)', 'Clausula vera (große Sexte zur Oktave)', 'clausule vraie (sixte majeure vers l’octave)', 'clausula vera (velká sexta do oktávy)', null, ''],
    ['csusp', 'claus', 'clausula with 7–6 suspension', 'Klausel mit Synkopendissonanz 7–6', 'clausule avec retard 7–6', 'klauzule se synkopou 7–6', null, ''],
    ['cphryg', 'claus', 'Phrygian clausula (mi: tenor falls a semitone)', 'phrygische Klausel (mi: Tenor fällt einen Halbton)', 'clausule phrygienne (mi : le ténor descend d’un demi-ton)', 'frygická klauzule (mi: tenor klesá o půltón)', null, ''],
    ['cbass', 'claus', 'clausula with bassizans (bass falls a fifth)', 'Klausel mit Bassklausel (Bass fällt eine Quinte)', 'clausule avec basse (la basse descend d’une quinte)', 'klauzule s basovým krokem (bas klesá o kvintu)', null, '']
  ].map(a => ({ id: a[0], g: a[1], name: { en: a[2], de: a[3], fr: a[4], cs: a[5] }, prog: a[6], mode: a[7] }));
  const BY = Object.fromEntries(ITEMS.map(x => [x.id, x]));
  const cfg = Object.assign({ on: ['auth', 'plagal', 'half', 'decept'], modes: 'both', sec: 1.0 }, E.load('cfg.cadences', {}));
  const save = () => E.save('cfg.cadences', cfg);

  /* ---------- Roman numerals to chords ---------- */
  const ROM = { i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6 };
  function chord(sym, minor) {
    const m = /^([ivIV]+)(°?)(64|6)?$/.exec(sym);
    const deg = ROM[m[1].toLowerCase()], upper = m[1] !== m[1].toLowerCase();
    const scale = minor ? MIN : MAJ;
    const root = scale[deg];
    const third = root + (upper ? 4 : 3), fifth = root + (m[2] ? 6 : 7);
    const tones = [root, third, fifth];
    const inv = m[3] === '64' ? 2 : m[3] === '6' ? 1 : 0;
    return { pcs: tones.map(x => ((x % 12) + 12) % 12), bass: tones[inv], root };
  }
  /* four-part voicing with the smallest motion; no parallel fifths or octaves if it can be helped */
  function voice(chords, tonic) {
    const out = [];
    let prev = null;
    chords.forEach(c => {
      // bass between E2 and D3 (relative to the tonic chosen so it fits)
      let b = tonic - 12 + ((c.bass % 12) + 12) % 12;
      while (b > 50) b -= 12; while (b < 40) b += 12;
      if (prev && Math.abs(b - prev[0]) > 7) b += b > prev[0] ? -12 : 12;
      if (b < 38) b += 12; if (b > 52) b -= 12;
      const cand = [];
      for (let m = 52; m <= 79; m++) if (c.pcs.includes(((m - tonic) % 12 + 12) % 12)) cand.push(m);
      let best = null, bs = Infinity;
      for (const t of cand) for (const a of cand) for (const s of cand) {
        if (!(t > b && a > t && s > a) || s - t > 24 || s - a > 12 || a - t > 12 || s < 64 || s > 79 || t < 52) continue;
        const pcs = [b, t, a, s].map(x => ((x - tonic) % 12 + 12) % 12);
        if (!c.pcs.slice(0, 2).every(p => pcs.includes(p))) continue;   // root and third present
        let sc = 0;
        if (prev) {
          sc += Math.abs(t - prev[1]) + Math.abs(a - prev[2]) + Math.abs(s - prev[3]);
          const now = [b, t, a, s];
          for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
            const i0 = (prev[j] - prev[i]) % 12, i1 = (now[j] - now[i]) % 12;
            if ((i0 === 7 && i1 === 7) || (i0 === 0 && i1 === 0)) if (prev[i] !== now[i]) sc += 12;
          }
        } else sc += Math.abs(s - 72);
        const thirds = pcs.filter(p => p === c.pcs[1]).length; if (thirds > 1) sc += 3;
        if (sc < bs) { bs = sc; best = [b, t, a, s]; }
      }
      if (!best) best = [b, b + 12 + (c.pcs[1] - c.pcs[0] + 12) % 12, b + 12 + (c.pcs[2] - c.pcs[0] + 12) % 12, b + 24];
      out.push(best); prev = best;
    });
    return out;
  }

  /* ---------- questions ---------- */
  function cadenceProg(id, minor) {
    const T1 = minor ? 'i' : 'I', IV = minor ? 'iv' : 'IV', vi = minor ? 'VI' : 'vi', ii6 = minor ? 'ii°6' : 'ii6';
    const lead = E.pick([[T1, IV], [T1, vi], [T1, ii6], [vi, IV], [T1, T1 + '6']]);
    if (id === 'auth') return [...lead, 'V', T1];
    if (id === 'plagal') return [T1, 'V', IV, T1];
    if (id === 'half') return [...E.pick([[T1, IV], [T1, ii6], [vi, ii6]]), E.pick([T1 + '64', IV, T1]), 'V'];
    if (id === 'decept') return [...lead, 'V', vi];
    if (id === 'phryg') return ['i', 'VI', 'iv6', 'V'];
  }
  /* clausulae in C (final C4 = 60): voices as [[midi, beats], ...] */
  function clausula(id) {
    const C = 60;
    if (id === 'cvera') return [[[C + 12, 1], [C + 11, 1], [C + 12, 2]], [[C + 4, 1], [C + 2, 1], [C, 2]]];
    if (id === 'csusp') return [[[C + 12, 2], [C + 11, 1], [C + 12, 2]], [[C + 4, 1], [C + 2, 2], [C, 2]]];
    if (id === 'cphryg') return [[[C + 16, 1], [C + 14, 1], [C + 16, 2]], [[C + 7, 1], [C + 5, 1], [C + 4, 2]]];
    if (id === 'cbass') return [[[C + 12, 1], [C + 11, 1], [C + 12, 2]], [[C + 4, 1], [C + 2, 1], [C, 2]], [[C - 12, 1], [C - 17, 1], [C - 12, 2]]];
  }
  function build(id, base) {
    const it = BY[id];
    if (it.g === 'claus') return { kind: 'lines', lines: clausula(id), shift: base.shift };
    const minor = it.mode === 'm' ? true : it.mode === 'M' ? false : base.minor;
    const syms = it.prog ? it.prog.split(' ') : cadenceProg(id, minor);
    return { kind: 'chords', minor, syms, chords: voice(syms.map(s => chord(s, minor)), base.tonic) };
  }
  function play(q, id) {
    const x = id ? build(id, q.base) : q.x;
    const A = E.audio; A.stop();
    let t = A.now();
    const sec = cfg.sec;
    if (x.kind === 'chords') {
      x.chords.forEach((v, i) => { const last = i === x.chords.length - 1; v.forEach(m => A.tone(E.mtof(m), t, sec * (last ? 1.8 : .95), { vol: .17 })); t += sec; });
    } else {
      x.lines.forEach(line => { let tt = t; line.forEach(([m, b]) => { A.tone(E.mtof(m + x.shift), tt, b * sec * .55 * .96, { vol: .24 }); tt += b * sec * .55; }); });
    }
  }
  function pool() {
    let ids = cfg.on.length ? cfg.on : ['auth', 'plagal', 'half', 'decept'];
    if (cfg.modes === 'major') ids = ids.filter(i => BY[i].mode !== 'm' || BY[i].g === 'claus');
    if (cfg.modes === 'minor') ids = ids.filter(i => BY[i].mode !== 'M');
    return ids.length ? ids : ['auth'];
  }
  const spec = {
    id: 'cadences', cols: 2, groupHeads: true,
    options: () => GROUPS.flatMap(g => ITEMS.filter(x => x.g === g.id && pool().includes(x.id)).map(x => ({ id: x.id, label: E.tn(x.name), group: E.tn(g.name) }))),
    ask() {
      const id = E.pick(pool()), it = BY[id];
      const minor = it.mode === 'm' || (it.mode === '' && (cfg.modes === 'minor' || (cfg.modes === 'both' && Math.random() < .4)));
      const base = { tonic: 57 + E.rand(10), minor, shift: E.rand(10) - 5 };   // tonic between A3 and F♯4
      const x = build(id, base);
      // a progression that ends in a cadence is also that cadence: both answers count, when both are on
      let answer = id;
      if (x.kind === 'chords' && it.prog) {
        const [a, z] = x.syms.slice(-2), tonic = /^(I|i)$/.test(z);
        const also = a === 'V' && tonic ? 'auth' : /^(IV|iv)$/.test(a) && tonic ? 'plagal' : z === 'V' ? 'half' : a === 'V' && /^(vi|VI)$/.test(z) ? 'decept' : null;
        if (also && pool().includes(also)) answer = [id, also];
      }
      return { base, x, answer };
    },
    play: q => play(q),
    compare: (q, id) => play(q, id),
    prompt: () => T('Which cadence, progression or model is it?'),
    reveal(q) {
      const it = BY[[].concat(q.answer)[0]];
      const syms = q.x.kind === 'chords' ? ' · ' + q.x.syms.join(' – ') : '';
      return `${T('It was')}${E.colon()}<b>${E.tn(it.name)}</b>${syms}`;
    },
    settings(el, rerun) {
      GROUPS.forEach(g => {
        const ids = ITEMS.filter(x => x.g === g.id).map(x => x.id);
        el.append(h('div', { class: 'sethead' }, E.tn(g.name), ' ',
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = cfg.on.filter(x => !ids.includes(x)).concat(ids); save(); rerun(); } }, T('all')),
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = cfg.on.filter(x => !ids.includes(x)); save(); rerun(); } }, T('none'))),
          E.chips(ITEMS.filter(x => x.g === g.id).map(x => ({ id: x.id, label: E.tn(x.name), on: cfg.on.includes(x.id) })), (id, on) => {
            cfg.on = ITEMS.map(x => x.id).filter(x => x === id ? on : cfg.on.includes(x)); save(); rerun();
          }));
      });
      el.append(
        E.selectField(T('Major and minor'), cfg.modes, [{ v: 'both', l: T('both') }, { v: 'major', l: T('major only') }, { v: 'minor', l: T('minor only') }], v => { cfg.modes = v; save(); rerun(); }),
        E.rangeField(T('Time per chord'), cfg.sec, .5, 2, .1, v => v.toFixed(1) + ' s', v => { cfg.sec = v; save(); }));
    }
  };
  E.room({
    id: 'cadences', num: 'IX', title: 'Cadences and progressions',
    desc: 'Cadences, common progressions, ground basses such as the romanesca, folia and passamezzo, and the clausulae of Renaissance counterpoint.',
    meta: '{n} cadences and models · four voices', metaVars: { n: ITEMS.length },
    lede: 'A short passage plays in four voices (the clausulae in two or three). Name the cadence, the progression or the model. In the settings you can add progressions, ground basses and clausulae.',
    icon: () => E.notation.notesSVG('bass', [{ dia: 18 }, { dia: 24, chord: 1 }, { dia: 21 }, { dia: 25, chord: 1 }, { dia: 14 }, { dia: 23, chord: 1 }], { SP: 8, gap: 3.4, minW: 150 }),
    spec,
    mount(box) { box.classList.add('quiz'); E.quiz(spec, box); }
  });
})();
