/* The texts to sing on the hand: the Ordinary of the Mass, sentence by sentence, and the closing versicles.
   Each sentence is split into words and each word into syllables (Latin as it is sung), so that the voices can
   sing it one syllable per note and follow the singer word by word. */

export const MASS = [
  { part: 'Kyrie', lines: ['Kyrie eleison.', 'Christe eleison.', 'Kyrie eleison.'] },
  { part: 'Gloria', lines: [
    'Gloria in excelsis Deo.',
    'Et in terra pax hominibus bonae voluntatis.',
    'Laudamus te.', 'Benedicimus te.', 'Adoramus te.', 'Glorificamus te.',
    'Gratias agimus tibi propter magnam gloriam tuam.',
    'Domine Deus, Rex caelestis, Deus Pater omnipotens.',
    'Domine Fili unigenite, Iesu Christe.',
    'Domine Deus, Agnus Dei, Filius Patris.',
    'Qui tollis peccata mundi, miserere nobis.',
    'Qui tollis peccata mundi, suscipe deprecationem nostram.',
    'Qui sedes ad dexteram Patris, miserere nobis.',
    'Quoniam tu solus Sanctus.', 'Tu solus Dominus.', 'Tu solus Altissimus, Iesu Christe.',
    'Cum Sancto Spiritu, in gloria Dei Patris. Amen.'] },
  { part: 'Credo', lines: [
    'Credo in unum Deum.',
    'Patrem omnipotentem, factorem caeli et terrae, visibilium omnium et invisibilium.',
    'Et in unum Dominum Iesum Christum, Filium Dei unigenitum.',
    'Et ex Patre natum ante omnia saecula.',
    'Deum de Deo, lumen de lumine, Deum verum de Deo vero.',
    'Genitum, non factum, consubstantialem Patri: per quem omnia facta sunt.',
    'Qui propter nos homines et propter nostram salutem descendit de caelis.',
    'Et incarnatus est de Spiritu Sancto ex Maria Virgine: et homo factus est.',
    'Crucifixus etiam pro nobis sub Pontio Pilato: passus et sepultus est.',
    'Et resurrexit tertia die, secundum Scripturas.',
    'Et ascendit in caelum: sedet ad dexteram Patris.',
    'Et iterum venturus est cum gloria, iudicare vivos et mortuos: cuius regni non erit finis.',
    'Et in Spiritum Sanctum, Dominum et vivificantem: qui ex Patre Filioque procedit.',
    'Qui cum Patre et Filio simul adoratur et conglorificatur: qui locutus est per Prophetas.',
    'Et unam, sanctam, catholicam et apostolicam Ecclesiam.',
    'Confiteor unum baptisma in remissionem peccatorum.',
    'Et exspecto resurrectionem mortuorum.',
    'Et vitam venturi saeculi. Amen.'] },
  { part: 'Sanctus', lines: ['Sanctus, Sanctus, Sanctus Dominus Deus Sabaoth.', 'Pleni sunt caeli et terra gloria tua.', 'Hosanna in excelsis.'] },
  { part: 'Benedictus', lines: ['Benedictus qui venit in nomine Domini.', 'Hosanna in excelsis.'] },
  { part: 'Agnus Dei', lines: [
    'Agnus Dei, qui tollis peccata mundi: miserere nobis.',
    'Agnus Dei, qui tollis peccata mundi: miserere nobis.',
    'Agnus Dei, qui tollis peccata mundi: dona nobis pacem.'] },
  { part: 'Ite, missa est', lines: ['Ite, missa est.', 'Deo gratias.'] },
  { part: 'Benedicamus Domino', lines: ['Benedicamus Domino.', 'Deo gratias.'] },
];

/* ---------- Latin syllables, as they are divided in the chant books ---------- */
const V = 'aeiouyáéíóúæœ';
const isV = c => V.includes(c);
const MUTA = 'bcdfgpt', LIQ = 'lr';
/* the pairs that begin a syllable together: muta cum liquida, ch ph th, gn, qu */
const together = (a, b) => (MUTA.includes(a) && LIQ.includes(b)) || (b === 'h' && 'cpt'.includes(a)) || (a === 'g' && b === 'n') || (a === 'q' && b === 'u');

export function hyphenate(w) {
  const s = w.toLowerCase();
  /* which letters are vowels here: i at the start of a word or between vowels is a consonant (Iesu, eius),
     u after q (and after ng: sanguis) is part of the consonant, ae oe au are one vowel */
  const vow = [...s].map((c, i) => {
    if (!isV(c)) return false;
    if (c === 'i' && i + 1 < s.length && isV(s[i + 1]) && (i === 0 || isV(s[i - 1]))) return false;
    if (c === 'u' && i > 0 && (s[i - 1] === 'q' || (s[i - 1] === 'g' && s[i - 2] === 'n')) && isV(s[i + 1] || '')) return false;
    return true;
  });
  const nuclei = [];
  for (let i = 0; i < s.length; i++) {
    if (!vow[i]) continue;
    const d = s.slice(i, i + 2);
    if ((d === 'ae' || d === 'oe' || d === 'au') && vow[i + 1]) { nuclei.push([i, i + 1]); i++; } else nuclei.push([i, i]);
  }
  if (nuclei.length < 2) return [w];
  const cuts = [];
  for (let n = 0; n + 1 < nuclei.length; n++) {
    const a = nuclei[n][1] + 1, b = nuclei[n + 1][0];   // the consonants between two vowels: s[a..b-1]
    const k = b - a;
    if (k === 0) cuts.push(a);
    else if (k === 1) cuts.push(a);
    else if (s[a] === 'x') cuts.push(a + 1);                          // ex-cel-sis, dex-te-ram
    else if (together(s[b - 2], s[b - 1])) cuts.push(b - 2);          // Pa-tris, a-gnus, Pro-phe-tas, se-pul-chrum
    else cuts.push(b - 1);                                            // sanc-tus, om-nis, mun-di
  }
  const out = []; let p = 0;
  cuts.forEach(c => { out.push(w.slice(p, c)); p = c; }); out.push(w.slice(p));
  return out;
}

/* a sentence → { words: [{text, syls: [..], first, last}], syl: [{text, word}] } */
export function prepareLine(line) {
  const words = [], syl = [];
  line.split(/\s+/).filter(Boolean).forEach((raw, wi) => {
    const core = raw.replace(/[^A-Za-zÀ-ÿæœÆŒ]/g, '');
    if (!core) return;
    const syls = hyphenate(core);
    const first = syl.length;
    syls.forEach((t, k) => syl.push({ text: t, word: words.length, end: k === syls.length - 1 }));
    words.push({ text: raw, core, syls, first, last: syl.length - 1 });
  });
  return { line, words, syl };
}

/* how a word sounds, for comparing it with what speech recognition heard (it hears Latin as Italian) */
export const sound = w => (w || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
  .replace(/ae|oe/g, 'e').replace(/y/g, 'i').replace(/k/g, 'c').replace(/ch/g, 'c').replace(/ph/g, 'f').replace(/th/g, 't')
  .replace(/h/g, '').replace(/j/g, 'i').replace(/qu/g, 'cu').replace(/x/g, 'cs').replace(/(.)\1/g, '$1');

export function similarity(a, b) {
  if (!a || !b) return 0;
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}
