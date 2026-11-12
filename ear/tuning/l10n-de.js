/* Stimmungssysteme — deutsche Texte. Schlüssel: die englischen Originale (ui), die Kennungen der Stimmungen (tun)
   und die data-h-Abschnitte der Seite (html). Tonnamen nach deutschem Gebrauch: Cis, Es, B, H. */
(window.TUNING_L = window.TUNING_L || {}).de = {
  ui: {
    'Circle of fifths': 'Quintenzirkel', 'Keyboard': 'Klaviatur', 'Language': 'Sprache', 'Dimensions': 'Dimensionen',
    'Organ': 'Orgel', 'Strings': 'Streicher', 'Flute': 'Flöte',
    'Pythagorean comma': 'Pythagoreisches Komma', 'Syntonic comma': 'Syntonisches Komma', 'Schisma': 'Schisma', 'Diesis': 'Diesis',
    'twelve pure fifths minus seven octaves': 'zwölf reine Quinten minus sieben Oktaven',
    'four pure fifths minus a pure major third and two octaves': 'vier reine Quinten minus eine reine große Terz und zwei Oktaven',
    'the difference between the two': 'der Unterschied zwischen beiden',
    'an octave minus three pure major thirds': 'eine Oktave minus drei reine große Terzen',
    'Euler lattice': 'Euler-Gitter', 'fifth': 'Quinte', 'major third': 'große Terz', 'minor third': 'kleine Terz',
    'major triad': 'Durdreiklang', 'minor triad': 'Molldreiklang', 'major sixth': 'große Sexte',
    'harmonic seventh vs. equal minor seventh': 'Naturseptime gegen gleichstufige kleine Septime',
    '{c} c above C': '{c} Cent über C',
    'one syntonic comma lower than the Pythagorean {n}': 'ein syntonisches Komma tiefer als das pythagoreische {n}',
    'one syntonic comma higher than the Pythagorean {n}': 'ein syntonisches Komma höher als das pythagoreische {n}',
    '{k} syntonic commas lower than the Pythagorean {n}': '{k} syntonische Kommata tiefer als das pythagoreische {n}',
    '{k} syntonic commas higher than the Pythagorean {n}': '{k} syntonische Kommata höher als das pythagoreische {n}',
    'Lattice in {d} dimensions': 'Gitter in {d} Dimensionen', 'no 11': 'ohne 11', 'drag to turn': 'zum Drehen ziehen',
    'C → A minor → D minor → G major → C major, every chord pure, every common tone held: the last C (−S) is 21.5 c lower than the first. At the end the original C sounds again for comparison.':
      'C → a-Moll → d-Moll → G-Dur → C-Dur, jeder Akkord rein, jeder gemeinsame Ton liegen gelassen: Das letzte C (−S) ist 21,5 Cent tiefer als das erste. Zum Schluss erklingt zum Vergleich noch einmal das ursprüngliche C.',
    'fifth up (× 3:2)': 'Quinte aufwärts (× 3:2)', 'fifth down (× 2:3)': 'Quinte abwärts (× 2:3)',
    'major third up (× 5:4)': 'große Terz aufwärts (× 5:4)', 'major third down (× 4:5)': 'große Terz abwärts (× 4:5)',
    'minor third up (× 6:5)': 'kleine Terz aufwärts (× 6:5)', 'minor third down (× 5:6)': 'kleine Terz abwärts (× 5:6)',
    'harmonic seventh up (× 7:4)': 'Naturseptime aufwärts (× 7:4)', 'harmonic seventh down (× 4:7)': 'Naturseptime abwärts (× 4:7)',
    '{i}: which one is pure?': '{i}: Welche ist rein?',
    'Correct.': 'Richtig.', 'Not quite.': 'Leider falsch.',
    'The pure one was the first: {i} pure {p} c, equal-tempered {e} c ({d} c). Listen for the beating in the tempered one.':
      'Die reine war die erste: {i} rein {p} Cent, gleichstufig {e} Cent ({d} Cent). Achten Sie auf die Schwebung im temperierten Intervall.',
    'The pure one was the second: {i} pure {p} c, equal-tempered {e} c ({d} c). Listen for the beating in the tempered one.':
      'Die reine war die zweite: {i} rein {p} Cent, gleichstufig {e} Cent ({d} Cent). Achten Sie auf die Schwebung im temperierten Intervall.'
  },

  tun: {
    pyth: {name: 'Pythagoreisch', who: 'mittelalterliche Musiktheorie',
      temp: '11 reine Quinten; die Wolfsquinte Gis–Es ist um ein pythagoreisches Komma zu eng',
      text: [
        'Die Stimmung der mittelalterlichen Musiktheorie, gebaut aus den beiden einfachsten Verhältnissen: der Oktave (2:1) und der Quinte (3:2). Zwölf reine Quinten schließen den Kreis nicht ganz – sie übersteigen sieben Oktaven um das pythagoreische Komma (etwa 23,5 Cent) –, deshalb muss eine Quinte, hier Gis–Es, das ganze Komma schlucken und wird zum heulenden „Wolf“.',
        'Quinten und Quarten sind vollkommen rein, die melodischen Ganztöne groß (9:8, 203,9 Cent): Melodien klingen hell, Leittonhalbtöne sind klein und gespannt (90,2 Cent). Die große Terz aus zwei Ganztönen (81:64, 407,8 Cent) ist um mehr als einen Fünftel-Halbton größer als rein: In der mittelalterlichen Mehrstimmigkeit waren Terzen und Sexten unvollkommene Konsonanzen, die weitergehen mussten – die pythagoreische Stimmung lässt hören, warum.',
        'Bemerkenswert: Einige Terzen sind fast rein. H–Es, Fis–B, Cis–F und Gis–C (eigentlich verminderte Quarten) messen 384,4 Cent und sind nur 2 Cent zu eng – eine Besonderheit, die manche Tastenspieler des 15. Jahrhunderts nutzten.'],
      how: ['Stimmen Sie a′ (oder c′) nach Ihrer Stimmtonquelle.', 'Stimmen Sie alle Quinten und Quarten schwebungsfrei, im Quintenzirkel von Es bis Gis: Es–B–F–C–G–D–A–E–H–Fis–Cis–Gis.', 'Lassen Sie die Wolfsquinte Gis–Es, wie sie sich ergibt: Sie schwebt schnell und klingt rau.']},

    just: {name: 'Reine Stimmung (C-Dur)', who: 'Ptolemaios, Zarlino 1558',
      temp: 'reine Quinten 3:2 und Terzen 5:4 in C; D–A ist um ein syntonisches Komma zu eng',
      text: [
        'Reine Quinten (3:2) und reine große Terzen (5:4) zugleich. Gioseffo Zarlino (Le istitutioni harmoniche, 1558) machte dieses „syntonisch-diatonische“ Tongeschlecht des Ptolemaios zur theoretischen Grundlage der vollkommenen Konsonanzen; Sängerinnen, Sänger und Streicher bewegen sich ganz natürlich darauf zu, wenn sie einen Akkord aushalten.',
        'Der Preis: Es gibt zwei Größen des Ganztons (9:8 = 203,9 Cent und 10:9 = 182,4 Cent), und auf einem Instrument mit festen Tonhöhen funktioniert das nur in einer Tonart. Hier, auf C gestimmt, sind die Dreiklänge C-, F- und G-Dur sowie a- und e-Moll rein, aber die Quinte D–A ist um ein syntonisches Komma (21,5 Cent) zu eng, d-Moll ist also unbrauchbar. Deshalb brauchten Tasteninstrumente Temperaturen.',
        'Nehmen Sie sie als Ideal, an dem jede Temperatur auf dieser Seite gemessen wird: Die Tabellen zeigen, wie weit jede Terz und Quinte von diesen reinen Größen abweicht.'],
      how: ['Stimmen Sie c′.', 'Stimmen Sie G und F als reine Quinte bzw. Quarte von C, dann D als reine Quinte über G.', 'Stimmen Sie E, A und H als reine große Terzen über C, F und G (schwebungsfrei).', 'Stimmen Sie die übrigen Töne als reine Terzen oder Quinten dieser Töne (Es = reine kleine Terz über C, B = 9:5, Fis = reine Terz über D, Cis = 16:15, Gis/As = 8:5).']},

    m14: {name: '¼-Komma-mitteltönig', who: 'Pietro Aron 1523, Zarlino, Salinas 1577',
      temp: '11 Quinten um ¼ syntonisches Komma zu eng (696,6 Cent); Wolf Gis–Es zu weit (737,6 Cent)',
      text: [
        'Die Stimmung der Renaissance-Tasteninstrumente. Jede Quinte wird um ein Viertel des syntonischen Kommas verkleinert, sodass vier Quinten (C–G–D–A–E) genau auf einer reinen großen Terz C–E ankommen. Acht große Terzen sind rein; der Ganzton liegt genau in der Mitte der Terz – daher „mitteltönig“. Pietro Aron beschrieb eine Temperatur dieser Art in seinem Toscanello (1523); Francisco de Salinas (De musica, 1577) gab das genaue Viertelkomma an.',
        'Die Akkorde der Tonarten mit wenigen Vorzeichen leuchten; die Farbe der Musik hängt von der Tonart ab. Aber die Kreuztöne sind tief und die B-Töne hoch: Gis ist nicht As, und der diatonische Halbton (117,1 Cent) ist viel größer als der chromatische (76,0 Cent). Der Kreis schließt sich nicht – die übrig bleibende Quinte Gis–Es ist der Wolf, und die vier „Terzen“ H–Es, Fis–B, Cis–F und Gis–C sind unbrauchbare verminderte Quarten (427 Cent). Manche Instrumente hatten geteilte Obertasten (Gis/As, Es/Dis), um dem zu entgehen.',
        'Die mitteltönige Stimmung beherrschte Orgeln und Cembali seit dem frühen 16. Jahrhundert und blieb in vielen Orgeln bis weit ins 18., ja 19. Jahrhundert erhalten.'],
      how: ['Stimmen Sie c′ und e′ als reine, schwebungsfreie große Terz.', 'Stimmen Sie die Quinten C–G, G–D, D–A, A–E alle gleich eng, sodass E genau auf dem schon gestimmten e ankommt (mit Quarten und Oktaven in der mittleren Oktave bleiben). Prüfen Sie, dass die vier Quinten ähnlich langsam schweben.', 'Fahren Sie mit gleich engen Quinten fort: E–H, H–Fis, Fis–Cis, Cis–Gis, und von C abwärts: C–F, F–B, B–Es.', 'Probe: Jede große Terz C–E, D–Fis, E–Gis, F–A, G–H, A–Cis, B–D, Es–G ist rein.']},

    m13: {name: '⅓-Komma-mitteltönig', who: 'Francisco de Salinas 1577',
      temp: '11 Quinten um ⅓ syntonisches Komma zu eng (694,8 Cent)',
      text: [
        'Jede Quinte wird um ein Drittel des syntonischen Kommas verkleinert; dadurch werden die kleinen Terzen (6:5) rein und die großen Terzen etwas zu eng. Salinas beschrieb sie in De musica (1577) als die Stimmung, die ihm für Gambe und Tasteninstrument am besten klang.',
        'Die Quinten sind ziemlich eng (7,2 Cent), doch die Intervalle kommen der 19-stufig gleichschwebenden Stimmung sehr nahe; sie passt daher zu Musik voller Molldreiklänge und chromatischer Halbtöne.'],
      how: ['Stimmen Sie c′ und es′ als reine kleine Terz, dann a′ als reine kleine Terz unter c″ (mit Oktaven).', 'Teilen Sie die übrige Strecke mit gleich engen Quinten auf, wie bei der ¼-Komma-Mitteltönigkeit, aber enger; prüfen Sie, dass alle kleinen Terzen C–Es, D–F, E–G, F–As … schwebungsfrei sind.']},

    m27: {name: '²⁄₇-Komma-mitteltönig', who: 'Gioseffo Zarlino 1558',
      temp: '11 Quinten um ²⁄₇ syntonisches Komma zu eng (695,8 Cent)',
      text: [
        'Zarlinos Temperatur aus Le istitutioni harmoniche (1558): Die Quinte wird um 2/7 des Kommas verkleinert, wodurch große und kleine Terzen gleich unrein werden (jede um 1/7 Komma zu eng). Ein Theoretikerkompromiss zwischen ¼- und ⅓-Komma-Mitteltönigkeit.'],
      how: ['Stimmen Sie wie ¼-Komma-mitteltönig, aber mit ganz wenig engeren Quinten, sodass die großen Terzen langsam nach unten schweben und die kleinen Terzen genauso langsam.']},

    m15: {name: '⅕-Komma-mitteltönig', who: 'eine mildere Mitteltönigkeit',
      temp: '11 Quinten um ⅕ syntonisches Komma zu eng (697,6 Cent)',
      text: [
        'Eine sanftere Mitteltönigkeit: Die Quinten sind reiner, die großen Terzen etwas zu weit (4,3 Cent), der Wolf weniger wild. Sie bewahrt viel von der Farbe der ¼-Komma-Mitteltönigkeit und macht entfernte Tonarten etwas brauchbarer.'],
      how: ['Stimmen Sie wie ¼-Komma-mitteltönig, aber lassen Sie die Quinten etwas weniger eng: Die Terzen C–E, F–A und G–H sollen langsam nach oben schweben.']},

    m16: {name: '⅙-Komma-mitteltönig', who: 'Gottfried Silbermann (nach Sorge)',
      temp: '11 Quinten um ⅙ syntonisches Komma zu eng (698,4 Cent)',
      text: [
        'Die Mitteltönigkeit, die nach seinem Kritiker Georg Andreas Sorge mit den Orgeln Gottfried Silbermanns (1683–1753) verbunden wird. Die Quinten sind nur 3,6 Cent zu eng, die Terzen 7,2 Cent zu weit; diatonischer und chromatischer Halbton (108,1 und 88,3 Cent) sind weniger ungleich als bei ¼ Komma.',
        'Sehr nahe an der Teilung der Oktave in 55 gleiche Stufen, die Telemann und der Sänger und Theoretiker Pier Francesco Tosi als das System von neun „Kommata“ pro Ganzton beschrieben.'],
      how: ['Stimmen Sie wie ¼-Komma-mitteltönig, aber die Quinten nur leicht eng; die großen Terzen der gebräuchlichen Tonarten schweben mäßig nach oben.']},

    werck3: {name: 'Werckmeister III', who: 'Andreas Werckmeister 1691',
      temp: 'C–G, G–D, D–A und H–Fis um ¼ pythagoreisches Komma zu eng; alle übrigen Quinten rein',
      text: [
        'Aus Andreas Werckmeisters Musicalischer Temperatur (1691), die erste seiner „guten“ Temperaturen (mit III nummeriert, weil er die reine pythagoreische und die mitteltönige Stimmung zuerst zählte). Vier Quinten teilen sich das pythagoreische Komma, die übrigen acht sind rein; so schließt sich der Kreis, und jede Tonart ist spielbar.',
        'Die Tonarten sind nicht gleich: C-Dur und die benachbarten Tonarten haben recht gute Terzen (C–E 390,2 Cent), die entfernten Tonarten (Fis-, Des-, As-Dur) dagegen pythagoreische Terzen von 407,8 Cent. Bachs Generation hörte darin die unterschiedliche Charakteristik der Tonarten.'],
      how: ['Stimmen Sie c′.', 'Stimmen Sie C–G, G–D und D–A jeweils um ein Viertelkomma zu eng (sie schweben etwas schneller als in der gleichstufigen Stimmung).', 'Stimmen Sie A–E und E–H rein, dann H–Fis um ein Viertelkomma zu eng.', 'Stimmen Sie alle übrigen Quinten rein: Fis–Cis–Gis–Es und C–F–B–Es. Zur Probe muss Gis–Es nun rein herauskommen.']},

    werck4: {name: 'Werckmeister IV', who: 'Andreas Werckmeister 1691',
      temp: 'fünf Quinten um ⅓ pythagoreisches Komma zu eng, Gis–Es und Es–B um ⅓ Komma zu weit',
      text: [
        'Werckmeisters zweite Temperatur, gebaut aus Dritteln des pythagoreischen Kommas: fünf Quinten um ein Drittelkomma zu eng, zwei Quinten (Gis–Es und Es–B) um ein Drittelkomma zu weit. Ein unregelmäßiges, stärker gefärbtes System als Werckmeister III.'],
      how: ['Stimmen Sie C–G, D–A, E–H, Fis–Cis und B–F jeweils um ein Drittelkomma zu eng, G–D, A–E, H–Fis, Cis–Gis und F–C rein.', 'Stimmen Sie Gis–Es und Es–B um ein Drittelkomma zu weit (schwebend, aber nach oben).']},

    werck5: {name: 'Werckmeister V', who: 'Andreas Werckmeister 1691',
      temp: 'D–A, A–E, Fis–Cis, Cis–Gis, F–C um ¼ Komma zu eng; Gis–Es um ¼ Komma zu weit',
      text: [
        'Werckmeisters dritte Temperatur: fünf Quinten um ein Viertelkomma zu eng, eine (Gis–Es) um ein Viertelkomma zu weit, die übrigen rein. Mehrere Töne liegen auf runden Cent-Werten (Es 300, Fis 600, A 900 über C).'],
      how: ['Stimmen Sie C–G und G–D rein, D–A und A–E um ein Viertelkomma zu eng, E–H und H–Fis rein.', 'Stimmen Sie Fis–Cis und Cis–Gis um ein Viertelkomma zu eng; F–C um ein Viertelkomma zu eng, B–F und Es–B rein; Gis–Es ergibt sich um ein Viertelkomma zu weit.']},

    kirn2: {name: 'Kirnberger II', who: 'Johann Philipp Kirnberger 1771',
      temp: 'D–A und A–E um ½ syntonisches Komma zu eng, Fis–Cis um ein Schisma zu eng, alle übrigen rein',
      text: [
        'Aus Kirnbergers Die Kunst des reinen Satzes (1771). Das Denken eines Komponisten, nicht eines Stimmers: eine reine Terz C–E (das Komma wird zwischen D–A und A–E halbiert) und so viele reine Quinten wie möglich. Die beiden sehr engen Quinten machen D-Dur und A-Dur recht rau.'],
      how: ['Stimmen Sie c′ und e′ als reine Terz, g′ und d′ als reine Quinten von C aus.', 'Teilen Sie den Abstand D–E zwischen D–A und A–E: beide Quinten gleich eng (je ein halbes Komma – sie schweben deutlich).', 'Stimmen Sie alle anderen Quinten rein, außer Fis–Cis, die um ein kaum hörbares Schisma zu eng ist (Sie können sie als rein behandeln).']},

    kirn3: {name: 'Kirnberger III', who: 'Johann Philipp Kirnberger um 1779',
      temp: 'C–G, G–D, D–A, A–E um ¼ syntonisches Komma zu eng, Fis–Cis um ein Schisma zu eng',
      text: [
        'Kirnbergers verbesserte Fassung: Das Komma verteilt sich jetzt auf vier Quinten, genau wie bei der ¼-Komma-Mitteltönigkeit. So hat C-Dur eine reine Terz und mitteltönige Süße, während die übrigen Quinten rein sind und der Kreis sich schließt. Ausgeglichener als Kirnberger II und heute für barocke Orgel- und Cembalomusik viel verwendet.'],
      how: ['Stimmen Sie c′–e′ als reine Terz.', 'Stimmen Sie C–G–D–A–E als vier gleich enge Quinten, die auf dem reinen e ankommen (wie bei der ¼-Komma-Mitteltönigkeit).', 'Stimmen Sie alle übrigen Quinten rein (E–H–Fis und C–F–B–Es–As); Fis–Cis ist um ein Schisma zu eng, praktisch rein.']},

    vallotti: {name: 'Vallotti', who: 'Francesco Antonio Vallotti, Padua (veröff. 1779)',
      temp: 'F–C–G–D–A–E–H: sechs Quinten um ⅙ pythagoreisches Komma zu eng, sechs Quinten rein',
      text: [
        'Die Temperatur von Francesco Antonio Vallotti, Kapellmeister an der Basilica del Santo in Padua (auch Tartini–Vallotti genannt). Die sechs „natürlichen“ Quinten von F bis H sind je um ein Sechstelkomma zu eng, die sechs chromatischen rein. Das Ergebnis ist symmetrisch und sanft: Die Tonarten gehen gleitend von süß (C, F, G) zu heller und pythagoreischer (Fis, Des) über.',
        'Eine der heute meistverwendeten historischen Temperaturen, eine gute Wahl für Musik vom 17. bis ins frühe 19. Jahrhundert.'],
      how: ['Stimmen Sie a′, dann die Quinten F–C–G–D–A–E–H jeweils um ein Sechstelkomma zu eng (zwischen der Schwebung der gleichstufigen Stimmung und rein).', 'Stimmen Sie die Quinten H–Fis–Cis–Gis und F–B–Es–As rein. Das reine Gis/As muss sich nun schwebungsfrei treffen.']},

    young: {name: 'Young II', who: 'Thomas Young 1800',
      temp: 'C–G–D–A–E–H–Fis: sechs Quinten um ⅙ Komma zu eng, sechs Quinten rein',
      text: [
        'Vorgeschlagen vom Physiker Thomas Young im Jahr 1800. Dasselbe Muster wie bei Vallotti, um eine Quinte nach oben verschoben (die temperierten Quinten reichen von C bis Fis); dadurch werden die Kreuztonarten etwas süßer und die B-Tonarten etwas heller.'],
      how: ['Stimmen Sie die Quinten C–G–D–A–E–H–Fis jeweils um ein Sechstelkomma zu eng.', 'Stimmen Sie Fis–Cis–Gis–Es–B–F–C rein.']},

    neid: {name: 'Neidhardt, „große Stadt“', who: 'Johann Georg Neidhardt 1724',
      temp: 'C–G, G–D, D–A ⅙ Komma; sechs Quinten 1⁄12 Komma; E–H, Gis–Es, F–C rein',
      text: [
        'Johann Georg Neidhardt (Sectio canonis harmonici, Königsberg 1724) schlug für verschiedene Orte verschiedene Temperaturen vor: für ein Dorf, eine kleine Stadt, eine große Stadt und einen Hof – je größer der Ort, desto näher an der gleichstufigen Stimmung, weil dort entferntere Tonarten gespielt würden.',
        'Dies ist die Temperatur für die große Stadt: drei Quinten um ein Sechstelkomma zu eng, sechs wie in der gleichstufigen Stimmung (ein Zwölftelkomma), drei rein. Sehr nahe an der gleichstufigen Stimmung, mit einer leichten Bevorzugung der gebräuchlichen Tonarten.'],
      how: ['Stimmen Sie C–G, G–D und D–A jeweils um ein Sechstelkomma zu eng.', 'Stimmen Sie A–E, H–Fis, Fis–Cis, Cis–Gis, Es–B und B–F als gleichstufige Quinten (um ein Zwölftelkomma zu eng).', 'Stimmen Sie E–H, Gis–Es und F–C rein.']},

    kellner: {name: 'Kellner', who: 'Herbert Anton Kellner 1977',
      temp: 'C–G–D–A–E und H–Fis um ⅕ pythagoreisches Komma zu eng, sieben Quinten rein',
      text: [
        'Eine moderne Rekonstruktion einer Temperatur für Bach, 1977 von Herbert Anton Kellner vorgeschlagen und aus Zahlensymbolik (Bachs Siegel) abgeleitet. Wie Werckmeister III, aber das Komma verteilt sich auf fünf Quinten, was ausgeglichenere Tonarten ergibt.'],
      how: ['Stimmen Sie C–G, G–D, D–A, A–E und H–Fis jeweils um ein Fünftelkomma zu eng.', 'Stimmen Sie alle übrigen Quinten rein (E–H, Fis–Cis–Gis–Es–B–F–C).']},

    lehman: {name: 'Lehman (Bach)', who: 'Bradley Lehman 2005',
      temp: 'F–C–G–D–A–E um ⅙ Komma zu eng; E–H–Fis–Cis rein; Cis–Gis–Es–B um 1⁄12 zu eng; B–F um 1⁄12 zu weit',
      text: [
        'Bradley Lehmans Deutung (Early Music, 2005) der Schleifenzeichnung auf dem Titelblatt von Bachs Wohltemperiertem Klavier (1722) als Stimmanweisung. Fünf Sechstelkomma-Quinten, drei reine, drei Zwölftelkomma-Quinten und eine leicht zu weite Quinte B–F. Eine viel diskutierte und umstrittene Hypothese; musikalisch eine sehr ausgeglichene wohltemperierte Stimmung.'],
      how: ['Stimmen Sie F–C–G–D–A–E jeweils um ein Sechstelkomma zu eng.', 'Stimmen Sie E–H, H–Fis und Fis–Cis rein.', 'Stimmen Sie Cis–Gis, Gis–Dis und Dis–Ais jeweils um ein Zwölftelkomma zu eng (wie in der gleichstufigen Stimmung).', 'B–F ergibt sich um ein Zwölftelkomma zu weit: Prüfen Sie, dass sie langsam nach oben schwebt.']},

    equal: {name: 'Gleichstufige Stimmung', who: 'Zhu Zaiyu 1584, Simon Stevin um 1605',
      temp: 'alle Quinten um 1⁄12 pythagoreisches Komma zu eng (700 Cent)',
      text: [
        'Zwölf gleiche Halbtöne zu 100 Cent: Jede Quinte ist um ein Zwölftel des pythagoreischen Kommas zu eng (2 Cent), jede große Terz 13,7 Cent zu weit. Exakt berechnet von Zhu Zaiyu in China (1584) und Simon Stevin in den Niederlanden (um 1605). Lauten und Gamben, deren Bünde gerade über alle Saiten laufen, verwendeten schon seit dem 16. Jahrhundert nahezu gleiche Halbtöne – Vincenzo Galilei empfahl das Verhältnis 18:17.',
        'Alle Tonarten klingen gleich; nichts ist rein außer der Oktave. Im 19. Jahrhundert wurde sie zur Norm für Tasteninstrumente und ist der Bezugspunkt für alles auf dieser Seite.'],
      how: ['Stimmen Sie a′.', 'Stimmen Sie die zwölf Quinten jeweils ganz wenig zu eng, sodass alle langsam und gleichmäßig zunehmend schweben (etwa einmal pro Sekunde in der Mitte der Klaviatur).', 'Prüfen Sie mit großen Terzen und Sexten: Chromatisch aufwärts müssen ihre Schwebungen gleichmäßig schneller werden, ohne Sprünge.']}
  },

  html: {
    lede: 'Wie die zwölf Töne der Oktave vom Mittelalter bis heute gestimmt wurden. Hören Sie Tonleitern und Akkorde in jedem System, vergleichen Sie, singen Sie dazu – und lernen Sie, sie selbst zu stimmen.',
    intro: 'Reine Quinten (3:2) und reine große Terzen (5:4) vertragen sich auf einer Klaviatur nicht. Zwölf reine Quinten übersteigen sieben Oktaven um das <em>pythagoreische Komma</em>; vier reine Quinten übersteigen eine reine große Terz (plus zwei Oktaven) um das <em>syntonische Komma</em>. Jedes Stimmungssystem auf dieser Seite ist eine Entscheidung darüber, wohin diese kleinen Reste kommen – in eine einzige unbrauchbare „Wolfsquinte“, gleichmäßig in alle Quinten oder ungleichmäßig, sodass manche Tonarten süßer klingen als andere.',
    eulerH: 'Das Euler-Gitter (Tonnetz)',
    euler1: 'In seinem <em>Tentamen novae theoriae musicae</em> (1739) zeichnete Leonhard Euler die Töne der reinen Stimmung als Netz: Die eine Richtung multipliziert mit 3 (reine Quinten), die andere mit 5 (reine große Terzen). Im 19. Jahrhundert machten Arthur von Oettingen und Hugo Riemann daraus das <em>Tonnetz</em>, und heute beschreibt die neo-Riemannsche Theorie damit, wie sich Akkorde bewegen: Klappt man ein Dreieck über eine seiner Kanten, bleiben zwei Töne liegen und der dritte bewegt sich um einen Schritt.',
    euler2: 'In Dreiecken gezeichnet ist jedes nach oben zeigende Dreieck ein reiner Dur-, jedes nach unten zeigende ein reiner Molldreiklang. Die Lage eines Tons zählt: Das E, das man über eine Terz von C erreicht (5:4), ist um ein syntonisches Komma tiefer als das E nach vier Quinten (81:64). Die kleinen Zeichen zeigen das: <b>−S</b> bedeutet ein syntonisches Komma tiefer als der gleichnamige pythagoreische Ton.',
    d2h: 'Zwei Dimensionen: Quinten und Terzen',
    d2note: 'Tippen Sie auf einen Ton, um ihn zu hören, und auf ein Dreieck, um seinen Akkord zu hören. Ihr Weg wird gezeichnet – so sehen Sie, wohin Sie abdriften.',
    pump: 'Die Kommapumpe: C – a – d – G – C',
    clear: 'Weg löschen',
    d3h: 'Drei Dimensionen: die Naturseptime',
    d3p: 'Euler selbst vermutete 1764, dass der Dominantseptakkord seinen Klang dem siebten Teilton verdankt. Nimmt man 7:4 als dritte Achse hinzu, wird aus der Ebene ein Raum; im 20. Jahrhundert erkundeten ihn Harry Partch, Ben Johnston und James Tenney. Die Naturseptime (968,8 Cent) ist 31 Cent tiefer als die gleichstufige kleine Septime; zusammen mit dem Durdreiklang bildet sie den Akkord 4:5:6:7, den Barbershop-Quartette nach Gehör rein intonieren. Das Zeichen <b>−Z</b> steht für das septimale Komma 64:63 (27,3 Cent).',
    d4h: 'Vier Dimensionen: der elfte Teilton',
    d4p: 'Eine vierte Achse lässt sich in unserem Raum nicht bauen, aber vorstellen – so wie man einen Würfel als zwei an den Ecken verbundene Quadrate zeichnet. Hier erscheint das ganze 3D-Gitter dreimal, jede Kopie einen Schritt 11:8 entfernt. Das Intervall 11:8 (551,3 Cent) liegt fast genau zwischen Quarte und Tritonus; Partch baute seine 43-tönige Skala auf diesem 11-Limit-Raum auf. <b>+U</b> steht für das undezimale Komma 33:32 (53,3 Cent). Jede weitere Primzahl – 13, 17, 19 … – fügt eine weitere Dimension hinzu: die Obertonreihe als Raum mit immer mehr Richtungen, von Tenney „harmonischer Raum“ genannt.',
    dSev: 'Naturseptakkord 4:5:6:7', dSevET: 'derselbe gleichstufig', dSevs: 'vier kleine Septimen: 16:9, 9:5, 1000 Cent, 7:4', dSub: 'Subminor-Dreiklang 7:6',
    dEleven: '4:3, 11:8, der Tritonus 600 Cent, 45:32', dOtonal: '4:5:6:7:9:11 (Obertonreihe)',
    ex1h: 'Übung: Welcher Weg durch das Gitter?',
    ex1note: 'Zwei Töne in reiner Stimmung, erst nacheinander, dann zusammen. Welcher Schritt im Gitter war es?',
    newEx: 'Neues Beispiel', again: 'Nochmals hören',
    lvl2: '2D: Quinten und Terzen', lvl3: '3D: mit Naturseptime',
    ex2h: 'Übung: rein oder temperiert?',
    ex2note: 'Dasselbe Intervall zweimal: einmal rein, einmal gleichstufig.',
    first: 'Das erste war rein', second: 'Das zweite war rein',
    mar1: 'Lange vor den Temperaturen beschrieb Marchetto von Padua eine außergewöhnliche Art, die Kreuztöne zu setzen. In seinem <em>Lucidarium in arte musicae planae</em> (1317–18) und im <em>Pomerium in arte musicae mensuratae</em> (1318–19) teilt er den Ganzton in fünf Teile, die er <em>Dieses</em> nennt. Ein Halbton kann <em>enharmonisch</em> (zwei Dieses), <em>diatonisch</em> (drei) oder <em>chromatisch</em> (vier) sein.',
    mar2: 'Wird eine Stimme erhöht, um in eine vollkommene Konsonanz zu führen – die Sexte, die sich zur Oktave öffnet (A–Fis → G–G), oder die Terz, die sich zur Quinte öffnet (A–Cis → G–D) –, nimmt Marchetto den großen chromatischen Halbton. Der Kreuzton steht dann nur eine Diesis (etwa ein Fünftel eines Ganztons, rund 40–50 Cent) unter dem Ton, in den er sich auflöst. Die unvollkommene Konsonanz wird sehr weit und sehr gespannt und ihre Auflösung umso befriedigender: das Gegenteil der Mitteltönigkeit, in der die Kreuztöne tief liegen.',
    mar3: 'Wie wörtlich Marchetto seine Zahlen meinte, ist umstritten. John Rahn (<a href="https://mtosmt.org/issues/mto.98.4.6/mto.98.4.6.rahn.html" target="_blank" rel="noopener">Music Theory Online, 1998</a>) zeigt, wie sie sich am Monochord verwirklichen lassen, und stellt fest, dass Hörer den Unterschied leicht wahrnehmen. Hier wird die Diesis als genau ein Fünftel eines pythagoreischen Ganztons angenommen (40,8 Cent). Hören Sie die beiden Kadenzen mit dem Kreuzton auf drei Arten gesetzt:',
    marM: 'Marchetto (⁴⁄₅ Ton, 163 Cent)', marP: 'Pythagoreisch (Apotome, 114 Cent)', marQ: '¼-Komma-mitteltönig (76 Cent)',
    marNote: 'Jede Taste spielt A–Fis → G–g (Sexte zur Oktave), dann A–Cis → G–d (Terz zur Quinte). Die Zahlen geben den Abstand des Kreuztons über seinem Stammton an.'
  }
};
