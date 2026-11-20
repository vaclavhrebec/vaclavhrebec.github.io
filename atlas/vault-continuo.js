/* Atlas of Musical Style — additions: elements named in the thoroughbass treatises of Muffat (1699) and Heinichen (1728),
   and in Bermudo (1555) and Elias Salomo (1274). Dates: first = earliest clear use, common = when it is ordinary, fade = when it recedes. */
(function (V) {
  const add = (style, ids) => { const s = V.styles.find(x => x.id === style); if (s) ids.forEach(i => s.elements.includes(i) || s.elements.push(i)); };
  V.elements.push(
    {id: 'transitus', title: 'Passing notes on the weak part of the beat (transitus regularis)', folder: 'counterpoint', first: 1200, common: 1450, fade: null,
      scope: 'Franco of Cologne’s dissonances between consonances; Tinctoris (1477); Muffat’s quarta and septima transiens (1699); Heinichen (1728)',
      text: 'A dissonance that passes by step between two consonances on the virtually short part of the beat and has no chord of its own. In thoroughbass the player strikes the chord on the long note and lets the short one pass. The counterpart of the [[transitus-irregularis]]; with the [[suspension]] the main way dissonance enters tonal music.'},
    {id: 'transitus-irregularis', title: 'Accented passing note (transitus irregularis)', folder: 'counterpoint', first: 1600, common: 1680, fade: null,
      scope: 'Monteverdi’s recitatives; Christoph Bernhard’s quasi-transitus (c. 1660); Heinichen, Der General-Bass (1728); Bach’s fast basses',
      text: 'The passing note falls on the virtually long note and the consonance comes after it, so the accompanist strikes the chord of the following note in advance (anticipando). Forbidden in the strict style, it becomes ordinary in fast basses and the [[galant]] melody, where it grows into the unprepared appoggiatura.'},
    {id: 'passing-seventh', title: 'Passing seventh (8–7 over the bass)', folder: 'harmony', first: 1580, common: 1630, fade: null,
      scope: 'Monteverdi and the Roman continuo madrigal; Muffat’s septima transiens (1699); the “7ma in transitu” of Heinichen (1728); the 8–7 before every dominant in the 18th century',
      text: 'The octave above the bass moves down to the seventh while the bass holds, so a consonant chord turns into a seventh chord on its way to the next. One of the commonest moves of the continuo player, and the origin of the dominant seventh as a sound in its own right.'},
    {id: 'theatrical-resolution', title: 'Dissonance resolved in another voice (theatrical licences)', folder: 'counterpoint', first: 1640, common: 1700, fade: 1800,
      scope: 'Venetian and Neapolitan opera; A. Scarlatti; Handel’s and Hasse’s arias; codified by Heinichen (1728)',
      text: 'The opera style lets a dissonance resolve in another voice or another octave, over a bass that has moved on, or anticipated or delayed. Heinichen allows all of it on one condition: somewhere a lawful resolution must still follow. A step from [[seconda-pratica]] to the free voice-leading of the [[galant]].'},
    {id: 'full-voiced-continuo', title: 'Full-voiced continuo accompaniment (vollstimmig)', folder: 'texture', first: 1680, common: 1710, fade: 1770,
      scope: 'Gasparini, L’armonico pratico (1708); Heinichen (1728): 4, 6, 8 and more parts with both hands; Pisendel’s Dresden orchestra',
      text: 'Chords doubled in both hands, often with the acciaccatura, to fill a large room or an orchestra – the opposite of the thin, voice-led three or four parts of the 17th century. Heinichen keeps embellishment (the manierlicher General-Bass) for small forces only.'},
    {id: 'all-keys-cycle', title: 'Cycles through all the keys', folder: 'harmony', first: 1702, common: 1720, fade: null,
      scope: 'J. C. F. Fischer, Ariadne musica (1702); Mattheson, Organisten-Probe (1719); Bach, Das wohltemperierte Klavier I (1722); Heinichen’s musical circle (1711, 1728); Chopin’s Preludes op. 28',
      text: 'Collections and modulations that walk through all 24 major and minor keys, made possible by [[well-temperament]] and ordered by Heinichen’s circle, which alternates each major key with its relative minor.'},
    {id: 'redobles', title: 'Redobles and quiebros (Spanish keyboard graces)', folder: 'practice', first: 1550, common: 1557, fade: 1700,
      scope: 'Bermudo (1555); Venegas de Henestrosa (1557); Tomás de Santa María, Arte de tañer fantasía (1565); Cabezón (1578); Correa de Arauxo (1626)',
      text: 'Trills (redobles) of a tone or a semitone and short mordents (quiebros) on keyboard and vihuela. Bermudo allows them only on the notes that belong to the mode, and only “so hidden that it is hardly felt”.'},
    {id: 'rector-improvisation', title: 'Improvised polyphony led by a rector', folder: 'practice', first: 1270, common: 1300, fade: 1600,
      scope: 'Elias Salomo, Scientia artis musicae (1274); cathedral and monastic choirs in France; the cantor of later cantare super librum',
      text: 'Four singers improvise over the chant at the fifth, octave and twelfth, placed on their notes by a rector who gives each entry, the pauses with his hand over the book, and whispered corrections. The oldest detailed account of how [[super-librum]] was led.'}
  );
  add('notre-dame', ['rector-improvisation']);
  add('ars-antiqua', ['rector-improvisation']);
  add('early-baroque', ['passing-seventh', 'transitus']);
  add('high-baroque', ['transitus-irregularis', 'passing-seventh', 'theatrical-resolution', 'full-voiced-continuo', 'all-keys-cycle', 'transitus']);
  add('galant', ['transitus-irregularis', 'theatrical-resolution']);
})(window.VAULT);

/* From Tinctoris (1470s–80s) and Santa María (1565) */
(function (V) {
  const add = (style, ids) => { const s = V.styles.find(x => x.id === style); if (s) ids.forEach(i => s.elements.includes(i) || s.elements.push(i)); };
  V.elements.push(
    {id: 'varietas', title: 'Varietas: avoiding repeated figures (redictae)', folder: 'counterpoint', first: 1440, common: 1460, fade: 1500,
      scope: 'Ockeghem’s masses (Missa Mi-mi, Missa prolationum); Busnois; codified by Tinctoris, De arte contrapuncti III.6 and III.8 (1477)',
      text: 'The ideal of constant variety: no figure repeated, least of all over a repeating tenor, except to imitate bells or trumpets. It explains the seamless, non-repetitive lines of the [[ockeghem]] generation; the next generation turns the other way, to sequence, ostinato and [[pervasive-imitation]].'},
    {id: 'regulated-dissonance', title: 'Regulated dissonance: small, on weak parts or syncopated', folder: 'counterpoint', first: 1430, common: 1460, fade: 1600,
      scope: 'Du Fay’s late works, Ockeghem, Busnois; Tinctoris, De arte contrapuncti II.23–34 (1477); the Palestrina style',
      text: 'Discords are kept out of simple counterpoint and allowed in florid counterpoint only as small ornaments: passing on the weaker part of the beat, or in syncopation ([[suspension]]). Tinctoris scorns the older habit of long discords “to make the following concord sweeter”. The norm that [[palestrina]] perfects.'},
    {id: 'plectrum-improvisation', title: 'Plectrum lute and tenorista: an improvised upper part over a tenor', folder: 'practice', first: 1400, common: 1450, fade: 1520,
      scope: 'Pietrobono of Ferrara and his tenorista; the blind brothers Charles and Jean Fernandes on viols (Bruges); Tinctoris, De inventione IV.5 (c. 1481–83); Faenza Codex as a written trace',
      text: 'A soloist with a plectrum improvises a florid upper part over a tenor played by a partner, the tenorista. Tinctoris praises this beside the harder art of playing three or four parts alone, which leads to [[lute-polyphony]] with the fingers.'},
    {id: 'keyboard-paired-duos', title: 'Keyboard fantasia in paired duos (tañer a concierto)', folder: 'practice', first: 1550, common: 1560, fade: 1630,
      scope: 'Tomás de Santa María, Arte de tañer fantasía II (1565); Cabezón’s tientos; Correa de Arauxo (1626)',
      text: 'The four voices of an improvised fantasia move as two duos, bass with tenor and alto with soprano, answering each other with the same passo at the fourth, fifth or octave – [[paired-imitation]] as a method for the hands.'}
  );
  add('ockeghem', ['varietas', 'regulated-dissonance']);
  add('burgundian', ['regulated-dissonance']);
  add('josquin', ['regulated-dissonance']);
  add('palestrina', ['regulated-dissonance']);
  add('medieval-instrumental', ['plectrum-improvisation']);
  add('spanish-instrumental', ['keyboard-paired-duos', 'redobles', 'notes-inegales']);
})(window.VAULT);
