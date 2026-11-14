/* The other languages of the library, as they were sung around 1450–1600, syllable by syllable, in IPA:
   French (Middle French: the final e sung as [ə], oi as [wɛ], s silent before a consonant, nasal vowels before a
   consonant or at a word's end, final consonants silent except c, f, l, r), German (Luther's: ei/ey [aɪ], eu [ɔɪ],
   ch [x]/[ç], st/sp at a word's start [ʃt]/[ʃp], final b d g unvoiced, unstressed e [ə]) and Italian (as the
   church sings Latin, with ch/gh hard, gli [ʎ], and z [ts]).
   Each front end takes one word as the list of its syllables as written (the library's text splits words into the
   syllables of its notes) and returns one { on, v, co } per syllable, as latin.js does for Latin: onset consonants,
   the vowel, the coda consonants. A nasal vowel is written with a tilde (ɑ̃ ɛ̃ ɔ̃ œ̃). */

const clean = t => (t || '').toLowerCase().replace(/&[a-z]+;/g, m => ({ '&eacute;': 'é', '&egrave;': 'è', '&agrave;': 'à' }[m] || ''))
  .replace(/<[^>]*>/g, '').replace(/\[[^\]]*\]/g, '').replace(/[’]/g, "'").replace(/[^a-zàâäéèêëîïôöùûüÿçœæáíóúý' ]/g, '').trim();

/* ---------------------------------------------------------------- language */
const W = {
  la: 'et in est qui quae quod ad cum non dominus domine deus dei deo sanctus spiritus gloria pax tibi te nobis nos mihi meus mea sum sunt ex ab per pro sed ut omnes mundi peccata miserere kyrie christe eleison amen alleluia filius patris pater nunc semper virgo maria ave regina caeli coeli terra super quia propter cuius regni unum benedictus venit nomine hosanna excelsis agnus dona pacem o salve mater domini christus iesu ihesu eius sicut erat saecula seculorum nostri nostra vobis tuum tua meum enim ergo autem ecce ego dixit',
  fr: "le la les des du un une mon ma mes ton ta tes son sa ses je il elle nous vous ils que qui ne pas plus pour sans mais ou au aux en dont cueur coeur cuer amours amour moy moi toy toi suis fait faire bien bon belle dame jamais tout tous tant si par ce cest est et ay ung une sont qu'on vostre nostre doulce dueil regretz plaine seulement adieu helas hellas fortune",
  de: 'ich und der die das dem den des mein dein sein nicht ist ein eine in mit zu uns wir ihr er sie es von auf aus herr gott christ geist glauben unser unserm unsern vater himmel himmelreich heiligen wenn wann daß das nu nun gelobet seist du du dir dich mich mir',
  it: 'il lo gli per mi ti mio mia non sei ma come quando del della amor cor core che di e con questo questa piu più sempre io tu lui lei noi voi fortuna desperata iniqua maledecta dona electa fama',
  nl: 'ende het een mijn ic wel van den mi u niet dat ghi hem mijns sijn mi',
};
const SETS = Object.fromEntries(Object.entries(W).map(([k, v]) => [k, new Set(v.split(' '))]));
const ENDS = {
  la: /(us|um|orum|arum|ibus|ae|tur|unt|amus|imus|atis|itis|ionem|tio|tia|is)$/,
  fr: /(eur|eux|oit|oy|ay|ois|ait|ere|ette|elle|ée|és|ez|aulx|ieux|ment|esse|ance|ence)$/,
  de: /(lich|ung|keit|heit|cht|sch|tz|ein|en|er|st)$/,
  it: /(zza|zione|ia|io|are|ere|ire|ato|ata|ito|ita|mente|ella|ello)$/,
  nl: /(ijn|ght|cht|aer|oet|ue)$/,
};
/* the language of a voice's text: the commonest words decide, word endings help */
export function language(text) {
  const words = []; let w = '';
  for (const t of (text || '').split(/\s+/)) {
    if (!t || t === '.') continue;
    if (t.length > 1 && t.endsWith('-')) { w += t.slice(0, -1); continue; }
    words.push(clean((w + t).replace(/_/g, ' ')).replace(/'/g, "'")); w = '';
  }
  const score = { la: 0, fr: 0, de: 0, it: 0, nl: 0 };
  for (const x of words) for (const part of x.split(/[ ']/)) {
    if (!part) continue;
    for (const k in SETS) { if (SETS[k].has(part)) score[k] += 1; if (ENDS[k].test(part)) score[k] += .4; }
    if (/[äöü]/.test(part)) score.de += 1;
    if (/[èêçë]/.test(part)) score.fr += 1;
    if (/[áíóúý]/.test(part)) score.la += 1;            /* the chant books' accents */
    if (/'/.test(x)) score.fr += .5;
  }
  let best = 'la';
  for (const k in score) if (score[k] > score[best] + 1e-9) best = k;
  return best;
}

/* ---------------------------------------------------------------- French */
const isV = c => !!c && 'aàâäeéèêëiîïoôöuùûüyÿœæ'.includes(c);
const NAS = { a: 'ɑ̃', e: 'ɑ̃', i: 'ɛ̃', y: 'ɛ̃', o: 'ɔ̃', u: 'œ̃', ai: 'ɛ̃', ei: 'ɛ̃', oi: 'wɛ̃', ie: 'jɛ̃', ue: 'œ̃' };
const FR_SILENT_FINAL = /[stdpxzgb]+$/;          /* final consonants that are not pronounced (c, f, l, r are) */
const MONO_E = new Set(['les', 'des', 'mes', 'tes', 'ses', 'ces', 'es', 'et', 'est', 'ez']);

export function frWord(sylsRaw) {
  /* elision inside one note ("re et", "ce a"): the e before the vowel is dropped */
  const syls = sylsRaw.map(s => clean(s.replace(/_/g, ' ')).replace(/e '?(?=[aeiouyhàéèâêô])/g, '').replace(/ /g, '').replace(/'/g, ''));
  /* -eil, -ail, -oeil, and -eil-les, -ail-le across the syllables: a palatal glide [j] closes the vowel */
  for (let k = 0; k < syls.length; k++) {
    const nx = syls[k + 1] || '';
    if (/[aeouœ]ill?$/.test(syls[k]) && nx[0] === 'l') { syls[k] = syls[k].replace(/ill?$/, 'Y'); syls[k + 1] = nx.slice(1); }
    else if (/[aeouœ]il$/.test(syls[k])) syls[k] = syls[k].replace(/il$/, 'Y');
  }
  const word = syls.join('');
  const n = syls.length;
  return rhotic(syls.map((s, si) => {
    const last = si === n - 1;
    const next = syls[si + 1] || '';
    let t = s;
    /* silent letters */
    if (last) {
      if (/(ent)$/.test(t) && n > 1 && /[^aeiouy]ent$/.test(word) && !/(ment|vent|tent|sent|rent)$/.test(word)) t = t.replace(/ent$/, 'e');
      t = t.replace(/(e)s$/, '$1');
      if (!MONO_E.has(word)) t = t.replace(/([aeiouyéèêàôîûœ])([stdpxzgb]+)$/, (m, v, c) => v);
      else t = t.replace(/[stz]+$/, '');
      t = t.replace(/([nm])[stdpxzgbc]+$/, '$1');
      t = t.replace(/([lr])[stdpxzgbc]+$/, '$1');
      t = t.replace(/([^aeiouyéèêàôîûœ])[stdpxzg]+$/, '$1');
    }
    t = t.replace(/es(?=[bcdfgjklmnpqtv])/g, 'ê').replace(/s(?=[bcdfgjklmnpqtv])/g, '');   /* estre, maistresse: the s is silent */
    if (!last && (!next.length || !isV(next[0]))) t = t.replace(/es$/, 'ê').replace(/s$/, '');
    t = t.replace(/aul(?=[bcdfgjkmnpqstvx]|$)/, 'au');    /* mauldit, haulte: [o] */
    t = t.replace(/^h/, '').replace(/([^cpts])h/g, '$1');
    t = t.replace(/b(?=t)/, '').replace(/p(?=t)/, '');    /* doibt, escript */
    t = t.replace(/l(?=x$)/, '');
    const nextFirst = next[0] || '';
    return frSyl(t, { last, nextFirst, mono: n === 1, word });
  }));
}

function frSyl(t, { last, nextFirst, mono, word }) {
  const on = [], co = [];
  let v = null, i = 0;
  const push = p => (v ? co : on).push(p);
  while (i < t.length) {
    const c = t[i], d = t[i + 1] || '', e2 = t[i + 2] || '';
    if (isV(c)) {
      if (v) { i++; continue; }
      /* the vowel group */
      let j = i; while (j < t.length && isV(t[j])) j++;
      let g = t.slice(i, j);
      const after = t.slice(j);
      /* -ill-: a palatal glide (merveilles, vieille, fille) */
      if (/^ll/.test(after) && /i$/.test(g)) { g = g.length > 1 ? g.slice(0, -1) : g; co.push('j'); }
      const nasal = /^[nm]([^aeiouyéèê]|$)/.test(after) && !(after.length === 1 && isV(nextFirst));
      let q;
      if (nasal) q = NAS[g] || NAS[g.slice(-2)] || NAS[g.slice(-1)] || 'ɑ̃';
      else q = frVowel(g, { closed: after.replace(/^h/, '').length > 0, last, mono, word, j, t });
      if (q.startsWith('w') && q.length > 1) { on.push('w'); q = q.slice(1); }
      if (q.startsWith('j') && q.length > 1) { on.push('j'); q = q.slice(1); }
      if (q.startsWith('ɥ')) { on.push('ɥ'); q = q.slice(1); }
      v = q;
      i = j;
      if (nasal) { i++; while (t[i] === 'n' || t[i] === 'm') i++; }
      continue;
    }
    if (c === 'c' && d === 'h') { push('ʃ'); i += 2; continue; }
    if (c === 'p' && d === 'h') { push('f'); i += 2; continue; }
    if (c === 't' && d === 'h') { push('t'); i += 2; continue; }
    if (c === 'g' && d === 'n') { push('ɲ'); i += 2; continue; }
    if (c === 'q' && d === 'u') { push('k'); i += 2; continue; }
    if (c === 'g' && d === 'u' && 'eiy'.includes(e2)) { push('g'); i += 2; continue; }
    if (c === 'c' || c === 'ç') { push(c === 'ç' || 'eiyéè'.includes(d) ? 's' : 'k'); i++; continue; }
    if (c === 'g') { push('eiyéè'.includes(d) ? 'ʒ' : 'g'); i++; continue; }
    if (c === 'j') { push('ʒ'); i++; continue; }
    if (c === 's' && d === 's') { push('s'); i += 2; continue; }
    if (c === 's') { push(!v && !on.length && i === 0 ? 's' : v ? 's' : 's'); i++; continue; }
    if (c === 'x') { push('k'); push('s'); i++; continue; }
    if (c === 'z') { push('z'); i++; continue; }
    if (c === 'r') { push('r'); i++; continue; }
    if (c === 'l' && d === 'l') { i += 2; if (!co.includes('j')) push('l'); continue; }
    if (c === 'y' && !v) { push('j'); i++; continue; }
    if (c === 'Y') { co.push('j'); i++; continue; }
    if ('bdfklmnptvw'.includes(c)) { push(c === 'w' ? 'v' : c); i++; continue; }
    i++;
  }
  if (!v) return null;
  const dedup = a => a.filter((p, k) => p !== a[k - 1]);
  return { on: dedup(on), v, co: dedup(co) };
}

function frVowel(g, { closed, last, mono, word }) {
  if (/^(eau|au)$/.test(g)) return 'o';
  if (/^(ieu|ieue)$/.test(g)) return 'jø';
  if (/^(iei|ié|iè)$/.test(g)) return 'jɛ';
  if (/^(oe|ue|oue|œ)$/.test(g) && closed) return 'œ';
  if (/^(ou|où|oû)$/.test(g)) return 'u';
  if (/^(oi|oy|oie|oye)$/.test(g)) return 'wɛ';
  if (/^(ai|ay|aî|ei|ey|aie|aye)$/.test(g)) return 'ɛ';
  if (/^(eu|œu|ue|ueu|oeu|eü)$/.test(g)) return closed ? 'œ' : 'ø';
  if (/^(ui|uy)$/.test(g)) return 'ɥi';
  if (/^(ie|iè)$/.test(g)) return 'jɛ';
  if (/^(ée|éé|ée)$/.test(g)) return 'e';
  if (g === 'é') return 'e';
  if (g === 'è' || g === 'ê') return 'ɛ';
  if (g === 'e') {
    if (mono && MONO_E.has(word)) return 'e';
    if (closed) return 'ɛ';
    return 'ə';                       /* re-, de, le, que, the final e: all sung [ə] */
  }
  const k = g.slice(-1);
  return { a: 'a', à: 'a', â: 'a', i: 'i', î: 'i', y: 'i', ÿ: 'i', o: 'ɔ', ô: 'o', u: 'y', ù: 'y', û: 'y', ü: 'y', œ: 'ø', æ: 'ɛ', ë: 'ɛ', ï: 'i' }[k] || 'a';
}

/* r: rolled [r] at a word's start and after a vowel, a flap [ɾ] after a consonant and between vowels */
function rhotic(out) {
  out.forEach((x, k) => {
    if (!x) return;
    x.on = x.on.map((p, i) => p === 'r' && (i > 0 || k > 0) ? 'ɾ' : p);
  });
  return out;
}

/* ---------------------------------------------------------------- German */
export function deWord(sylsRaw) {
  const syls = sylsRaw.map(s => clean(s.replace(/_/g, ' ')).replace(/ /g, ''));
  const n = syls.length;
  return rhotic(syls.map((s, si) => deSyl(s, { first: si === 0, last: si === n - 1, next: syls[si + 1] || '', n, prev: syls[si - 1] || '' })));
}

function deSyl(t, { first, last, next, n, prev }) {
  const on = [], co = [];
  let v = null, i = 0;
  const push = p => (v ? co : on).push(p);
  const unstressed = n > 1 && !first && /^[^aeiouyäöü]*e[^aeiouyäöü]*$/.test(t);   /* -en, -er, -el, -te, -de */
  const prefix = n > 1 && first && /^(be|ge|ver|er|ent|zer)$/.test(t);
  while (i < t.length) {
    const c = t[i], d = t[i + 1] || '', e2 = t[i + 2] || '';
    if ('aeiouyäöü'.includes(c)) {
      if (v) { i++; continue; }
      let j = i; while (j < t.length && 'aeiouyäöüh'.includes(t[j]) && !(t[j] === 'h' && 'aeiouyäöü'.includes(t[j + 1] || ''))) j++;
      const g = t.slice(i, j).replace(/h/g, '');
      const closed = t.slice(j).length > 0;
      v = deVowel(g, { closed, schwa: (unstressed || prefix) && g === 'e' });
      if (v === 'jy' || v === 'ɪe') v = 'i';
      i = j; continue;
    }
    if (c === 's' && d === 'c' && e2 === 'h') { push('ʃ'); i += 3; continue; }
    if (c === 'c' && d === 'h') { const back = v && /[aouɔʊ]|aʊ/.test(v); push(v ? (back ? 'x' : 'ç') : 'k'); i += 2; continue; }
    if (c === 'c' && d === 'k') { push('k'); i += 2; continue; }
    if (c === 't' && d === 'z') { push('ts'); i += 2; continue; }
    if (c === 'p' && d === 'f') { push('pf'); i += 2; continue; }
    if (c === 'p' && d === 'h') { push('f'); i += 2; continue; }
    if (c === 'q' && d === 'u') { push('k'); push('v'); i += 2; continue; }
    if (c === 'n' && d === 'g') { push('ŋ'); i += 2; continue; }
    if (c === 'n' && d === 'k') { push('ŋ'); push('k'); i += 2; continue; }
    if (c === 's' && (d === 't' || d === 'p') && first && i === 0) { push('ʃ'); push(d); i += 2; continue; }
    if (c === 's') { push(!v && i === 0 && 'aeiouyäöü'.includes(d) ? 'z' : 's'); i++; continue; }
    if (c === 'z') { push('ts'); i++; continue; }
    if (c === 'v') { push('f'); i++; continue; }
    if (c === 'w') { push('v'); i++; continue; }
    if (c === 'j') { push('j'); i++; continue; }
    if (c === 'y' && !v) { push('j'); i++; continue; }
    if (c === 'h') { if (!v) push('h'); i++; continue; }
    if (c === 'c') { push('k'); i++; continue; }
    if (c === 'r') { push('r'); i++; continue; }
    if ('bdg'.includes(c) && v && i === t.length - 1 && (last || !'aeiouyäöü'.includes(next[0] || ''))) { push({ b: 'p', d: 't', g: 'k' }[c]); i++; continue; }
    if ('bdfgklmnpstx'.includes(c)) { if (c === 'x') { push('k'); push('s'); } else push(c); i++; continue; }
    i++;
  }
  if (!v) return null;
  const dedup = a => a.filter((p, k) => p !== a[k - 1]);
  return { on: dedup(on), v, co: dedup(co) };
}

function deVowel(g, { closed, schwa }) {
  if (schwa) return 'ə';
  if (/^(ei|ey|ai|ay)$/.test(g)) return 'aɪ';
  if (/^(au|aw)$/.test(g)) return 'aʊ';
  if (/^(eu|äu|ew)$/.test(g)) return 'ɔɪ';
  if (/^(ie|ye)$/.test(g)) return 'i';
  if (/^(ue|üe|uo|ü)$/.test(g)) return 'y';
  if (/^(oe|ö)$/.test(g)) return closed ? 'œ' : 'ø';
  if (/^(ae|ä)$/.test(g)) return 'ɛ';
  if (/^(ee|eh)$/.test(g)) return 'e';
  if (/^(oo)$/.test(g)) return 'o';
  if (/^(aa)$/.test(g)) return 'a';
  const k = g.slice(-1);
  if (k === 'a') return 'a';
  if (k === 'e') return closed ? 'ɛ' : 'e';
  if (k === 'i' || k === 'y') return closed ? 'ɪ' : 'i';
  if (k === 'o') return closed ? 'ɔ' : 'o';
  if (k === 'u') return closed ? 'ʊ' : 'u';
  return 'a';
}

/* ---------------------------------------------------------------- Flemish (through the German rules) */
export function nlWord(sylsRaw) {
  return deWord(sylsRaw.map(s => clean(s).replace(/ij|y/g, 'ei').replace(/oe/g, 'u').replace(/ue|uy/g, 'ü').replace(/ae/g, 'aa')
    .replace(/sch/g, 'sX').replace(/gh?/g, 'X').replace(/X/g, 'ch').replace(/^v/, 'w')));
}

/* one word in a language: 'la' and 'it' are left to latin.js */
export const FRONT_ENDS = { fr: frWord, de: deWord, nl: nlWord };
