/* Atlas of Musical Style — performing forces: who makes the music.
   Every STYLE gets a medium – vocal, instrumental, mixed (voices with instruments) or electronic – and a line on its usual ensemble.
   Every ELEMENT gets the media it belongs to:
     v  – only with voices (it depends on a text or on singers: chant, the mass, word-painting, falsobordone…)
     i  – only with instruments (lute, keyboard, orchestra, the concerto…)
     m  – needs voices and instruments together (accompanied song, monody, opera…)
     vi – either (counterpoint, harmony, notation, tuning…); this is the default.
   A vocal style may not contain an i or m element, an instrumental style no v or m element: check() lists every clash in the console.
   This file also adds the ensembles themselves (folder "forces") and the instrumental styles split off from the vocal ones.
   Loaded after all other vault files. */
(function (V) {
  const el = id => V.elements.find(e => e.id === id), st = id => V.styles.find(s => s.id === id);
  const add = (sid, ids) => { const s = st(sid); if (s) ids.forEach(i => { if (!s.elements.includes(i)) s.elements.push(i); }); };
  const drop = (sid, ids) => { const s = st(sid); if (s) s.elements = s.elements.filter(i => !ids.includes(i)); };

  V.folders.forces = 'Forces & ensembles';
  V.MEDIA = { vocal: 'Vocal', instrumental: 'Instrumental', mixed: 'Voices and instruments', electronic: 'Electronic' };

  /* ---------- the ensembles ---------- */
  V.elements.push(
    {id: 'chant-choir', title: 'Chant choir and cantors', folder: 'forces', first: 700, common: 800, fade: null, forces: 'v',
      scope: 'the papal singers in Rome (Ordines Romani, c. 700); monastic and cathedral choirs; the cantor or precentor leading them',
      text: 'The first standing musical institution of the West: clerics, monks or nuns and boys who sing the office and the Mass every day, with soloists (cantors) for the more elaborate chants. One line, any number of singers: [[plainchant]] and the [[real-parts|real voices]] of a piece are independent of how many sing it. Its leader carries the staff of the [[time-beater]].'},
    {id: 'chapel-choir', title: 'The chapel (cappella) of singers', folder: 'forces', first: 1380, common: 1430, fade: null, forces: 'v',
      scope: 'the papal chapel; the court chapels of Burgundy, Savoy, Ferrara, Milan, Munich, the Habsburgs; cathedral and collegiate choirs with boys; the English Chapel Royal; the Dresden Hofkantorei (1548)',
      text: 'Polyphony is sung by a salaried body of adult singers and choirboys belonging to a court, a pope or a church – a *cappella*, *chapelle* or *Kantorei*. Its size runs from a handful of singers to some thirty; how many sang each part (one, two, several) varied with the place and the piece and is still debated. Instruments join on feast days, the organ alternates with the choir ([[alternatim]]), and singers improvise as well as read ([[super-librum]]).\n\n*A cappella* – “in the manner of the chapel” – later comes to mean voices without instruments. The idea of an unaccompanied Renaissance ideal belongs largely to the 19th century ([[early-music-revival|Palestrina revival]]); in practice the organ and wind instruments often doubled or replaced voices. In this atlas every style sung by such a body is **vocal**.'},
    {id: 'alta-capella', title: 'Minstrels: loud and soft instruments', folder: 'forces', first: 1380, common: 1420, fade: 1550, forces: 'i',
      scope: 'town and court minstrels; the alta capella of two shawms and slide trumpet or sackbut; the soft (bassa) instruments: lute, harp, fiddle, recorder, portative organ',
      text: 'Before the orchestra, instrumentalists are organised by volume. The *loud* band (*alta*) of shawms, bombard and slide trumpet, later the sackbut, plays outdoors, at banquets and for the [[basse-danse]], improvising over a tenor; the *soft* instruments (*bassa*) play indoors, often in twos and threes – a lute with a *tenorista*, harp and fiddle. Players are hired by towns and courts, usually from minstrel families and guilds, and mostly play without written music. They lead on to the [[consort]] and, through the violin bands, to the [[orchestra]].'},
    {id: 'consort', title: 'Consort (whole and broken)', folder: 'forces', first: 1500, common: 1540, fade: 1700, forces: 'i',
      scope: 'viols (from the 1490s), recorders, crumhorns, cornetts and sackbuts built in families of sizes; Morley, The First Booke of Consort Lessons (1599); Dowland, Lachrimae (1604) for five viols and lute; the In nomine and fancy',
      text: 'A small instrumental ensemble, one player to a part, that plays polyphony as voices would. A *whole* consort is one family of instruments in several sizes – a chest of viols, a set of recorders – so that it can play any vocal piece; a *broken* consort mixes families, like Morley’s treble viol, flute, bass viol, lute, cittern and pandora. Consort music (fantasias, In nomines, dances) keeps the [[real-parts|real voices]] of vocal polyphony; it fades as the violin band and the [[trio-sonata]] take over in the later 17th century.'},
    {id: 'wind-harmonie', title: 'Harmonie and wind band', folder: 'forces', first: 1760, common: 1780, fade: null, forces: 'i',
      scope: 'the Harmonie of pairs of oboes, clarinets, horns and bassoons (Joseph II’s, 1782); Mozart’s serenades (Gran Partita); military bands; Adolphe Sax’s saxhorns and saxophones (1840s); the concert band',
      text: 'An ensemble of wind instruments only: first the aristocratic *Harmonie* of six or eight players for open-air and table music, then the military band, the civic and village band, and the 20th-century concert band. It brings the brass and the clarinet into everyday music long before the [[romantic-orchestra]], and is the background of jazz ([[big-band]]).'},
    {id: 'choral-society', title: 'Choral society (large amateur choir)', folder: 'forces', first: 1784, common: 1820, fade: null, forces: 'v',
      scope: 'the Handel Commemoration in Westminster Abbey (1784); the Berlin Singakademie (1791); the music festivals and Liedertafeln of the 19th century',
      text: 'Singing in a choir becomes a civic pastime: hundreds of amateurs, men and women, sing [[oratorio|oratorios]] and masses with an [[orchestra]], or part-songs alone. The choir is now large and many to a part – the opposite of the professional [[chapel-choir|chapel]] – and the earlier repertory (Handel, Bach, Palestrina) is revived for it ([[early-music-revival]]).'},
    {id: 'rhythm-section', title: 'The band: rhythm section and front line', folder: 'forces', first: 1900, common: 1920, fade: null, forces: 'vi',
      scope: 'New Orleans bands (banjo, tuba, drums; cornet, clarinet, trombone); the swing rhythm section (piano, guitar, bass, drums); the bebop combo; the rock band (guitars, bass, drums); the studio band',
      text: 'The ensemble of jazz and popular music: a *rhythm section* that keeps the beat and the chords – drums, bass, piano or guitar – and a *front line* of melody instruments or a singer. It is a small group with one player to a part and much improvised or arranged by ear, closer to the [[alta-capella|minstrel bands]] and the [[basso-continuo|continuo group]] than to the orchestra. Enlarged into sections it becomes the [[big-band]]; with amplification and the [[electric-guitar]] the rock band.'}
  );
  ['orchestra', 'classical-orchestra', 'romantic-orchestra', 'big-band'].forEach(id => { el(id).folder = 'forces'; });
  Object.assign(el('orchestra'), {
    title: 'Orchestra', first: 1607, common: 1680, fade: null,
    scope: 'the 24 violons du Roi (12 royal violons by 1607, “24 violons ordinaires” in 1618); Lully’s Petits violons (1656) and Grande Bande (1664); Corelli’s Roman orchestras; the opera houses; the word in Mattheson, Das neu-eröffnete Orchestre (1713)',
    text: 'When does a band become an orchestra? Following Neal Zaslaw, an ensemble counts as an orchestra when it has: (1) bowed strings of the violin family at its core; (2) several players to a part, at least among the violins; (3) a stable, institutional membership; and (4) a common discipline under one leader – the same bowing, ornaments and beat. Wind instruments, timpani and a continuo keyboard may be added.\n\nBy these criteria the orchestra begins at the French court: the royal violin band, twelve strong by 1607 and the *24 violons* by 1618, plays dance music in five parts with several to a part; Lully drills his Petits violons and the Grande Bande into a uniform body. Corelli does the same in Rome, and the opera houses spread the model. Earlier ensembles – the instruments of the Florentine intermedi (1589), Monteverdi’s *Orfeo* (1607), the instrumentalists of San Marco or of Munich – are large and colourful, but assembled for an occasion or play one to a part: they are *proto-orchestral*.\n\nThe Dresden Staatskapelle dates itself to 1548, when Johann Walter set up the elector’s court *Kantorei*. That year marks the founding of an institution, not of an orchestra: it was a chapel of singers, with a few instrumentalists engaged beside them. Instruments become regular members in the following decades, under Schütz (from 1617) it is a mixed Kapelle of singers and players, and only in the 18th century (Pisendel, Hasse) is it an orchestra in the sense above. Other “oldest orchestras” have the same history: a court’s musical household that grew into an orchestra.\n\nThe Classical wind section follows ([[classical-orchestra]]), then the [[romantic-orchestra]]; the [[conductor]] replaces the leading violinist.'
  });

  /* an instrumental form of the Middle Ages */
  V.elements.push({id: 'estampie', title: 'Estampie (stantipes)', folder: 'form', first: 1250, common: 1280, fade: 1400, forces: 'i',
    scope: 'the eight “estampies royales” of the Manuscrit du Roi (13th c.); Johannes de Grocheio, De musica (c. 1300); the Robertsbridge fragment (c. 1360); Italian istampitte (London, BL Add. 29987)',
    text: 'The earliest written instrumental music: a dance or display piece in several *puncta*, each played twice with an open and a closed ending. Grocheio describes it as music for fiddlers that holds the attention of the listener by its difficulty. A rare written trace of what minstrels ([[alta-capella]]) mostly played from memory.'});

  /* ---------- which media each element belongs to ---------- */
  const F = {
    v: 'plainchant neumes hexachord parallel-organum free-organum florid-organum discant-clausula rhythmic-modes discant fauxbourdon english-discant english-faburden gymel super-librum sortisatio motet conductus formes-fixes cyclic-mass parody-mass soggetto-cavato word-painting sequence-trope troubadour-song frottola falsobordone chorale stile-antico seconda-pratica greek-humanism castrato-virtuosity sprechstimme liturgical-drama lauda caccia carol villancico cantus-fractus chiavette contrafactum quodlibet chant-restoration rap',
    i: 'orchestra intabulation dance-pairs ricercar toccata chorale-prelude trio-sonata concerto-grosso solo-concerto dance-suite french-overture style-brise violin-idiom mannheim-effects classical-orchestra romantic-orchestra fortepiano alberti-bass symphony string-quartet character-piece program-music valve-brass prepared-piano electric-guitar drum-machine power-chord lute-polyphony enharmonic-keyboards microtonal-instruments keyboard-tablature basse-danse glosas scordatura alfabeto mixture-sound big-band ragtime-syncopation stile-concitato klangfarbenmelodie minuet-trio partimento rule-of-octave bebop-line film-score',
    m: 'monody lute-song concertato opera oratorio da-capo-aria lied music-drama opera-buffa ensemble-finale public-opera accompanied-monody strophic-variation',
  };
  for (const k in F) F[k].split(/\s+/).forEach(id => { const e = el(id); if (e && !e.forces) e.forces = k; });
  V.elements.forEach(e => { if (!e.forces) e.forces = 'vi'; });

  /* ---------- the medium and the usual ensemble of every style ---------- */
  const S = {
    'antiquity': ['mixed', 'singers with lyre, kithara, harp or aulos; choruses in Greek drama'],
    'chant-style': ['vocal', 'a choir of clerics, monks or nuns in unison, with cantors as soloists'],
    'early-organum': ['vocal', 'soloists of the chant choir adding a voice to the chant'],
    'aquitanian': ['vocal', 'two (rarely three) solo singers in the abbeys of southern France'],
    'notre-dame': ['vocal', 'solo singers of the cathedral clergy, one to a part, against the choir singing the chant'],
    'ars-antiqua': ['vocal', 'solo singers, one to a part; instruments may have played the tenor'],
    'troubadours': ['vocal', 'a solo singer; an accompaniment on fiddle, harp or lute is possible but not written down'],
    'ars-nova': ['vocal', 'solo singers of court and church chapels, one to a part; instruments may take untexted lines'],
    'trecento': ['vocal', 'two or three solo singers; untexted parts possibly played'],
    'ars-subtilior-style': ['vocal', 'virtuoso solo singers at the courts of Avignon, Foix and Aragon; untexted lower parts possibly played'],
    'english-style': ['vocal', 'the chapel choirs of English cathedrals, colleges and noble households'],
    'burgundian': ['vocal', 'court and cathedral chapels of adult singers and boys; instruments only in some secular songs'],
    'ockeghem': ['vocal', 'the chapels of the French court, the Burgundian dukes and Italian princes'],
    'josquin': ['vocal', 'papal, royal and ducal chapels: a dozen to some thirty singers'],
    'franco-flemish': ['vocal', 'the Habsburg, papal and princely chapels; partbooks also sung by amateurs at home'],
    'palestrina': ['vocal', 'the papal chapel and the choirs of the Roman basilicas, men and boys or falsettists'],
    'tudor': ['vocal', 'cathedral and college choirs, the Chapel Royal, and singers at home reading from partbooks'],
    'spanish-ren': ['vocal', 'cathedral choirs and the royal chapels of Spain, often doubled by ministriles (shawms, cornetts, sackbuts)'],
    'parisian-chanson': ['vocal', 'four voices, sung by amateurs and court singers; also played on instruments'],
    'madrigal': ['vocal', 'one singer to a part, in academies and courts; the concerto delle donne of Ferrara'],
    'venetian': ['mixed', 'two or more choirs of singers, cornetts, sackbuts, strings and organs in San Marco'],
    'instrumental-ren': ['instrumental', 'solo lute, vihuela, keyboard; consorts of viols, recorders or loud winds'],
    'medieval-instrumental': ['instrumental', 'minstrels: fiddle, harp, lute, recorders; the loud band of shawms and slide trumpet; organists'],
    'english-instrumental': ['mixed', 'solo lute and the lute ayre; consorts of viols, whole and broken; virginals'],
    'spanish-instrumental': ['mixed', 'solo vihuela or keyboard; voice and vihuela; viol with harpsichord'],
    'early-baroque': ['mixed', 'solo singers with continuo; small mixed ensembles of strings, cornetts and continuo'],
    'stylus-phantasticus': ['instrumental', 'solo keyboard, violin or viol with continuo'],
    'french-baroque': ['mixed', 'the court orchestra of five-part strings with oboes; solo lute and harpsichord; the opera'],
    'high-baroque': ['mixed', 'orchestras of strings, oboes and continuo; choirs; solo instruments'],
    'opera-seria': ['mixed', 'solo singers with the opera orchestra'],
    'galant': ['mixed', 'keyboard, chamber ensembles, comic opera, the orchestra'],
    'empfindsamkeit': ['mixed', 'the solo clavichord and fortepiano; songs with keyboard'],
    'mannheim': ['instrumental', 'the Mannheim court orchestra'],
    'viennese-classical': ['mixed', 'orchestra, string quartet, piano; opera and church music'],
    'bel-canto-opera': ['mixed', 'solo singers with orchestra and chorus'],
    'early-romantic': ['mixed', 'piano; voice and piano; orchestra'],
    'late-romantic': ['mixed', 'the large orchestra; the opera house; voice and piano'],
    'nationalism': ['mixed', 'orchestra, opera, piano'],
    'impressionism': ['mixed', 'piano; orchestra; chamber ensembles'],
    'expressionism': ['mixed', 'orchestra; chamber ensembles; voice with mixed ensemble (Pierrot lunaire)'],
    'primitivism': ['mixed', 'the large orchestra and ballet'],
    'second-viennese': ['mixed', 'orchestra, string quartet, piano, voice and ensemble'],
    'neoclassicism': ['mixed', 'chamber orchestras and mixed ensembles'],
    'darmstadt': ['mixed', 'mixed ensembles, piano, orchestra, electronic studio'],
    'electroacoustic': ['electronic', 'tape, loudspeakers, synthesizers and computers, sometimes with live performers'],
    'new-york-school': ['mixed', 'piano and prepared piano; flexible ensembles'],
    'sonorism': ['mixed', 'the large orchestra and chorus'],
    'minimalism': ['mixed', 'the composers’ own amplified ensembles; keyboards and voices'],
    'spectralism': ['mixed', 'orchestra and ensembles, with electronics'],
    'new-complexity': ['instrumental', 'solo instruments and chamber ensembles'],
    'postmodern': ['mixed', 'orchestra, ensembles, voices, electronics'],
    'holy-minimalism': ['mixed', 'choirs, strings, organ'],
    'ragtime': ['instrumental', 'solo piano; dance orchestras'],
    'early-jazz': ['mixed', 'the New Orleans band: cornet, clarinet, trombone, banjo, tuba or bass, drums; blues singers'],
    'swing-era': ['mixed', 'the big band and its singer'],
    'bebop': ['instrumental', 'the small combo: saxophone, trumpet, piano, bass, drums'],
    'modal-jazz-style': ['instrumental', 'the small combo'],
    'free-jazz': ['instrumental', 'the combo, without fixed roles'],
    'rock': ['mixed', 'singer, electric guitars, bass and drums'],
    'hip-hop': ['mixed', 'MC and DJ: rapper, turntables, sampler and drum machine'],
    'electronic-dance': ['electronic', 'DJ and producer: drum machines, synthesizers, samplers'],
  };

  /* ---------- the instrumental styles split off from vocal ones ---------- */
  V.styles.push(
    {id: 'medieval-instrumental', title: 'Medieval & 15th-century instrumental music', from: 1250, to: 1500,
      elements: ['estampie', 'alta-capella', 'drone', 'keyboard-tablature', 'basse-danse', 'diminution', 'intabulation', 'mixture-sound', 'alternatim', 'cantus-firmus'],
      text: 'What minstrels and organists played: the estampie and other dances, the improvised basse danse of the loud band, and the first keyboard books (Robertsbridge, Faenza, Paumann, Buxheim), which turn chants and songs into ornamented instrumental pieces. Most of this music was never written down.'},
    {id: 'english-instrumental', title: 'English lute, consort & keyboard music', from: 1560, to: 1640,
      elements: ['lute-polyphony', 'lute-song', 'consort', 'variation-form', 'ground-bass', 'dance-pairs', 'cantus-firmus', 'ricercar', 'diminution', 'english-cadence', 'meantone'],
      text: 'The instrumental side of the Elizabethan and Jacobean age, kept apart from the vocal [[tudor|Tudor polyphony]]: the virginalists (Byrd, Bull, Gibbons; the Fitzwilliam Virginal Book), consorts of viols playing fancies, In nomines and pavans, Dowland’s lute solos and *Lachrimae*, and the lute ayre of Dowland and Campion.'},
    {id: 'spanish-instrumental', title: 'Spanish vihuela & keyboard music', from: 1530, to: 1630,
      elements: ['lute-polyphony', 'lute-song', 'intabulation', 'glosas', 'diminution', 'variation-form', 'ground-bass', 'ricercar', 'keyboard-tablature', 'alternatim'],
      text: 'The vihuelists from Milán (*El Maestro*, 1536) and Narváez to Fuenllana, the keyboard music of Cabezón, and Ortiz’s glosas for viol: fantasias and tientos, diferencias on grounds and songs, and songs for voice and vihuela – apart from the vocal [[spanish-ren|Spanish polyphony]].'}
  );
  if (V.voices) Object.assign(V.voices, {
    'medieval-instrumental': [1, 3, 3, 'a single dance line, or an ornamented line over a tenor; two or three parts in the keyboard sources'],
    'english-instrumental': [1, 6, 6, 'the solo lute or virginal, voice and lute, and consorts of four to six viols'],
    'spanish-instrumental': [1, 4, 4, 'the solo vihuela or keyboard in up to four parts; voice and vihuela'],
  });

  /* ---------- corrections: elements that do not belong to the medium of a style ---------- */
  drop('tudor', ['lute-song', 'lute-polyphony', 'meantone']);
  st('tudor').text = 'From the florid Eton Choirbook through Taverner and Tallis to Byrd and Gibbons: long melismatic lines, the gymel and the English cadence in Latin church music, the English anthem and service after the Reformation, and the Elizabethan madrigal. The lute, the consort and the virginals have their own entry: [[english-instrumental]].';
  drop('spanish-ren', ['lute-song', 'lute-polyphony', 'glosas', 'diminution', 'english-cadence']);
  add('spanish-ren', ['chapel-choir', 'cyclic-mass', 'parody-mass']);
  st('spanish-ren').text = 'Peñalosa and Anchieta, then Morales, Guerrero and Victoria, and the cathedral singers who improvised contrapunto: grave, expressive sacred polyphony with frequent false relations, the villancico in the vernacular. The vihuela and the keyboard are in [[spanish-instrumental]].';
  drop('madrigal', ['lute-song', 'accompanied-monody', 'enharmonic-keyboards']);
  st('madrigal').text += ' Madrigals were also sung by one voice to the lute, an arrangement that leads to [[monody]].';
  drop('parisian-chanson', ['dance-pairs']);
  drop('burgundian', ['basse-danse', 'keyboard-tablature']);
  drop('ars-nova', ['keyboard-tablature']);
  drop('stylus-phantasticus', ['seconda-pratica']);
  drop('troubadours', ['accompanied-monody']);
  st('troubadours').text += ' Whether and how the songs were accompanied is not written down; see [[accompanied-monody]].';
  if (st('instrumental-ren')) add('instrumental-ren', ['consort', 'alta-capella']);
  ['chant-style', 'early-organum'].forEach(s => add(s, ['chant-choir']));
  ['english-style', 'burgundian', 'ockeghem', 'josquin', 'franco-flemish', 'palestrina', 'tudor'].forEach(s => add(s, ['chapel-choir']));
  add('venetian', ['chapel-choir']);
  ['french-baroque', 'high-baroque', 'opera-seria', 'mannheim'].forEach(s => add(s, ['orchestra']));
  add('viennese-classical', ['wind-harmonie']);
  add('early-romantic', ['choral-society']); add('late-romantic', ['choral-society', 'wind-harmonie']);
  ['early-jazz', 'swing-era', 'bebop', 'modal-jazz-style', 'free-jazz', 'rock'].forEach(s => add(s, ['rhythm-section']));
  for (const id in S) { const s = st(id); if (s) { s.medium = S[id][0]; s.ensemble = S[id][1]; } }

  /* composers whose instrumental work now has its own style */
  const cmp = id => (V.composers || []).find(c => c.id === 'c-' + id || c.id === id);
  const restyle = (id, styles) => { const c = cmp(id); if (c) c.styles = styles; };
  restyle('dowland', ['english-instrumental', 'instrumental-ren']);
  restyle('byrd', ['tudor', 'english-instrumental']);
  restyle('gibbons', ['tudor', 'english-instrumental']);
  restyle('morley', ['tudor', 'madrigal', 'english-instrumental']);
  restyle('milan', ['spanish-instrumental']);
  restyle('cabezon', ['spanish-instrumental', 'instrumental-ren']);
  restyle('ortiz', ['spanish-instrumental', 'instrumental-ren']);

  /* ---------- the check ---------- */
  const BAD = { vocal: ['i', 'm'], instrumental: ['v', 'm'] };
  V.checkForces = () => {
    const out = [];
    V.styles.forEach(s => (s.elements || []).forEach(e => { const n = el(e); if (n && BAD[s.medium] && BAD[s.medium].includes(n.forces)) out.push(`${s.id} (${s.medium}) has ${e} (${n.forces})`); }));
    V.styles.forEach(s => { if (!s.medium) out.push(`${s.id}: no medium`); });
    return out;
  };
})(window.VAULT);
