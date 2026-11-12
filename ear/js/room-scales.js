/* Room VI — scales and modes, including maqamat with quarter tones */
'use strict';
(function () {
  const h = E.h, T = E.t;
  const GROUPS = [
    ['dia', 'Major and minor', 'Dur und Moll', 'Majeur et mineur', 'Dur a moll'],
    ['modes', 'Church modes', 'Kirchentonarten', 'Modes ecclésiastiques', 'Církevní stupnice'],
    ['penta', 'Pentatonic and blues', 'Pentatonik und Blues', 'Pentatoniques et blues', 'Pentatonika a blues'],
    ['jazz', 'Jazz scales and their modes', 'Jazzskalen und ihre Modi', 'Gammes de jazz et leurs modes', 'Jazzové stupnice a jejich módy'],
    ['messiaen', 'Messiaen’s modes of limited transposition', 'Messiaens Modi mit begrenzter Transponierbarkeit', 'Modes à transpositions limitées de Messiaen', 'Messiaenovy modusy s omezenou transpozicí'],
    ['gypsy', 'Gypsy, Eastern European and other heptatonic scales', 'Zigeunerskalen, osteuropäische und andere Siebentonleitern', 'Gammes tziganes, d’Europe de l’Est et autres heptatoniques', 'Cikánské, východoevropské a jiné sedmitónové stupnice'],
    ['india', 'Indian thaats and ragas', 'Indische Thaats und Ragas', 'Thaats et ragas indiens', 'Indické thaaty a rágy'],
    ['japan', 'Japanese scales', 'Japanische Skalen', 'Gammes japonaises', 'Japonské stupnice'],
    ['maqam', 'Arabic maqamat (quarter tones)', 'Arabische Maqamat (Vierteltöne)', 'Maqâmât arabes (quarts de ton)', 'Arabské makamy (čtvrttóny)']
  ].map(a => ({ id: a[0], name: { en: a[1], de: a[2], fr: a[3], cs: a[4] } }));
  // steps in semitones (may contain .5 for quarter tones); names en/de/fr/cs
  const S = [
    ['major', 'dia', '2 2 1 2 2 2 1', 'major', 'Dur', 'majeur', 'dur'],
    ['natmin', 'dia', '2 1 2 2 1 2 2', 'natural minor', 'natürliches Moll', 'mineur naturel', 'přirozená moll'],
    ['harmin', 'dia', '2 1 2 2 1 3 1', 'harmonic minor', 'harmonisches Moll', 'mineur harmonique', 'harmonická moll'],
    ['melmin', 'dia', '2 1 2 2 2 2 1', 'melodic minor (ascending)', 'melodisches Moll (aufwärts)', 'mineur mélodique (ascendant)', 'melodická moll (vzestupná)'],
    ['harmaj', 'dia', '2 2 1 2 1 3 1', 'harmonic major', 'harmonisches Dur', 'majeur harmonique', 'harmonická dur'],
    ['ionian', 'modes', '2 2 1 2 2 2 1', 'Ionian', 'Ionisch', 'ionien', 'jónská'],
    ['dorian', 'modes', '2 1 2 2 2 1 2', 'Dorian', 'Dorisch', 'dorien', 'dórská'],
    ['phrygian', 'modes', '1 2 2 2 1 2 2', 'Phrygian', 'Phrygisch', 'phrygien', 'frygická'],
    ['lydian', 'modes', '2 2 2 1 2 2 1', 'Lydian', 'Lydisch', 'lydien', 'lydická'],
    ['mixolydian', 'modes', '2 2 1 2 2 1 2', 'Mixolydian', 'Mixolydisch', 'mixolydien', 'mixolydická'],
    ['aeolian', 'modes', '2 1 2 2 1 2 2', 'Aeolian', 'Äolisch', 'éolien', 'aiolská'],
    ['locrian', 'modes', '1 2 2 1 2 2 2', 'Locrian', 'Lokrisch', 'locrien', 'lokrická'],
    ['majpent', 'penta', '2 2 3 2 3', 'major pentatonic', 'Dur-Pentatonik', 'pentatonique majeure', 'durová pentatonika'],
    ['minpent', 'penta', '3 2 2 3 2', 'minor pentatonic', 'Moll-Pentatonik', 'pentatonique mineure', 'mollová pentatonika'],
    ['blues', 'penta', '3 2 1 1 3 2', 'blues scale', 'Bluesskala', 'gamme blues', 'bluesová stupnice'],
    ['majblues', 'penta', '2 1 1 3 2 3', 'major blues scale', 'Dur-Bluesskala', 'gamme blues majeure', 'durová bluesová stupnice'],
    ['dorb2', 'jazz', '1 2 2 2 2 1 2', 'Dorian ♭2 (2nd mode of melodic minor)', 'Dorisch ♭2 (2. Modus von Melodisch Moll)', 'dorien ♭2 (2e mode du mineur mélodique)', 'dórská ♭2 (2. modus melodické moll)'],
    ['lydaug', 'jazz', '2 2 2 2 1 2 1', 'Lydian augmented (3rd mode)', 'Lydisch übermäßig (3. Modus)', 'lydien augmenté (3e mode)', 'lydická zvětšená (3. modus)'],
    ['lyddom', 'jazz', '2 2 2 1 2 1 2', 'Lydian dominant / acoustic scale (4th mode)', 'Lydisch-dominant / akustische Skala (4. Modus)', 'lydien dominant / gamme acoustique (4e mode)', 'lydická dominantní / akustická (4. modus)'],
    ['mixb6', 'jazz', '2 2 1 2 1 2 2', 'Mixolydian ♭6 (5th mode)', 'Mixolydisch ♭6 (5. Modus)', 'mixolydien ♭6 (5e mode)', 'mixolydická ♭6 (5. modus)'],
    ['locn2', 'jazz', '2 1 2 1 2 2 2', 'Locrian ♮2 (6th mode)', 'Lokrisch ♮2 (6. Modus)', 'locrien ♮2 (6e mode)', 'lokrická ♮2 (6. modus)'],
    ['altered', 'jazz', '1 2 1 2 2 2 2', 'altered scale / super-Locrian (7th mode)', 'alterierte Skala / superlokrisch (7. Modus)', 'gamme altérée / superlocrien (7e mode)', 'alterovaná / superlokrická (7. modus)'],
    ['wholetone', 'jazz', '2 2 2 2 2 2', 'whole-tone scale', 'Ganztonleiter', 'gamme par tons', 'celotónová stupnice'],
    ['hwdim', 'jazz', '1 2 1 2 1 2 1 2', 'half-whole diminished', 'Halbton-Ganzton-Leiter', 'diminuée demi-ton–ton', 'zmenšená půltón–celý tón'],
    ['whdim', 'jazz', '2 1 2 1 2 1 2 1', 'whole-half diminished', 'Ganzton-Halbton-Leiter', 'diminuée ton–demi-ton', 'zmenšená celý tón–půltón'],
    ['bebopdom', 'jazz', '2 2 1 2 2 1 1 1', 'bebop dominant', 'Bebop-Dominantskala', 'bebop dominante', 'bebopová dominantní'],
    ['bebopmaj', 'jazz', '2 2 1 2 1 1 2 1', 'bebop major', 'Bebop-Durskala', 'bebop majeure', 'bebopová durová'],
    ['m1', 'messiaen', '2 2 2 2 2 2', 'Messiaen mode 1', 'Messiaen-Modus 1', 'mode 1 de Messiaen', 'Messiaenův modus 1'],
    ['m2', 'messiaen', '1 2 1 2 1 2 1 2', 'Messiaen mode 2 (octatonic)', 'Messiaen-Modus 2 (oktatonisch)', 'mode 2 de Messiaen (octatonique)', 'Messiaenův modus 2 (oktatonika)'],
    ['m3', 'messiaen', '2 1 1 2 1 1 2 1 1', 'Messiaen mode 3', 'Messiaen-Modus 3', 'mode 3 de Messiaen', 'Messiaenův modus 3'],
    ['m4', 'messiaen', '1 1 3 1 1 1 3 1', 'Messiaen mode 4', 'Messiaen-Modus 4', 'mode 4 de Messiaen', 'Messiaenův modus 4'],
    ['m5', 'messiaen', '1 4 1 1 4 1', 'Messiaen mode 5', 'Messiaen-Modus 5', 'mode 5 de Messiaen', 'Messiaenův modus 5'],
    ['m6', 'messiaen', '2 2 1 1 2 2 1 1', 'Messiaen mode 6', 'Messiaen-Modus 6', 'mode 6 de Messiaen', 'Messiaenův modus 6'],
    ['m7', 'messiaen', '1 1 1 2 1 1 1 1 2 1', 'Messiaen mode 7', 'Messiaen-Modus 7', 'mode 7 de Messiaen', 'Messiaenův modus 7'],
    ['hungmin', 'gypsy', '2 1 3 1 1 3 1', 'Hungarian minor (Gypsy minor)', 'Ungarisch-Moll (Zigeunermoll)', 'mineur hongrois (tzigane)', 'maďarská moll (cikánská)'],
    ['hungmaj', 'gypsy', '3 1 2 1 2 1 2', 'Hungarian major', 'Ungarisch-Dur', 'majeur hongrois', 'maďarská dur'],
    ['dblharm', 'gypsy', '1 3 1 2 1 3 1', 'double harmonic (Byzantine)', 'doppelt harmonisch (byzantinisch)', 'double harmonique (byzantine)', 'dvojitě harmonická (byzantská)'],
    ['phrygdom', 'gypsy', '1 3 1 2 1 2 2', 'Phrygian dominant (Spanish Gypsy)', 'Phrygisch-dominant (spanisch)', 'phrygien dominant (espagnol)', 'frygická dominantní (španělská)'],
    ['romanian', 'gypsy', '2 1 3 1 2 1 2', 'Romanian minor (Ukrainian Dorian)', 'Rumänisch-Moll (ukrainisch-dorisch)', 'mineur roumain (dorien ukrainien)', 'rumunská moll (ukrajinská dórská)'],
    ['neapmin', 'gypsy', '1 2 2 2 1 3 1', 'Neapolitan minor', 'neapolitanisches Moll', 'mineur napolitain', 'neapolská moll'],
    ['neapmaj', 'gypsy', '1 2 2 2 2 2 1', 'Neapolitan major', 'neapolitanisches Dur', 'majeur napolitain', 'neapolská dur'],
    ['enigmatic', 'gypsy', '1 3 2 2 2 1 1', 'enigmatic scale (Verdi)', 'enigmatische Skala (Verdi)', 'gamme énigmatique (Verdi)', 'enigmatická stupnice (Verdi)'],
    ['persian', 'gypsy', '1 3 1 1 2 3 1', 'Persian scale', 'persische Skala', 'gamme persane', 'perská stupnice'],
    ['bilawal', 'india', '2 2 1 2 2 2 1', 'Thaat Bilawal', 'Thaat Bilawal', 'thaat Bilawal', 'thaat Bilával'],
    ['khamaj', 'india', '2 2 1 2 2 1 2', 'Thaat Khamaj', 'Thaat Khamaj', 'thaat Khamaj', 'thaat Khamádž'],
    ['kafi', 'india', '2 1 2 2 2 1 2', 'Thaat Kafi', 'Thaat Kafi', 'thaat Kafi', 'thaat Káfí'],
    ['asavari', 'india', '2 1 2 2 1 2 2', 'Thaat Asavari', 'Thaat Asavari', 'thaat Asavari', 'thaat Ásávarí'],
    ['bhairavi', 'india', '1 2 2 2 1 2 2', 'Thaat Bhairavi', 'Thaat Bhairavi', 'thaat Bhairavi', 'thaat Bhairaví'],
    ['bhairav', 'india', '1 3 1 2 1 3 1', 'Thaat Bhairav', 'Thaat Bhairav', 'thaat Bhairav', 'thaat Bhairav'],
    ['kalyan', 'india', '2 2 2 1 2 2 1', 'Thaat Kalyan (Yaman)', 'Thaat Kalyan (Yaman)', 'thaat Kalyan (Yaman)', 'thaat Kaljan (Jaman)'],
    ['marwa', 'india', '1 3 2 1 2 2 1', 'Thaat Marwa', 'Thaat Marwa', 'thaat Marwa', 'thaat Márvá'],
    ['purvi', 'india', '1 3 2 1 1 3 1', 'Thaat Purvi', 'Thaat Purvi', 'thaat Purvi', 'thaat Púrví'],
    ['todi', 'india', '1 2 3 1 1 3 1', 'Thaat Todi', 'Thaat Todi', 'thaat Todi', 'thaat Tódí'],
    ['bhupali', 'india', '2 2 3 2 3', 'Raga Bhupali', 'Raga Bhupali', 'raga Bhupali', 'rága Bhúpálí'],
    ['malkauns', 'india', '3 2 3 2 2', 'Raga Malkauns', 'Raga Malkauns', 'raga Malkauns', 'rága Málkauns'],
    ['durga', 'india', '2 3 2 2 3', 'Raga Durga', 'Raga Durga', 'raga Durga', 'rága Durgá'],
    ['hirajoshi', 'japan', '2 1 4 1 4', 'Hirajōshi', 'Hirajōshi', 'hirajōshi', 'hiradžóši'],
    ['in', 'japan', '1 4 2 1 4', 'In (Miyako-bushi)', 'In (Miyako-bushi)', 'in (miyako-bushi)', 'in (mijako-buši)'],
    ['yo', 'japan', '2 3 2 2 3', 'Yo', 'Yo', 'yo', 'jo'],
    ['iwato', 'japan', '1 4 1 4 2', 'Iwato', 'Iwato', 'iwato', 'iwato'],
    ['insen', 'japan', '1 4 2 3 2', 'Insen', 'Insen', 'insen', 'insen'],
    ['rast', 'maqam', '2 1.5 1.5 2 2 1.5 1.5', 'Maqam Rast', 'Maqam Rast', 'maqâm Rast', 'makam Rast'],
    ['bayati', 'maqam', '1.5 1.5 2 2 1 2 2', 'Maqam Bayati', 'Maqam Bayati', 'maqâm Bayâtî', 'makam Bajátí'],
    ['sikah', 'maqam', '1.5 2 2 1.5 1.5 2 1.5', 'Maqam Sikah', 'Maqam Sikah', 'maqâm Sîkâh', 'makam Síkáh'],
    ['saba', 'maqam', '1.5 1.5 1 3 1 2 1', 'Maqam Saba', 'Maqam Saba', 'maqâm Sabâ', 'makam Sabá'],
    ['hijaz', 'maqam', '1 3 1 2 1.5 1.5 2', 'Maqam Hijaz', 'Maqam Hidschas', 'maqâm Hijâz', 'makam Hidžáz'],
    ['nahawand', 'maqam', '2 1 2 2 1 3 1', 'Maqam Nahawand', 'Maqam Nahawand', 'maqâm Nahawand', 'makam Nahavand'],
    ['kurd', 'maqam', '1 2 2 2 1 2 2', 'Maqam Kurd', 'Maqam Kurd', 'maqâm Kurd', 'makam Kurd'],
    ['ajam', 'maqam', '2 2 1 2 2 2 1', 'Maqam Ajam', 'Maqam Adscham', 'maqâm ʿAjam', 'makam Adžam'],
    ['nikriz', 'maqam', '2 1 3 1 2 1 2', 'Maqam Nikriz', 'Maqam Nikriz', 'maqâm Nikrîz', 'makam Nikríz'],
    ['huzam', 'maqam', '1.5 2 1 3 1 2 1.5', 'Maqam Huzam', 'Maqam Huzam', 'maqâm Huzâm', 'makam Huzám'],
    ['suznak', 'maqam', '2 1.5 1.5 2 1 3 1', 'Maqam Suznak', 'Maqam Suznak', 'maqâm Sûznâk', 'makam Súznák'],
    ['husayni', 'maqam', '1.5 1.5 2 2 1.5 1.5 2', 'Maqam Husayni', 'Maqam Husaini', 'maqâm Husaynî', 'makam Husajní'],
    ['hijazkar', 'maqam', '1 3 1 2 1 3 1', 'Maqam Hijazkar', 'Maqam Hidschaskar', 'maqâm Hijâzkâr', 'makam Hidžázkár']
  ].map(a => {
    const steps = a[2].split(' ').map(Number);
    const cents = [0]; steps.forEach(s => cents.push(cents[cents.length - 1] + s * 100));
    return { id: a[0], g: a[1], steps, cents, name: { en: a[3], de: a[4], fr: a[5], cs: a[6] } };
  });
  const BY = Object.fromEntries(S.map(s => [s.id, s]));
  const key = s => s.cents.join(',');
  const cfg = Object.assign({ on: ['major', 'natmin', 'harmin', 'melmin'], dir: 'up', tempo: 150 }, E.load('cfg.scales', {}));
  const save = () => E.save('cfg.scales', cfg);

  function play(q, id) {
    const sc = BY[id || q.sc.id];
    const A = E.audio; A.stop();
    const t0 = A.now(), d = 60 / cfg.tempo;
    let seq = sc.cents.slice();
    if (cfg.dir === 'down') seq = seq.reverse();
    if (cfg.dir === 'both') seq = seq.concat(sc.cents.slice(0, -1).reverse());
    const base = E.mtof(q.tonic);
    seq.forEach((c, i) => A.tone(base * Math.pow(2, c / 1200), t0 + i * d, d * (i === seq.length - 1 ? 2.2 : 1.05), { vol: .28 }));
  }
  const fmtStep = s => { const w = Math.floor(s), half = s - w > .01; return (w ? w : '') + (half ? '½' : '') || '0'; };

  const spec = {
    id: 'scales', cols: 3, groupHeads: true,
    options: () => {
      // scales with the same notes share one button
      return GROUPS.flatMap(g => S.filter(s => s.g === g.id && cfg.on.includes(s.id)).map(s => ({ id: s.id, label: E.tn(s.name), group: E.tn(g.name) })));
    },
    ask() {
      const ids = cfg.on.length ? cfg.on : ['major'];
      const sc = BY[E.pick(ids)];
      const tonic = 52 + E.rand(10);   // E3 … C♯4
      const same = ids.filter(id => key(BY[id]) === key(sc));
      return { sc, tonic, answer: same };
    },
    play: q => play(q),
    compare: (q, id) => play(q, id),
    prompt: () => T('Which scale is it?'),
    reveal(q) {
      const others = [].concat(q.answer).filter(id => id !== q.sc.id).map(id => E.tn(BY[id].name));
      return `${T('It was')}${E.colon()}<b>${E.tn(q.sc.name)}</b>${others.length ? ' (= ' + others.join(', ') + ')' : ''} · ${T('steps in semitones')}${E.colon()}<span class="steps">${q.sc.steps.map(fmtStep).join(' ')}</span>`;
    },
    settings(el, rerun) {
      GROUPS.forEach(g => {
        const ids = S.filter(s => s.g === g.id).map(s => s.id);
        el.append(h('div', { class: 'sethead' }, E.tn(g.name), ' ',
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = cfg.on.filter(x => !ids.includes(x)).concat(ids); save(); rerun(); } }, T('all')),
          h('button', { type: 'button', class: 'mini', onclick: () => { cfg.on = cfg.on.filter(x => !ids.includes(x)); save(); rerun(); } }, T('none'))),
          E.chips(S.filter(s => s.g === g.id).map(s => ({ id: s.id, label: E.tn(s.name), on: cfg.on.includes(s.id) })), (id, on) => {
            cfg.on = S.map(s => s.id).filter(x => x === id ? on : cfg.on.includes(x)); save(); rerun();
          }));
        if (g.id === 'maqam') el.append(h('p', { class: 'note' }, T('Maqamat are played in quarter-tone (24-tone equal) approximation, ascending one octave, as given by maqamworld.com. In performance the neutral intervals vary by region, performer and melodic direction. Maqam Saba does not close at the octave.')));
        if (g.id === 'india') el.append(h('p', { class: 'note' }, T('Thaats and ragas are played in equal temperament; ragas are defined by melodic movement as much as by their notes.')));
      });
      el.append(
        E.selectField(T('Direction'), cfg.dir, [{ v: 'up', l: T('ascending') }, { v: 'down', l: T('descending') }, { v: 'both', l: T('ascending and descending') }], v => { cfg.dir = v; save(); }),
        E.rangeField(T('Tempo'), cfg.tempo, 60, 300, 10, v => v + ' ' + T('notes per minute'), v => { cfg.tempo = v; save(); }));
    }
  };

  E.room({
    id: 'scales', num: 'VI', title: 'Scales and modes',
    desc: 'Major and minor, church modes, jazz scales, Messiaen’s modes, Gypsy scales, Indian thaats, Japanese scales and Arabic maqamat with quarter tones.',
    meta: '{n} scales · quarter tones', metaVars: { n: S.length },
    lede: 'A scale is played from a random tonic. Choose its name. Scales that contain exactly the same notes (for example Aeolian and natural minor) count as the same answer.',
    icon: () => E.notation.notesSVG('treble', [28, 29, 30, 31, 32, 33].map(d => ({ dia: d })), { SP: 8, gap: 2.2, minW: 150 }),
    spec,
    mount(box) { box.classList.add('quiz'); E.quiz(spec, box); }
  });
})();
