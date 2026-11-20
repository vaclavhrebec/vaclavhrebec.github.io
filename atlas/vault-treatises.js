/* Atlas of Musical Style — treatises.
   [id, author, title, year, elements and styles it describes, one-line note, IMSLP page title or null, other names used in the notes, composer id]
   The year is the date of writing or first printing (c. for manuscripts). Printed treatises from c. 1480 link to IMSLP;
   IMSLP opens the page directly when the title exists and otherwise shows its search results for the same words.
   Medieval treatises survive in manuscript and have no IMSLP page; they are listed without an outside link. */
(function (V) {
  const T = [
    /* ---------- antiquity and the early Middle Ages ---------- */
    ['aristoxenus', 'Aristoxenus', 'Elementa harmonica', -330, ['greek-genera'], 'The genera and tetrachords judged by the ear rather than by number.', null, []],
    ['ptolemy', 'Claudius Ptolemy', 'Harmonics', 150, ['greek-genera', 'pythagorean'], 'Ratios for every genus and tonos; the mathematical counterpart to Aristoxenus.', null, []],
    ['boethius', 'Boethius', 'De institutione musica', 510, ['greek-genera', 'pythagorean'], 'Greek theory in Latin: the ratios, the genera and the three kinds of music. The basis of medieval teaching.', null, ['Boethius']],
    ['enchiriadis', 'Anonymous', 'Musica enchiriadis', 870, ['parallel-organum', 'early-organum'], 'The first written description of polyphony: organum at the fourth and fifth, with daseian notation.', null, []],
    ['scolica', 'Anonymous', 'Scolica enchiriadis', 880, ['parallel-organum'], 'A dialogue companion to Musica enchiriadis, with more examples of organum.', null, []],
    ['hucbald', 'Hucbald of Saint-Amand', 'De harmonica institutione', 880, ['church-modes'], 'Teaches the finals and the modal system with Greek letters.', null, ['Hucbald']],
    ['alia-musica', 'Anonymous', 'Alia musica', 900, ['church-modes'], 'Joins the eight church modes to the Greek names of the tonoi.', null, []],
    ['micrologus', 'Guido of Arezzo', 'Micrologus', 1026, ['free-organum', 'church-modes'], 'Chant, modes and organum that meets the chant at the cadence (occursus).', null, []],
    ['guido-prologus', 'Guido of Arezzo', 'Prologus in Antiphonarium', 1028, ['staff'], 'Lines a third apart with letter clefs, so that a melody can be read at sight.', null, ['prologue to the Antiphoner']],
    ['guido-epistola', 'Guido of Arezzo', 'Epistola de ignoto cantu', 1030, ['hexachord'], 'Teaches singing an unknown melody by the syllables ut re mi fa sol la.', null, []],
    ['ad-organum', 'Anonymous', 'Ad organum faciendum', 1100, ['free-organum'], 'Rules for an organal voice in contrary motion against the chant.', null, []],

    /* ---------- 13th and 14th centuries ---------- */
    ['vatican-organum', 'Anonymous', 'Vatican organum treatise', 1200, ['discant', 'florid-organum'], 'Hundreds of short examples of two-voice progressions over chant.', null, []],
    ['discantus-positio', 'Anonymous', 'Discantus positio vulgaris', 1230, ['discant', 'rhythmic-modes'], 'Early rules of measured discant against a chant tenor.', null, []],
    ['garlandia', 'Johannes de Garlandia', 'De mensurabili musica', 1250, ['rhythmic-modes'], 'The six rhythmic modes and their ligature patterns.', null, []],
    ['franco', 'Franco of Cologne', 'Ars cantus mensurabilis', 1280, ['franconian-notation', 'motet'], 'Each note shape has its own value; perfection in three. The notation of the 13th-century motet.', null, []],
    ['anon-iv', 'Anonymous IV', 'De mensuris et discantu', 1280, ['rhythmic-modes', 'notre-dame'], 'Names Leonin and Perotin and describes the Magnus liber.', null, ['Anonymous IV']],
    ['lucidarium', 'Marchetto of Padua', 'Lucidarium', 1318, ['musica-ficta', 'pythagorean'], 'Chromatic semitones and the division of the whole tone; the theory behind musica ficta.', null, []],
    ['elias', 'Elias Salomo', 'Scientia artis musicae', 1274, ['super-librum', 'rector-improvisation', 'church-modes'], 'A chant manual written at the papal court; its last chapters describe four-voice improvised singing led by a rector, and musica falsa.', null, ['Scientia artis musicae']],
    ['pomerium', 'Marchetto of Padua', 'Pomerium', 1319, ['ars-nova-notation', 'trecento', 'notes-inegales'], 'The Italian system of mensural notation and the grouping of semibreves.', null, []],
    ['ars-nova', 'Philippe de Vitry (attributed)', 'Ars nova', 1322, ['ars-nova-notation'], 'Duple and triple divisions at every level, the minim and red notes.', null, [], 'c-vitry'],
    ['docta', 'Pope John XXII', 'Docta sanctorum patrum', 1324, ['hocket', 'ars-nova-notation'], 'A papal decretal against the new notation, hockets and secular texts in church music.', null, ['Docta sanctorum']],
    ['speculum', 'Jacobus of Liège', 'Speculum musicae', 1330, ['ars-nova-notation', 'ars-antiqua'], 'The largest medieval music treatise; its last book defends the ars antiqua against the moderns.', null, []],

    /* ---------- 15th century ---------- */
    ['power-treatise', 'Leonel Power', 'Treatise for him that wille be a syngere', 1430, ['english-faburden', 'discant'], 'English discant taught by sights over the chant.', null, ['Leonel Power’s discant treatise'], 'c-power'],
    ['anselmi', 'Giorgio Anselmi', 'De musica', 1434, ['tactus', 'time-beater'], 'Describes showing the measure with the movement of the hand.', null, []],
    ['paumann', 'Conrad Paumann', 'Fundamentum organisandi', 1452, ['keyboard-tablature', 'super-librum'], 'Exercises for organists: florid upper voices over a given tenor.', null, [], 'c-paumann'],
    ['proportionale', 'Johannes Tinctoris', 'Proportionale musices', 1473, ['tactus', 'ars-subtilior'], 'The proportions of mensural notation, and the claim that only music of the last forty years is worth hearing.', null, [], 'c-tinctoris'],
    ['tinctoris-contrapunctus', 'Johannes Tinctoris', 'Liber de arte contrapuncti', 1477, ['super-librum', 'suspension', 'bass-cadence', 'discant'], 'Counterpoint sung super librum and written (res facta); eight rules of composition; the treatment of dissonance.', null, [], 'c-tinctoris'],
    ['guilielmus', 'Guilielmus Monachus', 'De preceptis artis musicae', 1480, ['gymel', 'english-faburden', 'fauxbourdon'], 'Describes the English practices of gymel and faburden for Italian readers.', null, ['Guilielmus Monachus']],
    ['tinctoris-inventione', 'Johannes Tinctoris', 'De inventione et usu musicae', 1482, ['lute-polyphony'], 'Instruments and players of the time, including lutenists who play several parts alone.', null, [], 'c-tinctoris'],
    ['ramis', 'Bartolomeo Ramis de Pareia', 'Musica practica', 1482, ['pythagorean', 'meantone', 'hexachord'], 'Proposes a monochord with consonant thirds and attacks Guido’s hexachords.', 'Musica practica (Ramos de Pareja, Bartolomé)', []],
    ['practica', 'Franchinus Gaffurius', 'Practica musicae', 1496, ['tactus', 'suspension', 'super-librum'], 'Chant, mensural notation and counterpoint; the semibrevis compared to a calm pulse.', 'Practica musicae (Gaffurius, Franchinus)', [], 'c-gaffurius'],

    /* ---------- 16th century ---------- */
    ['schlick', 'Arnolt Schlick', 'Spiegel der Orgelmacher und Organisten', 1511, ['pitch-standard', 'meantone'], 'Organ building and tuning, with the length of the pipe that fixes the pitch.', 'Spiegel der Orgelmacher und Organisten (Schlick, Arnolt)', ['Spiegel der Orgelmacher'], 'c-schlick'],
    ['philomathes', 'Venceslaus Philomathes', 'Musicorum libri quatuor', 1512, ['time-beater', 'tactus'], 'A Latin verse textbook from Vienna, including the choir director’s duties.', 'Musicorum libri quatuor (Philomathes, Venceslaus)', []],
    ['toscanello', 'Pietro Aron', 'Toscanello in musica', 1523, ['meantone', 'four-voice'], 'Composing all voices at once, and a description of meantone tuning.', 'Toscanello in musica (Aaron, Pietro)', ['Toscanello']],
    ['fontegara', 'Silvestro Ganassi', 'Opera intitulata Fontegara', 1535, ['diminution'], 'The recorder and its diminutions: tables of figures for every interval.', 'Opera intitulata Fontegara (Ganassi, Silvestro)', ['Fontegara']],
    ['dodecachordon', 'Heinrich Glarean', 'Dodecachordon', 1547, ['church-modes'], 'Twelve modes instead of eight, adding Aeolian and Ionian; with many examples by Josquin.', 'Dodecachordon (Glareanus, Henricus)', []],
    ['bourgeois', 'Loys Bourgeois', 'Le droit chemin de musique', 1550, ['notes-inegales'], 'Teaches singing; the first clear description of unequal notes.', 'Le droit chemin de musique (Bourgeois, Loys)', []],
    ['coclico', 'Adrianus Petit Coclico', 'Compendium musices', 1552, ['super-librum', 'diminution'], 'Counterpoint and ornamentation as taught, so he claims, by Josquin.', 'Compendium musices (Coclico, Adrianus Petit)', []],
    ['ortiz', 'Diego Ortiz', 'Trattado de glosas', 1553, ['glosas', 'diminution', 'ground-bass'], 'Glosas for the bass viol, and recercadas over madrigals and grounds.', 'Trattado de glosas (Ortiz, Diego)', [], 'c-ortiz'],
    ['vicentino', 'Nicola Vicentino', 'L’antica musica ridotta alla moderna prattica', 1555, ['enharmonic-revival', 'chromaticism', 'enharmonic-keyboards', 'greek-genera'], 'The three Greek genera made practical; the archicembalo with 31 notes to the octave.', 'L\'antica musica ridotta alla moderna prattica (Vicentino, Nicola)', ['L’antica musica'], 'c-vicentino'],
    ['bermudo', 'Juan Bermudo', 'Declaración de instrumentos musicales', 1555, ['intabulation', 'meantone', 'redobles'], 'Keyboard, vihuela and harp: tuning, intabulation and composition.', 'Declaración de instrumentos musicales (Bermudo, Juan)', []],
    ['zarlino', 'Gioseffo Zarlino', 'Le istitutioni harmoniche', 1558, ['full-triad', 'suspension', 'soggetto-cavato', 'church-modes', 'pervasive-imitation'], 'The counterpoint of Willaert’s school: the harmonia perfetta, dissonance treatment and the twelve modes.', 'Le istitutioni harmoniche (Zarlino, Gioseffo)', [], 'c-zarlino'],
    ['santa-maria', 'Tomás de Santa María', 'Arte de tañer fantasía', 1565, ['glosas', 'super-librum'], 'Improvising fantasias at the keyboard: fingering, glosas and counterpoint.', 'Arte de tañer fantasía (Santa María, Tomás de)', []],
    ['mei', 'Girolamo Mei', 'De modis musicis antiquorum', 1573, ['greek-humanism', 'monody'], 'Greek music was a single line sung with an instrument – the idea that reaches the Camerata.', null, [], 'c-mei'],
    ['salinas', 'Francisco de Salinas', 'De musica libri septem', 1577, ['meantone', 'greek-genera'], 'The exact quarter-comma meantone, and Spanish popular songs as examples of metre.', 'De musica libri septem (Salinas, Francisco de)', []],
    ['galilei', 'Vincenzo Galilei', 'Dialogo della musica antica et della moderna', 1581, ['greek-humanism', 'monody'], 'An attack on polyphony in the name of Greek monody.', 'Dialogo della musica antica, et della moderna (Galilei, Vincenzo)', [], 'c-galilei'],
    ['dalla-casa', 'Girolamo Dalla Casa', 'Il vero modo di diminuir', 1584, ['diminution'], 'Diminutions for cornett and voice, applied to whole madrigals and chansons.', 'Il vero modo di diminuir (Dalla Casa, Girolamo)', []],
    ['arbeau', 'Thoinot Arbeau', 'Orchésographie', 1589, ['basse-danse', 'dance-pairs'], 'The dances of the 16th century step by step, with their tunes and drum rhythms.', 'Orchésographie (Arbeau, Thoinot)', []],
    ['bottrigari', 'Ercole Bottrigari', 'Il desiderio', 1594, ['enharmonic-keyboards', 'meantone'], 'On playing instruments together; reports on Luzzaschi and the archicembalo.', 'Il desiderio (Bottrigari, Ercole)', []],
    ['morley', 'Thomas Morley', 'A Plaine and Easie Introduction to Practicall Musicke', 1597, ['english-cadence', 'super-librum', 'madrigal'], 'An English dialogue on singing, descant and composition, with a guide to genres.', 'A Plaine and Easie Introduction to Practicall Musicke (Morley, Thomas)', [], 'c-morley'],

    /* ---------- 17th century ---------- */
    ['artusi', 'Giovanni Maria Artusi', 'L’Artusi, overo Delle imperfettioni della moderna musica', 1600, ['seconda-pratica'], 'Attacks the unprepared dissonances of Monteverdi’s madrigals.', 'L\'Artusi, overo Delle imperfettioni della moderna musica (Artusi, Giovanni Maria)', []],
    ['banchieri', 'Adriano Banchieri', 'L’organo suonarino', 1605, ['alternatim', 'chiavette', 'basso-continuo'], 'The church organist’s handbook: alternatim versets, transposition and continuo.', 'L\'organo suonarino (Banchieri, Adriano)', []],
    ['burmeister', 'Joachim Burmeister', 'Musica poetica', 1606, ['figurenlehre', 'word-painting'], 'Musical figures named after the figures of rhetoric, with an analysis of a Lassus motet.', 'Musica poetica (Burmeister, Joachim)', []],
    ['lippius', 'Johannes Lippius', 'Synopsis musicae novae', 1612, ['full-triad'], 'Names the trias harmonica, the triad as the root of all harmony.', 'Synopsis musicae novae (Lippius, Johannes)', []],
    ['cerone', 'Pietro Cerone', 'El melopeo y maestro', 1613, ['super-librum', 'stile-antico'], 'A vast Spanish compendium of Italian practice, including contrapunto and the Guidonian hand.', 'El melopeo y maestro (Cerone, Pietro)', []],
    ['praetorius', 'Michael Praetorius', 'Syntagma musicum', 1619, ['pitch-standard', 'chiavette', 'time-beater', 'concertato'], 'Instruments, pitch (Chorton and Kammerton), transposing clefs and performing polychoral music.', 'Syntagma musicum (Praetorius, Michael)', [], 'c-praetorius'],
    ['mersenne', 'Marin Mersenne', 'Harmonie universelle', 1636, ['equal-temperament', 'orchestra', 'violin-idiom'], 'Acoustics, tuning and every instrument of the time, from the lute to the 24 violins.', 'Harmonie universelle (Mersenne, Marin)', []],
    ['descartes', 'René Descartes', 'Les passions de l’âme', 1649, ['affekt'], 'A philosophy of the passions that shapes the Baroque doctrine of affects.', null, []],
    ['kircher', 'Athanasius Kircher', 'Musurgia universalis', 1650, ['stylus-phantasticus', 'affekt', 'algorithmic'], 'An encyclopedia of music: the styles, the affects and a box for composing by combination.', 'Musurgia universalis (Kircher, Athanasius)', [], 'c-kircher'],
    ['bernhard', 'Christoph Bernhard', 'Tractatus compositionis augmentatus', 1657, ['figurenlehre', 'seconda-pratica', 'stile-antico'], 'Schütz’s pupil on the old and new styles and the figures of dissonance.', null, []],
    ['werckmeister', 'Andreas Werckmeister', 'Musicalische Temperatur', 1691, ['well-temperament'], 'Temperaments in which every key can be played.', 'Musicalische Temperatur (Werckmeister, Andreas)', []],

    /* ---------- 18th century ---------- */
    ['hotteterre', 'Jacques Hotteterre', 'Principes de la flûte traversière', 1707, ['notes-inegales', 'agrements'], 'The first method for the transverse flute; unequal notes and ornaments.', 'Principes de la flûte traversière (Hotteterre, Jacques-Martin)', []],
    ['campion', 'François Campion', 'Traité d’accompagnement', 1716, ['rule-of-octave', 'basso-continuo'], 'The règle de l’octave: a chord for every step of the bass scale.', 'Traité d\'accompagnement et de composition (Campion, François)', []],
    ['couperin-art', 'François Couperin', 'L’art de toucher le clavecin', 1716, ['agrements', 'notes-inegales', 'style-brise'], 'Fingering, ornaments and the expressive touch of the harpsichord.', 'L\'art de toucher le clavecin (Couperin, François)', [], 'c-f-couperin'],
    ['rameau', 'Jean-Philippe Rameau', 'Traité de l’harmonie', 1722, ['tonality', 'fifths-sequence'], 'The fundamental bass: chords and their roots as the basis of harmony.', 'Traité de l\'harmonie (Rameau, Jean-Philippe)', ['Rameau’s Traité'], 'c-rameau'],
    ['tosi', 'Pier Francesco Tosi', 'Opinioni de’ cantori antichi e moderni', 1723, ['castrato-virtuosity', 'rubato', 'da-capo-aria'], 'The art of the Baroque singer: ornamenting the da capo, and stolen time.', 'Opinioni de\' cantori antichi e moderni (Tosi, Pier Francesco)', []],
    ['fux', 'Johann Joseph Fux', 'Gradus ad Parnassum', 1725, ['stile-antico', 'suspension'], 'Counterpoint in five species after Palestrina – the school of strict counterpoint to this day.', 'Gradus ad Parnassum (Fux, Johann Joseph)', []],
    ['muffat-regulae', 'Georg Muffat', 'Regulae concentuum partiturae', 1699, ['basso-continuo', 'transitus', 'passing-seventh', 'suspension'], 'Every chord of the thoroughbass named and classified: six kinds of fourth, tied, struck and passing sevenths, the cadences by the motion of the bass.', 'Regulae Concentuum Partiturae (Muffat, Georg)', [], 'muffat'],
    ['heinichen', 'Johann David Heinichen', 'Der General-Bass in der Composition', 1728, ['basso-continuo', 'rule-of-octave', 'affekt', 'transitus', 'transitus-irregularis', 'passing-seventh', 'theatrical-resolution', 'full-voiced-continuo', 'all-keys-cycle'], 'Continuo playing and the affects; transitus regularis and irregularis, the theatrical resolutions of dissonance, the circle of keys.', 'Der General-Bass in der Composition (Heinichen, Johann David)', []],
    ['walther', 'Johann Gottfried Walther', 'Musicalisches Lexicon', 1732, ['figurenlehre'], 'The first German music dictionary, with terms, figures and composers.', 'Musicalisches Lexicon (Walther, Johann Gottfried)', []],
    ['mattheson', 'Johann Mattheson', 'Der vollkommene Capellmeister', 1739, ['affekt', 'figurenlehre'], 'Melody, rhetoric and the affects; the complete education of a music director.', 'Der vollkommene Capellmeister (Mattheson, Johann)', []],
    ['quantz', 'Johann Joachim Quantz', 'Versuch einer Anweisung die Flöte traversiere zu spielen', 1752, ['notes-inegales', 'lombard-rhythm', 'galant', 'cadenza'], 'The flute and the whole of galant performance practice: tempo, ornaments, cadenzas.', 'Versuch einer Anweisung die Flöte traversiere zu spielen (Quantz, Johann Joachim)', []],
    ['cpe-versuch', 'Carl Philipp Emanuel Bach', 'Versuch über die wahre Art das Clavier zu spielen', 1753, ['empfindsamkeit', 'agrements', 'basso-continuo'], 'Fingering, ornaments, continuo and free fantasy at the keyboard.', 'Versuch über die wahre Art das Clavier zu spielen (Bach, Carl Philipp Emanuel)', [], 'c-cpe-bach'],
    ['l-mozart', 'Leopold Mozart', 'Versuch einer gründlichen Violinschule', 1756, ['violin-idiom', 'rubato'], 'Bowing, ornaments and style on the violin of the galant age.', 'Versuch einer gründlichen Violinschule (Mozart, Leopold)', []],
    ['rousseau', 'Jean-Jacques Rousseau', 'Dictionnaire de musique', 1768, ['picardy-third', 'opera-buffa'], 'A music dictionary; names the tierce de Picardie.', 'Dictionnaire de musique (Rousseau, Jean-Jacques)', []],
    ['fenaroli', 'Fedele Fenaroli', 'Regole musicali per i principianti di cembalo', 1775, ['partimento', 'rule-of-octave', 'galant-schemata'], 'The Neapolitan partimento method used for a century.', 'Regole musicali per i principianti di cembalo (Fenaroli, Fedele)', []],
    ['koch', 'Heinrich Christoph Koch', 'Versuch einer Anleitung zur Composition', 1782, ['periodic-phrasing', 'sonata-form'], 'Melody built from phrases and periods; the first account of Classical form.', 'Versuch einer Anleitung zur Composition (Koch, Heinrich Christoph)', []],

    /* ---------- 19th and 20th centuries ---------- */
    ['berlioz-traite', 'Hector Berlioz', 'Grand traité d’instrumentation', 1844, ['romantic-orchestra'], 'Every instrument and its colour, with examples from Gluck to Berlioz himself.', 'Grand traité d\'instrumentation et d\'orchestration modernes, Op.10 (Berlioz, Hector)', [], 'c-berlioz'],
    ['marx', 'Adolf Bernhard Marx', 'Die Lehre von der musikalischen Komposition', 1845, ['sonata-form', 'rondo'], 'Names sonata form and describes its themes, development and recapitulation.', 'Die Lehre von der musikalischen Komposition (Marx, Adolf Bernhard)', []],
    ['wagner-oper', 'Richard Wagner', 'Oper und Drama', 1851, ['music-drama', 'leitmotif'], 'The programme of the music drama: the orchestra as the bearer of motifs of memory.', null, [], 'c-wagner'],
    ['schoenberg-harmonielehre', 'Arnold Schoenberg', 'Harmonielehre', 1911, ['free-atonality', 'quartal-harmony', 'extended-tertian'], 'Tonal harmony taught to its limits: chords in fourths and the emancipation of the dissonance.', null, [], 'c-schoenberg'],
    ['messiaen-technique', 'Olivier Messiaen', 'Technique de mon langage musical', 1944, ['messiaen-modes', 'irregular-metre', 'birdsong'], 'Modes of limited transposition, added values and non-retrogradable rhythms.', null, [], 'c-messiaen']
  ];

  const imslp = q => 'https://imslp.org/index.php?title=Special:Search&search=' + encodeURIComponent(q);
  V.treatises = T.map(([id, author, title, year, els, note, q, aka, composer]) => ({
    id: 't-' + id, kind: 'treatise', author, title, year, els, note, href: q ? imslp(q) : null, aka: aka || [], composer: composer || null
  }));

  /* mentions of a treatise in the notes open its page in the Atlas */
  V.works = V.works || [];
  V.treatises.forEach(t => [t.title].concat(t.aka).forEach(text => {
    if (!V.works.some(w => w.text === text)) V.works.push({text, where: 'atlas', href: '#note/' + t.id, id: t.id});
  }));
})(window.VAULT);
