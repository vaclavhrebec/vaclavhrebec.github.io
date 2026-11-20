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
]
