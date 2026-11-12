/* Ladicí systémy — české texty. Názvy tónů podle českého úzu: Cis, Es, B, H; tóniny „C dur“, „a moll“. */
(window.TUNING_L = window.TUNING_L || {}).cs = {
  ui: {
    'Circle of fifths': 'Kvintový kruh', 'Keyboard': 'Klaviatura', 'Language': 'Jazyk', 'Dimensions': 'Rozměry',
    'Organ': 'Varhany', 'Strings': 'Smyčce', 'Flute': 'Flétna',
    'Pythagorean comma': 'Pythagorejské koma', 'Syntonic comma': 'Syntonické koma', 'Schisma': 'Schisma', 'Diesis': 'Diesis',
    'twelve pure fifths minus seven octaves': 'dvanáct čistých kvint minus sedm oktáv',
    'four pure fifths minus a pure major third and two octaves': 'čtyři čisté kvinty minus čistá velká tercie a dvě oktávy',
    'the difference between the two': 'rozdíl mezi oběma',
    'an octave minus three pure major thirds': 'oktáva minus tři čisté velké tercie',
    'Euler lattice': 'Eulerova mřížka', 'fifth': 'kvinta', 'major third': 'velká tercie', 'minor third': 'malá tercie',
    'major triad': 'durový kvintakord', 'minor triad': 'mollový kvintakord', 'major sixth': 'velká sexta',
    'harmonic seventh vs. equal minor seventh': 'přirozená septima proti rovnoměrné malé septimě',
    '{c} c above C': '{c} centů nad C',
    'one syntonic comma lower than the Pythagorean {n}': 'o jedno syntonické koma níž než pythagorejské {n}',
    'one syntonic comma higher than the Pythagorean {n}': 'o jedno syntonické koma výš než pythagorejské {n}',
    '{k} syntonic commas lower than the Pythagorean {n}': 'o {k} syntonická komata níž než pythagorejské {n}',
    '{k} syntonic commas higher than the Pythagorean {n}': 'o {k} syntonická komata výš než pythagorejské {n}',
    'Lattice in {d} dimensions': 'Mřížka ve {d} rozměrech', 'no 11': 'bez 11', 'drag to turn': 'tažením otočíte',
    'C → A minor → D minor → G major → C major, every chord pure, every common tone held: the last C (−S) is 21.5 c lower than the first. At the end the original C sounds again for comparison.':
      'C → a moll → d moll → G dur → C dur, každý akord čistý, každý společný tón držený: poslední C (−S) je o 21,5 centu níž než první. Na konci pro srovnání znovu zazní původní C.',
    'fifth up (× 3:2)': 'kvinta nahoru (× 3:2)', 'fifth down (× 2:3)': 'kvinta dolů (× 2:3)',
    'major third up (× 5:4)': 'velká tercie nahoru (× 5:4)', 'major third down (× 4:5)': 'velká tercie dolů (× 4:5)',
    'minor third up (× 6:5)': 'malá tercie nahoru (× 6:5)', 'minor third down (× 5:6)': 'malá tercie dolů (× 5:6)',
    'harmonic seventh up (× 7:4)': 'přirozená septima nahoru (× 7:4)', 'harmonic seventh down (× 4:7)': 'přirozená septima dolů (× 4:7)',
    '{i}: which one is pure?': '{i}: která je čistá?',
    'Correct.': 'Správně.', 'Not quite.': 'Bohužel ne.',
    'The pure one was the first: {i} pure {p} c, equal-tempered {e} c ({d} c). Listen for the beating in the tempered one.':
      'Čistá byla první: {i} čistá {p} centů, rovnoměrně temperovaná {e} centů ({d} centů). Poslouchejte zázněje v temperovaném intervalu.',
    'The pure one was the second: {i} pure {p} c, equal-tempered {e} c ({d} c). Listen for the beating in the tempered one.':
      'Čistá byla druhá: {i} čistá {p} centů, rovnoměrně temperovaná {e} centů ({d} centů). Poslouchejte zázněje v temperovaném intervalu.'
  },

  tun: {
    pyth: {name: 'Pythagorejské ladění', who: 'středověká hudební teorie',
      temp: '11 čistých kvint; vlčí kvinta Gis–Es je o pythagorejské koma užší',
      text: [
        'Ladění středověké hudební teorie, postavené ze dvou nejjednodušších poměrů: oktávy (2:1) a kvinty (3:2). Dvanáct čistých kvint kruh úplně neuzavře – přesáhnou sedm oktáv o pythagorejské koma (asi 23,5 centu) –, a tak jedna kvinta, zde Gis–Es, musí spolknout celé koma a stává se z ní vyjící „vlk“.',
        'Kvinty a kvarty jsou dokonale čisté a melodické celé tóny velké (9:8, 203,9 centu), takže melodie znějí jasně a citlivé půltóny jsou malé a napjaté (90,2 centu). Velká tercie ze dvou celých tónů (81:64, 407,8 centu) je o víc než pětinu půltónu širší než čistá: ve středověkém vícehlasu byly tercie a sexty nedokonalé konsonance, které musely pokračovat dál – a pythagorejské ladění dá slyšet proč.',
        'Zajímavost: některé tercie jsou téměř čisté. H–Es, Fis–B, Cis–F a Gis–C (ve skutečnosti zmenšené kvarty) mají 384,4 centu a jsou užší jen o 2 centy – kuriozita, kterou využívali někteří klávesisté 15. století.'],
      how: ['Nalaďte a¹ (nebo c¹) podle ladičky.', 'Nalaďte všechny kvinty a kvarty bez záznějů, po kvintovém kruhu od Es ke Gis: Es–B–F–C–G–D–A–E–H–Fis–Cis–Gis.', 'Vlčí kvintu Gis–Es nechte, jak vyjde: rychle zázní a zní drsně.']},

    just: {name: 'Čisté ladění (C dur)', who: 'Ptolemaios, Zarlino 1558',
      temp: 'čisté kvinty 3:2 a tercie 5:4 v C; D–A je o syntonické koma užší',
      text: [
        'Čisté kvinty (3:2) a čisté velké tercie (5:4) zároveň. Gioseffo Zarlino (Le istitutioni harmoniche, 1558) učinil tento Ptolemaiův „syntonický diatonický“ rod teoretickým základem dokonalých konsonancí; zpěváci a smyčcaři k němu přirozeně směřují, když drží akord.',
        'Daň: existují dvě velikosti celého tónu (9:8 = 203,9 centu a 10:9 = 182,4 centu) a na nástroji s pevnými tóny to funguje jen v jedné tónině. Zde, naladěno na C, jsou čisté kvintakordy C, F a G dur a a a e moll, ale kvinta D–A je o syntonické koma (21,5 centu) užší, takže d moll je nepoužitelná. Proto klávesové nástroje potřebovaly temperatury.',
        'Berte ho jako ideál, jímž se měří každá temperatura na této stránce: tabulky ukazují, jak daleko se každá tercie a kvinta od těchto čistých velikostí odchyluje.'],
      how: ['Nalaďte c¹.', 'Nalaďte G a F jako čistou kvintu a kvartu od C, pak D jako čistou kvintu nad G.', 'Nalaďte E, A a H jako čisté velké tercie nad C, F a G (bez záznějů).', 'Zbývající tóny nalaďte jako čisté tercie nebo kvinty těchto tónů (Es = čistá malá tercie nad C, B = 9:5, Fis = čistá tercie nad D, Cis = 16:15, Gis/As = 8:5).']},

    m14: {name: 'Středotónové ladění ¼ komatu', who: 'Pietro Aron 1523, Zarlino, Salinas 1577',
      temp: '11 kvint zúžených o ¼ syntonického komatu (696,6 centu); vlk Gis–Es širší (737,6 centu)',
      text: [
        'Ladění renesančních klávesových nástrojů. Každá kvinta se zúží o čtvrtinu syntonického komatu, takže čtyři kvinty (C–G–D–A–E) dopadnou přesně na čistou velkou tercii C–E. Osm velkých tercií je čistých; celý tón leží přesně uprostřed tercie – odtud „středotónové“. Pietro Aron popsal temperaturu tohoto druhu ve svém Toscanellu (1523); Francisco de Salinas (De musica, 1577) uvedl přesnou čtvrtinu komatu.',
        'Akordy v tóninách s málo předznamenáními září; barva hudby závisí na tónině. Ale tóny s křížky jsou nízko a tóny s béčky vysoko: Gis není As a diatonický půltón (117,1 centu) je mnohem větší než chromatický (76,0 centu). Kruh se neuzavře – zbývající kvinta Gis–Es je vlk a čtyři „tercie“ H–Es, Fis–B, Cis–F a Gis–C jsou nepoužitelné zmenšené kvarty (427 centů). Některé nástroje měly dělené klávesy (Gis/As, Es/Dis), aby se tomu vyhnuly.',
        'Středotónové ladění vládlo varhanám a cembalům od počátku 16. století a v mnoha varhanách se udrželo hluboko do 18., ba i 19. století.'],
      how: ['Nalaďte c¹ a e¹ jako čistou velkou tercii bez záznějů.', 'Nalaďte kvinty C–G, G–D, D–A, A–E všechny stejně zúžené, aby E dopadlo přesně na už naladěné e (kvartami a oktávami zůstávejte ve střední oktávě). Zkontrolujte, že všechny čtyři kvinty zázní podobně pomalu.', 'Pokračujte stejně zúženými kvintami E–H, H–Fis, Fis–Cis, Cis–Gis a od C dolů: C–F, F–B, B–Es.', 'Kontrola: každá velká tercie C–E, D–Fis, E–Gis, F–A, G–H, A–Cis, B–D, Es–G je čistá.']},

    m13: {name: 'Středotónové ladění ⅓ komatu', who: 'Francisco de Salinas 1577',
      temp: '11 kvint zúžených o ⅓ syntonického komatu (694,8 centu)',
      text: [
        'Každá kvinta se zúží o třetinu syntonického komatu, takže malé tercie (6:5) jsou čisté a velké tercie mírně úzké. Salinas ho v De musica (1577) popsal jako ladění, které mu pro violu da gamba a klávesy znělo nejlépe.',
        'Kvinty jsou dost úzké (7,2 centu), ale intervaly se velmi blíží rovnoměrnému ladění o 19 stupních, takže se hodí pro hudbu plnou mollových kvintakordů a chromatických půltónů.'],
      how: ['Nalaďte c¹ a es¹ jako čistou malou tercii, pak a¹ jako čistou malou tercii pod c² (pomocí oktáv).', 'Zbývající vzdálenost rozdělte stejně zúženými kvintami, jako u ladění ¼ komatu, ale užšími; zkontrolujte, že všechny malé tercie C–Es, D–F, E–G, F–As … jsou bez záznějů.']},

    m27: {name: 'Středotónové ladění ²⁄₇ komatu', who: 'Gioseffo Zarlino 1558',
      temp: '11 kvint zúžených o ²⁄₇ syntonického komatu (695,8 centu)',
      text: [
        'Zarlinova temperatura z Le istitutioni harmoniche (1558): kvinta se zúží o 2/7 komatu, takže velké i malé tercie jsou stejně nečisté (každá o 1/7 komatu užší). Teoretikův kompromis mezi laděním ¼ a ⅓ komatu.'],
      how: ['Laďte jako u ladění ¼ komatu, ale s kvintami ještě o kousek užšími, aby velké tercie pomalu zázněly směrem dolů a malé tercie stejně pomalu.']},

    m15: {name: 'Středotónové ladění ⅕ komatu', who: 'mírnější středotónové ladění',
      temp: '11 kvint zúžených o ⅕ syntonického komatu (697,6 centu)',
      text: [
        'Jemnější středotónové ladění: kvinty jsou blíž čistým, velké tercie mírně široké (4,3 centu), vlk méně divoký. Zachovává hodně z barvy ladění ¼ komatu a vzdálené tóniny dělá o něco použitelnějšími.'],
      how: ['Laďte jako u ladění ¼ komatu, ale nechte kvinty o něco méně úzké: tercie C–E, F–A a G–H mají pomalu zázět směrem nahoru.']},

    m16: {name: 'Středotónové ladění ⅙ komatu', who: 'Gottfried Silbermann (podle Sorgeho)',
      temp: '11 kvint zúžených o ⅙ syntonického komatu (698,4 centu)',
      text: [
        'Středotónové ladění spojované s varhanami Gottfrieda Silbermanna (1683–1753) podle jeho kritika Georga Andrease Sorgeho. Kvinty jsou užší jen o 3,6 centu, tercie širší o 7,2 centu; diatonický a chromatický půltón (108,1 a 88,3 centu) jsou si podobnější než u ¼ komatu.',
        'Velmi blízké dělení oktávy na 55 stejných dílů, které Telemann a zpěvák a teoretik Pier Francesco Tosi popisovali jako systém devíti „komat“ na celý tón.'],
      how: ['Laďte jako u ladění ¼ komatu, ale kvinty jen mírně zužte; velké tercie běžných tónin zázní středně rychle směrem nahoru.']},

    werck3: {name: 'Werckmeister III', who: 'Andreas Werckmeister 1691',
      temp: 'C–G, G–D, D–A a H–Fis zúžené o ¼ pythagorejského komatu; všechny ostatní kvinty čisté',
      text: [
        'Z Musicalische Temperatur (1691) Andrease Werckmeistera, první z jeho „dobrých“ temperatur (s číslem III, protože jako první počítal čisté pythagorejské a středotónové ladění). Čtyři kvinty si rozdělí pythagorejské koma, ostatních osm je čistých, takže se kruh uzavře a hrát lze ve všech tóninách.',
        'Tóniny nejsou stejné: C dur a tóniny jí blízké mají docela dobré tercie (C–E 390,2 centu), kdežto vzdálené tóniny (Fis, Des, As dur) mají pythagorejské tercie o 407,8 centu. Bachova generace v tom slyšela rozdílný charakter tónin.'],
      how: ['Nalaďte c¹.', 'Nalaďte C–G, G–D a D–A, každou zúženou o čtvrt komatu (zázní o něco rychleji než v rovnoměrném ladění).', 'Nalaďte A–E a E–H čistě; pak H–Fis zúženou o čtvrt komatu.', 'Všechny zbývající kvinty nalaďte čistě: Fis–Cis–Gis–Es a C–F–B–Es. Pro kontrolu musí nyní vyjít čistě i Gis–Es.']},

    werck4: {name: 'Werckmeister IV', who: 'Andreas Werckmeister 1691',
      temp: 'pět kvint zúžených o ⅓ pythagorejského komatu, Gis–Es a Es–B rozšířené o ⅓ komatu',
      text: [
        'Werckmeisterova druhá temperatura, stavěná z třetin pythagorejského komatu: pět kvint zúžených o třetinu komatu, dvě kvinty (Gis–Es a Es–B) rozšířené o třetinu komatu. Nepravidelný a výrazněji zabarvený systém než Werckmeister III.'],
      how: ['Nalaďte C–G, D–A, E–H, Fis–Cis a B–F, každou zúženou o třetinu komatu, a G–D, A–E, H–Fis, Cis–Gis a F–C čistě.', 'Nalaďte Gis–Es a Es–B rozšířené o třetinu komatu (zázní, ale směrem nahoru).']},

    werck5: {name: 'Werckmeister V', who: 'Andreas Werckmeister 1691',
      temp: 'D–A, A–E, Fis–Cis, Cis–Gis, F–C zúžené o ¼ komatu; Gis–Es rozšířená o ¼ komatu',
      text: [
        'Werckmeisterova třetí temperatura: pět kvint zúžených o čtvrt komatu, jedna (Gis–Es) o čtvrt komatu rozšířená, ostatní čisté. Několik tónů vychází na kulaté hodnoty v centech (Es 300, Fis 600, A 900 nad C).'],
      how: ['Nalaďte C–G a G–D čistě, D–A a A–E zúžené o čtvrt komatu, E–H a H–Fis čistě.', 'Nalaďte Fis–Cis a Cis–Gis zúžené o čtvrt komatu; F–C zúženou o čtvrt komatu, B–F a Es–B čistě; Gis–Es pak vyjde o čtvrt komatu širší.']},

    kirn2: {name: 'Kirnberger II', who: 'Johann Philipp Kirnberger 1771',
      temp: 'D–A a A–E zúžené o ½ syntonického komatu, Fis–Cis o schisma, všechny ostatní čisté',
      text: [
        'Z Kirnbergerova spisu Die Kunst des reinen Satzes (1771). Myšlení skladatele spíš než ladiče: čistá tercie C–E (koma se rozpůlí mezi D–A a A–E) a co nejvíc čistých kvint. Dvě velmi úzké kvinty dělají D dur a A dur dost drsnými.'],
      how: ['Nalaďte c¹ a e¹ jako čistou tercii a g¹ a d¹ jako čisté kvinty od C.', 'Vzdálenost D–E rozdělte mezi D–A a A–E: obě kvinty stejně úzké (každá o půl komatu – zázní zřetelně).', 'Všechny ostatní kvinty nalaďte čistě, kromě Fis–Cis, která je užší o sotva slyšitelné schisma (můžete ji brát jako čistou).']},

    kirn3: {name: 'Kirnberger III', who: 'Johann Philipp Kirnberger kol. 1779',
      temp: 'C–G, G–D, D–A, A–E zúžené o ¼ syntonického komatu, Fis–Cis o schisma',
      text: [
        'Kirnbergerova vylepšená verze: koma se nyní dělí mezi čtyři kvinty, přesně jako u středotónového ladění ¼ komatu. C dur tak má čistou tercii a středotónovou sladkost, zatímco ostatní kvinty jsou čisté a kruh se uzavře. Vyrovnanější než Kirnberger II a dnes hojně užívané pro barokní varhany a cembalo.'],
      how: ['Nalaďte c¹–e¹ jako čistou tercii.', 'Nalaďte C–G–D–A–E jako čtyři stejně úzké kvinty, které dopadnou na čisté e (jako u ladění ¼ komatu).', 'Všechny ostatní kvinty nalaďte čistě (E–H–Fis a C–F–B–Es–As); Fis–Cis je užší o schisma, prakticky čistá.']},

    vallotti: {name: 'Vallotti', who: 'Francesco Antonio Vallotti, Padova (vyd. 1779)',
      temp: 'F–C–G–D–A–E–H: šest kvint zúžených o ⅙ pythagorejského komatu, šest kvint čistých',
      text: [
        'Temperatura Francesca Antonia Vallottiho, kapelníka v Basilica del Santo v Padově (nazývaná také Tartini–Vallotti). Šest „přirozených“ kvint od F po H je zúženo vždy o šestinu komatu, šest chromatických je čistých. Výsledek je souměrný a jemný: tóniny plynule přecházejí od sladkých (C, F, G) k jasnějším a pythagorejštějším (Fis, Des).',
        'Jedna z dnes nejpoužívanějších historických temperatur, dobrá volba pro hudbu 17. až počátku 19. století.'],
      how: ['Nalaďte a¹, pak kvinty F–C–G–D–A–E–H, každou zúženou o šestinu komatu (mezi záznějem rovnoměrného ladění a čistou).', 'Kvinty H–Fis–Cis–Gis a F–B–Es–As nalaďte čistě. Čisté Gis/As se teď musí potkat bez záznějů.']},

    young: {name: 'Young II', who: 'Thomas Young 1800',
      temp: 'C–G–D–A–E–H–Fis: šest kvint zúžených o ⅙ komatu, šest kvint čistých',
      text: [
        'Navrhl ho fyzik Thomas Young v roce 1800. Stejný vzorec jako u Vallottiho, posunutý o kvintu výš (temperované kvinty vedou od C po Fis); křížkové tóniny jsou tak o něco sladší a béčkové o něco jasnější.'],
      how: ['Nalaďte kvinty C–G–D–A–E–H–Fis, každou zúženou o šestinu komatu.', 'Nalaďte Fis–Cis–Gis–Es–B–F–C čistě.']},

    neid: {name: 'Neidhardt, „velké město“', who: 'Johann Georg Neidhardt 1724',
      temp: 'C–G, G–D, D–A ⅙ komatu; šest kvint 1⁄12 komatu; E–H, Gis–Es, F–C čisté',
      text: [
        'Johann Georg Neidhardt (Sectio canonis harmonici, Královec 1724) navrhl pro různá místa různé temperatury: pro vesnici, malé město, velké město („große Stadt“) a dvůr – čím větší místo, tím blíž rovnoměrnému ladění, protože se tam budou hrát vzdálenější tóniny.',
        'Toto je temperatura pro velké město: tři kvinty zúžené o šestinu komatu, šest jako v rovnoměrném ladění (o dvanáctinu komatu), tři čisté. Velmi blízko rovnoměrnému ladění, s jemnou předností pro běžné tóniny.'],
      how: ['Nalaďte C–G, G–D a D–A, každou zúženou o šestinu komatu.', 'Nalaďte A–E, H–Fis, Fis–Cis, Cis–Gis, Es–B a B–F jako rovnoměrně temperované kvinty (zúžené o dvanáctinu komatu).', 'Nalaďte E–H, Gis–Es a F–C čistě.']},

    kellner: {name: 'Kellner', who: 'Herbert Anton Kellner 1977',
      temp: 'C–G–D–A–E a H–Fis zúžené o ⅕ pythagorejského komatu, sedm kvint čistých',
      text: [
        'Moderní rekonstrukce temperatury pro Bacha, kterou v roce 1977 navrhl Herbert Anton Kellner a odvodil ze symboliky čísel (Bachova pečeť). Jako Werckmeister III, ale koma je rozložené do pěti kvint, což dává vyrovnanější tóniny.'],
      how: ['Nalaďte C–G, G–D, D–A, A–E a H–Fis, každou zúženou o pětinu komatu.', 'Všechny ostatní kvinty nalaďte čistě (E–H, Fis–Cis–Gis–Es–B–F–C).']},

    lehman: {name: 'Lehman (Bach)', who: 'Bradley Lehman 2005',
      temp: 'F–C–G–D–A–E zúžené o ⅙ komatu; E–H–Fis–Cis čisté; Cis–Gis–Es–B zúžené o 1⁄12; B–F rozšířená o 1⁄12',
      text: [
        'Výklad Bradleyho Lehmana (Early Music, 2005), který kresbu se smyčkami na titulním listu Bachova Dobře temperovaného klavíru (1722) čte jako ladicí návod. Pět kvint o šestinu komatu, tři čisté, tři o dvanáctinu komatu a jedna mírně široká kvinta B–F. Hojně diskutovaná a sporná hypotéza; hudebně velmi vyrovnaná nerovnoměrná temperatura.'],
      how: ['Nalaďte F–C–G–D–A–E, každou zúženou o šestinu komatu.', 'Nalaďte E–H, H–Fis a Fis–Cis čistě.', 'Nalaďte Cis–Gis, Gis–Dis a Dis–Ais, každou zúženou o dvanáctinu komatu (jako v rovnoměrném ladění).', 'B–F vyjde o dvanáctinu komatu širší: zkontrolujte, že pomalu zázní směrem nahoru.']},

    equal: {name: 'Rovnoměrně temperované ladění', who: 'Zhu Zaiyu 1584, Simon Stevin kol. 1605',
      temp: 'všechny kvinty zúžené o 1⁄12 pythagorejského komatu (700 centů)',
      text: [
        'Dvanáct stejných půltónů po 100 centech: každá kvinta je užší o dvanáctinu pythagorejského komatu (2 centy), každá velká tercie širší o 13,7 centu. Přesně je vypočítali Zhu Zaiyu v Číně (1584) a Simon Stevin v Nizozemí (kolem 1605). Loutny a violy da gamba, jejichž pražce vedou rovně přes všechny struny, používaly téměř stejné půltóny už od 16. století – Vincenzo Galilei doporučoval poměr 18:17.',
        'Všechny tóniny znějí stejně; čistá není nic kromě oktávy. V 19. století se stalo normou pro klávesové nástroje a je měřítkem pro všechno na této stránce.'],
      how: ['Nalaďte a¹.', 'Nalaďte dvanáct kvint, každou nepatrně zúženou, aby všechny zázněly pomalu a rovnoměrně narůstajícím tempem (uprostřed klaviatury asi jednou za sekundu).', 'Kontrolujte velkými terciemi a sextami: chromaticky vzhůru se jejich zázněje musí plynule zrychlovat, bez skoků.']}
  },

  html: {
    lede: 'Jak se dvanáct tónů oktávy ladilo od středověku po dnešek. Poslechněte si stupnice a akordy v každém systému, porovnejte je, zpívejte k nim – a naučte se je sami ladit.',
    intro: 'Čisté kvinty (3:2) a čisté velké tercie (5:4) spolu na klaviatuře žít nemohou. Dvanáct čistých kvint přesáhne sedm oktáv o <em>pythagorejské koma</em>; čtyři čisté kvinty přesáhnou čistou velkou tercii (plus dvě oktávy) o <em>syntonické koma</em>. Každý ladicí systém na této stránce je rozhodnutím, kam tyto malé zbytky uložit – do jediné nepoužitelné „vlčí“ kvinty, rovnoměrně do všech kvint, nebo nerovnoměrně, takže některé tóniny znějí sladčeji než jiné.',
    eulerH: 'Eulerova mřížka (Tonnetz)',
    euler1: 'Ve svém spise <em>Tentamen novae theoriae musicae</em> (1739) nakreslil Leonhard Euler tóny čistého ladění jako síť: jeden směr násobí třemi (čisté kvinty), druhý pěti (čisté velké tercie). V 19. století z ní Arthur von Oettingen a Hugo Riemann vytvořili <em>Tonnetz</em> a dnešní neoriemannovská teorie jím popisuje pohyb akordů: překlopíme-li trojúhelník přes jednu z jeho stran, dva tóny zůstanou a třetí se posune o krok.',
    euler2: 'Nakreslená v trojúhelnících je každý trojúhelník špičkou nahoru čistý durový a každý špičkou dolů čistý mollový kvintakord. Na poloze tónu záleží: E dosažené tercií od C (5:4) je o syntonické koma níž než E dosažené čtyřmi kvintami (81:64). Ukazují to drobné značky: <b>−S</b> znamená o syntonické koma níž než pythagorejský tón téhož jména.',
    d2h: 'Dva rozměry: kvinty a tercie',
    d2note: 'Klepnutím na tón ho uslyšíte, klepnutím na trojúhelník jeho akord. Vaše cesta se kreslí, takže vidíte, kam se posouváte.',
    pump: 'Komatová pumpa: C – a – d – G – C',
    clear: 'Smazat cestu',
    d3h: 'Tři rozměry: přirozená septima',
    d3p: 'Už Euler v roce 1764 vyslovil domněnku, že dominantní septakord vděčí za svůj zvuk sedmému alikvotnímu tónu. Přidáme-li 7:4 jako třetí osu, stane se z roviny prostor; ve 20. století ho zkoumali Harry Partch, Ben Johnston a James Tenney. Přirozená septima (968,8 centu) je o 31 centů nižší než rovnoměrně temperovaná malá septima; spolu s durovým kvintakordem tvoří akord 4:5:6:7, který barbershopová kvarteta ladí podle sluchu. Značka <b>−Z</b> označuje septimové koma 64:63 (27,3 centu).',
    d4h: 'Čtyři rozměry: jedenáctý alikvot',
    d4p: 'Čtvrtou osu v našem prostoru postavit nelze, ale lze si ji představit – tak jako kreslíme krychli jako dva čtverce spojené v rozích. Celá 3D mřížka je zde zobrazena třikrát, každá kopie o jeden krok 11:8 dál. Interval 11:8 (551,3 centu) leží téměř přesně mezi kvartou a tritónem; Partch na tomto prostoru s limitou 11 postavil svou 43tónovou stupnici. <b>+U</b> označuje undecimové koma 33:32 (53,3 centu). Každé další prvočíslo – 13, 17, 19 … – přidává další rozměr: alikvotní řada jako prostor o stále více směrech, který Tenney nazval harmonickým prostorem.',
    dSev: 'Přirozený septakord 4:5:6:7', dSevET: 'totéž v rovnoměrném ladění', dSevs: 'čtyři malé septimy: 16:9, 9:5, 1000 centů, 7:4', dSub: 'Submollový kvintakord 7:6',
    dEleven: '4:3, 11:8, tritón 600 centů, 45:32', dOtonal: '4:5:6:7:9:11 (alikvotní řada)',
    ex1h: 'Cvičení: kudy vede cesta mřížkou?',
    ex1note: 'Dva tóny v čistém ladění, nejprve po sobě, pak spolu. O jaký krok v mřížce šlo?',
    newEx: 'Nový příklad', again: 'Přehrát znovu',
    lvl2: '2D: kvinty a tercie', lvl3: '3D: s přirozenou septimou',
    ex2h: 'Cvičení: čistý, nebo temperovaný?',
    ex2note: 'Tentýž interval dvakrát: jednou čistý, jednou rovnoměrně temperovaný.',
    first: 'Čistý byl první', second: 'Čistý byl druhý',
    mar1: 'Dávno před temperaturami popsal Marchetto z Padovy pozoruhodný způsob, jak umístit tóny s křížkem. Ve svém <em>Lucidarium in arte musicae planae</em> (1317–18) a v <em>Pomerium in arte musicae mensuratae</em> (1318–19) dělí celý tón na pět dílů, které nazývá <em>dieses</em>. Půltón může být <em>enharmonický</em> (dvě diesis), <em>diatonický</em> (tři) nebo <em>chromatický</em> (čtyři).',
    mar2: 'Když je hlas zvýšen, aby vedl do dokonalé konsonance – sexta, která se otevírá do oktávy (A–Fis → G–G), nebo tercie, která se otevírá do kvinty (A–Cis → G–D) –, bere Marchetto velký chromatický půltón. Tón s křížkem pak stojí jen jednu diesis (asi pětinu celého tónu, zhruba 40–50 centů) pod tónem, do něhož se rozvádí. Nedokonalá konsonance je velmi široká a velmi napjatá a její rozvedení o to uspokojivější: přesný opak středotónového ladění, kde jsou tóny s křížkem nízko.',
    mar3: 'Jak doslova Marchetto svá čísla myslel, je předmětem sporů. John Rahn (<a href="https://mtosmt.org/issues/mto.98.4.6/mto.98.4.6.rahn.html" target="_blank" rel="noopener">Music Theory Online, 1998</a>) ukazuje, jak je lze uskutečnit na monochordu, a zjišťuje, že posluchači rozdíl snadno slyší. Zde je diesis brána přesně jako pětina pythagorejského celého tónu (40,8 centu). Poslechněte si obě kadence s tónem s křížkem umístěným třemi způsoby:',
    marM: 'Marchetto (⁴⁄₅ tónu, 163 centů)', marP: 'Pythagorejsky (apotomé, 114 centů)', marQ: 'Středotónově ¼ komatu (76 centů)',
    marNote: 'Každé tlačítko zahraje A–Fis → G–g (sexta do oktávy), pak A–Cis → G–d (tercie do kvinty). Čísla udávají vzdálenost tónu s křížkem nad jeho základním tónem.'
  }
};
