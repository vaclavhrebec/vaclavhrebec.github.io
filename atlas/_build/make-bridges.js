#!/usr/bin/env node
/* Builds atlas/vault-bridges.js: the links from the Atlas of Musical Style to its sister projects.
     node atlas/_build/make-bridges.js
   Edit the three tables below, run the script, commit both files. The script stops with a list if an id does not exist
   (an element in the Atlas, a topic or treatise in Concordantia, a piece in the Cantare library). */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const slug = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---- the Atlas ---- */
const W = {}; global.window = W;
['vault.js', 'vault-renaissance.js', 'vault-baroque.js', 'vault-classical-romantic.js', 'vault-modern.js', 'vault-popular.js', 'vault-longue-duree.js',
  'vault-more.js', 'vault-continuo.js', 'vault-crosslinks.js', 'vault-voices.js', 'vault-composers.js', 'vault-works.js', 'vault-treatises.js', 'vault-sources.js', 'vault-forces.js']
  .forEach(f => new Function('window', fs.readFileSync(path.join(ROOT, 'atlas', f), 'utf8'))(W));
const V = W.VAULT, EL = new Set(V.elements.map(e => e.id)), TR = new Set(V.treatises.map(t => t.id));

/* ---- Concordantia ---- */
const tree = new Function(fs.readFileSync(path.join(ROOT, 'concordantia', 'tree.js'), 'utf8') + ';return {TREE,WORKS};')();
const TOPIC = {}; (function w(a) { a.forEach(t => { TOPIC[t.id] = t.l; w(t.c || []); }); })(tree.TREE);
const WORKS = tree.WORKS;

/* ---- Cantare ---- */
const lib = JSON.parse(fs.readFileSync(path.join(ROOT, 'gym/cantare/data/library.json'), 'utf8'));
const LIBSLUG = new Set(); (function w(n) { if (Array.isArray(n)) n.forEach(w); else if (n && n.group) { (n.items || []).forEach(w); (n.subs || []).forEach(w); } else if (n && n.title) LIBSLUG.add(slug(n.title)); })(lib);
const JRP = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'gym/cantare/jrp/search.json'), 'utf8')).map(x => x[0]));
const OWN = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'gym/cantare/data/atlas-examples.json'), 'utf8')).map(x => x.id));

/* ===================================================================== TABLE 1: Atlas element -> Concordantia topics */
const TOPICS = {
  'plainchant': ['chant', 'chant-singing'], 'neumes': ['neumes'], 'staff': ['neumes', 'gamut'],
  'hexachord': ['hexachords', 'solmisation', 'mutation', 'hand'], 'church-modes': ['eight', 'finals', 'interval-species', 'tonary'],
  'musica-ficta': ['ficta', 'necessitas', 'mi-contra-fa'], 'pythagorean': ['pythagorean', 'monochord'], 'meantone': ['meantone'],
  'well-temperament': ['well'], 'greek-genera': ['greek-tonoi', 'enharmonic'], 'enharmonic-revival': ['enharmonic', 'five-parts'],
  'pitch-standard': ['pitch-standard'], 'rhythmic-modes': ['rhythmic-modes'], 'franconian-notation': ['franconian'],
  'ars-nova-notation': ['ars-nova', 'mensuration'], 'ars-subtilior': ['mensuration', 'proportions'], 'white-notation': ['mensuration', 'coloration'],
  'tactus': ['tactus'], 'hemiola': ['proportions'], 'keyboard-tablature': ['tablature'], 'intabulation': ['intabulation'],
  'parallel-organum': ['parallel-organum'], 'free-organum': ['free-organum', 'guidonian-organum'], 'florid-organum': ['organum', 'notre-dame'],
  'three-voice': ['whole-texture'], 'four-voice': ['whole-texture'], 'contratenor-bassus': ['voice-functions'],
  'fauxbourdon': ['faburden'], 'english-faburden': ['faburden'], 'gymel': ['faburden'], 'english-discant': ['discant-treatises'],
  'discant': ['discant-treatises', 'notre-dame'], 'discant-clausula': ['discant-treatises', 'notre-dame'],
  'canon': ['imitation', 'improvised-canon', 'enigmatic-canon'], 'mensuration-canon': ['enigmatic-canon', 'mensuration'],
  'isorhythm': ['isorhythm'], 'voice-exchange': ['invertible'], 'super-librum': ['super-librum', 'res-facta', 'alla-mente'],
  'sortisatio': ['sortisatio'], 'rector-improvisation': ['rector'], 'diminution': ['diminution', 'dim-15', 'dim-16', 'contrapunctus-diminutus'],
  'glosas': ['dim-16', 'division-ground'], 'redobles': ['redobles'],
  'suspension': ['dissonance-treatment'], 'regulated-dissonance': ['consonance', 'dissonance-treatment'], 'cambiata': ['dissonance-treatment'],
  'transitus': ['transitus', 'dissonance-treatment'], 'transitus-irregularis': ['transitus'], 'theatrical-resolution': ['theatrical-resolution'],
  'varietas': ['varietas'], 'pervasive-imitation': ['imitation'], 'paired-imitation': ['imitation'], 'fugue': ['imitation', 'improvised-fugue'],
  'rule-of-octave': ['octave-rule'], 'basso-continuo': ['continuo', 'continuo-early', 'figured-bass'], 'partimento': ['partimento'],
  'notes-inegales': ['inegalite'], 'agrements': ['french-agrements'], 'alternatim': ['alternatim'],
  'basse-danse': ['basse-danse-steps', 'bassadanza', 'misure'], 'ground-bass': ['grounds', 'division-ground'], 'cadenza': ['cadenza'],
  'full-triad': ['triad'], 'word-painting': ['figures'], 'figurenlehre': ['figures'], 'affekt': ['affects'],
  'seconda-pratica': ['pratiche'], 'stile-antico': ['pratiche'],
  'open-final': ['cadences'], 'double-leading-tone': ['cadences', 'ficta'], 'under-third-cadence': ['cadences'], 'octave-leap-cadence': ['cadences'],
  'bass-cadence': ['cadences'], 'picardy-third': ['cadences'], 'english-cadence': ['cadences'],
  'ricercar': ['fantasia'], 'toccata': ['preluding'], 'lute-song': ['lute'], 'lute-polyphony': ['lute'], 'plectrum-improvisation': ['lute'],
  'keyboard-paired-duos': ['tanido-a-concierto'], 'chant-restoration': ['chant-reform'], 'sequence-trope': ['hymnody'], 'cantus-fractus': ['chant-singing'],
  'real-parts': ['voicing'], 'sixth-chord-chains': ['parallel-tenths'], 'falsobordone': ['psalmody'],
  'hocket': ['isorhythm'], 'cantus-firmus': ['res-facta', 'voice-functions'], 'motet': ['genres'], 'cyclic-mass': ['genres'], 'parody-mass': ['genres'],
  'chorale': ['hymnody'], 'time-beater': ['tactus'], 'conductor': ['tactus']
};

/* ===================================================================== TABLE 2: Atlas element -> pieces to hear
   ref: jrp:<id> (Josquin Research Project and sister collections in the Cantare library) | lib:<slug of the title> | atlas:<id> (data/atlas-examples.json)
   Sing-along links need nothing more: every example opens in the Cantare player and has a link to the whole app. */
const EXAMPLES = {
  'parallel-organum': [{ ref: 'atlas:parallel-organum', label: 'Parallel organum at the fourth (constructed example)' }],
  'free-organum': [{ ref: 'atlas:free-organum', label: 'Free organum with occursus (constructed example)' }],
  'fauxbourdon': [{ ref: 'atlas:fauxbourdon', label: 'Fauxbourdon: parallel sixths (constructed example)' }],
  'plainchant': [{ ref: 'lib:ave-maris-stella', label: 'Ave maris stella, plainchant hymn' }],
  'hexachord': [{ ref: 'lib:hexachord-up-and-down', label: 'Hexachord up and down' }],
  'super-librum': [{ ref: 'lib:ave-maris-stella', label: 'Ave maris stella: a chant to sing against' }],
  'cantus-fractus': [{ ref: 'lib:conditor-alme-siderum-fractus', label: 'Conditor alme siderum, in cantus fractus' }],
  'chorale': [{ ref: 'lib:ein-feste-burg-ist-unser-gott-luther', label: 'Ein feste Burg ist unser Gott (Luther)' }],
  'ground-bass': [{ ref: 'lib:passamezzo-antico-ortiz-1553', label: 'Passamezzo antico (Ortiz, 1553)' }],
  'basse-danse': [{ ref: 'lib:la-spagna-anonymous-basse-danse', label: 'La Spagna: a basse danse tenor' }],
  'franconian-notation': [{ ref: 'jrp:MP_322', label: 'Mariae assumptio / Huius chori / Tenor (Montpellier Codex)' }],
  'rhythmic-modes': [{ ref: 'jrp:MP_322', label: 'Mariae assumptio / Huius chori / Tenor (Montpellier Codex)' }],
  'motet': [{ ref: 'jrp:MP_322', label: 'Mariae assumptio / Huius chori / Tenor (Montpellier Codex)' }],
  'ars-nova-notation': [{ ref: 'jrp:MP_in_nova', label: 'Garrit gallus / In nova fert / Neuma (Roman de Fauvel)' }],
  'isorhythm': [{ ref: 'jrp:MP_hugo', label: 'Hugo, Hugo, princeps invidie (Ivrea Codex)' }, { ref: 'jrp:MP_in_arboris', label: 'Tuba sacre fidei / In arboris empiro (Ivrea Codex)' }],
  'formes-fixes': [{ ref: 'jrp:Duf3014', label: 'Resvellies vous et faites chiere lye (Du Fay, ballade)' }],
  'cyclic-mass': [{ ref: 'jrp:Duf1005a', label: 'Kyrie, Missa Se la face ay pale (Du Fay)' }],
  'cantus-firmus': [{ ref: 'jrp:Duf1004a', label: 'Kyrie, Missa L’homme armé (Du Fay)' }],
  'parody-mass': [{ ref: 'jrp:Jos0802a', label: 'Kyrie, Missa Fortuna desperata (Josquin)' }],
  'soggetto-cavato': [{ ref: 'jrp:Jos1101a', label: 'Kyrie, Missa Hercules dux Ferrarie (Josquin)' }],
  'mensuration-canon': [{ ref: 'jrp:Oke1011a', label: 'Kyrie, Missa Prolationum (Ockeghem)' }, { ref: 'jrp:Jos0603e', label: 'Agnus Dei, Missa L’homme armé super voces musicales (Josquin)' }],
  'canon': [{ ref: 'jrp:Bus3024', label: 'Ha que ville II (Busnoys): canon at the unison' }],
  'paired-imitation': [{ ref: 'jrp:Jos2306', label: 'Ave Maria … virgo serena (Josquin)' }],
  'pervasive-imitation': [{ ref: 'jrp:Jos0403a', label: 'Kyrie, Missa Pange lingua (Josquin)' }],
  'homophony': [{ ref: 'lib:mille-regretz-josquin-four-voices', label: 'Mille regretz (Josquin, four voices)' }],
  'four-voice': [{ ref: 'lib:mille-regretz-josquin-four-voices', label: 'Mille regretz (Josquin, four voices)' }],
  'five-plus-voices': [{ ref: 'jrp:Jos2313', label: 'Benedicta es, celorum regina (Josquin, six voices)' }],
  'stile-antico': [{ ref: 'jrp:CRIM_Mass_0015_1', label: 'Kyrie, Missa Benedicta es (Palestrina)' }],
  'regulated-dissonance': [{ ref: 'jrp:CRIM_Mass_0015_1', label: 'Kyrie, Missa Benedicta es (Palestrina)' }],
  'suspension': [{ ref: 'jrp:CRIM_Mass_0015_1', label: 'Kyrie, Missa Benedicta es (Palestrina)' }]
};

/* ===================================================================== TABLE 3: elements that Fiorire can show */
const FIORIRE = ['diminution', 'glosas', 'redobles', 'intabulation', 'ground-bass'];

/* ===================================================================== TABLE 4: Atlas treatise -> Concordantia treatise (same writer, same title) */
const MANUAL_WORKS = { 't-scolica': 'enchiriadis', 't-hucbald': 'hucbald', 't-tinctoris-contrapunctus': 'tinctoris', 't-tinctoris-tonorum': 'tinctoris-ton',
  't-micrologus': 'guido-micr', 't-guido-epistola': 'guido-ep', 't-speculum': 'jacobus', 't-guilielmus': 'monachus', 't-proportionale': 'tinctoris-prop',
  't-tinctoris-diffinitorium': 'tinctoris-dif', 't-tinctoris-inventione': 'tinctoris-inv', 't-practica': 'gaffurius', 't-toscanello': 'aron', 't-fontegara': 'ganassi',
  't-dodecachordon': 'glarean', 't-santa-maria': 'santamaria', 't-dalla-casa': 'dallacasa', 't-werckmeister': 'werckmeister-temp', 't-campion': 'campion',
  't-couperin-art': 'couperin', 't-rameau': 'rameau-traite', 't-heinichen': 'heinichen-1728', 't-mattheson': 'mattheson-cap', 't-cpe-versuch': 'cpe-bach',
  't-l-mozart': 'lmozart', 't-muffat-regulae': 'muffat' };
const SAME_ID_WORKS = ['boethius', 'enchiriadis', 'ad-organum', 'garlandia', 'franco', 'elias', 'paumann', 'schlick', 'coclico', 'ortiz', 'vicentino', 'bermudo', 'zarlino',
  'salinas', 'galilei', 'arbeau', 'morley', 'artusi', 'banchieri', 'burmeister', 'lippius', 'cerone', 'praetorius', 'mersenne', 'kircher', 'bernhard', 'hotteterre',
  'tosi', 'fux', 'quantz', 'fenaroli', 'paumann'];

/* ------------------------------------------------------------------ checks and output */
const bad = [];
const chk = (cond, msg) => { if (!cond) bad.push(msg); };
const out = { topics: {}, examples: {}, fiorire: [], works: {}, labels: {}, workLabels: {} };
for (const [el, ts] of Object.entries(TOPICS)) {
  chk(EL.has(el), 'unknown Atlas element in TOPICS: ' + el);
  ts.forEach(t => chk(TOPIC[t], 'unknown Concordantia topic ' + t + ' for ' + el));
  if (ts.length) { out.topics[el] = ts; ts.forEach(t => { out.labels[t] = TOPIC[t]; }); }
}
for (const [el, xs] of Object.entries(EXAMPLES)) {
  chk(EL.has(el), 'unknown Atlas element in EXAMPLES: ' + el);
  xs.forEach(x => {
    const [kind, id] = [x.ref.slice(0, x.ref.indexOf(':')), x.ref.slice(x.ref.indexOf(':') + 1)];
    chk((kind === 'jrp' && JRP.has(id)) || (kind === 'lib' && LIBSLUG.has(id)) || (kind === 'atlas' && OWN.has(id)), 'unknown piece ' + x.ref + ' for ' + el);
  });
  out.examples[el] = xs;
}
FIORIRE.forEach(e => { chk(EL.has(e), 'unknown element in FIORIRE: ' + e); out.fiorire.push(e); });
const addWork = (t, w) => { chk(TR.has(t) && WORKS[w], 'bad treatise pair ' + t + ' -> ' + w); out.works[t] = w; out.workLabels[w] = WORKS[w].a + ', ' + WORKS[w].t; };
Object.entries(MANUAL_WORKS).forEach(([t, w]) => addWork(t, w));
SAME_ID_WORKS.forEach(w => { if (!out.works['t-' + w] && TR.has('t-' + w)) addWork('t-' + w, w); });
/* every other Atlas treatise whose id after "t-" is also a Concordantia id */
V.treatises.forEach(t => { const w = t.id.replace(/^t-/, ''); if (!out.works[t.id] && WORKS[w]) addWork(t.id, w); });
if (bad.length) { console.error('Not written. Fix these first:\n  ' + [...new Set(bad)].join('\n  ')); process.exit(1); }

const body = `/* Atlas of Musical Style — bridges to Concordantia (topics, treatises), the Cantare player (pieces to hear) and Fiorire.
   Written by _build/make-bridges.js from its tables: edit the tables there, not this file. */
(function (V) {
  V.bridges = {\n${Object.keys(out).map(k => '    ' + JSON.stringify(k) + ': ' + JSON.stringify(out[k])).join(',\n')}\n  };
})(window.VAULT);
`;
fs.writeFileSync(path.join(ROOT, 'atlas', 'vault-bridges.js'), body);
console.log('vault-bridges.js written:', Object.keys(out.topics).length, 'elements with topics,', Object.keys(out.examples).length, 'with examples,', Object.keys(out.works).length, 'treatises linked');
