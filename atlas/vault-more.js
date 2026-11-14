/* Atlas of Musical Style — further additions (November 2026): microtonal instruments, medieval and Renaissance genres
   and practices, and some long-lived devices (hemiola, contrafactum, quodlibet, imitations of nature). Loaded before vault-crosslinks.js. */
(function (V) {
  V.elements.push(
    /* ---------- instruments with more than twelve notes ---------- */
    {id: 'enharmonic-keyboards', title: 'Chromatic & enharmonic keyboards (16th–17th c.)', folder: 'timbre', first: 1550, common: 1560, fade: 1650,
      scope: 'Vicentino’s archicembalo and arciorgano (Rome, c. 1550; 31 notes to the octave; a second arciorgano by Vincenzo Colombo, Venice, by 1561); the cembalo cromatico at the Este court in Ferrara, played by Luzzasco Luzzaschi; Trasuntino’s clavemusicum omnitonum (1606); split-key organs and harpsichords',
      text: 'Keyboards built to play the revived Greek genera ([[enharmonic-revival]]). Vicentino’s archicembalo and his organ, the arciorgano, divide the octave into many more steps than twelve, on two or more ranks of keys; a reconstruction of the arciorgano was built in Basel in 2016. In Ferrara the archicembalo was regarded as almost a museum piece that only Luzzasco Luzzaschi could really play (Bottrigari); whether his instrument had 31, 19 or fewer keys per octave is not certain. Far commoner are keyboards with a few split keys (G♯/A♭, D♯/E♭) so that [[meantone]] can serve more keys. After the 17th century such instruments disappear for almost three hundred years, until the [[microtonal-instruments]] of the 20th century.'},
    {id: 'microtonal-instruments', title: 'Microtonal instruments (20th century)', folder: 'timbre', first: 1920, common: 1950, fade: null,
      scope: 'Hába’s quarter-tone grand piano (August Förster, shown in Prague in 1924), quarter-tone pianinos, quarter- and sixth-tone harmoniums, a quarter-tone clarinet and trumpet; Wyschnegradsky’s pianos tuned a quarter tone apart; Carrillo’s pianos; the 31-tone Fokker organ (Haarlem, 1950); Partch’s instruments',
      text: 'With the return of [[microtonality]] composers again have instruments built. Alois Hába in Prague has Förster build quarter-tone pianos (1924–31), a quarter-tone harmonium and a sixth-tone harmonium, as well as a quarter-tone clarinet, trumpet and guitar; his quarter-tone opera *Matka* (Munich, 1931) uses them. Adriaan Fokker revives Huygens’s 31-tone division – the same that Vicentino had used on the [[enharmonic-keyboards|archicembalo]] – in his organ in Haarlem. Today digital keyboards and synthesizers make any division of the octave possible.'},

    /* ---------- medieval and Renaissance genres ---------- */
    {id: 'liturgical-drama', title: 'Liturgical drama', folder: 'form', first: 970, common: 1100, fade: 1300,
      scope: 'the Easter dialogue Quem quaeritis (Regularis concordia, c. 970); the Fleury Playbook; the Play of Daniel (Beauvais, c. 1230); Hildegard’s Ordo virtutum',
      text: 'Sung plays in Latin grown out of [[sequence-trope|tropes]]: the three Marys at the tomb and the angel, later whole biblical stories, sung in [[plainchant]]-like melody with simple staging in church.'},
    {id: 'lauda', title: 'Lauda', folder: 'form', first: 1260, common: 1300, fade: 1600,
      scope: 'the laudesi confraternities; the Cortona laudario (late 13th c.); polyphonic laude in Petrucci’s prints (1508) and in Rome around Filippo Neri',
      text: 'Italian devotional songs in the vernacular, first monophonic, then in simple chordal polyphony. With the [[frottola]] they prepare the clear [[homophony]] of the 16th century; the laude sung in Filippo Neri’s Oratory lead to the [[oratorio]].'},
    {id: 'caccia', title: 'Caccia', folder: 'counterpoint', first: 1340, common: 1350, fade: 1400,
      scope: 'Italian Trecento: Jacopo da Bologna, Giovanni da Cascia, Landini; the French chace',
      text: 'Two voices in strict [[canon]] at the unison over a free tenor, often on hunting scenes with shouts and calls – the “chase” is musical as well as literal. With the French chace it is the first flowering of written canon.'},
    {id: 'carol', title: 'English carol', folder: 'form', first: 1400, common: 1430, fade: 1530,
      scope: 'Trinity carol roll, Selden manuscript, Egerton manuscript; Agincourt Carol',
      text: 'English songs in two or three voices with a refrain (burden) between the verses, Latin, English or mixed, in the [[english-discant|sweet English sonority]], often with passages in [[gymel]] or [[english-faburden|faburden]].'},
    {id: 'keyboard-tablature', title: 'Keyboard tablatures & organ intabulations', folder: 'rhythm', first: 1360, common: 1450, fade: 1700,
      scope: 'Robertsbridge fragment (c. 1360); Faenza codex (c. 1420); Paumann’s Fundamentum organisandi (1452); the Buxheim Organ Book (c. 1470); the German organ tablatures to Scheidt and beyond',
      text: 'The earliest written keyboard music: the upper part ornamented in small values over a slower voice, in letters and notes. These sources show how organists turned songs and chants into instrumental music ([[intabulation]], [[diminution]]) and how they were taught to improvise over a given voice (the *Fundamentum*).'},
    {id: 'basse-danse', title: 'Basse danse on a tenor', folder: 'practice', first: 1440, common: 1450, fade: 1530,
      scope: 'the Brussels basse danse manuscript (c. 1470); Italian bassadanza; alta capella of shawms and slide trumpet',
      text: 'The courtly dance of the 15th century: a tenor in long equal notes, around which the wind players of the *alta capella* improvised one or two faster voices – an instrumental cousin of [[super-librum|cantare super librum]]. Arbeau still describes it in 1589.'},
    {id: 'villancico', title: 'Villancico', folder: 'form', first: 1470, common: 1500, fade: 1800,
      scope: 'Cancionero de Palacio (c. 1500): Juan del Encina; Spanish and Portuguese cathedrals and the colonies of the New World into the 18th century',
      text: 'The Spanish song with refrain (estribillo) and verses (coplas), first secular, then mostly devotional – for Christmas and Corpus Christi – with ever larger forces in Spain and Latin America.'},
    {id: 'glosas', title: 'Glosas (Spanish diminution)', folder: 'practice', first: 1550, common: 1553, fade: 1650,
      scope: 'Diego Ortiz, Trattado de glosas (Rome, 1553); Santa María, Arte de tañer fantasía (1565); Cabezón’s glosados',
      text: 'The Spanish art of [[diminution]] on a given piece or bass. Ortiz shows how the bass viol can play *recercadas* over a madrigal or over a ground such as the [[ground-bass|folia or passamezzo]] – a link between improvised counterpoint and the later variation.'},
    {id: 'sortisatio', title: 'Sortisatio (German improvised counterpoint)', folder: 'practice', first: 1520, common: 1540, fade: 1650,
      scope: 'German school theorists of the 16th century, who oppose sortisatio (singing) to compositio (writing)',
      text: 'The German name for what Italians and Spaniards called contrapunto or [[super-librum|cantare super librum]]: counterpoint made up on the spot over a chant or song tenor, taught in Latin schools beside written composition.'},
    {id: 'cantus-fractus', title: 'Cantus fractus (measured chant)', folder: 'rhythm', first: 1400, common: 1580, fade: 1900,
      scope: 'Credo cardinalis and other measured chants of the 15th century; Guidetti, Directorium chori (Rome, 1582); the Editio Medicea (1614–15); French plain-chant musical (Nivers, Du Mont)',
      text: 'Chant sung in measured values – longs, breves and semibreves – instead of the free rhythm of [[plainchant]]. It grows in the late Middle Ages, is codified in the Roman books after Trent (Guidetti uses distinct note shapes for different lengths) and in France becomes the *plain-chant musical* of the 17th and 18th centuries. Solesmes and the Vatican edition (1908) return to unmeasured chant.'},
    {id: 'chiavette', title: 'High clefs (chiavette)', folder: 'rhythm', first: 1540, common: 1560, fade: 1700,
      scope: 'Palestrina, Lassus, Marenzio, Monteverdi; discussed by Banchieri, Praetorius (1619)',
      text: 'Pieces written in the high clef set (G2, C2, C3, F3) instead of the normal one (C1, C3, C4, F4). Theorists from Praetorius onward say such pieces were transposed down, usually a fourth or fifth, by singers and organists – the clefs keep every part on the staff without ledger lines and show the mode, not the sounding pitch.'},

    /* ---------- Baroque devices ---------- */
    {id: 'scordatura', title: 'Scordatura', folder: 'timbre', first: 1620, common: 1670, fade: null,
      scope: 'Biagio Marini, op. 8 (1629); Biber’s Rosary Sonatas (c. 1676); Bach’s fifth cello suite; Mozart’s Sinfonia concertante (viola); Mahler’s fourth symphony',
      text: 'Retuning the strings of a violin, viol or lute away from the normal tuning, for new chords, resonances and colours. Biber’s Rosary Sonatas use a different tuning for almost every sonata; the music is notated as fingered, so it sounds other than it looks.'},
    {id: 'strophic-variation', title: 'Strophic variation', folder: 'form', first: 1600, common: 1610, fade: 1680,
      scope: 'Caccini, Le nuove musiche (1602); Monteverdi, Possente spirto in Orfeo (1607); arias over the Romanesca and Ruggiero',
      text: 'Each strophe of a song is sung over the same bass with a new, more and more ornamented melody – the early-Baroque way of joining [[monody]] with [[ground-bass|bass patterns]] and [[diminution]].'},
    {id: 'alfabeto', title: 'Strummed guitar chords (alfabeto)', folder: 'practice', first: 1590, common: 1620, fade: null,
      scope: 'Amat, Guitarra española (1596); Montesardo (1606) and the Italian alfabeto tablatures; Spanish and Latin American rasgueado; flamenco; folk and pop strumming',
      text: 'The five-course guitar is strummed in chords, notated with letters (A, B, C… each one a chord shape) and rhythm signs. It is the first chord symbol system and one of the longest-living practices on this atlas: from the 17th-century *battuto* to flamenco *rasgueado* and the strumming of folk and popular song, often in [[accompanied-monody|self-accompanied song]].'},
    {id: 'echo', title: 'Echo effects', folder: 'texture', first: 1550, common: 1580, fade: 1750,
      scope: 'Lassus, O la, o che bon eccho; Venetian polychoral music; Sweelinck’s echo fantasias; Monteverdi’s Vespers (Audi coelum); Bach’s Echo in the French Overture',
      text: 'A phrase answered softly by a second group or a second manual. Natural for [[cori-spezzati|divided choirs]] and organs with several keyboards; also a play on words when the echo repeats only the last syllables with a new meaning.'},

    /* ---------- long-lived devices ---------- */
    {id: 'hemiola', title: 'Hemiola', folder: 'rhythm', first: 1350, common: 1450, fade: null,
      scope: 'coloration in 14th–15th-century notation; cadences in triple time from the Renaissance to the Baroque courante and minuet; Brahms, Schumann; Bernstein’s America',
      text: 'Two bars of three beats regrouped as three bars of two (or three minims in the place of two dotted minims). Written with blackened notes in mensural notation, it marks the cadence in countless triple-time pieces, and Romantic composers use it to blur the barline.'},
    {id: 'contrafactum', title: 'Contrafactum (new words to an old tune)', folder: 'form', first: 900, common: 1100, fade: null,
      scope: 'sequences and conductus, troubadour melodies with Latin texts, Lutheran chorales from secular songs (Innsbruck, ich muss dich lassen → O Welt, ich muss dich lassen), Genevan psalms, hymnals; parody songs today',
      text: 'A melody keeps its notes and receives a new text – sacred for secular, or the reverse. One of the oldest and most constant procedures: much of the [[chorale]] repertory and many hymn tunes are contrafacta, and so is every new text sung to a familiar tune.'},
    {id: 'quodlibet', title: 'Quodlibet', folder: 'counterpoint', first: 1450, common: 1530, fade: null,
      scope: 'German song quodlibets (Senfl, Schmeltzl), French fricassées; the last of Bach’s Goldberg Variations (1741)',
      text: 'Several well-known songs combined at once or one after another, often to comic effect. In Bach’s Goldberg Variations two folk songs are set in counterpoint over the aria’s bass.'},
    {id: 'battaglia', title: 'Battle pieces (battaglia)', folder: 'form', first: 1520, common: 1550, fade: 1830,
      scope: 'Janequin, La guerre (printed 1528); Byrd’s Battell; Biber’s Battalia (1673); Kuhnau; Beethoven’s Wellingtons Sieg (1813)',
      text: 'Fanfares, drums, cannon shots and the cries of the wounded imitated in music – the oldest steady tradition of [[program-music]], centuries before the symphonic poem. Biber’s *Battalia* already uses paper under the bass strings and simultaneous songs in different keys.'},
    {id: 'birdsong', title: 'Birdsong in music', folder: 'form', first: 1340, common: 1530, fade: null,
      scope: 'Trecento cacce and virelais; Janequin, Le chant des oiseaux; Daquin, Le coucou; Rameau, La poule; Beethoven’s Pastoral Symphony (1808); Messiaen, Catalogue d’oiseaux (1956–58)',
      text: 'Cuckoos, nightingales and hens imitated by voices and instruments from the 14th century to Messiaen, who notates real birdsong in the field and builds whole works from it.'},
    {id: 'lombard-rhythm', title: 'Lombard rhythm (Scotch snap)', folder: 'rhythm', first: 1720, common: 1735, fade: null,
      scope: 'Italian and galant music c. 1720–60 (Vivaldi, Pergolesi, Quantz); Scottish folk song; later pop and jazz',
      text: 'A short accented note followed by a longer one on the beat – the reverse of the dotted rhythm. Fashionable in galant music, characteristic of Scottish song, and alive in popular music.'},

    /* ---------- the 18th century ---------- */
    {id: 'opera-buffa', title: 'Comic opera (opera buffa)', folder: 'form', first: 1710, common: 1740, fade: 1850,
      scope: 'Neapolitan commedia per musica; Pergolesi, La serva padrona (1733); Goldoni and Galuppi; Mozart and Da Ponte; Rossini',
      text: 'Everyday characters, fast syllabic singing, and the [[ensemble-finale]] in which the action keeps moving. Its clear periodic tunes feed the [[galant]] style and the [[viennese-classical|Classical]] symphony.'},
    {id: 'minuet-trio', title: 'Minuet and trio', folder: 'form', first: 1680, common: 1750, fade: 1830,
      scope: 'Lully’s minuets; the third movement of the Classical symphony and string quartet; replaced by Beethoven’s scherzo',
      text: 'A courtly dance in triple time paired with a second, lighter minuet (the trio, once for three instruments), after which the first returns. A fixed movement of the [[symphony]] and [[string-quartet]] until Beethoven turns it into the scherzo.'},
    {id: 'sturm-und-drang', title: 'Sturm und Drang (agitated minor)', folder: 'harmony', first: 1765, common: 1768, fade: 1780,
      scope: 'Haydn’s minor-key symphonies (Nos. 26, 39, 44, 45, 49), Mozart’s Symphony K. 183, Vanhal, Gluck',
      text: 'A short wave of passionate minor-key works with syncopations, wide leaps, tremolo and sudden dynamics, around 1765–75; an anticipation of Romantic expression within the [[viennese-classical|Classical]] style.'}
    ,
    /* ---------- institutions, technology and the long view ---------- */
    {id: 'antiphony', title: 'Antiphony & call and response', folder: 'texture', first: 350, common: 400, fade: null,
      scope: 'antiphonal psalmody brought to Milan by Ambrose (386); responsorial chant; alternatim; cori spezzati; African-American work song, spirituals and gospel; blues and jazz riffs',
      text: 'Two groups – or a leader and a group – answering each other. It shapes the psalmody of the early Church, the [[alternatim]] of choir and organ and the [[cori-spezzati|divided choirs]] of Venice, and, from another root, the call and response of African-American music, the [[riff]] exchanges of the [[big-band]] and the singer answered by the guitar in the blues.'},
    {id: 'public-opera', title: 'Public opera house', folder: 'practice', first: 1637, common: 1660, fade: null,
      scope: 'Teatro San Cassiano, Venice (1637), soon followed by further Venetian theatres; Hamburg Gänsemarkt (1678); London, Paris',
      text: 'Opera moves from court festivities to a theatre with paying audiences. Smaller orchestras, star singers and a few stock scene types follow – the beginning of [[opera]] as a business and of the [[castrato-virtuosity|cult of the singer]].'},
    {id: 'public-concert', title: 'Public concerts', folder: 'practice', first: 1672, common: 1730, fade: null,
      scope: 'John Banister’s concerts in London (1672); collegia musica (Telemann, Bach in Leipzig); Concert spirituel, Paris (1725); Leipzig Gewandhaus (1781)',
      text: 'Music for anyone who buys a ticket, outside church and court. The public concert creates the repertory of the [[symphony]] and the [[virtuosity|virtuoso]], and in the 19th century the idea of a canon of “classics” played again and again.'},
    {id: 'pitch-standard', title: 'Pitch standards (a′ = …)', folder: 'pitch', first: 1490, common: 1600, fade: null,
      scope: 'late-Gothic organs built to the pitch of their town or church; Arnolt Schlick, Spiegel der Orgelmacher (1511), who prints the length of the lowest pipe to fix the pitch; Praetorius on Chorton and Kammerton (1619); the French diapason normal a′ = 435 (1859); the London conference a′ = 440 (1939, ISO 1955); a′ = 415, 430, 466 in historical performance today',
      text: 'There was never one pitch for everyone, but there were standards long before the modern a′ = 440 – for a church, a town or a court. Restorers of organs from around 1500 find instruments built deliberately a tone lower (or higher) than others of the time, to match the local choir and the town’s wind players; Arnolt Schlick in 1511 tells organ builders the exact length of the pipe that sets the pitch, and Praetorius in 1619 names the *Chorton* of church music and the *Kammerton* of chamber music. Only the 19th and 20th centuries fix one reference tone for all: the French *diapason normal* (435 Hz, 1859) and a′ = 440 (1939). The historical-performance movement in turn adopts conventional pitches for older repertoires, such as a′ = 415 for the Baroque and 466 for some 17th-century music.'},
    {id: 'time-beater', title: 'Time-beating with hand, staff or roll of paper', folder: 'practice', first: 1200, common: 1430, fade: 1800,
      scope: 'precentors’ staffs kept in cathedral treasuries from the 12th century; singers touching each other’s shoulders in medieval miniatures; Anselmi (Parma, 1434) on showing the tactus with the hand; the choir director’s duties in Philomathes, Musicorum libri quatuor (Vienna, 1512); the cantor with his stick in German Latin schools and Czech literati brotherhoods (Kutná Hora Gradual, 1490s); the roll of paper of Praetorius’s Kapellmeister; Lully’s staff',
      text: 'Someone has always given the beat to an ensemble. From the 12th century the precentor carries a staff – a sign of office, but long enough to be seen by the whole choir – and medieval pictures show singers keeping time by tapping one another on the shoulder. From the 15th century the theorists describe the [[tactus]] as the down-up motion of the leader’s hand; choirmasters and cantors are depicted with a long stick, used to beat the tactus (and, in the Latin schools, the pupils). In [[cori-spezzati|polychoral]] music a chief time-beater stands at the organ and others relay his beat in each choir, often with a roll of paper. Lully famously beat time with a heavy staff. The [[conductor|modern conductor]] of the 19th century is not the beginning of this story but a new role within it: an interpreter rather than a time-keeper.'},
    {id: 'sound-recording', title: 'Sound recording & broadcasting', folder: 'timbre', first: 1877, common: 1925, fade: null,
      scope: 'Edison’s phonograph (1877); the gramophone disc; electrical recording (1925); radio; the LP (1948); tape, CD, streaming',
      text: 'Music can be kept and heard without performers. Jazz and popular styles spread by record rather than score; performers learn from recordings; and the record itself becomes a work in the [[multitrack-studio|studio]], in [[musique-concrete]] and in [[sampling]].'},
    {id: 'film-score', title: 'Film music', folder: 'form', first: 1908, common: 1933, fade: null,
      scope: 'Saint-Saëns, L’assassinat du duc de Guise (1908); sound film from 1927; Steiner, King Kong (1933); Korngold, Prokofiev, Herrmann; Morricone; Williams',
      text: 'Orchestral music that follows the picture: the [[leitmotif]], the [[romantic-orchestra|late-Romantic orchestra]] and [[program-music|programme music]] live on in the cinema, which becomes the place where most people hear an orchestra.'},
    {id: 'chant-restoration', title: 'Chant restoration (Solesmes)', folder: 'practice', first: 1833, common: 1883, fade: null,
      scope: 'Dom Guéranger refounds Solesmes (1833); Pothier, Liber gradualis (1883); Mocquereau, Paléographie musicale (from 1889); the Vatican edition (1908); semiology (Cardine, 1970)',
      text: 'The Benedictines of Solesmes return to the oldest manuscripts, replace the measured [[cantus-fractus]] and the Editio Medicea with free-rhythm chant, and make it the official chant of the Church in 1903–08. Later research on the [[neumes]] (Gregorian semiology) changes the way chant is sung again.'},
    {id: 'early-music-revival', title: 'Historically informed performance', folder: 'practice', first: 1829, common: 1965, fade: null,
      scope: 'Mendelssohn revives the St Matthew Passion (1829); Arnold Dolmetsch; Wanda Landowska’s harpsichord; Harnoncourt, Leonhardt, Brüggen; period instruments and treatises',
      text: 'Old music played on the instruments, with the techniques, tunings and [[pitch-standard|pitches]] of its time, learned from treatises and sources. It grows from 19th-century revivals of Bach and Palestrina into a movement that changes concert life from the 1960s and brings back practices such as [[notes-inegales]], [[diminution]] and improvised [[super-librum|counterpoint]].'}
  );

  const st = id => V.styles.find(s => s.id === id);
  const add = (style, ids) => ids.forEach(i => st(style) && !st(style).elements.includes(i) && st(style).elements.push(i));
  add('chant-style', ['liturgical-drama', 'contrafactum', 'cantus-fractus']);
  add('troubadours', ['contrafactum']);
  add('trecento', ['caccia', 'lauda', 'birdsong']);
  add('ars-nova', ['keyboard-tablature', 'hemiola']);
  add('english-style', ['carol']);
  add('burgundian', ['basse-danse', 'keyboard-tablature', 'hemiola']);
  add('josquin', ['quodlibet', 'sortisatio', 'lauda']);
  add('spanish-ren', ['villancico', 'glosas']);
  add('instrumental-ren', ['glosas', 'keyboard-tablature', 'battaglia']);
  add('franco-flemish', ['sortisatio', 'chiavette', 'contrafactum']);
  add('palestrina', ['chiavette', 'cantus-fractus']);
  add('madrigal', ['chiavette', 'enharmonic-keyboards']);
  add('parisian-chanson', ['battaglia', 'birdsong']);
  add('venetian', ['echo']);
  add('early-baroque', ['strophic-variation', 'alfabeto', 'echo', 'enharmonic-keyboards']);
  add('stylus-phantasticus', ['scordatura', 'battaglia']);
  add('french-baroque', ['birdsong', 'hemiola', 'minuet-trio']);
  add('high-baroque', ['hemiola', 'quodlibet']);
  add('galant', ['opera-buffa', 'lombard-rhythm', 'minuet-trio']);
  add('viennese-classical', ['minuet-trio', 'sturm-und-drang', 'opera-buffa']);
  add('late-romantic', ['hemiola', 'public-concert']);
  add('chant-style', ['antiphony', 'chant-restoration']);
  add('venetian', ['antiphony', 'time-beater']);
  add('burgundian', ['time-beater']);
  add('josquin', ['time-beater']);
  add('french-baroque', ['time-beater']);
  add('early-baroque', ['public-opera']);
  add('high-baroque', ['public-opera', 'public-concert']);
  add('viennese-classical', ['public-concert']);
  add('early-jazz', ['antiphony', 'sound-recording']);
  add('swing-era', ['antiphony', 'sound-recording']);
  add('rock', ['sound-recording']);

  const el = id => V.elements.find(e => e.id === id);
  if (el('enharmonic-revival')) el('enharmonic-revival').text += ' The instruments: [[enharmonic-keyboards]].';
  if (el('microtonality')) el('microtonality').text += ' New instruments are built for it: [[microtonal-instruments]].';
  if (el('conductor')) { el('conductor').title = 'The modern conductor (interpreter with baton)'; el('conductor').text = 'The [[time-beater]] – who had given the beat with hand, staff or roll of paper since the Middle Ages – becomes an interpreter standing before the [[romantic-orchestra]], replacing the leading violinist or the keyboard player of the continuo. The short light baton spreads in the 1820s (Spohr, Weber, Mendelssohn).'; }
  if (el('tactus')) { el('tactus').first = 1430; el('tactus').scope = 'the beat given by the hand; Anselmi (1434), Gaffurius, Practica musicae (1496), Agricola (1532)'; el('tactus').text += ' Who gave it, and with what: see [[time-beater]].'; }
  const sty = id => V.styles.find(x => x.id === id);
  if (sty('stylus-phantasticus')) sty('stylus-phantasticus').text = 'The name comes from Athanasius Kircher, *Musurgia universalis* (Rome, 1650), the first source to define it: the *stylus phantasticus* is “aptus instrumentis” – suited to instruments – the freest and least bound way of composing, held to no words and no fixed subject, made to display the player’s invention and skill. Frescobaldi and Froberger (whom Kircher names), Biber, Buxtehude and the north German organists: sections of free fantasy alternate with fugal passages. See [[toccata]].';
  if (el('program-music')) el('program-music').text += ' Its long prehistory: [[battaglia|battle pieces]] and [[birdsong]].';
})(window.VAULT);
