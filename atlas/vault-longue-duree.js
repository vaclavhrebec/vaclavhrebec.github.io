/* Atlas of Musical Style — additions: antiquity, and the long-lived elements (“Dauerbrenner”).
   Self-accompanied song, the drone, discant and fauxbourdon with their afterlives, polyphonic lute playing,
   the English cadence, mixtures and parallel chords. Negative years are BC. Loaded before vault-crosslinks.js. */
(function (V) {
  V.elements.push(
    /* ---------- antiquity ---------- */
    {id: 'accompanied-monody', title: 'Self-accompanied song', folder: 'texture', first: -3000, common: -2500, fade: null,
      scope: 'harpists and lyre-players of Sumer and Egypt; the Greek kitharode and the Homeric singer; jongleurs and Minnesänger; vihuelists and lutenists; the lied and the singer-songwriter',
      text: 'A singer accompanying himself on a string instrument: one of the oldest and most constant ways of making music, a true *Dauerbrenner*. The lyres from the royal tombs of Ur (c. 2500 BC) and the harpists painted in Egyptian tombs show it in the third millennium BC; the cuneiform Hurrian hymns from Ugarit ([[ancient-notation]]) seem to give instructions for the lyre. In Greece the kitharode sings to the kithara and Homer’s bards to the phorminx.\n\nThe medieval [[troubadour-song|troubadours, trouvères and Minnesänger]] were, at least in part, accompanied by fiddle, harp or lute – the sources rarely write it down, so how is still debated. In the Renaissance singers sing to the lute, vihuela or viol, often arranging polyphony for one voice and instrument ([[lute-song]]); this flows into [[monody]], the [[lied]], and today’s singer-songwriter with a guitar. The written repertory shows only the tip of a practice that was always there.'},
    {id: 'ancient-notation', title: 'Ancient notations (cuneiform & Greek)', folder: 'rhythm', first: -1400, common: -200, fade: 400,
      scope: 'Hurrian hymns from Ugarit (c. 1400 BC); Greek vocal and instrumental notation: Delphic hymns (128 BC), Seikilos epitaph (1st c. AD), papyri',
      text: 'The earliest written music. The clay tablets from Ugarit name intervals of the lyre’s strings; Greek notation writes pitches with letter signs, one set for voices and one for instruments, with signs for long notes. Only about sixty fragments survive, and the knowledge was lost: medieval chant had to be written down anew in [[neumes]].'},
    {id: 'greek-genera', title: 'Tetrachords & the three genera', folder: 'pitch', first: -450, common: -350, fade: 600,
      scope: 'Philolaus and Archytas (5th–4th c. BC), Aristoxenus, Elementa harmonica (c. 330 BC); Ptolemy, Harmonics (2nd c. AD); passed on by Boethius',
      text: 'Greek theory builds scales from tetrachords – four notes spanning a fourth – in three genera: diatonic, chromatic and enharmonic (with quarter tones). The ratios of the [[pythagorean]] intervals come from here. Through Boethius the Greek system shapes medieval theory, and Vicentino tries to revive the chromatic and enharmonic genera in 1555 ([[chromaticism]]).'},

    /* ---------- improvised and written polyphony on a chant ---------- */
    {id: 'discant', title: 'Discant (note against note on a chant)', folder: 'counterpoint', first: 1170, common: 1230, fade: 1650,
      scope: 'Vatican organum treatise; Discantus positio vulgaris (c. 1230); English treatises on sights (Leonel Power, c. 1430); Spanish and Italian contrapunto into the 17th century',
      text: 'A voice set against a chant one note against one (or a few), in consonances – fifth, octave, unison, and more and more thirds and sixths – with contrary motion preferred. From the 12th century it is the elementary teaching of polyphony, written and improvised, and the root of [[discant-clausula|discant style]], of [[english-discant]], of [[fauxbourdon]] and of [[super-librum|cantare super librum]].'},
    {id: 'english-faburden', title: 'Faburden & English sights', folder: 'practice', first: 1430, common: 1450, fade: 1550,
      scope: 'anonymous English treatises of c. 1430–50 (BL Lansdowne 763, which also holds Leonel Power’s discant treatise); faburden settings of hymns and Magnificats; organ faburdens',
      text: 'The English way of improvising on a chant: the singers do not read intervals but imagine their notes on the chant’s own staff (“sights”), transposed. In faburden the chant lies in the middle, a treble sings a fourth above it, and the lowest voice moves between thirds and fifths below – chains of 6–3 sonorities, the English twin of the continental [[fauxbourdon]] of Du Fay’s generation, which Dunstaple and Power knew. The chant-bearing “faburden” line later becomes a cantus firmus of its own.'},
    {id: 'gymel', title: 'Gymel (twin song)', folder: 'texture', first: 1430, common: 1450, fade: 1550,
      scope: 'English carols and the Eton Choirbook; named by Guilielmus Monachus (c. 1480)',
      text: 'Latin *cantus gemellus*: two voices, usually of the same range, moving mostly in parallel thirds and sixths and closing on a unison or octave. In English choirbooks a voice part “divides” into gymel for a passage of sweet two-part sound – the [[english-discant|English sonority]] reduced to its core.'},

    /* ---------- the long life of fauxbourdon: parallel sonorities ---------- */
    {id: 'sixth-chord-chains', title: 'Chains of 6–3 chords (fauxbourdon’s afterlife)', folder: 'harmony', first: 1500, common: 1600, fade: null,
      scope: 'falsobordone and stepwise sequences; continuo practice (the 6 over every scale step except the first and fifth); right-hand passages in parallel sixth chords in Mozart and Beethoven (the finale of Beethoven’s Sonata op. 2 no. 3)',
      text: 'The sound of [[fauxbourdon]] never disappears: a scale harmonised by parallel 6–3 chords. It lives on in [[falsobordone]], in Baroque sequences and the [[rule-of-octave]], and in the Classical piano style, where the right hand runs up or down in chains of sixth chords. From there it is a short step to the [[mixture-sound|mixture]] and the [[parallel-chords]] of Debussy and Ravel.'},
    {id: 'mixture-sound', title: 'Mixtures & Mixturklang', folder: 'timbre', first: 1350, common: 1450, fade: null,
      scope: 'the medieval organ Blockwerk (Halberstadt, 1361), separate mixture stops from the 15th century; orchestral doublings at the twelfth and seventeenth (Ravel, Boléro 1928); Messiaen’s organ registrations',
      text: 'An organ mixture adds octaves, fifths and sometimes thirds above every note, so that a melody is heard as a moving chord – fused into one colour. Composers later do the same with the orchestra: in Ravel’s *Boléro* horn, celesta and piccolos play the tune at the octave, twelfth and seventeenth. This *Mixturklang* is the timbral side of [[parallel-organum]] and of [[parallel-chords|planing]].'},
    {id: 'power-chord', title: 'Power chords (parallel fifths in rock)', folder: 'popular', first: 1950, common: 1965, fade: null,
      scope: 'electric blues and early rock; Link Wray, Rumble (1958); the Kinks; hard rock and metal',
      text: 'Root and fifth (often with the octave), shifted as one fixed shape along the guitar neck: parallel fifths as the basic sound of rock, especially with [[electric-guitar|distortion]], which makes a third sound muddy. One chord shape moved up and down the neck is also the everyday technique of bluegrass and folk guitar and banjo. A popular rediscovery of [[parallel-organum]] and a cousin of the [[mixture-sound|mixture]].'},
    {id: 'drone', title: 'Drone (bourdon)', folder: 'texture', first: 1100, common: 1200, fade: null,
      scope: 'organistrum and hurdy-gurdy, bagpipes; pastorales and the musette; folk music everywhere; Bartók, La Monte Young, Pärt',
      text: 'A sustained or repeated note under a moving melody. Medieval instruments build it in (the organistrum, depicted from the 12th century, the hurdy-gurdy and bagpipe); art music uses it to evoke shepherds and the countryside (the Baroque pastorale and musette), and the 20th century rediscovers it in folk-based music, minimalism and [[tintinnabuli]]. Another *Dauerbrenner* beside [[accompanied-monody|self-accompanied song]].'},

    /* ---------- instruments and cadences ---------- */
    {id: 'lute-polyphony', title: 'Polyphonic lute playing (fingers, not plectrum)', folder: 'timbre', first: 1480, common: 1500, fade: null,
      scope: 'Tinctoris, De inventione et usu musicae (c. 1481–83); Spinacino and Dalza (Petrucci, 1507–08); Milán, Narváez and the vihuelists; Dowland; the classical guitar',
      text: 'Until the late 15th century the lute is played with a quill plectrum, mostly one line at a time – one lutenist plays the melody, a *tenorista* the tenor. Tinctoris reports players who manage two, three or four parts alone; with two plectra, and then by plucking with the fingers (c. 1500), one player can play complete polyphony. This makes possible the [[intabulation]] of motets and chansons, the solo fantasia and the [[lute-song]], and leads on to the [[style-brise]] and to polyphonic guitar playing.'},
    {id: 'english-cadence', title: 'English cadence (cadential false relation)', folder: 'cadence', first: 1490, common: 1540, fade: 1700,
      scope: 'Eton Choirbook, Taverner, Tallis, Byrd, Gibbons, Purcell; Morley describes it; frequent cross-relations also in Spanish and Portuguese polyphony',
      text: 'In a cadence to G one voice sings the leading note F♯ (by [[musica-ficta]]) while another, doing its own job, comes down F♮–E–D: the sharp and the natural F sound together or right after each other. The other voices make their normal cadence. The clash – the “English cadence” or “English clash” – is a hallmark of Tudor and Elizabethan polyphony and still loved by Purcell; similar false relations colour the music of the Spanish masters.'}
  );

  /* ---------- new styles ---------- */
  V.styles.push(
    {id: 'antiquity', title: 'Ancient Near East & Greece', from: -3000, to: 400,
      elements: ['accompanied-monody', 'ancient-notation', 'greek-genera'],
      text: 'Sumerian and Egyptian harps and lyres, the Hurrian hymns of Ugarit, Greek kitharodes and the aulos, the theory of Pythagoras, Aristoxenus and Ptolemy. Music is sung to an instrument; little was written down and less survives.'},
    {id: 'tudor', title: 'Tudor & Elizabethan polyphony', from: 1490, to: 1625,
      elements: ['english-cadence', 'gymel', 'english-faburden', 'cantus-firmus', 'pervasive-imitation', 'five-plus-voices', 'suspension', 'picardy-third', 'alternatim', 'word-painting', 'lute-song', 'lute-polyphony', 'meantone'],
      text: 'From the florid Eton Choirbook through Taverner and Tallis to Byrd, Morley, Dowland and Gibbons: long melismatic lines, the gymel and the English cadence, the Elizabethan madrigal and the lute ayre.'},
    {id: 'spanish-ren', title: 'Spanish Renaissance polyphony', from: 1490, to: 1630,
      elements: ['english-cadence', 'pervasive-imitation', 'five-plus-voices', 'alternatim', 'falsobordone', 'super-librum', 'suspension', 'picardy-third', 'diminution', 'lute-polyphony', 'lute-song', 'cori-spezzati'],
      text: 'Peñalosa and Anchieta, then Morales, Guerrero and Victoria, the vihuelists Milán and Narváez, and the improvisers of contrapunto described by Ortiz and Santa María: grave, expressive sacred polyphony with frequent false relations.'}
  );

  /* ---------- the new elements in existing styles ---------- */
  const st = id => V.styles.find(s => s.id === id);
  const add = (style, ids) => ids.forEach(i => st(style) && !st(style).elements.includes(i) && st(style).elements.push(i));
  add('troubadours', ['accompanied-monody', 'drone']);
  add('notre-dame', ['discant']);
  add('ars-antiqua', ['discant']);
  add('english-style', ['discant']);
  add('burgundian', ['english-faburden', 'gymel', 'discant']);
  add('instrumental-ren', ['lute-polyphony', 'drone']);
  add('madrigal', ['accompanied-monody']);
  add('early-baroque', ['accompanied-monody', 'lute-polyphony', 'sixth-chord-chains']);
  add('high-baroque', ['sixth-chord-chains']);
  add('french-baroque', ['drone']);
  add('viennese-classical', ['sixth-chord-chains']);
  add('early-romantic', ['accompanied-monody']);
  add('impressionism', ['mixture-sound']);
  add('rock', ['power-chord', 'accompanied-monody']);

  /* links from older notes */
  const el = id => V.elements.find(e => e.id === id);
  if (el('fauxbourdon')) el('fauxbourdon').text += ' Its sound outlives it by centuries: see [[sixth-chord-chains]], [[mixture-sound]] and [[parallel-chords]]; its English twin is [[english-faburden]].';
  if (el('english-discant')) el('english-discant').text += ' It grows out of [[discant]], is taught by [[english-faburden|sights]] and is distilled in the [[gymel]].';
  if (el('parallel-chords')) el('parallel-chords').text += ' Its relatives: the [[mixture-sound|organ mixture]], the [[sixth-chord-chains]] of fauxbourdon, and the [[power-chord]] of rock.';
  if (el('lute-song')) el('lute-song').text += ' Its ancestor is the oldest practice in this atlas, [[accompanied-monody|self-accompanied song]]; it depends on [[lute-polyphony]].';
  if (el('troubadour-song')) el('troubadour-song').text += ' How far they accompanied themselves is debated: see [[accompanied-monody]].';
  if (el('double-leading-tone')) el('double-leading-tone').text += ' Compare the later [[english-cadence]].';

  /* real voices of the new styles (read by vault-voices.js) */
  V.voicesMore = {
    'antiquity': [1, 1, 2, 'one sung line; the instrument doubles or decorates it, so there is rarely a second real voice'],
    'tudor': [4, 6, 40, 'five or six voices in the Eton Choirbook; Tallis’s Spem in alium has forty'],
    'spanish-ren': [4, 5, 12, 'four to six voices in Morales and Guerrero; Victoria’s polychoral works up to twelve']
  };
})(window.VAULT);
