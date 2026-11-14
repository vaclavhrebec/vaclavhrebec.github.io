/* Atlas of Musical Style — links to scores and sources.
   Every named composition, print or manuscript in the notes is linked to IMSLP (scores and prints)
   or DIAMM (medieval and Renaissance manuscripts), so that nobody has to look for it.
   [text as it appears in the notes, where, query or direct URL]
     'imslp' – IMSLP: the query is the expected page title; IMSLP opens the page directly when the title
               exists and otherwise shows its search results for the same words.
     'diamm' – DIAMM: a source page (full URL) or a search in the database.
   Only the first mention in each note is linked. Works still under copyright are left out. */
(function (V) {
  const W = [
    /* ---------- chant, organum, Notre Dame ---------- */
    ['Winchester Troper', 'diamm', 'Winchester Troper'],
    ['Codex Calixtinus', 'diamm', 'Codex Calixtinus'],
    ['Congaudeant catholici', 'diamm', 'Codex Calixtinus'],
    ['Magnus liber organi', 'diamm', 'Magnus liber'],
    ['Magnus liber', 'diamm', 'Magnus liber'],
    ['Viderunt omnes', 'imslp', 'Viderunt omnes (Pérotin)'],
    ['Viderunt', 'imslp', 'Viderunt omnes (Pérotin)'],
    ['Sederunt principes', 'imslp', 'Sederunt principes (Pérotin)'],
    ['Sederunt', 'imslp', 'Sederunt principes (Pérotin)'],
    ['Sumer is icumen in', 'imslp', 'Sumer is icumen in (Anonymous)'],
    ['Montpellier Codex', 'diamm', 'Montpellier H196'],
    ['Ordo virtutum', 'imslp', 'Ordo virtutum (Hildegard von Bingen)'],
    ['Fleury Playbook', 'diamm', 'Fleury Playbook'],
    ['Play of Daniel', 'imslp', 'Ludus Danielis (Anonymous)'],
    ['Cortona laudario', 'diamm', 'Cortona 91'],
    ['Seikilos epitaph', 'imslp', 'Epitaph of Seikilos (Anonymous)'],
    ['Delphic hymns', 'imslp', 'Delphic Hymns (Athenaeus)'],

    /* ---------- 14th and 15th centuries ---------- */
    ['Roman de Fauvel', 'diamm', 'Fauvel'],
    ['Messe de Notre Dame', 'imslp', 'Messe de Nostre Dame (Machaut, Guillaume de)'],
    ['Machaut’s Mass', 'imslp', 'Messe de Nostre Dame (Machaut, Guillaume de)'],
    ['his four-voice Mass', 'imslp', 'Messe de Nostre Dame (Machaut, Guillaume de)'],
    ['Codex Chantilly', 'diamm', 'Chantilly 564'],
    ['Robertsbridge fragment', 'diamm', 'Robertsbridge'],
    ['Faenza Codex', 'diamm', 'Faenza 117'],
    ['Faenza codex', 'diamm', 'Faenza 117'],
    ['Worcester fragments', 'diamm', 'Worcester fragments'],
    ['Old Hall Manuscript', 'diamm', 'https://www.diamm.ac.uk/sources/210/'],
    ['Old Hall manuscript', 'diamm', 'https://www.diamm.ac.uk/sources/210/'],
    ['Old Hall', 'diamm', 'https://www.diamm.ac.uk/sources/210/'],
    ['BL Lansdowne 763', 'diamm', 'Lansdowne 763'],
    ['Trinity carol roll', 'diamm', 'Trinity carol roll'],
    ['Selden manuscript', 'diamm', 'Selden B. 26'],
    ['Egerton manuscript', 'diamm', 'Egerton 3307'],
    ['Agincourt Carol', 'imslp', 'Deo gracias Anglia (Anonymous)'],
    ['Missa Sancti Jacobi', 'imslp', 'Missa Sancti Jacobi (Dufay, Guillaume)'],
    ['Nuper rosarum flores', 'imslp', 'Nuper rosarum flores (Dufay, Guillaume)'],
    ['Missa Caput', 'imslp', 'Missa Caput (Anonymous)'],
    ['Fundamentum organisandi', 'diamm', 'Locheimer Liederbuch'],
    ['Buxheim Organ Book', 'diamm', 'Buxheim'],
    ['Brussels basse danse manuscript', 'diamm', 'Brussels 9085'],
    ['Eton Choirbook', 'diamm', 'Eton College 178'],
    ['Missa prolationum', 'imslp', 'Missa prolationum (Ockeghem, Johannes)'],
    ['Deo gratias', 'imslp', 'Deo gratias (Ockeghem, Johannes)'],
    ['Cancionero de Palacio', 'diamm', 'Cancionero de Palacio'],

    /* ---------- 16th century ---------- */
    ['Harmonice musices odhecaton', 'imslp', 'Harmonice Musices Odhecaton (Petrucci, Ottaviano)'],
    ['Missa L’homme armé super voces musicales', 'imslp', 'Missa L\'homme armé super voces musicales (Josquin Des Prez)'],
    ['Missa Hercules dux Ferrariae', 'imslp', 'Missa Hercules Dux Ferrariae (Josquin Des Prez)'],
    ['Innsbruck, ich muss dich lassen', 'imslp', 'Innsbruck, ich muss dich lassen (Isaac, Heinrich)'],
    ['O Welt, ich muss dich lassen', 'imslp', 'O Welt, ich muss dich lassen (Isaac, Heinrich)'],
    ['Achtliederbuch', 'imslp', 'Etlich christlich Lieder (Various)'],
    ['Geystliche gesangk Buchleyn', 'imslp', 'Geystliche gesangk Buchleyn (Walter, Johann)'],
    ['La guerre', 'imslp', 'La guerre (Janequin, Clément)'],
    ['Le chant des oiseaux', 'imslp', 'Le chant des oyseaulx (Janequin, Clément)'],
    ['Fontegara', 'imslp', 'Opera intitulata Fontegara (Ganassi, Silvestro)'],
    ['Milán 1536', 'imslp', 'El Maestro (Milán, Luis de)'],
    ['Narváez 1538', 'imslp', 'Los seys libros del Delphin (Narváez, Luys de)'],
    ['Musica nova', 'imslp', 'Musica nova (Willaert, Adrian)'],
    ['Salmi spezzati', 'imslp', 'Salmi spezzati (Willaert, Adrian)'],
    ['Trattado de glosas', 'imslp', 'Trattado de glosas (Ortiz, Diego)'],
    ['Arte de tañer fantasía', 'imslp', 'Arte de tañer fantasía (Santa María, Tomás de)'],
    ['O la, o che bon eccho', 'imslp', 'O là, o che bon eccho (Lassus, Orlande de)'],
    ['Striggio’s mass for 40 voices', 'imslp', 'Missa sopra Ecco sì beato giorno (Striggio, Alessandro)'],
    ['Spem in alium', 'imslp', 'Spem in alium (Tallis, Thomas)'],
    ['Directorium chori', 'imslp', 'Directorium chori (Guidetti, Giovanni)'],
    ['Byrd’s Battell', 'imslp', 'The Battell (Byrd, William)'],
    ['Guitarra española', 'imslp', 'Guitarra española (Amat, Joan Carles)'],
    ['Dowland 1597', 'imslp', 'The First Booke of Songes or Ayres (Dowland, John)'],
    ['Sacrae symphoniae', 'imslp', 'Sacrae symphoniae (Gabrieli, Giovanni)'],
    ['Cavalieri’s Lamentations', 'imslp', 'Lamentationes Hieremiae Prophetae (Cavalieri, Emilio de\')'],

    /* ---------- 17th century ---------- */
    ['Euridice', 'imslp', 'Euridice (Peri, Jacopo)'],
    ['Le nuove musiche', 'imslp', 'Le nuove musiche (Caccini, Giulio)'],
    ['Cento concerti ecclesiastici', 'imslp', 'Cento concerti ecclesiastici (Viadana, Lodovico Grossi da)'],
    ['fifth book of madrigals', 'imslp', 'Il quinto libro de madrigali (Monteverdi, Claudio)'],
    ['Monteverdi’s Orfeo', 'imslp', 'L\'Orfeo (Monteverdi, Claudio)'],
    ['Possente spirto', 'imslp', 'L\'Orfeo (Monteverdi, Claudio)'],
    ['Monteverdi’s Vespers', 'imslp', 'Vespro della Beata Vergine (Monteverdi, Claudio)'],
    ['Missa In illo tempore', 'imslp', 'Missa in illo tempore (Monteverdi, Claudio)'],
    ['Combattimento di Tancredi e Clorinda', 'imslp', 'Il combattimento di Tancredi e Clorinda (Monteverdi, Claudio)'],
    ['Madrigali guerrieri et amorosi', 'imslp', 'Madrigali guerrieri, et amorosi (Monteverdi, Claudio)'],
    ['Lamento della ninfa', 'imslp', 'Lamento della ninfa (Monteverdi, Claudio)'],
    ['Tabulatura nova', 'imslp', 'Tabulatura nova (Scheidt, Samuel)'],
    ['Symphoniae sacrae', 'imslp', 'Symphoniae sacrae (Schütz, Heinrich)'],
    ['op. 8 (1629)', 'imslp', 'Sonate, symphonie, canzoni, Op.8 (Marini, Biagio)'],
    ['Alcidiane', 'imslp', 'Alcidiane (Lully, Jean-Baptiste)'],
    ['Sonata violino solo', 'imslp', 'Violin Sonata in D major (Muffat, Georg)'],
    ['Rosary Sonatas', 'imslp', 'Rosary Sonatas (Biber, Heinrich Ignaz Franz von)'],
    ['Battalia', 'imslp', 'Battalia (Biber, Heinrich Ignaz Franz von)'],
    ['When I am laid in earth', 'imslp', 'Dido and Aeneas (Purcell, Henry)'],

    /* ---------- 18th century ---------- */
    ['Corelli op. 6', 'imslp', '12 Concerti Grossi, Op.6 (Corelli, Arcangelo)'],
    ['Handel op. 6', 'imslp', '12 Concerti Grossi, Op.6 (Handel, George Frideric)'],
    ['L’estro armonico', 'imslp', 'L\'estro armonico, Op.3 (Vivaldi, Antonio)'],
    ['Brandenburg Concertos', 'imslp', 'Brandenburg Concertos (Bach, Johann Sebastian)'],
    ['Orgelbüchlein', 'imslp', 'Orgelbüchlein (Bach, Johann Sebastian)'],
    ['Bach’s Clavierbüchlein', 'imslp', 'Clavier-Büchlein vor Wilhelm Friedemann Bach (Bach, Johann Sebastian)'],
    ['Partita in D', 'imslp', 'Partita in D major, BWV 828 (Bach, Johann Sebastian)'],
    ['Goldberg Variations', 'imslp', 'Goldberg-Variationen, BWV 988 (Bach, Johann Sebastian)'],
    ['French Overture', 'imslp', 'Overture in the French style, BWV 831 (Bach, Johann Sebastian)'],
    ['Bach’s Crucifixus', 'imslp', 'Mass in B minor, BWV 232 (Bach, Johann Sebastian)'],
    ['fifth cello suite', 'imslp', 'Cello Suite No.5 in C minor, BWV 1011 (Bach, Johann Sebastian)'],
    ['St Matthew Passion', 'imslp', 'Matthäus-Passion, BWV 244 (Bach, Johann Sebastian)'],
    ['Messiah', 'imslp', 'Messiah, HWV 56 (Handel, George Frideric)'],
    ['La serva padrona', 'imslp', 'La serva padrona (Pergolesi, Giovanni Battista)'],
    ['Le coucou', 'imslp', 'Le coucou (Daquin, Louis-Claude)'],
    ['La poule', 'imslp', 'La poule (Rameau, Jean-Philippe)'],
    ['Couperin’s organ masses', 'imslp', 'Pièces d\'orgue (Couperin, François)'],
    ['Haydn’s op. 33', 'imslp', '6 String Quartets, Op.33 (Haydn, Joseph)'],
    ['Symphony K. 183', 'imslp', 'Symphony No.25 in G minor, K.183/173dB (Mozart, Wolfgang Amadeus)'],
    ['Mozart’s Figaro', 'imslp', 'Le nozze di Figaro, K.492 (Mozart, Wolfgang Amadeus)'],
    ['Symphony K. 550', 'imslp', 'Symphony No.40 in G minor, K.550 (Mozart, Wolfgang Amadeus)'],
    ['Sinfonia concertante', 'imslp', 'Sinfonia concertante in E-flat major, K.364/320d (Mozart, Wolfgang Amadeus)'],

    /* ---------- 19th century ---------- */
    ['Sonata op. 2 no. 3', 'imslp', 'Piano Sonata No.3, Op.2 No.3 (Beethoven, Ludwig van)'],
    ['Waldstein Sonata', 'imslp', 'Piano Sonata No.21, Op.53 (Beethoven, Ludwig van)'],
    ['Moonlight Sonata', 'imslp', 'Piano Sonata No.14, Op.27 No.2 (Beethoven, Ludwig van)'],
    ['Emperor Concerto', 'imslp', 'Piano Concerto No.5, Op.73 (Beethoven, Ludwig van)'],
    ['Beethoven’s Fifth', 'imslp', 'Symphony No.5, Op.67 (Beethoven, Ludwig van)'],
    ['Fifth Symphony, 1808', 'imslp', 'Symphony No.5, Op.67 (Beethoven, Ludwig van)'],
    ['Pastoral Symphony', 'imslp', 'Symphony No.6, Op.68 (Beethoven, Ludwig van)'],
    ['Beethoven’s Pastoral', 'imslp', 'Symphony No.6, Op.68 (Beethoven, Ludwig van)'],
    ['Diabelli Variations', 'imslp', '33 Variations on a Waltz by Anton Diabelli, Op.120 (Beethoven, Ludwig van)'],
    ['Wellingtons Sieg', 'imslp', 'Wellingtons Sieg, Op.91 (Beethoven, Ludwig van)'],
    ['Gretchen am Spinnrade', 'imslp', 'Gretchen am Spinnrade, D.118 (Schubert, Franz)'],
    ['Schubert’s impromptus', 'imslp', '4 Impromptus, D.899 (Schubert, Franz)'],
    ['Field’s nocturnes', 'imslp', 'Nocturnes (Field, John)'],
    ['Songs without Words', 'imslp', 'Lieder ohne Worte (Mendelssohn, Felix)'],
    ['Symphonie fantastique', 'imslp', 'Symphonie fantastique, H.48 (Berlioz, Hector)'],
    ['B minor Sonata', 'imslp', 'Piano Sonata in B minor, S.178 (Liszt, Franz)'],
    ['Chopin’s mazurkas', 'imslp', 'Mazurkas (Chopin, Frédéric)'],
    ['Chopin’s études', 'imslp', '12 Etudes, Op.10 (Chopin, Frédéric)'],
    ['Ruslan', 'imslp', 'Ruslan and Lyudmila (Glinka, Mikhail)'],
    ['Wagner’s Ring', 'imslp', 'Der Ring des Nibelungen (Wagner, Richard)'],
    ['Tristan und Isolde', 'imslp', 'Tristan und Isolde, WWV 90 (Wagner, Richard)'],
    ['Sadko', 'imslp', 'Sadko, Op.5 (Rimsky-Korsakov, Nikolay)'],
    ['Königskinder', 'imslp', 'Königskinder (Humperdinck, Engelbert)'],
    ['Maple Leaf Rag', 'imslp', 'Maple Leaf Rag (Joplin, Scott)'],
    ['Sarabandes', 'imslp', '3 Sarabandes (Satie, Erik)'],
    ['Mahler’s fourth symphony', 'imslp', 'Symphony No.4 (Mahler, Gustav)'],

    /* ---------- early 20th century (public domain in many countries) ---------- */
    ['Pagodes', 'imslp', 'Estampes (Debussy, Claude)'],
    ['Golliwogg’s Cakewalk', 'imslp', 'Children\'s Corner (Debussy, Claude)'],
    ['Voiles', 'imslp', 'Préludes, Livre 1 (Debussy, Claude)'],
    ['La cathédrale engloutie', 'imslp', 'Préludes, Livre 1 (Debussy, Claude)'],
    ['Elektra', 'imslp', 'Elektra, Op.58 (Strauss, Richard)'],
    ['Chamber Symphony op. 9', 'imslp', 'Kammersymphonie, Op.9 (Schoenberg, Arnold)'],
    ['Petrushka', 'imslp', 'Petrushka (Stravinsky, Igor)'],
    ['Rite of Spring', 'imslp', 'The Rite of Spring (Stravinsky, Igor)'],
    ['Allegro barbaro', 'imslp', 'Allegro barbaro, Sz.49 (Bartók, Béla)'],
    ['St Louis Blues', 'imslp', 'The St. Louis Blues (Handy, W.C.)'],
    ['Rhapsody in Blue', 'imslp', 'Rhapsody in Blue (Gershwin, George)'],
    ['Boléro', 'imslp', 'Boléro (Ravel, Maurice)'],
    ['Classical Symphony', 'imslp', 'Symphony No.1, Op.25 (Prokofiev, Sergey)'],
    ['Scythian Suite', 'imslp', 'Scythian Suite, Op.20 (Prokofiev, Sergey)'],
    ['The Tides of Manaunaun', 'imslp', 'The Tides of Manaunaun (Cowell, Henry)'],

    /* ---------- printed liturgical books ---------- */
    ['Editio Medicea', 'imslp', 'Graduale de tempore et de sanctis (Editio Medicea)'],
    ['Liber gradualis', 'imslp', 'Liber gradualis (Pothier, Joseph)']
  ];

  const url = (where, q) => /^https?:/.test(q) ? q
    : where === 'diamm' ? 'https://www.diamm.ac.uk/search/?q=' + encodeURIComponent(q)
    : 'https://imslp.org/index.php?title=Special:Search&search=' + encodeURIComponent(q);
  V.works = W.map(([text, where, q]) => ({text, where, href: url(where, q)}));

  /* links for the marked pieces in the Voices view, by year */
  V.workMarks = {
    850: url('imslp', 'Musica enchiriadis (Anonymous)'), 1150: url('diamm', 'Codex Calixtinus'),
    1198: url('imslp', 'Viderunt omnes (Pérotin)'), 1365: url('imslp', 'Messe de Nostre Dame (Machaut, Guillaume de)'),
    1490: url('imslp', 'Deo gratias (Ockeghem, Johannes)'), 1565: url('imslp', 'Missa sopra Ecco sì beato giorno (Striggio, Alessandro)'),
    1570: url('imslp', 'Spem in alium (Tallis, Thomas)'), 1615: url('imslp', 'Sonata XX a 22 (Gabrieli, Giovanni)'),
    1682: url('imslp', 'Missa Salisburgensis (Biber, Heinrich Ignaz Franz von)'), 1788: url('imslp', 'Symphony No.41 in C major, K.551 (Mozart, Wolfgang Amadeus)'),
    1913: url('imslp', 'Deutsche Motette, Op.62 (Strauss, Richard)')
  };

  /* turn the first mention of every work in a piece of rendered HTML into a link (never inside another link) */
  const list = V.works.slice().sort((a, b) => b.text.length - a.text.length);
  const rx = new RegExp(list.map(w => w.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/’/g, '[’\']')).join('|'), 'g');
  const find = t => list.find(w => w.text === t || w.text.replace(/’/g, '\'') === t.replace(/’/g, '\''));
  V.linkWorks = function (html) {
    const used = new Set(); let inA = 0;
    return html.split(/(<[^>]+>)/).map(part => {
      if (part[0] === '<') { if (/^<a[\s>]/i.test(part)) inA++; else if (/^<\/a>/i.test(part)) inA = Math.max(0, inA - 1); return part; }
      if (inA) return part;
      return part.replace(rx, m => {
        const w = find(m); if (!w || used.has(w.href)) return m; used.add(w.href);
        const site = w.where === 'diamm' ? 'DIAMM' : 'IMSLP';
        return `<a class="wk" href="${w.href}" target="_blank" rel="noopener" title="Open on ${site}">${m}</a>`;
      });
    }).join('');
  };
})(window.VAULT);
