# Additions to the Concordantia tree: new works, new topics, and passages quoted from the texts.
# The quotations were checked against the scans (archive.org page images) or the TML transcription;
# spelling follows the prints (long s written as s). Each passage: (where in the work, text, link to the page).
TML = "https://lightseagreen-dog-349934.hostingersite.com/tml/13th/SALSCI"
def IA(item, n): return f"https://archive.org/details/{item}/page/n{n}/mode/1up"
BER = "Juan-Bermudo-Declaracion-1555"
CER = "1566-1625-Cerone-Pedro-1613-el-melopeo-y-maestro"
HEI = "dergeneralbassin00hein"
MUF = "https://imslp.org/wiki/Regulae_Concentuum_Partiturae_(Muffat%2C_Georg)"

WORKS = {
"elias":("Elias Salomo","Scientia artis musicae",1274,"1274","Roman Curia (from Saint-Astier, Périgord)",
  "Written at the papal court in the year of the Council of Lyon; a practical chant manual that ends with the earliest detailed account of improvised four-voice singing led by a rector.","re:^13th/SALSCI$",'Elias Salomo Scientia artis musicae'),
"muffat":("Georg Muffat","Regulae concentuum partiturae",1699,"1699","Passau",
  "Manuscript thoroughbass treatise: every chord (Grieff) and dissonance named, with its preparation and resolution, by a pupil of Lully and Pasquini.","",'Muffat Regulae concentuum partiturae'),
}

SM = "https://imslp.org/index.php?title=Special:Search&search=" + "Arte de ta%C3%B1er fantas%C3%ADa Santa Mar%C3%ADa"
WORKS["santamaria"] = ("Tomás de Santa María","Arte de tañer fantasía",1565,"1565","Valladolid",
  "A Dominican organist's method, finished 1557, for keyboard and vihuela: technique, intabulation and, in Part II, improvising a fantasia in four voices. Passages after the transcriptions of the Lexique musical de la Renaissance (ATILF).","",'Santa Maria Arte de taner fantasia')

# ---------------- Johannes Tinctoris: all his treatises in the TML
TB = "https://lightseagreen-dog-349934.hostingersite.com/tml/15th/"
def TT(k): return TB + k
WORKS.update({
"tinctoris":("Johannes Tinctoris","Liber de arte contrapuncti",1477,"1477","Naples","Written at the Aragonese court in Naples and dedicated to King Ferrante; three books: the concords, the discords, and the eight general rules.","re:^15th/TINC(ON|PT)\\d$"),
"tinctoris-prop":("Johannes Tinctoris","Proportionale musices",1473,"c. 1473","Naples","Proportions in mensural music; its prologue praises the English and Dunstaple.","re:^15th/TINPROM?$"),
"tinctoris-eff":("Johannes Tinctoris","Complexus effectuum musices",1475,"c. 1475","Naples","Twenty effects of music, from pleasing God to healing the sick; dedicated to Beatrice of Aragon.","re:^15th/TINCOM\\d?$"),
"tinctoris-exp":("Johannes Tinctoris","Expositio manus",1472,"c. 1472","Naples","The Guidonian hand, its letters, syllables, hexachords and mutations, written for the young Johannes de Lotinis.","re:^15th/TIN(EM|EXP)$",'Tinctoris Expositio manus'),
"tinctoris-ton":("Johannes Tinctoris","Liber de natura et proprietate tonorum",1476,"1476","Naples","The eight tones in chant and polyphony, their mixture and commixture; dedicated to Ockeghem and Busnois.","re:^15th/TIN(LDN|NAT)$",'Tinctoris Liber de natura et proprietate tonorum'),
"tinctoris-not":("Johannes Tinctoris","Tractatus de notis et pausis",1474,"c. 1472–75","Naples","The note shapes and rests of mensural music; dedicated to Martin Hanard, papal singer and canon of Cambrai.","re:^15th/TIN(TDN|TRAN)$",'Tinctoris Tractatus de notis et pausis'),
"tinctoris-val":("Johannes Tinctoris","Tractatus de regulari valore notarum",1474,"c. 1472–75","Naples","Modus, tempus and prolation, and the regular value of each note under them.","re:^15th/TIN(TDR|TRAR)$",'Tinctoris De regulari valore notarum'),
"tinctoris-imp":("Johannes Tinctoris","Liber imperfectionum notarum musicalium",1474,"c. 1472–75","Naples","The rules of imperfection, written for the young Jacobus Frontin.","re:^15th/TIN(LIB|LIMP)$",'Tinctoris Liber imperfectionum notarum'),
"tinctoris-alt":("Johannes Tinctoris","Tractatus alterationum",1474,"c. 1472–75","Naples","Alteration in eight general rules; dedicated to Guillaume Guignant, first chaplain of the Duke of Milan.","re:^15th/TIN(TRAL|TRALT)$",'Tinctoris Tractatus alterationum'),
"tinctoris-pun":("Johannes Tinctoris","Scriptum super punctis musicalibus",1474,"c. 1472–75","Naples","The dots of division, augmentation and perfection.","re:^15th/TIN(TDP|TRAP)$",'Tinctoris Scriptum super punctis musicalibus'),
"tinctoris-inv":("Johannes Tinctoris","De inventione et usu musicae",1482,"c. 1481–83","Naples","A history of music, its singers and instruments, surviving only in extracts sent to Johannes Stokem; names Pietrobono and the blind Flemish viol players.","re:^15th/TININV\\d?$",'Tinctoris De inventione et usu musicae'),
})

# ---------------- Dance treatises of the 15th and 16th centuries
BRU = "https://www.diamm.ac.uk/sources/787/"
WORKS.update({
"domenico":("Domenico da Piacenza","De arte saltandi et choreas ducendi",1450,"c. 1450","Ferrara","The first Italian dance treatise: the four misure (bassadanza, quaternaria, saltarello, piva) and the balli of the master of Ferrara.","",'Domenico da Piacenza De arte saltandi'),
"brussels-bd":("Anonymous (court of Margaret of Austria)","Basses danses (Brussels, KBR, MS 9085)",1497,"c. 1495–1501","Burgundian Netherlands","Gold and silver on black parchment: an instruction in the basse danse and 58 dances, each a tenor in breves with its steps written beneath. Owned by Margaret of Austria.","",'Brussels basse danse manuscript 9085'),
"toulouze":("Michel Toulouze","L’art et instruction de bien dancer",1490,"c. 1490","Paris","The first printed dance book: almost the same instruction as the Brussels manuscript, with its own basse danse tenors.","",'Toulouze art et instruction de bien dancer'),
"copland":("Robert Copland","The maner of dauncynge of bace daunces",1521,"1521","London","An English version of the French basse danse instruction, printed at the end of Barcley's French grammar.","",'Copland maner of dauncynge of bace daunces'),
"arbeau":("Thoinot Arbeau (Jehan Tabourot)","Orchésographie",1589,"1589","Langres","A dialogue teaching the dances of the late 16th century – basse danse, pavane, galliard, branles, volte – with their tunes, the drum rhythms and a step tablature.","",'Arbeau Orchesographie'),
"caroso":("Fabritio Caroso","Il ballarino",1581,"1581","Venice","Rules and steps of the Italian court dance, with each ballo’s music in lute tablature.","",'Caroso Il ballarino'),
"negri":("Cesare Negri","Le gratie d’amore",1602,"1602","Milan","The Milanese dancing master’s treatise: steps, galliard variations and balli with their music in tablature and melody.","",'Negri Le gratie d amore'),
})

# (parent id, id, label, aliases, description)
NEW_NODES = [
("super-librum","rector","Leading the singers: the rector and his signs","rector chori, cantor, Vorsänger, signals, cheironomy, Leitung, organum purum",
  "Who leads improvised polyphony, and how: giving the pitches, the entries, the pauses and the corrections by hand and voice."),
("chant","chant-composition","Composing new chant","compositio cantus, new offices, modal unity, Neukomposition",
  "Rules for making new chant: keeping to the mode in which it began, and to the genre it belongs to."),
("imitation","enigmatic-canon","Enigmatic canons","canon enigmaticus, Rätselkanon, inscriptions, puzzle canons",
  "Canons written as riddles: a single line with a motto that tells, obscurely, how the other voices are to be derived."),
("dissonance-treatment","transitus","Transitus: passing notes in thoroughbass","transitus regularis, transitus irregularis, Durchgang, durchgehende Noten, quarta transiens, septima transiens, 7ma in transitu",
  "Notes that pass through without a chord of their own: on the virtually short part of the beat (regular), or on the long part with the chord anticipated (irregular)."),
("dissonance-treatment","theatrical-resolution","Theatrical resolutions of dissonance","Verwechselung der Harmonie, resolutio theatralis, anticipatio, retardatio, licentiae",
  "The freedoms of the operatic style: dissonances resolved in another voice, over another bass, anticipated or delayed."),
("harmony","circle-of-keys","The circle of keys","musicalischer Circul, Quintenzirkel, circle of fifths, Verwandtschaft der Tonarten, key relationships",
  "An order of all 24 major and minor keys by which one can modulate step by step to the nearest relatives."),
("musica-poetica","loci-topici","Invention from the loci topici","loci topici, inventio, Erfindung, antecedentia concomitantia consequentia, rhetoric",
  "Finding musical ideas by examining a text through the commonplaces of rhetoric."),
("continuo","manierlich","Embellished thoroughbass","manierlicher General-Bass, Manieren im Generalbass, Zierrathen, galant accompaniment",
  "Graces, passages, arpeggios and imitation added to the accompaniment, and when they are out of place."),
("ornamentation","redobles","Redobles and quiebros (Spain)","redoble, quiebro, glosa, Spanish keyboard ornaments, vihuela graces",
  "The trills and mordents of Spanish keyboard and vihuela players, and on which keys they belong."),
("performance","inegalite","Unequal notes (ayre, inégalité)","ayre, notes inégales, Inegalität, swing, dotted pairs, corcheas desiguales",
  "Playing written-equal notes in long–short (or short–long) pairs, as the 'good air' of the music."),
("performance","practising","How to practise","ejercicio, estudio, Üben, exercitium, practice routines",
  "Advice on daily practice: scales and fingering, learning works, transposing patterns into every key."),
("fantasia","tanido-a-concierto","Fantasia in four voices by paired duos (tañer a concierto)","tañer a concierto, fantasía a concierto, duo pairs, responsiones",
  "Santa María's method of improvising: the two lower and the two upper voices move as duos that answer each other with the same passo."),
("instruments","clavichord","Clavichord (monacordio)","monacordio, clavicordio, Clavichord, Klavichord, practice instrument",
  "The keyboard instrument on which players learned, with how to strike its keys and tune it."),
("counterpoint","varietas","Varietas and the avoidance of redictae","varietas, diversitas, redicta, repetition, Abwechslung, variety",
  "Variety as a rule of composition and of singing super librum, and the ban on repeating a figure, except in imitation of bells or trumpets."),
("counterpoint","genres","Genres: mass, motet, chanson","missa, motetum, cantilena, cantus magnus, mediocris, parvus, Gattungen, genera",
  "The kinds of composed music, defined by size, text and use."),
("modes","mode-mixture","Mixture and commixture of the modes","mixtio, commixtio, tonus mixtus, tonus commixtus, Modusmischung",
  "A melody that exceeds its mode's range into the neighbouring one (mixture) or uses another mode's species (commixture); and how to name the mode of a polyphonic work."),
("rhythm","mensuration","Mensuration: modus, tempus and prolation","modus maior, modus minor, tempus perfectum, prolatio maior, Mensur, mensuration signs",
  "The four levels of mensural organisation and the signs that show them."),
("improvisation","instrumental-improv-15","Improvising instrumentalists in the 15th century","Pietrobono, tenorista, leutum, viola, plectrum lute, Orbus, minstrels",
  "Lutenists and viol players who improvised a florid upper part over a tenor, or played several parts alone."),
("performance","dance","Dance and its music","Tanz, danza, danse, choreography, dancing master",
  "What the dance treatises say about the music: the tenors, the misure, and how steps and notes correspond."),
("dance","basse-danse-steps","Steps and measures of the basse danse","basse danse, pas simple, pas double, desmarche, branle, reprise, congé, grande mesure",
  "One step to each breve of the tenor; the large, middle and small measures."),
("dance","misure","Misure: bassadanza, quaternaria, saltarello, piva","misura, tempo, Domenico, Guglielmo, Cornazano, proportions in dance",
  "The four Italian dance measures, related as proportions of one another, and how a ballo changes from one to another."),
("dance","dance-tunes-16","Dance tunes of the 16th century","pavane, galliard, branle, volte, tourdion, Arbeau, Caroso, Negri",
  "The newer dances and the tunes printed with them, from Arbeau to Caroso and Negri."),
("instruments","harp","Harp","arpa, Harfe, harpe, arpa de dos órdenes, double harp",
  "Strings, tuning and the playing of chromatic notes on the harp."),
("tablature","intabulation","Intabulation","poner, cifrar, intavolatura, Intavolierung, arranging vocal works for keyboard and lute",
  "Setting vocal polyphony for keyboard, vihuela or lute, and why players should learn from it before playing their own music."),
]

# (node, work, note, [(where, text, link)])
ADD = [
# ---------------- Elias Salomo, Scientia artis musicae (1274), Gerbert, Scriptores III
("rector","elias","Ch. 30: the rector places each singer on his note, holds the others until the four voices sound, leads every entry and pause, and corrects quietly.",[
 ("Ch. XXX, GS III p. 57","Item notandum notabiliter, quod dato, quod essent aeque boni cantores quatuor, qui cantare debent, necesse est, quod regant se per unum.",TML),
 ("Ch. XXX, GS III p. 58","Item notandum, quod in omnibus punctis illum Rectorem quasi primum incipere permittere debent. Item notandum, quod ipse debet eos regere in omnibus pausis, et post pausas incipere debet, qualemcumque ipse cantaverit vocem.",TML),
 ("Ch. XXX, GS III p. 58","… ponet omnes ordinatim in suas voces, et faciet eis pausas cum manu sua super librum honeste dissyllabando. Sed si quisquam parum aut minus rigide sonabit, aut posuerit vanos punctos, tunc dicet ad aurem cuiuslibet honeste: parum sonas, minus sonas, nimis rigide cantas, nimis figuraliter ponis punctos.",TML)]),
("super-librum","elias","Ch. 30, 'de notitia cantandi in quatuor voces': four singers over the chant, the voices a fifth, a fourth and a fifth apart; never more than four.",[
 ("Ch. XXX, GS III p. 59","Et est sciendum, quod secunda vox differt a prima per quinque punctos, tertia a secunda differt quatuor punctos, quarta a tertia quinque.",TML),
 ("Ch. XXX, GS III p. 58","… non possunt nec debent esse illi ultra quatuor, qui cantant aliquomodo, quin cedat ad confusionem et deturpationem totius cantus, qui cantatur; nec debet dici cantus quatuor, sed dirisio plurimorum.",TML),
 ("Ch. XXX, GS III p. 60","Tertia cum prima resonat, quia capit in ima, / Dat modulos quarta mediante voce secunda.",TML)]),
("hand","elias","Ch. 7: the 'palma' contains all knowledge of music; the left hand is imagined, the right gives the pauses.",[
 ("Ch. VII, GS III p. 23","Palma est clavis, figura, sive instrumentum continens omnimodam notitiam artis musicae, seu omnium, quae recte cantari possunt, manifestationem, sine cuius notitia scientia nulla; nec alias cantor, sed ioculator seu iauglator reputatur.",TML),
 ("Ch. VII, GS III p. 24","Est et notandum, quod in figura ista debet poni imaginatio sinistrae manus; nam cum dextra facimus pausas, ostendimus punctos cum digito, et stilo, et aliquotiens volvimus librum.",TML)]),
("solmisation-debate","elias","Ch. 7: against the singers of Provence and Toulouse who sing letter names instead of ut re mi fa sol la.",[
 ("Ch. VII, GS III p. 23","Quare quidam Provinciales sive Tolosani utuntur litteris pro litteris, litteris pro punctis in palma? Respondeo: illud non est nisi abusus et corruptela.",TML)]),
("gamut","elias","Ch. 1: seven letters, like the seven gifts of the Holy Spirit.",[
 ("Ch. I, GS III p. 18","Sciendum est, quod ars musicae septenario numero litterarum contenta est A. B. C. D. E. F. G. adinstar et similitudinem, quia sunt septem dona spiritus sancti.",TML)]),
("tonary","elias","Chs. 13–27: the 'seculorum' (psalm-tone endings) of each tone and which chants each one governs.",[
 ("Ch. XXIII, GS III p. 48","Regula. Omne seculorum quarti toni finiens in G. regit omnem cantum eiusdem toni incipientem in G.",TML)]),
("neumes","elias","Ch. 28: chant must be written on lines, with the clef on the line of the mode's 'regula'.",[
 ("Ch. XXVIII, GS III p. 55","Nam cantus sine competentibus lineis non potest bene ordinari, neque poni aequis gradibus in libro.",TML),
 ("Ch. XXVIII, GS III p. 55","Quare in cantu, qui ascendit quinque vel sex lineas, omnes non ponuntur in libro? Respondeo: omittitur fortassis propter avaritiam pergameni vel desidiam notatoris.",TML)]),
("chant-composition","elias","Ch. 29: a new chant keeps the nature of the tone in which it began, and the seven genres of chant are not to be mixed.",[
 ("Ch. XXIX, GS III p. 57","… de quocumque octo tonorum cantus aliquis inchoatus fuerit ad edendum, illius toni naturam servare debet, cuius exordium sumsit.",TML)]),
("chant-singing","elias","Prologue and ch. 30: against singing chant in the manner of organum; begin at a moderate pitch, sing slowly, pause and resume together.",[
 ("Prooemium, GS III p. 17","… cantum planum, et bene ordinatum per angelos … deridendo, assumendo aliquoties naturam cantus scientiae organizandi … anticipando, festinando, retardando, et male copulando punctos.",TML),
 ("Ch. XXX, GS III p. 59","Item quod tractim et pausatim cantetur. Item quod unus expectet alium. Item quod ab omnibus quasi simul fiat pausa et resumtio cantus.",TML)]),
("national-styles","elias","Ch. 30: the French raise their voices well; the Lombards howl like wolves; the canons of Lyon shout.",[
 ("Ch. XXX, GS III p. 60","… non tamen cantus Lombardorum, qui ululant ad modum luporum.",TML),
 ("Ch. XXX, GS III p. 59","… et tunc illorum iudicio plus laudatur, qui maiori clangore astra ferit, velut possent sanctos Angelos superius excitare.",TML)]),
("ficta","elias","Ch. 31, 'de doctrina falsae musicae': which notes may and may not be altered.",[
 ("Ch. XXXI, GS III p. 61","Item incidit in contagionem falsae musicae, quicumque plangit F. vel G. c. vel d. quae nullo modo debent neque patiuntur plangi.",TML),
 ("Ch. XXXI, GS III p. 61","Item alio modo contaminatur cantus, quando mollificatur E. quod nullo modo patitur mollificari.",TML)]),
("bowed","elias","Ch. 31: the ignorant singer sings a melody as if it were played on the vielle.",[
 ("Ch. XXXI, GS III p. 61","… habilitare vocem suam ad cantandum cantum, qui cum instrumento ligneo, cum viella optime cantaretur.",TML)]),

# ---------------- Bermudo, Declaración de instrumentos musicales (Osuna, 1555)
("musicus","bermudo","Book I, ch. 5: cantante, cantor and músico, after Boethius.",[
 ("Lib. I, cap. 5","El vso dela obra no engendra sciencia: y la especulacion dela Musica produze cognoscimiento: el qual cognoscimiento es Musica.",IA(BER,23))]),
("keyboard-technique","bermudo","Book IV, ch. 1: the hands, the fingering, and twenty years of study.",[
 ("Lib. IV, cap. 1","Lo principal que se requiere para ser vno tañedor: es la postura delas manos, con que dedos ha de subir, y con quales abaxar para con facilidad hazer los passos difficultosos, con quales dedos redoblar, y en que teclas.",IA(BER,136)),
 ("Lib. IV, cap. 1","No he visto hombre, que se pueda dezir tañedor: que no ha passado veynte años de continuo studio.",IA(BER,136))]),
("intabulation","bermudo","Book IV, ch. 1: the beginner intabulates villancicos of Vásquez, then Josquin, Willaert, Jachet, Figueroa, Morales and Gombert.",[
 ("Lib. IV, cap. 1","La Musica que aueys de poner: sea primero vnos villancicos del acertado musico Iuan vazques … Despues poned musica de Iosquin, de Adriano, de Iachet mantuano, del maestro Figueroa, de Morales, de Gomberth, y de algunos otros semejantes.",IA(BER,136))]),
("fantasia","bermudo","Book IV, ch. 1: no fantasía before one knows many works.",[
 ("Lib. IV, cap. 1","El auiso que do a los tañedores de vihuela es bueno para los de organo. Digo, que no tañessen fantesia hasta que supiessen muchas obras: y despues sacarian fantesia.",IA(BER,137))]),
("redobles","bermudo","Book IV, ch. 2: redobles of a tone and of a semitone, on the keys that belong to the mode.",[
 ("Lib. IV, cap. 2","Ay dos maneras de redobles en el arte de tañer monachordio: vnos son de tono, y otros de semitono. Mucho haze al caso saber si aueys de redoblar en tono, o en semitono.",IA(BER,137)),
 ("Lib. IV, cap. 2","Mirad luego las teclas cercanas al golpe, que son de essencia del modo que tañeys: y en las tales podeys redoblar.",IA(BER,137))]),
("dim-16","bermudo","Book IV, ch. 43: glosas only in one's own music, never in other men's works.",[
 ("Lib. IV, cap. 43","Si el tañedor fuere sufficiente para hechar glosas, porque es buen componedor: no las ponga en obras de otros. Haga Musica de su caudal, quite, y ponga quantos puntos quisiere: como en cosa de su casa. Permite se vn redoble, y tan dissimulado que a penas se sienta. El redoble es como cantor que haze de garganta.",IA(BER,186))]),
("alternatim","bermudo","Book IV, ch. 44: where the organist should end so that the choir can take up the pitch.",[
 ("Lib. IV, cap. 44","Sabiendo algunos tañedores, que hazia este libro: me importunaron a poner el canon, o regla: para el final delo que tañen respondiendo el choro. Lo mas difficultoso que ay en Musica (si no me engaño) es lo que piden: porque todos los organos no son yguales, y en todos los choros no cantan ygualmente.",IA(BER,186))]),
("enharmonic","bermudo","Book IV, ch. 47: the good players' raised notes form a new 'semichromatic' genus.",[
 ("Lib. IV, cap. 47","Quiso Dios, que componiendo vna poca de Musica en el genero chromatico: halle las clausulas delos sustentados y delos intensos, que ahora vsan los buenos tañedores. … halle infaliblemente, que tienen compuesto vn nueuo genero del diatonico y chromatico: el qual se puede llamar semichromatico.",IA(BER,189))]),
("harp","bermudo","Book IV, chs. 87–92: the harp, its strings and its tuning; how Ludovico made chromatic cadences.",[
 ("Lib. IV, cap. 88","Dizen, que el nombrado Ludouico quando venia a clausular: poniendo el dedo debaxo dela cuerda, la semitonaua, y hazia clausula de sustentado. Gran destreza y certidumbre era menester para esto.",IA(BER,237))]),
("lute","bermudo","Book II, chs. 31–32: vihuela and guitar tunings; the four-course guitar is a vihuela without its outer courses; five-course guitars seen in Spain.",[
 ("Lib. II","Este es el temple commun que en España se vsa: pero en cifras de Ytalia auemos visto otro. Suben la tercera cuerda vn semitono, quedandose todas las demas enel temple que estauan.",IA(BER,73)),
 ("Lib. II","No es otra cosa esta guitarra: sino vna vihuela quitada la sexta y la prima. … Este temple mas es para romances viejos, y Musica golpeada: que para Musica de el tiempo. … Guitarra auemos visto en España de cinco ordenes de cuerdas.",IA(BER,73))]),
("rules","bermudo","Book V: what counterpoint is; contrary motion in the perfect consonances.",[
 ("Lib. V","Dizese contrapunto (segun quiere Bucheo) quasi contrapuestas las bozes en vna concordancia concertada con arte aprouada. O quiere dezir contrapunto, yr vn punto contra otro.",IA(BER,273))]),
("parallels","bermudo","Book V: Morales on organists' hidden parallel octaves and fifths.",[
 ("Lib. V","Dixo me vna vez el egregio musico de buena memoria Christoual de morales. Si lo que hazen algunos tañedores de organo se sacasse en limpio: grandes faltas hallariamos. Y tuuo gran razon para dezirlo: porque pueden dar dos octauas y dos quintas, y no sentirse: como cantando se hallaria la tal falsedad.",IA(BER,273))]),

# ---------------- Cerone, El melopeo y maestro (Naples, 1613)
("vocal-production","cerone","Book I: how pupils should stand and look while singing.",[
 ("Lib. I, p. 69","Por esso los Maestros esten aduertidos de no permetir que sus dicipulos canten con la cabeça torcida, que bueluan los ojos, que no alcen y baxen con las figuras la cabeça, que tuerzan la boca, que miren à otras partes cantando à la mente, si no que tengan siempre los ojos sobre del libro.",IA(CER,84))]),
("alla-mente","cerone","Book IX: counterpoint over the chant must be known 'scientifically', not only sung by heart.",[
 ("Lib. IX","Y en particular ha de procurar de saber scientificamente adonde estan las especies consonantes en el Libro; porquanto el cantarlas à la mente y decoro, poco aprouecha.",IA(CER,590)),
 ("Lib. IX, cap. 29, p. 592","Contrapunto concertado llaman algunos, quando differentes partes hazen Contrapunto; y para ello, hara gran prouecho vsar delos passos largos generales, que puse de ambas diminuciones; diziendo la vna boz vn passo y la otra otro, que entre en differente especie.",IA(CER,606))]),
("improvised-canon","cerone","Book IX, ch. 28: the common way of making fugas over the plainchant.",[
 ("Lib. IX, cap. 28, p. 592","Modo comun de hazer las Fugas sobre Cantollano.",IA(CER,606))]),
("faburden","cerone","Book XII, ch. 14: in Spain psalms are sung only in fabordones.",[
 ("Lib. XII, cap. 14, p. 689","Aunque en estos Reynos de España, no es en vso el cantar los Salmos en Musica, si no à Fabordones, con todo esto (por quien gustare componerlos) no quiero dexar de dezir lo que conuiene obseruar en hazerlos.",IA(CER,703))]),
("parallels","cerone","Book XII, ch. 19: in frottolas and estrambotes consecutive fifths are allowed.",[
 ("Lib. XII, cap. 19","… haziendo cantar las partes con cantares vnisonados a modo de Fabordon. Aqui se concede el cantar inmediatamente con dos, tres o quatro Quintas (o con otras tantas Dozenas) seguidas.",IA(CER,707))]),
("enigmatic-canon","cerone","Book XXII: a whole book of musical enigmas 'to sharpen the wit'.",[
 ("Lib. XXII, title","Libro veyntidoseno, en el qual se ponen vnos enigmas musicales, y para sutilizar el ingenio.",IA(CER,1087))]),

# ---------------- Heinichen, Der General-Bass in der Composition (Dresden, 1728)
("transitus","heinichen-1728","Part I, ch. 4, §4: transitus regularis and irregularis, defined by virtually long and short notes.",[
 ("Teil I, Kap. 4, §. 4, S. 259","Es ist aber der Transitus zweyerley: regularis und irregularis. Der Transitus regularis ist, wenn die virtualiter lange Note zum Accorde richtig anschläget oder consoniret, die nechstfolgende virtualiter kurtze Note aber im durch passiren dissoniret … Transitus irregularis ist, wenn die virtualiter lange Note zum Accorde falsch anschläget, oder dissoniret, die darauff folgende virtualiter kurtze Note aber erst consoniret, oder mit dem vorgeschlagenen Accorde eintrifft.",IA(HEI,272)),
 ("Teil I, Kap. 4","… bald die 7ma in transitu, bald die 6te, bald der ordinaire Accord entstehet.",IA(HEI,278))]),
("theatrical-resolution","heinichen-1728","Part II, ch. 1: the theatrical style's exchanges of harmony, and the one rule that keeps them sound.",[
 ("Teil II, Kap. 1, §. 4, S. 587","Dergleichen Verwechselung der Stimmen, oder Verwechselung der Harmonie (nach der bekandten Arth zu reden) ist nun sonderlich nach Erfindung des Theatralischen Styli auf das höchste und gleichsam ad excessum getrieben worden.",IA(HEI,600)),
 ("Teil II, Kap. 1, §. 5, S. 587","Daß ordentlicher Weise kein, in Dissonantien bestehender Theatralischer Satz oder Gang vor richtig passiren könne, wo nicht zugleich eine legale Resolution der Dissonanz darauff erfolget, es geschehe nun solches vor oder nach der Verwechselung der Harmonie, in der obern, mittlern, oder untersten Stimme.",IA(HEI,600))]),
("circle-of-keys","heinichen-1728","Part II, ch. 5: the 'musicalischer Circul' of all 24 keys, found while studying with Kuhnau.",[
 ("Teil II, Kap. 5, §. 4","… daß nothwendig unter denen sämbtlichen Modis Musicis so eine natürliche, und ungezwungene Ordnung, und Anverwandschafft seyn müsse, durch welche man alle Modos Musicos gradatim, und gleichsam Stuffen-weise ohne Zwang des Gehöres durchwandern, und aus einer Cammer in die andere, vor und rückwerts gehen könne.",IA(HEI,857)),
 ("Teil II, Kap. 5, §. 5","Ich genosse nehmlich dazumahl in der Composition die Lehre des sonst berühmten Herrn Kuhnau, ehemahligen Directoris Chori Musici zu Leipzig …",IA(HEI,857))]),
("loci-topici","heinichen-1728","Einleitung: antecedentia, concomitantia and consequentia of the text.",[
 ("Einleitung","Unsere Gedancken aber auff gute Ideen zu leiten, und die natürliche Fantasie auffzumuntern, solches kan meines erachtens nicht besser geschehen, als durch die Oratorischen Locos Topicos. Man mag auch bey denen aller unfruchtbahresten Materien nur 3. fontes principales, nehmlich Antecedentia, Concomitantia, & Consequentia Textus nach denen Locis Topicis examiniren …",IA(HEI,41))]),
("manierlich","heinichen-1728","Part I, ch. 6: the embellished thoroughbass, for players already sure of the fundamentals.",[
 ("Teil I, Kap. 6, §. 1, S. 521","Einen manierlichen General-Bass zu spielen, erfodert viel Erfahrung, Discretion, und Judicium. … Der General-Bass ist ohne diß nicht deßwegen erdacht worden, daß man damit, wie in denen Præludiis concertiren, sondern nur denen concertirenden Stimmen accompagniren solle.",IA(HEI,534)),
 ("Teil I, Kap. 6, §. 4, S. 522","Die erste Classe mag in sich enthalten diejenigen kleinen Manieren, welche allzeit unveränderlich bleiben … und diese seynd (1) das Trillo, (2) der Transitus in die 3e, (3) der Vorschlag, (4) die Schleiffung, (5) die Mordente, und (6) die so genandte Acciaccatura. Die andere Classe hält in sich … (1) die Melodie, (2) die Passagien, und (3) die Harpeggiaturen oder gebrochene Sachen.",IA(HEI,535))]),
("acciaccatura","heinichen-1728","Part I, ch. 6, §4: the acciaccatura among the fixed graces of the thoroughbass.",[]),
("voicing","heinichen-1728","Part I, ch. 6: beginners should play full-voiced (4, 6, 8 and more parts), not 'colourful'.",[]),

# ---------------- Muffat, Regulae concentuum partiturae (1699)
("figured-bass","muffat","Every chord is a 'Grieff' or concentus; it begins with the concentus ordinarius.",[
 ("p. 1","Concentus ordinarius hat die Terz, Quint und Octav; die Terz füllet am meisten, die Quint füllet noch mehr als die Octav; die Terz ist fast die nothwendigste.",MUF)]),
("fourth","muffat","Six kinds of fourth, from the 'sweet' consonant fourth to the tritone.",[
 ("p. 6","Aus der Quart entstehen sechserley Grieff, nemblich 1ma quarta consonans, 2da quarta dissonans supersyncopata, 3tia quarta subsyncopata, 4ta quarta transiens, 5ta quarta irregularis oder Italica und 6ta Tritonus oder falsche Quart.",MUF),
 ("p. 6","Quarta consonans oder quarta suavis, die süße Quart, bedienet sich der Quart, der Sext und der Octav.",MUF),
 ("p. 16","Quarta Italica, die welsche oder irregular Quart, welche etwas seltzamer vorkombt, ist ein Grieff, in welchen, da der Baß sich beweget, in einer obern Stimme aber die Quart vor und nach fest haltet …",MUF)]),
("transitus","muffat","The passing fourth and seventh over a held bass.",[
 ("p. 14","Quarta transiens, die durchgehende Quart ist, welche auf ein stette Noten des Baß durchschleicht, also, daß vor und nach der Quart der Baß immer fort in einen Orth stehen bleibt. Zu und von der Quart soll niemahl gesprungen werden, sondern gradatim auf- und abgestiegen werden.",MUF),
 ("p. 30","Septima transiens, die durchgehende Sept, vor und nach welcher der Baß fest in einer Noten bleibet …",MUF)]),
("dissonance-treatment","muffat","Tied, struck and passing sevenths; every tied dissonance resolves downwards by step.",[
 ("p. 27","… erstlich Septima syncopata, die gebundene Sept. Andertens Septima pulsata, die geschlagene Sept. Drittens Septima transiens, die durchgehende Sept.",MUF),
 ("p. 28","Septima syncopata, die gebundene Sept, wird erkennt, da sich der Baß zu der Sept bewegt, hingegen die obere Stimm leichtlich in vorigen Grieff die Sept vorbereiten und binden kann, welche als dann in nachfolgenden Grieff jederzeit abwerts gradatim aufgelöst werden soll.",MUF)]),
("mi-contra-fa","muffat","The 'chromatic' chords, beginning with mi contra fa.",[
 ("p. 40","Von denen chromatischen Grieffen oder Concenten, und erstens von mi contra fa.",MUF)]),
("cadences","muffat","Cadentia major, minor and minima, named by the motion of the bass.",[
 ("p. 91","Cadentia major ist, in welcher der Baß quintweis herunter oder quartweis hinauf springt …",MUF),
 ("p. 91","Cadentia minima, wo der Baß staffelweis ab- oder aufsteigt oder unbeweglich bleibt.",MUF)]),
("german-17","muffat","Regulae concentuum partiturae (1699): the most systematic German thoroughbass manual of the century.",[]),

# ---------------- Tomás de Santa María, Arte de tañer fantasía (Valladolid, 1565)
("keyboard-technique","santamaria","Part I, chs. 13–18: the eight conditions of good playing, the hands, the striking of the keys and the fingers.",[
 ("Lib. I, fol. 36v","Las condiciones que assi adornan la musica, se reduzen a ocho. La primera es tañer a Compas. La segunda poner bien las manos. La tercera herir bien las teclas. La quarta tañer con limpieça y distinction. La quinta correr bien las manos a vna parte y a otra … La sesta herir con dedos co[n]uenientes. La septima, tañer con bue[n] ayre. La octaua, hazer buenos redobles y quiebros.",SM),
 ("Lib. I, fol. 39v","Quando con qualquiera de las dos manos se subieren o baxaren arreo, passos largos de Seminimas, o corcheas, los dedos con que se subieren o baxaren, tambien han de yr arreo, siguiendo se vno tras otro, sin dexar ningun intermedio.",SM)]),
("inegalite","santamaria","Part I, ch. 19: 'buen ayre': semiminims and quavers played long–short, in three manners.",[
 ("Lib. I, fol. 45v","Quanto al tañer con buen ayre … se advierta, que para esto se requiere tañer las Seminimas de vna manera, y las corcheas de tres. La manera que se ha de tener para tañer las Seminimas, es detenerse en la primera, y correr la segunda … lo qual se haze, como si la primera Seminima tuuiesse pu[n]tillo, y la segunda fuesse corchea … Y tengase auiso, que la Seminima q[ue] se corre, no ha de yr muy corrida, sino vn poco moderada.",SM),
 ("Lib. I, fol. 45v","De las tres maneras de las corcheas, las dos se hazen quasi de vna mesma manera, que es deteniendose en vna corchea, y corriendo otra. … Esta manera sirue para las obras que son todas de contrapunto, y para passos largos.",SM)]),
("redobles","santamaria","Part I, ch. 20: the new redobles and quiebros, better than the old ones; answered between the hands.",[
 ("Lib. I, fol. 48v","Estas maneras de Redobles y Quiebros … son muy nueuos y galanos, los quales causan ta[n]ta gracia y melodia en la musica, que la leuantan en tantos grados … que paresce otra cosa distincta de lo que se tañe sin ellos, y por tanto, con mucha razon se deue vsar siempre dellos, y no de los otros, por quanto son antiguos y no graciosos.",SM),
 ("Lib. I, fol. 51v","… es necessario q[ue] los Redobles y Quiebros de Minimas se hagan a vezes con las dos manos, esto es, vn redoble co[n] la vna mano, y otro quiebro con la otra, respondiendose a vezes desta manera.",SM)]),
("intabulation","santamaria","Part I, chs. 21–22: putting polyphony on the clavichord is the source of the whole art.",[
 ("Lib. I, fol. 52r","El poner obras de canto de Organo en el Monacordio, es el origen y fu[e]nte de donde nascen y proceden todos los frutos y prouechos, y todo el arte del tañer para los tañedores.",SM),
 ("Lib. I, fol. 57v","Para sacar prouecho de las obras, quando se pusieren cinco cosas, se han de notar. La primera, es entender de rayz la inuencion y artificio que lleuaren los passos, y assi mesmo la respon[n]sion de las bozes … en lo qual consiste el arte de la fantasia.",SM)]),
("tactus","santamaria","Part I: keep the compás with the foot.",[
 ("Lib. I, fol. 57v","Tres cosas son necessarias para sugetar presto qualquier obra … La primera es tañer a Compas, lleuandole siempre co[n] vna mesma ygualdad de tiempo … para lo qual es necessario lleuar el Compas con el pie, y assi tener gran cuenta con el medio Compas.",SM)]),
("tablature","santamaria","Part I: how vihuela tablature (cifra) works.",[
 ("Lib. I, fol. 57r","La manera que agora se vsa de poner las obras en la Vihuela, es por cifra, para lo qual, es de saber, que esta cifra, es la quenta del guarismo, en esta quenta, la, o, da a entender que hieran en vazio …",SM)]),
("lute","santamaria","Part I: the frets of the vihuela.",[
 ("Lib. I, fol. 56v","En el cuello de la Vihuela, las cuerdas que rodean este mesmo cuello, se llaman Trastes, los quales estan puestos por tal medida, que del primero al tercero ay Tono, y del primero al segundo ay Semitono.",SM)]),
("dim-16","santamaria","Part I, ch. 23: glosas taken from a table of figures for each interval.",[
 ("Lib. I, fol. 59v","Quando fuere menester glosar Seminimas, que subieren y baxaren areo, se han de tomar de las glosas de Semibreue, que se han puesto para subir y baxar quinta.",SM)]),
("fourth","santamaria","Part I: the diminished fourth and the tritone on the keyboard.",[
 ("Lib. I, fol. 27v","La quarta menor, q[ue] por otro nombre se llama Remisa, y es de mi, a fa … es Disonancia de fa, contra mi, y puede se subir y baxar arreo, mas no de salto, porque de salto es incantable, y lo que es incantable no se puede tañer.",SM)]),
("mi-contra-fa","santamaria","Part I: the tritone is forbidden so strictly that it even decides which key a trill may use.",[
 ("Lib. I, fol. 27r","La quarta mayor, que por otro nombre llaman Tritono, y es de mi, a fa, o de fa, a mi, se compone de tres tonos … es Disonancia de fa, contra mi, y no se puede dar con vna voz sola arreo, ni de salto.",SM)]),
("enharmonic","santamaria","Part I: the black keys as the chromatic 'order'.",[
 ("Lib. I, fol. 13v","A la orden alta accidental, llaman genero Chromatico (que quiere dezir) lo accidental, que muda color, y procede por semitonos accidentales in cantables y cantables.",SM)]),
("cadences","santamaria","Part I: every clausula is made with one or two dissonances, struck in syncopation.",[
 ("Lib. I, fol. 62v–63r","Para fundamento destas clausulas, se ha de notar por regla general, que todas las Clausulas se hazen con vna o dos Dissonancias, pero co[n] tal condicion, que tras la Dissonancia, luego se de Consonancia, la qual Consonancia salua la Dissonancia … Estas dissonancias no se hieren de golpe con el Tiple, sino en Sincopa.",SM)]),
("polyphonic-modes","santamaria","Part I: the accidental (transposed) tones and three ways of leaving the tone.",[
 ("Lib. I, fol. 70v–71r","De tres maneras se sale del tono. La primera es mudando se la sequencia de la Solfa natural en accidental, o la accidental en natural … La segunda manera, es haziendo Clausulas fuera del tono primero començado.",SM)]),
("whole-texture","santamaria","Part II, ch. 6: playing in consonances is four-voice playing, with outer and inner voices.",[
 ("Lib. II, cap. 6, fol. 12r","… se ha de notar que el comun tañer a consonancias, es a quatro vozes, lo qual encierra y contiene en si, el tañer a duo y a tres.",SM)]),
("tanido-a-concierto","santamaria","Part II, chs. 33–51: the lower and the upper duo answer each other with the same passo.",[
 ("Lib. II, cap. 35, fol. 72r","En este tañer a concierto, comunmente el contrabaxo y el tenor (que son las dos vozes baxas) van juntos y conbinados por si, y ni mas ni menos el contra alto y el tiple … De donde se sigue, que el arte de tañer a concierto, va fundado en vn duo a la parte inferior, y otro a la parte superior.",SM),
 ("Lib. II, cap. 37, fol. 83v","Es de saber, q[ue] en las responsiones de las dos vozes baxas a las dos vozes altas … por la mayor parte el contrabaxo y el contra alto se corresponden en octaua, y ni mas ni menos el tenor y el tiple.",SM)]),
("improvised-fugue","santamaria","Part II, ch. 33: fugas with the passos 'trabados' or 'sueltos'.",[
 ("Lib. II, cap. 33","Quanto a la otra manera de fuga, que se haze tañendo los passos sueltos … el remedio es tañer cada passo suelto, hazie[n]dole cada voz por si, siruiendo … de acompañamiento la voz que no hiziere el passo, a la otra voz que le hiziere.",SM)]),
("fantasia","santamaria","Part II: the aim of the book, the art of the fantasia.",[
 ("Lib. II, fol. 1v","Siguese agora, en esta segunda parte, cumplir del todo el principal intento que arriba diximos, que es enseñar el arte de la fantasia de la Musica, practica, para que en breue tiempo y con menos trabajo se pueda alcançar.",SM),
 ("Lib. II, cap. 51, fol. 120v","Ya q[ue] se ha tratado de todos los medios necessarios, que para tañer fantasia a co[n]cierto y por arte se requieren, resta ahora solame[n]te tratar del modo que se ha de tener para proceder en ella.",SM)]),
("practising","santamaria","Part I and Part II, ch. 52: practise with the passos you know, transpose them into every key, run the hands over the whole keyboard.",[
 ("Lib. I, fol. 58r","Para que los nueuos aprouechen en la fantasia, es necessario que se exerciten siempre con los mesmos passos que saben, para que con este vso hagan habito del arte … Assi mesmo es cosa muy prouechosa mudar vn mesmo passo, por todos los signos que se pudieren hazer.",SM),
 ("Lib. II, cap. 52, fol. 121r–v","… exercite se el nueuo tañedor, en correr las manos con dedos conuenientes, por todo el juego del monacordio, de abaxo arriba y de arriba abaxo … procure exercitarse, en mudar las obras por todos los signos acidentales que se pudieren tañer, y assi mesmo procure tomar dellas, los passos q[ue] fueren de solfa graciosa, y tenerlos en la memoria para despues tañer sobre ellos fantasia a concierto.",SM)]),
("clavichord","santamaria","Part II, ch. 53: how to tune the clavichord, beginning from C.",[
 ("Lib. II, cap. 53","Considerando la necessidad que los nueuos tienen, del instrumento bien te[m]plado, para que con mas aliuio pueda[n] lleuar el trabajo del estudio, me moui a poner aqui el modo que se ha de tener para templar el monacordio … entonces estara bien afinado el punto, qua[n]do las dos cuerdas del mesmo punto estuuieren en tan yguales en la entonacion, que suenen como si fuesse vna sola.",SM)]),

# ---------------- Tinctoris
("res-facta","tinctoris","Book II, ch. 20: written counterpoint is res facta, counterpoint made in the mind is sung super librum.",[
 ("Lib. II, cap. 20 (CSM 22/2, p. 107)","Contrapunctus qui scripto fit communiter res facta nominatur. At istum quem mentaliter conficimus absolute contrapunctum vocamus, et hunc qui faciunt super librum cantare vulgariter dicuntur. In hoc autem res facta a contrapuncto potissimum differt, quod omnes partes rei factae sive tres sive quatuor sive plures sint, sibi mutuo obligentur …",TT("TINCPT2"))]),
("super-librum","tinctoris","Book II, ch. 20: when several sing super librum, each need only agree with the tenor; but it is praiseworthy if they agree among themselves.",[
 ("Lib. II, cap. 20 (CSM 22/2, p. 110)","… duobus aut tribus, quatuor aut pluribus super librum concinentibus alter alteri non subiicitur. Enimvero cuilibet eorum circa ea, quae ad legem ordinationemque concordantiarum pertinent, tenori consonare sufficit. Non tamen vituperabile immo plurimum laudabile censeo si concinentes similitudinem assumptionis ordinationisque concordantiarum inter se prudenter cantaverint. Sic enim concentum eorum multo repletiorem suavioremque efficient.",TT("TINCPT2"))]),
("history-in-treatises","tinctoris","Prologue: nothing written more than forty years ago is worth hearing.",[
 ("Prologus (CSM 22/2, p. 12)","Neque quod satis admirari nequeo quippiam compositum nisi citra annos quadraginta extat quod auditu dignum ab eruditis existimetur. Hac vero tempestate … infiniti florent compositores, ut Johannes Okeghem, Johannes Regis, Anthonius Busnois, Firminus Caron, Guillermus Faugues …",TT("TINCPT1"))]),
("rules","tinctoris","Book I, ch. 1: what counterpoint is; Book III, ch. 1: begin and end on a perfect concord.",[
 ("Lib. I, cap. 1 (CSM 22/2, p. 14)","Contrapunctus itaque est moderatus ac rationabilis concentus per positionem unius vocis contra aliam effectus, diciturque contrapunctus a contra et punctus, eo quod una nota contra aliam posita tamquam uno puncto contra alium constituatur.",TT("TINCPT1")),
 ("Lib. III, cap. 1 (CSM 22/2, p. 146)","… omnis contrapunctus per concordantiam perfectam et incipere et finire debet.",TT("TINCPT3"))]),
("parallels","tinctoris","Book III, ch. 2: move with the tenor by imperfect, not by perfect concords of the same kind.",[
 ("Lib. III, cap. 2 (CSM 22/2, p. 147)","Secunda regula est quod per concordantias imperfectas non autem perfectas eiusdem speciei cum tenore ascendere descendereque debemus …",TT("TINCPT3"))]),
("approach","tinctoris","Book III, ch. 4: counterpoint as close to the tenor as possible – except for singers super librum, who may go further to vary it.",[
 ("Lib. III, cap. 4 (CSM 22/2, p. 149)","Quarta regula est quod quam proximus et quam ordinatissimus poterit contrapunctus fieri debebit … Sed ab hac regula eximuntur, qui magis contrapuncto dulciori ac venustiori student quam propinquiori. Quique pluribus super librum canentibus ut contrapunctum diversificent, eum cum moderatione instar quodammodo compositorum longinquum efficiunt.",TT("TINCPT3"))]),
("dissonance-treatment","tinctoris","Book II, chs. 23–31: no discords in simple counterpoint; in diminished counterpoint only small ones, on the weaker parts or in syncopation, as ornaments.",[
 ("Lib. II, cap. 23 (CSM 22/2, p. 121)","In ipso autem simplici contrapuncto discordantiae simpliciter et absolute prohibentur, sed in diminuto cum ratione moderata interdum permittuntur.",TT("TINCPT2")),
 ("Lib. II, cap. 30 (CSM 22/2, p. 139–140)","Et nonnulli sunt qui talis integrae discordantiae admissionem probant, eo quod concordantia immediate sequens suavior appareat … O firmissima ratio! Num quid vitium aliquod ab homine praedicto virtute committendum est, quo virtus eius clarius enitescat?",TT("TINCPT2")),
 ("Lib. II, cap. 31 (CSM 22/2, p. 140)","Verumtamen … discordantiae parvae a musicis, sicut figurae rationabiles a grammaticis ornatus necessitatisve causa assumi permittuntur. Ornatur enim cantus, quando fit ascensus vel descensus ab una concordantia ad aliam per media compatibilia et per syncopas quae interdum sine discordantiis fieri non possunt.",TT("TINCPT2"))]),
("varietas","tinctoris","Book III, chs. 6 and 8: avoid redictae; seek variety in everything.",[
 ("Lib. III, cap. 6 (CSM 22/2, p. 152)","Sexta regula est quod super cantum planum canentes in quantum possumus redictas evitare debemus maxime si aliquae fuerint in tenore … Et quamvis ex omni parte in re facta regulariter etiam prohibeantur, aliquando tamen sonum campanarum aut tubarum imitando, ubique tollerantur.",TT("TINCPT3")),
 ("Lib. III, cap. 8 (CSM 22/2, p. 155)","Octava siquidem et ultima regula haec est quod in omni contrapuncto varietas accuratissime exquirenda est, nam, ut Horatius in sua Poetica dicit, \"Cytharedus ridetur corda si semper oberrat eadem.\"",TT("TINCPT3")),
 ("Lib. III, cap. 8 (CSM 22/2, p. 155)","Hanc autem diversitatem optimi quisque ingenii compositor aut concentor efficiet, si nunc per unam quantitatem, nunc per aliam, nunc per unam perfectionem … nunc cum syncopis, nunc sine syncopis, nunc cum fugis, nunc sine fugis, nunc cum pausis, nunc sine pausis, nunc diminutive, nunc plane …",TT("TINCPT3"))]),
("practising","tinctoris","Book III, ch. 9: only constant practice in composing and in singing super librum makes a musician, and it must begin in childhood.",[
 ("Lib. III, cap. 9 (CSM 22/2, p. 156)","Siquidem assiduitas sola et unica est quae post vocum, notarum, quantitatum atque concordantiarum generalem quandam cognitionem … numerosos cantores et eos praecipue quos superius expressi compositores praestatissimos ac celeberrimos effecit. … neminem prorsus cognovi qui si a vicesimo anno aetatis eius aut supra sive componere sive super librum canere inceperit, eminentem …",TT("TINCPT3"))]),
("contrapunctus-diminutus","tinctoris-dif","Diffinitorium: diminished counterpoint, 'which some call florid'.",[
 ("CS IV, p. 180","Contrapunctus diminutus est dum plures notae contra unam per proportionem aequalitatis aut inaequalitatis ponuntur, qui a quibusdam floridus nominatur.",TT("TINDIF")),
 ("CS IV, p. 182","Diminutio est alicujus grossi cantus in minutum redactio.",TT("TINDIF"))]),
("imitation","tinctoris-dif","Diffinitorium: fuga.",[
 ("CS IV, p. 184","Fuga est identitas partium cantus quo ad valorem, nomen, formam, et interdum quo ad locum notarum et pausarum suarum.",TT("TINDIF"))]),
("genres","tinctoris-dif","Diffinitorium: cantus magnus, mediocris and parvus – mass, motet and cantilena.",[
 ("CS IV, p. 185","Missa est cantus magnus cui verba Kyrie, et In terra, Patrem, Sanctus et Agnus, et interdum caeterae partes a pluribus canendae supponuntur, quae ab aliis officium dicitur.",TT("TINDIF")),
 ("CS IV, p. 185","Motetum est cantus mediocris cui verba cujusvis materiae, sed frequentius divinae supponuntur.",TT("TINDIF")),
 ("CS IV, p. 179","Cantilena est cantus parvus cui verba cujuslibet materiae sed frequentius amatoriae supponuntur.",TT("TINDIF"))]),
("voice-functions","tinctoris-dif","Diffinitorium: tenor, contratenor and supremum.",[
 ("CS IV, p. 189","Tenor est cujusque cantus compositi fundamentum relationis.",TT("TINDIF")),
 ("CS IV, p. 180","Contratenor est pars illa cantus compositi quae principaliter contra tenorem facta inferior est supremo, altior autem aut aequalis aut etiam ipso tenore inferior.",TT("TINDIF")),
 ("CS IV, p. 189","Supremum est pars cantus compositi altitudine caeteras excedens.",TT("TINDIF"))]),
("cadences","tinctoris-dif","Diffinitorium: the clausula.",[
 ("CS IV, p. 180","Clausula est cujuslibet partis cantus particula in fine cujus vel quies generalis vel perfectio reperitur.",TT("TINDIF"))]),
("ligatures","tinctoris-dif","Diffinitorium: the ligature.",[
 ("CS IV, p. 185","Ligatura est duarum aut plurium notarum ad invicem continua junctura.",TT("TINDIF"))]),
("hand","tinctoris-exp","Expositio manus, ch. 1: why the doctrine is called a 'hand'.",[
 ("Cap. 1 (CS IV, p. 1)","Manus est brevis et utilis doctrina ostendens compendiose qualitates vocum musicae. Dicitur autem hic manus ut continens pro contento; namque manus quaelibet … doctrinam istam continet suorum digitorum summitatibus et juncturis.",TT("TINEXP"))]),
("hexachords","tinctoris-exp","Expositio manus: the deductions (hexachords) and their properties.",[]),
("mutation","tinctoris-exp","Expositio manus: the mutations.",[]),
("history-in-treatises","tinctoris-ton","Dedicated to Ockeghem, first chaplain of the King of France, and Busnois, singer of the Duke of Burgundy.",[
 ("Prologus (CS IV, p. 16)","Praestantissimis ac celeberrimis artis musicae professoribus Domino Johanni Okeghem, christianissimi regis Francorum Protho-capellano ac Magistro Antonio Busnois, illustrissimi Burgondorum ducis cantori …",TT("TINNAT"))]),
("mode-mixture","tinctoris-ton","Chs. 13–25: commixture and mixture of the tones, in chant and in polyphony.",[
 ("Cap. 13 (CS IV, p. 24)","Si vero aliquis octo tonorum praedictorum a principio usque ad finem ex speciebus diapenthe ac diatessaron sibi … attributis non fuerit formatus, immo speciebus unus alterius aut plurium commiscatur hujusmodi tonus commixtus vocabitur …",TT("TINNAT")),
 ("Cap. 24 (CS IV, p. 29)","Denique notandum est quod commixtio et mixtio tonorum non solum fiunt in simplici cantu, verum etiam in composito, tali que modo ut si cantus sit cum duabus, tribus, quatuor aut pluribus partibus compositus, una pars erit unius toni altera alterius …",TT("TINNAT"))]),
("polyphonic-modes","tinctoris-ton","Ch. 24: the mode of a polyphonic work is the mode of its tenor – 'Le Serviteur' as example.",[
 ("Cap. 24 (CS IV, p. 29)","… si quis peteret absolute cujus toni talis compositio esset, interrogatus, debet absolute respondere secundum qualitatem tenoris eo quod omnis compositionis sit pars principalis et fundamentum totius relationis … Verbi gratia si quis universaliter mihi diceret: Tinctoris, peto abs te cujus toni sit carmen \"Le Serviteur\", responderem universaliter primi toni irregularis, quoniam tenor pars principalis ipsius carminis sit hujusmodi toni.",TT("TINNAT"))]),
("mi-contra-fa","tinctoris-ton","Ch. 10: in polyphony a tritone may be needed, and the square b then shows where mi must be sung.",[
 ("CS IV, p. 22","Non tamen ignorandum est quod in cantu composito a fa contra mi in concordantia perfecta fiat interdum tritono uti necessarium sit, et tunc ad significandum ubi fa evitandi tritoni gratia cantari deberet ibi mi esse canendum, duri signum hoc est quadrum ipsi mi censeo praeponendum.",TT("TINNAT"))]),
("eight","tinctoris-ton","The eight tones, their species of fifth and fourth, ambitus and finals.",[]),
("ethos","tinctoris-ton","Ch. 1: Aristotle's harmonies – Mixolydian plaintive, Lydian relaxed, Phrygian severe, Dorian moderate.",[]),
("national-styles","tinctoris-prop","Prologue: the English 'jubilate', the French 'sing'; the English keep repeating the same composition.",[
 ("Prohemium (CS IV, p. 154)","… novae artis fons et origo, apud Anglicos quorum caput Dunstaple exstitit, fuisse perhibetur, et huic contemporanei fuerunt in Gallia Dufay et Binchois quibus immediate successerunt moderni Okeghem, Busnois, Regis et Caron … Illi etenim in dies novos cantus novissime inveniunt, ac isti (quod miserrimi signum est ingenii) una semper et eadem compositione utuntur.",TT("TINPRO"))]),
("effects","tinctoris-eff","The twenty effects listed in the prologue.",[
 ("Prologus (p. 165–166)","Deum delectare, Dei laudes decorare, Gaudia beatorum amplificare, Ecclesiam militantem triumphanti assimilare, … Tristitiam depellere, Duritiam cordis resolvere, Diabolum fugare, Extasim causare, … Aegrotos sanare, Labores temperare, Animos ad praelium incitare, Amorem allicere, Iocunditatem convivii augmentare, Peritos in ea glorificare, Animas beatificare.",TT("TINCOM"))]),
("franconian","tinctoris-not","De notis et pausis: notes of certain and of uncertain value.",[
 ("Cap. 1 (CS IV, p. 41)","Nota est signum vocis certi vel incerti valoris. … aliae sunt certo valore ac regulari limitate secundum quantitates quibus supponuntur … et talibus in cantu figurato solum utimur; aliae pro voluntate canentium, nunc majoris nunc minoris valoris efficiuntur …",TT("TINTRAN"))]),
("mensuration","tinctoris-val","De regulari valore notarum: modus maior and minor, tempus and prolation, each containing the smaller.",[
 ("CS IV, p. 47","Sed ubi modus major ibi et minor, ubi modus minor ibi et tempus, ubi tempus ibi et prolatio, quoniam majori semper quantitati minorem inesse necesse est.",TT("TINTRAR"))]),
("ars-nova","tinctoris-val","The four quantities of mensural music.",[]),
("imperfection","tinctoris-alt","Tractatus alterationum; with the Liber imperfectionum and the Scriptum super punctis, Tinctoris' three treatises on the finer points of perfect mensuration.",[
 ("Tractatus alterationum (CS IV, p. 67)","Alteratio est proprii valoris alicujus notae duplicatio. Notam etenim alterari nihil aliud est quam cum suo proprio valoris alterius similis effici.",TT("TINTRALT"))]),
("imperfection","tinctoris-pun","Scriptum super punctis: three kinds of dot.",[
 ("Cap. 1 (CS IV, p. 70)","Punctus est minimum signum quod notae appositum eam dividit, aut augmentat aut perficit. Triplex igitur est punctus notae accidens, videlicet punctus divisionis, punctus augmentationis et punctus perfectionis.",TT("TINTRAP"))]),
("imperfection","tinctoris-imp","Liber imperfectionum: the rules of imperfection, for Jacobus Frontin.",[]),
("instrumental-improv-15","tinctoris-inv","Book IV, ch. 5: lutenists who improvise the upper part of any song; Pietrobono; the blind Flemish brothers on the viol.",[
 ("Lib. IV, cap. 5 (Weinmann, p. 45)","Usus autem ipsius lyrae quam leutum vulgo nuncupari prediximus: festis: choreis: et conviviis: privatisque recreationibus apud nos inservit. In qua plurimi precipue germani eximie sunt eruditi. Siquidem: nonnulli associati: supremam partem cujusvis compositi cantus: cum admirandis modulorum superinventionibus: adeo eleganter ea personant: ut profecto nihil prestantius. Inter quos: Petrus bonus Herculis Ferrarie ducis incliti lyricen (mea quidem sententia) ceteris est preferendus.",TT("TININV")),
 ("Lib. IV, cap. 5 (Weinmann, p. 45)","… duos fratres Orbos natione Flamingos … quorum uni Carolus: alteri Johannes nomina sunt. Brugis audiverim: illum supremam partem et hunc tenorem plurium cantilenarum: tam perite: tamque venuste hujusmodi viola consonantes: ut in ulla nunquam melodia: me profecto magis oblectaverim.",TT("TININV"))]),
("lute","tinctoris-inv","Book IV, chs. 4–5: the lute and the instruments derived from it; players who play three and four parts alone.",[
 ("Lib. IV, cap. 5 (Weinmann, p. 45)","Alii (quod multo difficilius est) soli: cantus non modo duarum partium: verum etiam trium et quatuor: artificiosissime promunt. Ut Orbus ille germanus: ac Henricus Carolo Burgundionum duci fortissimo nuper serviens.",TT("TININV")),
 ("Lib. IV, cap. 4 (p. 270)","… quinque et aliquando sex principalium ordinatio ea subtilitate a posteris (ut reor) Germanis inventa est: ut duabus mediis ad ditonum: ceteris vero ad diatessaron temperatis: lyra sit perfectissima.",TT("TININV4"))]),
("bowed","tinctoris-inv","Book IV, ch. 5: the viola with and without the bow, the rebec; Tinctoris' own favourite instruments.",[
 ("Lib. IV, cap. 5 (Weinmann, p. 45)","Viola vero cum arculo: non solum ad hunc usum: sed etiam ad historiarum recitationem in plerisque partibus orbis assumitur.",TT("TININV"))]),
("voice-functions","tinctoris-inv","Book II: tenoristae, contratenoristae (bassi and alti) and supremi.",[
 ("Lib. II (Weinmann, p. 33)","Enimvero: alii dicuntur tenoriste: alii contratenoriste: et alii supremi. Preterea: tenoristarum et contratenoristarum alii sunt imi hoc est vulgo bassi: et alii alti.",TT("TININV"))]),

# ---------------- dance
("basse-danse-steps","brussels-bd","The instruction: three measures; each step fills one note of the tenor.",[
 ("Instruction (transcription in The Letter of Dance 2)","Et si est a savore que deux pas simples; ung pas doubles done desmarche et ung branle occoupent autant de temp lun comme lautre. Cest a dire que chascun deulz doibt occuper une note de basse danse entiere …","https://www.pbm.com/~lindahl/lod/vol2/trans_brussels.html"),
 ("Instruction (transcription in The Letter of Dance 2)","Note que toute basse danse se commenche par desmarche et se finne par branle et se nomme basse danse pour ce que on la joue selon maier par fait et pour ce que quant en la danse on va on paix sans soy demener le plus gracieusement que on peult.","https://www.pbm.com/~lindahl/lod/vol2/trans_brussels.html")]),
("bassadanza","brussels-bd","58 tenors in black breves, the steps written beneath each note; the tenors are now in the Cantare library.",[]),
("basse-danse-steps","toulouze","Almost the same instruction as the Brussels manuscript, with a key to the step letters.",[]),
("bassadanza","toulouze","Its own basse danse tenors, among them 'Castille la nouvelle' (La Spagna).",[]),
("basse-danse-steps","copland","The English version of the basse danse instruction (1521).",[]),
("misure","domenico","The four misure – bassadanza, quaternaria, saltarello, piva – each faster than the last.",[]),
("misure","cornazano","The misure and the tenors of the bassadanza, among them Re di Spagna.",[]),
("misure","guglielmo","The six 'requisites' of the dancer, among them misura; balli changing their misura.",[]),
("bassadanza","domenico","Bassadanze and balli, the music largely not written down.",[]),
("dance-tunes-16","arbeau","The basse danse 'Jouissance vous donneray', pavanes, galliards and more than twenty branles, each tune with its drum rhythm.",[]),
("dance-tunes-16","caroso","Balli and cascarde with the music in Italian lute tablature.",[]),
("dance-tunes-16","negri","Galliard variations and balli with their music.",[]),
("dance","arbeau","Dance taught in a dialogue between the old canon Arbeau and his pupil Capriol.",[]),
]
