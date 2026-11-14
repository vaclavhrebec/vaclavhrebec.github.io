/* Atlas of Musical Style — the number of voices.
   A VOICE here is a real part: an independent contrapuntal line. It is not a performer. A piece in four voices stays a piece in four voices when
   twenty instruments play it, and a chorus of forty singers can still be sung in four voices.
   For every style: [lowest usual, highest usual, highest known in the repertory]. The numbers are rough guides: in styles driven by harmony,
   the number of real parts changes from bar to bar. null = the number of voices is not a useful measure there.
   Marks are single pieces with a documented number of parts. */
(function (V) {
  const VV = {
    'chant-style': [1, 1, 1, 'a single line, sung by one voice or many in unison'],
    'early-organum': [2, 2, 2, 'the added voice runs parallel; doubling at the octave makes four sounding lines but still two real voices'],
    'aquitanian': [2, 2, 3, 'three voices occur in a few pieces, such as Congaudeant catholici in the Codex Calixtinus'],
    'notre-dame': [2, 3, 4, 'most of the Magnus liber organi is in two voices, a small part in three, and Perotin’s Viderunt and Sederunt in four'],
    'ars-antiqua': [2, 3, 4, 'the motet normally has triplum, motetus and tenor; four-voice motets are exceptional'],
    'ars-nova': [2, 3, 4, 'Machaut’s motets in three or four voices and his four-voice Mass; five voices only in rare pieces'],
    'trecento': [2, 3, 3, 'the Italian madrigal is for two voices, the caccia for three'],
    'ars-subtilior-style': [3, 3, 4, null],
    'english-style': [3, 3, 4, 'three voices in the sweet sonority of the carols and the Old Hall pieces; four from the early 15th century'],
    'burgundian': [3, 3, 4, 'three voices (cantus, tenor, contratenor); four only occasionally'],
    'ockeghem': [3, 4, 4, 'four voices become the norm; the 36-voice Deo gratias is attributed to Ockeghem'],
    'josquin': [4, 6, 6, 'four to six real parts; canons add many more entries but not more different lines'],
    'franco-flemish': [4, 6, 8, 'six becomes common in the motet; eight is the exception'],
    'palestrina': [4, 6, 8, 'four to six in the masses, eight in the double-choir pieces'],
    'madrigal': [4, 6, 8, 'five is the standard number, hence "madrigal a 5"'],
    'venetian': [8, 12, 22, 'polychoral writing: two to four choirs of four to six real parts each, up to 22 parts in the large instrumental canzonas'],
    'early-baroque': [2, 5, 10, 'the continuo is a bass line with harmony and does not count as a voice of its own'],
    'stylus-phantasticus': [1, 4, 5, null],
    'instrumental-ren': [3, 5, 6, 'consort music for three to six viols or recorders'],
    'high-baroque': [2, 4, 8, 'fugues in two to five voices, the six-voice ricercar of the Musical Offering, the double choirs of the Passions and the B minor Mass'],
    'french-baroque': [3, 5, 5, 'Lully’s 24 violons du roi play in five parts: 24 players, five real voices'],
    'opera-seria': [2, 4, 5, 'violins I and II, viola and bass, with oboes and horns mostly doubling'],
    'galant': [2, 3, 4, 'a melody over a bass, two or three further parts'],
    'empfindsamkeit': [2, 4, 4, null],
    'mannheim': [3, 4, 5, 'a large orchestra in four to five real parts: the winds mostly double the strings'],
    'viennese-classical': [3, 4, 6, 'the string quartet is four parts; the symphony is rarely more than five or six real lines, however many players there are'],
    'bel-canto-opera': [3, 4, 6, 'the ensemble pieces, like the sextet in Lucia di Lammermoor, bring in six real voices'],
    'early-romantic': [3, 4, 6, null],
    'late-romantic': [4, 6, 16, 'divided strings and choirs can reach sixteen real parts, as in Strauss’s Deutsche Motette'],
    'second-viennese': [3, 5, 8, null],
    'neoclassicism': [2, 4, 6, null],
    'sonorism': [8, 20, 52, 'micropolyphony: in Penderecki’s Threnody (1960) the 52 string players have lines of their own'],
    'holy-minimalism': [2, 3, 4, 'in Pärt’s tintinnabuli there are exactly two voices, the melody and the triad voice'],
    'minimalism': [4, 8, 18, 'many players, but built from a few repeated patterns that shift against one another']
  };
  Object.assign(VV, V.voicesMore || {});
  V.voices = VV;
  V.voiceMarks = [
    {y: 850, n: 2, t: 'Musica enchiriadis', text: 'Parallel organum: the added voice follows the chant at the fifth or fourth below. With octave doubling four lines sound, but there are two real voices.'},
    {y: 1150, n: 3, t: 'Congaudeant catholici', text: 'In the Codex Calixtinus (12th century), one of the earliest surviving pieces in three voices.'},
    {y: 1198, n: 4, t: 'Viderunt omnes (Perotin)', text: 'Perotin’s quadruplum organa Viderunt omnes (1198) and Sederunt principes (1199): the first known pieces in four voices. Most of the Magnus liber organi is in two voices and only a small part in three.'},
    {y: 1365, n: 4, t: 'Machaut, Messe de Notre Dame', text: 'The first complete mass cycle by a single composer, for four voices (the date is uncertain, c. 1360).'},
    {y: 1490, n: 36, t: 'Deo gratias (Ockeghem?)', text: 'A canon in 36 voices, attributed to Ockeghem. In a canon the entries multiply but the lines are the same: the 36 voices are four or so independent melodies sung at different pitches and times.', attributed: true},
    {y: 1565, n: 40, t: 'Striggio, Missa Ecco sì beato giorno', text: 'A mass in 40 parts for a Florentine wedding of 1565, probably the earliest of the great forty-voice works.'},
    {y: 1570, n: 40, t: 'Tallis, Spem in alium', text: 'Forty parts in eight choirs of five, first heard before 1572. The choirs enter one after the other and combine in a mass of forty real lines.'},
    {y: 1615, n: 22, t: 'Gabrieli, Sonata XX a 22', text: 'The most voluminous of the Venetian polychoral instrumental pieces (published 1615), in 22 parts.'},
    {y: 1670, n: 5, t: 'Lully’s 24 violons du roi', text: 'The "grande bande" of 24 string players plays in five real parts (dessus, haute-contre, taille, quinte, basse): 24 instruments, but a five-voice piece.', parts: true},
    {y: 1682, n: 53, t: 'Missa salisburgensis (Biber?)', text: 'Scored for 53 parts in several choirs of voices and instruments, long attributed to Benevoli and now to Biber. Many of the parts double each other.', attributed: true},
    {y: 1788, n: 5, t: 'Mozart, Jupiter finale', text: 'Five themes combine in the finale of the Symphony No. 41: five real parts, however large the orchestra.', parts: true},
    {y: 1913, n: 16, t: 'Strauss, Deutsche Motette', text: 'A motet for four soloists and a sixteen-part chorus.'},
    {y: 1966, n: 16, t: 'Ligeti, Lux aeterna', text: 'Micropolyphony for sixteen voices: each sings its own line, so close that the ear hears one shifting cluster.'}
  ];

  /* the notes */
  const el = (o) => V.elements.push(o);
  el({id: 'real-parts', title: 'Real parts: voices versus players', folder: 'texture', first: 850, common: 1600, fade: null,
    scope: 'a way of counting, valid for all polyphony',
    text: 'The number of voices counts independent contrapuntal lines, not performers. A four-voice piece stays a four-voice piece whether four singers, forty singers or twenty instruments play it: Lully’s 24 violins play in five real parts, and a symphony orchestra of a hundred players rarely has more than five or six different lines at a time. Doubling at the octave, as in [[parallel-organum]], adds sounding pitches but no voice. Canons multiply the entries without multiplying the lines. This is why the number of voices is a better measure of a style than the size of the ensemble. See the chart in the Voices view and the voice filter in the style finder.'});
  el({id: 'two-voice', title: 'Two-voice texture', folder: 'texture', first: 850, common: 1000, fade: null,
    scope: 'most of the Magnus liber organi; the Italian madrigal; the invention and the duet',
    text: 'The commonest texture of the earliest polyphony: most of the Magnus liber organi, the repertory of Notre Dame, is in two voices, only a small part in [[three-voice]] and a very few pieces in four. The Trecento madrigal, too, is for two voices. It is also the simplest model of counterpoint: [[super-librum|singing against a given line]] means writing the second voice, note against note, and everything larger grows from that pair.'});
  el({id: 'many-voices', title: 'Many-voice polyphony (12–40 and more real parts)', folder: 'texture', first: 1490, common: 1565, fade: null,
    scope: 'canons of 24 and 36 voices; Striggio and Tallis (40 parts); Venetian polychoral works',
    text: 'From the late 15th century a few composers use far more than the usual four to six parts: a canon in 36 voices attributed to Ockeghem, Striggio’s mass for 40 voices (c. 1565), Tallis’s Spem in alium (before 1572), Gabrieli’s polychoral music. These works are built from groups: Spem in alium is eight choirs of five, and the 36-voice canon is a handful of lines at different pitches. The ear never follows 40 lines, but hears the masses of sound moving, which anticipates the [[sound-mass|sound masses]] and micropolyphony of the 20th century.'});
  const t = id => V.elements.find(e => e.id === id);
  if (t('three-voice')) t('three-voice').text = 'The normal number of voices for almost three centuries: tenor plus one or two upper voices, later tenor, cantus and contratenor. Perotin’s organa tripla are early examples, but most of the Magnus liber organi is still in [[two-voice]] texture. Gives way to the [[four-voice]] texture once the [[contratenor-bassus]] is established.';
  if (t('four-voice')) t('four-voice').text = 'Cantus, altus, tenor, bassus. Perotin’s *Viderunt* and *Sederunt* are early peaks, but four voices become the standard only with the [[contratenor-bassus]]. In the 14th century, pieces in four voices are still exceptions, Machaut’s Mass among them. A full four-voice texture invites the third into the final chord: the [[picardy-third]]. See also [[real-parts]].';
  if (t('five-plus-voices')) t('five-plus-voices').text = 'Five or six real parts become normal in the motet and the madrigal. With so many voices the triad is complete in almost every chord, so a final [[picardy-third]] becomes the rule rather than the exception. Beyond six, the music is organised in groups: see [[many-voices]] and [[cori-spezzati]].';
  const st = id => V.styles.find(s => s.id === id);
  const add = (style, ids) => ids.forEach(i => st(style) && !st(style).elements.includes(i) && st(style).elements.push(i));
  ['early-organum', 'aquitanian', 'notre-dame', 'ars-antiqua', 'trecento'].forEach(s => add(s, ['two-voice']));
  ['early-organum', 'french-baroque', 'viennese-classical', 'late-romantic'].forEach(s => add(s, ['real-parts']));
  ['ockeghem', 'franco-flemish', 'venetian', 'sonorism', 'tudor'].forEach(s => add(s, ['many-voices']));
})(window.VAULT);
