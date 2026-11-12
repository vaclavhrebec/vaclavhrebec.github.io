/* Systèmes d’accord — textes français. Noms de notes en solfège (do, ré, mi…), octaves à la française (la₃ = a′). */
(window.TUNING_L = window.TUNING_L || {}).fr = {
  ui: {
    'Circle of fifths': 'Cycle des quintes', 'Keyboard': 'Clavier', 'Language': 'Langue', 'Dimensions': 'Dimensions',
    'Organ': 'Orgue', 'Strings': 'Cordes', 'Flute': 'Flûte',
    'Pythagorean comma': 'Comma pythagoricien', 'Syntonic comma': 'Comma syntonique', 'Schisma': 'Schisma', 'Diesis': 'Diésis',
    'twelve pure fifths minus seven octaves': 'douze quintes pures moins sept octaves',
    'four pure fifths minus a pure major third and two octaves': 'quatre quintes pures moins une tierce majeure pure et deux octaves',
    'the difference between the two': 'la différence entre les deux',
    'an octave minus three pure major thirds': 'une octave moins trois tierces majeures pures',
    'Euler lattice': 'Réseau d’Euler', 'fifth': 'quinte', 'major third': 'tierce majeure', 'minor third': 'tierce mineure',
    'major triad': 'accord majeur', 'minor triad': 'accord mineur', 'major sixth': 'sixte majeure',
    'harmonic seventh vs. equal minor seventh': 'septième harmonique contre septième mineure tempérée',
    '{c} c above C': '{c} cents au-dessus de do',
    'one syntonic comma lower than the Pythagorean {n}': 'un comma syntonique plus bas que le {n} pythagoricien',
    'one syntonic comma higher than the Pythagorean {n}': 'un comma syntonique plus haut que le {n} pythagoricien',
    '{k} syntonic commas lower than the Pythagorean {n}': '{k} commas syntoniques plus bas que le {n} pythagoricien',
    '{k} syntonic commas higher than the Pythagorean {n}': '{k} commas syntoniques plus haut que le {n} pythagoricien',
    'Lattice in {d} dimensions': 'Réseau en {d} dimensions', 'no 11': 'sans 11', 'drag to turn': 'faire glisser pour tourner',
    'C → A minor → D minor → G major → C major, every chord pure, every common tone held: the last C (−S) is 21.5 c lower than the first. At the end the original C sounds again for comparison.':
      'do → la mineur → ré mineur → sol majeur → do majeur, chaque accord pur, chaque note commune tenue : le dernier do (−S) est 21,5 cents plus bas que le premier. À la fin, le do de départ sonne de nouveau pour comparaison.',
    'fifth up (× 3:2)': 'quinte ascendante (× 3:2)', 'fifth down (× 2:3)': 'quinte descendante (× 2:3)',
    'major third up (× 5:4)': 'tierce majeure ascendante (× 5:4)', 'major third down (× 4:5)': 'tierce majeure descendante (× 4:5)',
    'minor third up (× 6:5)': 'tierce mineure ascendante (× 6:5)', 'minor third down (× 5:6)': 'tierce mineure descendante (× 5:6)',
    'harmonic seventh up (× 7:4)': 'septième harmonique ascendante (× 7:4)', 'harmonic seventh down (× 4:7)': 'septième harmonique descendante (× 4:7)',
    '{i}: which one is pure?': '{i} : laquelle est pure ?',
    'Correct.': 'Exact.', 'Not quite.': 'Pas tout à fait.',
    'The pure one was the first: {i} pure {p} c, equal-tempered {e} c ({d} c). Listen for the beating in the tempered one.':
      'La pure était la première : {i} pure {p} cents, tempérée {e} cents ({d} cents). Écoutez les battements dans l’intervalle tempéré.',
    'The pure one was the second: {i} pure {p} c, equal-tempered {e} c ({d} c). Listen for the beating in the tempered one.':
      'La pure était la seconde : {i} pure {p} cents, tempérée {e} cents ({d} cents). Écoutez les battements dans l’intervalle tempéré.'
  },

  tun: {
    pyth: {name: 'Pythagoricien', who: 'théorie médiévale',
      temp: '11 quintes pures ; la quinte du loup sol♯–mi♭ est trop étroite d’un comma pythagoricien',
      text: [
        'L’accord de la théorie musicale médiévale, construit sur les deux rapports les plus simples : l’octave (2:1) et la quinte (3:2). Douze quintes pures ne ferment pas tout à fait le cycle – elles dépassent sept octaves du comma pythagoricien (environ 23,5 cents) –, si bien qu’une quinte, ici sol♯–mi♭, doit absorber tout le comma et devient un « loup » qui hurle.',
        'Quintes et quartes sont parfaitement pures et les tons mélodiques sont grands (9:8, 203,9 cents) : les mélodies sonnent claires, les demi-tons de sensible sont petits et tendus (90,2 cents). La tierce majeure, faite de deux tons (81:64, 407,8 cents), dépasse la tierce pure de plus d’un cinquième de demi-ton : dans la polyphonie médiévale, tierces et sixtes étaient des consonances imparfaites qui devaient avancer, et l’accord pythagoricien fait entendre pourquoi.',
        'À noter : certaines tierces sont presque pures. si–mi♭, fa♯–si♭, do♯–fa et sol♯–do (en réalité des quartes diminuées) mesurent 384,4 cents, seulement 2 cents trop étroites – une curiosité qu’exploitaient certains claviéristes du XVe siècle.'],
      how: ['Accordez le la₃ (ou le do₃) d’après votre diapason.', 'Accordez toutes les quintes et quartes sans battement, en suivant le cycle de mi♭ à sol♯ : mi♭–si♭–fa–do–sol–ré–la–mi–si–fa♯–do♯–sol♯.', 'Laissez la quinte du loup sol♯–mi♭ telle qu’elle tombe : elle bat vite et sonne rude.']},

    just: {name: 'Intonation juste (do majeur)', who: 'Ptolémée, Zarlino 1558',
      temp: 'quintes 3:2 et tierces 5:4 pures en do ; ré–la est trop étroite d’un comma syntonique',
      text: [
        'Des quintes pures (3:2) et des tierces majeures pures (5:4) en même temps. Gioseffo Zarlino (Le istitutioni harmoniche, 1558) fit de ce « diatonique syntonique » de Ptolémée le fondement théorique des consonances parfaites ; chanteurs et instrumentistes à cordes s’en approchent naturellement lorsqu’ils tiennent un accord.',
        'Le prix à payer : il existe deux tailles de ton (9:8 = 203,9 cents et 10:9 = 182,4 cents), et sur un instrument à sons fixes cela ne fonctionne que dans une seule tonalité. Ici, accordés sur do, les accords de do, fa et sol majeur ainsi que de la et mi mineur sont purs, mais la quinte ré–la est trop étroite d’un comma syntonique (21,5 cents) : ré mineur est inutilisable. C’est pourquoi les claviers ont eu besoin de tempéraments.',
        'Prenez-le comme l’idéal à l’aune duquel se mesure chaque tempérament de cette page : les tableaux montrent de combien chaque tierce et chaque quinte s’écarte de ces grandeurs pures.'],
      how: ['Accordez le do₃.', 'Accordez sol et fa en quinte et quarte pures de do, puis ré en quinte pure au-dessus de sol.', 'Accordez mi, la et si en tierces majeures pures au-dessus de do, fa et sol (sans battement).', 'Accordez les notes restantes en tierces ou quintes pures de celles-ci (mi♭ = tierce mineure pure sur do, si♭ = 9:5, fa♯ = tierce pure sur ré, do♯ = 16:15, sol♯/la♭ = 8:5).']},

    m14: {name: 'Mésotonique ¼ de comma', who: 'Pietro Aron 1523, Zarlino, Salinas 1577',
      temp: '11 quintes trop étroites d’¼ de comma syntonique (696,6 cents) ; loup sol♯–mi♭ trop large (737,6 cents)',
      text: [
        'L’accord des claviers de la Renaissance. Chaque quinte est rétrécie d’un quart de comma syntonique, de sorte que quatre quintes (do–sol–ré–la–mi) aboutissent exactement sur une tierce majeure pure do–mi. Huit tierces majeures sont pures ; le ton se trouve exactement au milieu de la tierce – d’où le nom de « mésotonique ». Pietro Aron décrivit un tempérament de ce type dans son Toscanello (1523) ; Francisco de Salinas (De musica, 1577) en donna le quart de comma exact.',
        'Les accords des tonalités à peu d’altérations rayonnent ; la couleur de la musique dépend de la tonalité. Mais les dièses sont bas et les bémols hauts : sol♯ n’est pas la♭, et le demi-ton diatonique (117,1 cents) est bien plus grand que le chromatique (76,0 cents). Le cycle ne se referme pas – la quinte restante sol♯–mi♭ est le loup, et les quatre « tierces » si–mi♭, fa♯–si♭, do♯–fa et sol♯–do sont des quartes diminuées inutilisables (427 cents). Certains instruments avaient des feintes brisées (sol♯/la♭, mi♭/ré♯) pour y échapper.',
        'Le mésotonique régna sur les orgues et les clavecins dès le début du XVIe siècle et se maintint dans bien des orgues jusque tard dans le XVIIIe, voire le XIXe siècle.'],
      how: ['Accordez do₃ et mi₃ en tierce majeure pure, sans battement.', 'Accordez les quintes do–sol, sol–ré, ré–la, la–mi toutes également étroites, de sorte que le mi arrive exactement sur le mi déjà accordé (en restant dans l’octave du milieu à l’aide de quartes et d’octaves). Vérifiez que les quatre quintes battent à une vitesse lente et semblable.', 'Continuez avec des quintes également étroites mi–si, si–fa♯, fa♯–do♯, do♯–sol♯, et en descendant depuis do : do–fa, fa–si♭, si♭–mi♭.', 'Vérification : toutes les tierces majeures do–mi, ré–fa♯, mi–sol♯, fa–la, sol–si, la–do♯, si♭–ré, mi♭–sol sont pures.']},

    m13: {name: 'Mésotonique ⅓ de comma', who: 'Francisco de Salinas 1577',
      temp: '11 quintes trop étroites d’⅓ de comma syntonique (694,8 cents)',
      text: [
        'Chaque quinte est rétrécie d’un tiers de comma syntonique, ce qui rend les tierces mineures (6:5) pures et les tierces majeures légèrement étroites. Salinas la décrit dans De musica (1577) comme l’accord qui lui semblait le meilleur pour la viole et le clavier.',
        'Ses quintes sont assez étroites (7,2 cents), mais ses intervalles sont très proches du tempérament égal à 19 degrés : il convient à une musique riche en accords mineurs et en demi-tons chromatiques.'],
      how: ['Accordez do₃ et mi♭₃ en tierce mineure pure, puis le la₃ en tierce mineure pure sous le do₄ (à l’aide d’octaves).', 'Répartissez la distance restante avec des quintes également étroites, comme pour le mésotonique ¼ de comma mais plus étroites ; vérifiez que toutes les tierces mineures do–mi♭, ré–fa, mi–sol, fa–la♭… sont sans battement.']},

    m27: {name: 'Mésotonique ²⁄₇ de comma', who: 'Gioseffo Zarlino 1558',
      temp: '11 quintes trop étroites de ²⁄₇ de comma syntonique (695,8 cents)',
      text: [
        'Le tempérament de Zarlino dans Le istitutioni harmoniche (1558) : la quinte est rétrécie de 2/7 de comma, ce qui rend tierces majeures et mineures également impures (chacune trop étroite d’1/7 de comma). Un compromis de théoricien entre le mésotonique ¼ et ⅓ de comma.'],
      how: ['Accordez comme le mésotonique ¼ de comma, mais avec des quintes très légèrement plus étroites, de sorte que les tierces majeures battent lentement vers le bas et les tierces mineures à la même vitesse lente.']},

    m15: {name: 'Mésotonique ⅕ de comma', who: 'un mésotonique plus doux',
      temp: '11 quintes trop étroites d’⅕ de comma syntonique (697,6 cents)',
      text: [
        'Un mésotonique plus doux : les quintes sont plus proches du pur, les tierces majeures légèrement larges (4,3 cents), le loup moins féroce. Il garde une bonne part de la couleur du mésotonique ¼ de comma tout en rendant les tonalités éloignées un peu plus praticables.'],
      how: ['Accordez comme le mésotonique ¼ de comma, mais laissez les quintes un peu moins étroites : les tierces do–mi, fa–la et sol–si doivent battre lentement vers le haut.']},

    m16: {name: 'Mésotonique ⅙ de comma', who: 'Gottfried Silbermann (d’après Sorge)',
      temp: '11 quintes trop étroites d’⅙ de comma syntonique (698,4 cents)',
      text: [
        'Le mésotonique associé aux orgues de Gottfried Silbermann (1683–1753), selon son critique Georg Andreas Sorge. Les quintes ne sont trop étroites que de 3,6 cents, les tierces trop larges de 7,2 cents ; les demi-tons diatonique et chromatique (108,1 et 88,3 cents) sont moins inégaux qu’au quart de comma.',
        'Très proche de la division de l’octave en 55 parties égales, que Telemann et le chanteur et théoricien Pier Francesco Tosi décrivaient comme le système des neuf « commas » par ton.'],
      how: ['Accordez comme le mésotonique ¼ de comma, mais avec des quintes à peine étroites ; les tierces majeures des tonalités usuelles battent modérément vers le haut.']},

    werck3: {name: 'Werckmeister III', who: 'Andreas Werckmeister 1691',
      temp: 'do–sol, sol–ré, ré–la et si–fa♯ trop étroites d’¼ de comma pythagoricien ; toutes les autres quintes pures',
      text: [
        'Tiré de la Musicalische Temperatur (1691) d’Andreas Werckmeister, le premier de ses « bons » tempéraments (numéroté III parce qu’il comptait d’abord l’accord pythagoricien pur et le mésotonique). Quatre quintes se partagent le comma pythagoricien, les huit autres sont pures : le cycle se referme et toutes les tonalités sont jouables.',
        'Les tonalités ne se ressemblent pas : do majeur et ses voisines ont d’assez bonnes tierces (do–mi 390,2 cents), tandis que les tonalités éloignées (fa♯, ré♭, la♭ majeur) ont des tierces pythagoriciennes de 407,8 cents. La génération de Bach y entendait le caractère propre à chaque tonalité.'],
      how: ['Accordez le do₃.', 'Accordez do–sol, sol–ré et ré–la chacune trop étroite d’un quart de comma (elles battent un peu plus vite qu’en tempérament égal).', 'Accordez la–mi et mi–si pures ; puis si–fa♯ trop étroite d’un quart de comma.', 'Accordez toutes les quintes restantes pures : fa♯–do♯–sol♯–mi♭ et do–fa–si♭–mi♭. En guise de vérification, sol♯–mi♭ doit maintenant être pure.']},

    werck4: {name: 'Werckmeister IV', who: 'Andreas Werckmeister 1691',
      temp: 'cinq quintes trop étroites d’⅓ de comma pythagoricien, sol♯–mi♭ et mi♭–si♭ trop larges d’⅓ de comma',
      text: [
        'Le deuxième tempérament de Werckmeister, construit sur des tiers de comma pythagoricien : cinq quintes trop étroites d’un tiers de comma, deux quintes (sol♯–mi♭ et mi♭–si♭) trop larges d’un tiers de comma. Un système irrégulier, plus fortement coloré que Werckmeister III.'],
      how: ['Accordez do–sol, ré–la, mi–si, fa♯–do♯ et si♭–fa chacune trop étroite d’un tiers de comma ; sol–ré, la–mi, si–fa♯, do♯–sol♯ et fa–do pures.', 'Accordez sol♯–mi♭ et mi♭–si♭ trop larges d’un tiers de comma (elles battent, mais du côté large).']},

    werck5: {name: 'Werckmeister V', who: 'Andreas Werckmeister 1691',
      temp: 'ré–la, la–mi, fa♯–do♯, do♯–sol♯, fa–do trop étroites d’¼ de comma ; sol♯–mi♭ trop large d’¼ de comma',
      text: [
        'Le troisième tempérament de Werckmeister : cinq quintes trop étroites d’un quart de comma, une (sol♯–mi♭) trop large d’un quart de comma, les autres pures. Plusieurs notes tombent sur des valeurs rondes en cents (mi♭ 300, fa♯ 600, la 900 au-dessus de do).'],
      how: ['Accordez do–sol et sol–ré pures, ré–la et la–mi trop étroites d’un quart de comma, mi–si et si–fa♯ pures.', 'Accordez fa♯–do♯ et do♯–sol♯ trop étroites d’un quart de comma ; fa–do trop étroite d’un quart de comma, si♭–fa et mi♭–si♭ pures ; sol♯–mi♭ en résulte trop large d’un quart de comma.']},

    kirn2: {name: 'Kirnberger II', who: 'Johann Philipp Kirnberger 1771',
      temp: 'ré–la et la–mi trop étroites d’½ comma syntonique, fa♯–do♯ trop étroite d’un schisma, toutes les autres pures',
      text: [
        'Tiré de Die Kunst des reinen Satzes (1771) de Kirnberger. La pensée d’un compositeur plutôt que d’un accordeur : une tierce pure do–mi (obtenue en partageant le comma entre ré–la et la–mi) et autant de quintes pures que possible. Les deux quintes très étroites rendent ré majeur et la majeur assez rudes.'],
      how: ['Accordez do₃ et mi₃ en tierce pure, sol₃ et ré₃ en quintes pures à partir de do.', 'Partagez la distance ré–mi entre ré–la et la–mi : les deux quintes également étroites (un demi-comma chacune – elles battent nettement).', 'Accordez toutes les autres quintes pures, sauf fa♯–do♯, trop étroite d’un schisma à peine audible (vous pouvez la traiter comme pure).']},

    kirn3: {name: 'Kirnberger III', who: 'Johann Philipp Kirnberger vers 1779',
      temp: 'do–sol, sol–ré, ré–la, la–mi trop étroites d’¼ de comma syntonique, fa♯–do♯ trop étroite d’un schisma',
      text: [
        'La version améliorée de Kirnberger : le comma est désormais partagé entre quatre quintes, exactement comme dans le mésotonique ¼ de comma. Do majeur a ainsi une tierce pure et une douceur mésotonique, tandis que les autres quintes sont pures et que le cycle se referme. Plus égal que Kirnberger II, et très employé aujourd’hui pour l’orgue et le clavecin baroques.'],
      how: ['Accordez do₃–mi₃ en tierce pure.', 'Accordez do–sol–ré–la–mi en quatre quintes également étroites qui aboutissent sur le mi pur (comme dans le mésotonique ¼ de comma).', 'Accordez toutes les autres quintes pures (mi–si–fa♯ et do–fa–si♭–mi♭–la♭) ; fa♯–do♯ est trop étroite d’un schisma, pratiquement pure.']},

    vallotti: {name: 'Vallotti', who: 'Francesco Antonio Vallotti, Padoue (publ. 1779)',
      temp: 'fa–do–sol–ré–la–mi–si : six quintes trop étroites d’⅙ de comma pythagoricien, six quintes pures',
      text: [
        'Le tempérament de Francesco Antonio Vallotti, maître de chapelle à la Basilica del Santo de Padoue (aussi appelé Tartini–Vallotti). Les six quintes « naturelles » de fa à si sont chacune trop étroites d’un sixième de comma, les six chromatiques sont pures. Le résultat est symétrique et doux : les tonalités passent sans heurt du suave (do, fa, sol) au plus brillant et plus pythagoricien (fa♯, ré♭).',
        'L’un des tempéraments historiques les plus utilisés aujourd’hui, un bon choix pour la musique du XVIIe au début du XIXe siècle.'],
      how: ['Accordez le la₃, puis les quintes fa–do–sol–ré–la–mi–si chacune trop étroite d’un sixième de comma (entre le battement du tempérament égal et le pur).', 'Accordez les quintes si–fa♯–do♯–sol♯ et fa–si♭–mi♭–la♭ pures. Le sol♯/la♭ pur doit alors se rejoindre sans battement.']},

    young: {name: 'Young II', who: 'Thomas Young 1800',
      temp: 'do–sol–ré–la–mi–si–fa♯ : six quintes trop étroites d’⅙ de comma, six quintes pures',
      text: [
        'Proposé par le physicien Thomas Young en 1800. Le même schéma que Vallotti, décalé d’une quinte vers le haut (les quintes tempérées vont de do à fa♯) : les tonalités à dièses deviennent un peu plus douces et les tonalités à bémols un peu plus brillantes.'],
      how: ['Accordez les quintes do–sol–ré–la–mi–si–fa♯ chacune trop étroite d’un sixième de comma.', 'Accordez fa♯–do♯–sol♯–mi♭–si♭–fa–do pures.']},

    neid: {name: 'Neidhardt, « grande ville »', who: 'Johann Georg Neidhardt 1724',
      temp: 'do–sol, sol–ré, ré–la ⅙ de comma ; six quintes 1⁄12 de comma ; mi–si, sol♯–mi♭, fa–do pures',
      text: [
        'Johann Georg Neidhardt (Sectio canonis harmonici, Königsberg 1724) proposa des tempéraments différents selon les lieux : pour un village, une petite ville, une grande ville (« große Stadt ») et une cour – plus le lieu est grand, plus on se rapproche du tempérament égal, car on y jouerait des tonalités plus éloignées.',
        'Voici le tempérament de la grande ville : trois quintes trop étroites d’un sixième de comma, six comme en tempérament égal (un douzième de comma), trois pures. Très proche du tempérament égal, avec une légère préférence pour les tonalités usuelles.'],
      how: ['Accordez do–sol, sol–ré et ré–la chacune trop étroite d’un sixième de comma.', 'Accordez la–mi, si–fa♯, fa♯–do♯, do♯–sol♯, mi♭–si♭ et si♭–fa comme des quintes de tempérament égal (trop étroites d’un douzième de comma).', 'Accordez mi–si, sol♯–mi♭ et fa–do pures.']},

    kellner: {name: 'Kellner', who: 'Herbert Anton Kellner 1977',
      temp: 'do–sol–ré–la–mi et si–fa♯ trop étroites d’⅕ de comma pythagoricien, sept quintes pures',
      text: [
        'Une reconstruction moderne d’un tempérament pour Bach, proposée par Herbert Anton Kellner en 1977 et tirée d’une symbolique des nombres (le sceau de Bach). Comme Werckmeister III, mais le comma est réparti sur cinq quintes, ce qui donne des tonalités plus égales.'],
      how: ['Accordez do–sol, sol–ré, ré–la, la–mi et si–fa♯ chacune trop étroite d’un cinquième de comma.', 'Accordez toutes les autres quintes pures (mi–si, fa♯–do♯–sol♯–mi♭–si♭–fa–do).']},

    lehman: {name: 'Lehman (Bach)', who: 'Bradley Lehman 2005',
      temp: 'fa–do–sol–ré–la–mi trop étroites d’⅙ de comma ; mi–si–fa♯–do♯ pures ; do♯–sol♯–mi♭–si♭ 1⁄12 trop étroites ; si♭–fa 1⁄12 trop large',
      text: [
        'La lecture par Bradley Lehman (Early Music, 2005) du dessin en boucles de la page de titre du Clavier bien tempéré de Bach (1722) comme schéma d’accord. Cinq quintes au sixième de comma, trois pures, trois au douzième de comma et une quinte si♭–fa légèrement large. Une hypothèse très discutée et contestée ; musicalement, un tempérament inégal très homogène.'],
      how: ['Accordez fa–do–sol–ré–la–mi chacune trop étroite d’un sixième de comma.', 'Accordez mi–si, si–fa♯ et fa♯–do♯ pures.', 'Accordez do♯–sol♯, sol♯–ré♯ et ré♯–la♯ chacune trop étroite d’un douzième de comma (comme en tempérament égal).', 'si♭–fa en résulte trop large d’un douzième de comma : vérifiez qu’elle bat lentement du côté large.']},

    equal: {name: 'Tempérament égal', who: 'Zhu Zaiyu 1584, Simon Stevin vers 1605',
      temp: 'toutes les quintes trop étroites d’1⁄12 de comma pythagoricien (700 cents)',
      text: [
        'Douze demi-tons identiques de 100 cents : chaque quinte est trop étroite d’un douzième de comma pythagoricien (2 cents), chaque tierce majeure trop large de 13,7 cents. Calculé exactement par Zhu Zaiyu en Chine (1584) et Simon Stevin aux Pays-Bas (vers 1605). Luths et violes, dont les frettes traversent droit toutes les cordes, utilisaient des demi-tons presque égaux dès le XVIe siècle – Vincenzo Galilei recommandait le rapport 18:17.',
        'Toutes les tonalités sonnent pareil ; rien n’est pur hormis l’octave. Il devint la norme des claviers au XIXe siècle et sert de référence à tout ce qui figure sur cette page.'],
      how: ['Accordez le la₃.', 'Accordez les douze quintes chacune très légèrement étroite, de sorte qu’elles battent toutes lentement, à une vitesse qui augmente régulièrement (environ une fois par seconde au milieu du clavier).', 'Vérifiez avec les tierces et sixtes majeures : en montant chromatiquement, leurs battements doivent s’accélérer régulièrement, sans à-coups.']}
  },

  html: {
    lede: 'Comment les douze notes de l’octave ont été accordées du Moyen Âge à nos jours. Écoutez gammes et accords dans chaque système, comparez-les, chantez avec eux – et apprenez à les accorder vous-même.',
    intro: 'Quintes pures (3:2) et tierces majeures pures (5:4) ne peuvent cohabiter sur un clavier. Douze quintes pures dépassent sept octaves du <em>comma pythagoricien</em> ; quatre quintes pures dépassent une tierce majeure pure (plus deux octaves) du <em>comma syntonique</em>. Chaque système d’accord de cette page est une décision sur l’endroit où loger ces petits restes – dans une seule quinte « du loup » inutilisable, également dans toutes les quintes, ou inégalement, de sorte que certaines tonalités soient plus douces que d’autres.',
    eulerH: 'Le réseau d’Euler (Tonnetz)',
    euler1: 'Dans son <em>Tentamen novae theoriae musicae</em> (1739), Leonhard Euler représenta les notes de l’intonation juste comme un réseau : une direction multiplie par 3 (quintes pures), l’autre par 5 (tierces majeures pures). Au XIXe siècle, Arthur von Oettingen et Hugo Riemann en firent le <em>Tonnetz</em>, et la théorie néo-riemannienne s’en sert aujourd’hui pour décrire le mouvement des accords : basculer un triangle sur l’un de ses côtés garde deux notes et déplace la troisième d’un degré.',
    euler2: 'Dessiné en triangles, chaque triangle pointe en haut est un accord majeur pur, chaque triangle pointe en bas un accord mineur pur. La position d’une note compte : le mi atteint par une tierce depuis do (5:4) est plus bas d’un comma syntonique que le mi atteint par quatre quintes (81:64). Les petites marques l’indiquent : <b>−S</b> signifie un comma syntonique plus bas que la note pythagoricienne du même nom.',
    d2h: 'Deux dimensions : quintes et tierces',
    d2note: 'Touchez une note pour l’entendre, un triangle pour entendre son accord. Votre chemin est tracé : vous voyez ainsi où vous dérivez.',
    pump: 'La pompe à comma : do – la m – ré m – sol – do',
    clear: 'Effacer le chemin',
    d3h: 'Trois dimensions : la septième harmonique',
    d3p: 'Euler lui-même suggéra en 1764 que l’accord de septième de dominante doit sa sonorité au septième harmonique. Ajoutez 7:4 comme troisième axe et le plan devient un espace ; au XXe siècle, Harry Partch, Ben Johnston et James Tenney l’ont exploré. La septième harmonique (968,8 cents) est 31 cents plus basse que la septième mineure tempérée ; avec l’accord majeur, elle forme l’accord 4:5:6:7 que les quatuors barbershop accordent à l’oreille. La marque <b>−Z</b> désigne le comma septimal 64:63 (27,3 cents).',
    d4h: 'Quatre dimensions : le onzième harmonique',
    d4p: 'Un quatrième axe ne peut pas être construit dans notre espace, mais on peut l’imaginer – comme on dessine un cube en deux carrés reliés par les coins. Ici, tout le réseau 3D apparaît trois fois, chaque copie à un pas de 11:8. L’intervalle 11:8 (551,3 cents) se situe presque exactement entre la quarte et le triton ; Partch bâtit son échelle de 43 notes sur cet espace de limite 11. <b>+U</b> désigne le comma undécimal 33:32 (53,3 cents). Chaque nombre premier supplémentaire – 13, 17, 19… – ajoute une dimension : la série harmonique comme un espace aux directions toujours plus nombreuses, ce que Tenney appelait l’espace harmonique.',
    dSev: 'Accord de septième harmonique 4:5:6:7', dSevET: 'le même en tempérament égal', dSevs: 'quatre septièmes mineures : 16:9, 9:5, 1000 cents, 7:4', dSub: 'Accord sous-mineur 7:6',
    dEleven: '4:3, 11:8, le triton 600 cents, 45:32', dOtonal: '4:5:6:7:9:11 (série harmonique)',
    ex1h: 'Exercice : quel chemin dans le réseau ?',
    ex1note: 'Deux notes en intonation juste, l’une après l’autre puis ensemble. Quel pas dans le réseau était-ce ?',
    newEx: 'Nouvel exemple', again: 'Réécouter',
    lvl2: '2D : quintes et tierces', lvl3: '3D : avec la septième harmonique',
    ex2h: 'Exercice : pur ou tempéré ?',
    ex2note: 'Le même intervalle deux fois : une fois pur, une fois en tempérament égal.',
    first: 'Le premier était pur', second: 'Le second était pur',
    mar1: 'Bien avant les tempéraments, Marchetto de Padoue décrivit une manière extraordinaire de placer les dièses. Dans son <em>Lucidarium in arte musicae planae</em> (1317–18) et son <em>Pomerium in arte musicae mensuratae</em> (1318–19), il divise le ton en cinq parties, qu’il appelle <em>dieses</em> (diésis). Un demi-ton peut être <em>enharmonique</em> (deux diésis), <em>diatonique</em> (trois) ou <em>chromatique</em> (quatre).',
    mar2: 'Lorsqu’une voix est haussée pour mener à une consonance parfaite – la sixte qui s’ouvre sur l’octave (la–fa♯ → sol–sol) ou la tierce qui s’ouvre sur la quinte (la–do♯ → sol–ré) –, Marchetto prend le grand demi-ton chromatique. La note diésée ne se trouve alors qu’à une diésis (environ un cinquième de ton, soit 40 à 50 cents) sous la note où elle se résout. La consonance imparfaite devient très large et très tendue, et sa résolution d’autant plus satisfaisante : tout le contraire du mésotonique, où les dièses sont bas.',
    mar3: 'La question de savoir jusqu’à quel point Marchetto entendait ses nombres à la lettre est débattue. John Rahn (<a href="https://mtosmt.org/issues/mto.98.4.6/mto.98.4.6.rahn.html" target="_blank" rel="noopener">Music Theory Online, 1998</a>) montre comment les réaliser au monocorde et constate que les auditeurs entendent facilement la différence. Ici, la diésis vaut exactement un cinquième de ton pythagoricien (40,8 cents). Écoutez les deux cadences avec la note diésée placée de trois façons :',
    marM: 'Marchetto (⁴⁄₅ de ton, 163 cents)', marP: 'Pythagoricien (apotome, 114 cents)', marQ: 'Mésotonique ¼ de comma (76 cents)',
    marNote: 'Chaque bouton joue la–fa♯ → sol–sol (sixte vers octave), puis la–do♯ → sol–ré (tierce vers quinte). Les nombres indiquent l’écart de la note diésée au-dessus de la note naturelle.'
  }
};
