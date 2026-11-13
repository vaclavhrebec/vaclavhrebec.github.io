/* Latin as it is sung (the Italianate, ecclesiastical pronunciation), syllable by syllable, in IPA.
   Each sung syllable becomes { on: [onset consonants], v: vowel, co: [coda consonants] }; its key (onset.vowel.coda,
   e.g. "kw.i." for qui, "s.a.ŋk" for sanc-, "t.u.s" for -tus) names the syllable in the voice bank sung by Chimera.
   The rules look across the syllables of one word: c, g and sc before front vowels, gn, ti before a vowel, x before c,
   n before k/g, mihi and nihil. */

const FRONT = /^(e|i|y|ae|oe|æ|œ)/;
const VOW = 'aeiouy';
const isV = ch => !!ch && VOW.includes(ch);

/* the letters of one syllable as written: lower case, no accents, no punctuation */
export function letters(t) {
  return (t || '').toLowerCase().replace(/&[a-z]+;/g, m => ({ '&eacute;': 'e', '&egrave;': 'e', '&agrave;': 'a' }[m] || ''))
    .replace(/æ/g, 'ae').replace(/œ/g, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/<[^>]*>/g, '').replace(/\[[^\]]*\]/g, '').replace(/[^a-z]/g, '').replace(/j/g, 'i').replace(/w/g, 'v').replace(/k/g, 'c');
}

/* one word, as a list of its syllables' letters → one {on, v, co} per syllable (null where a syllable has no vowel) */
export function word(syls) {
  const L = syls.map(letters);
  const out = L.map((s, si) => one(s, si ? L[si - 1] : '', si + 1 < L.length ? L[si + 1] : '', si === 0));
  /* across the syllable boundary */
  for (let i = 0; i + 1 < out.length; i++) {
    const a = out[i], b = out[i + 1]; if (!a || !b) continue;
    const last = a.co[a.co.length - 1], first = b.on[0];
    if (last === 'g' && b.on[0] === 'n') { a.co[a.co.length - 1] = 'ɲ'; b.on[0] = 'ɲ'; }
    if (last === 's' && b.cf) { a.co[a.co.length - 1] = 'ʃ'; b.on[0] = 'ʃ'; }        /* sus-ci-pe: suʃʃipe */
    if (last === 'k' && a.cx && b.cf) { a.co.splice(a.co.length - 1, 1); b.on[0] = 'ʃ'; } /* ex-cel-sis: ekʃɛlsis */
    if (last === 'k' && !a.cx && b.cf) a.co[a.co.length - 1] = 't';                    /* ec-ce: ɛttʃe */
    if (last === 'n' && (first === 'k' || first === 'g')) a.co[a.co.length - 1] = 'ŋ';  /* san-cto, lin-gua */
    if ((last === 'r' || last === 'ɾ') && b.on[0] === 'ɾ') b.on[0] = 'r';
  }
  return out.map(x => x && { on: x.on, v: x.v, co: x.co });
}

function one(s0, prev, next, initial) {
  /* h is silent (after c, p, t, r it makes a digraph), except between the i's of mihi and nihil */
  let s = '';
  for (let k = 0; k < s0.length; k++) {
    const h = s0[k];
    if (h !== 'h' || 'cptr'.includes(s0[k - 1] || '_') || (k === 0 && prev.endsWith('i') && s0[1] === 'i') || (k > 0 && s0[k - 1] === 'i' && s0[k + 1] === 'i')) s += h;
  }
  const on = [], co = [];
  let v = null, i = 0, cf = false, cx = false;
  const push = p => (v ? co : on).push(p);
  while (i < s.length) {
    const c = s[i], d = s[i + 1] || '', rest = s.slice(i + 1), after = rest + next;
    if (isV(c)) {
      /* the vowel sequence of this syllable */
      let j = i; while (j < s.length && isV(s[j])) j++;
      let seq = s.slice(i, j);
      if (v) { /* a second vowel group in one syllable (a slip of the syllabification): sing it in the coda as a glide */
        for (const ch of seq) co.push(ch === 'u' || ch === 'o' ? 'w' : 'j');
        i = j; continue;
      }
      if (seq.startsWith('i') && seq.length > 1 && !on.length) { on.push('j'); seq = seq.slice(1); }  /* iam, Ie-su, ius */
      else if (seq.startsWith('u') && seq.length > 1 && !on.length && !initial) { on.push('v'); seq = seq.slice(1); } /* u written for v */
      else if (seq === 'ui' && (on.at(-1) === 'k' || !on.length)) { on.push('w'); seq = 'i'; } /* cui, huic */
      if (seq === 'ae' || seq === 'oe') v = 'ɛ';
      else if (seq === 'au') v = 'aʊ';
      else if (seq === 'ei') v = 'eɪ';
      else if (seq === 'eu') { v = 'ɛ'; co.push('w'); }
      else {
        /* earlier vowels glide into the last one */
        for (const ch of seq.slice(0, -1)) on.push(ch === 'u' || ch === 'o' ? 'w' : 'j');
        v = { a: 'a', e: 'ɛ', i: 'i', o: 'ɔ', u: 'u', y: 'i' }[seq.at(-1)];
      }
      i = j; continue;
    }
    if (c === 'c' && d === 'h') { push('k'); i += 2; continue; }
    if (c === 'p' && d === 'h') { push('f'); i += 2; continue; }
    if (c === 't' && d === 'h') { push('t'); i += 2; continue; }
    if (c === 'r' && d === 'h') { push('r'); i += 2; continue; }
    if (c === 'q') { push('k'); if (d === 'u') { push('w'); i += 2; } else i++; continue; }
    if (c === 'g' && d === 'u' && isV(s[i + 2] || '') ) { push('g'); push('w'); i += 2; continue; } /* lin-gua, san-gui-nis */
    if (c === 'g' && d === 'n') { push('ɲ'); i += 2; continue; }
    if (c === 's' && d === 'c' && FRONT.test(s.slice(i + 2) + next)) { push('ʃ'); i += 2; continue; }
    if (c === 'c' && d === 'c' && FRONT.test(s.slice(i + 2) + next)) { push('t'); push('tʃ'); i += 2; continue; }
    if (c === 'c') { const f = FRONT.test(after); if (f && !v) cf = true; push(f ? 'tʃ' : 'k'); i++; continue; }
    if (c === 'g') { push(FRONT.test(after) ? 'dʒ' : 'g'); i++; continue; }
    if (c === 'h') { if ((prev.endsWith('i') || s[i - 1] === 'i') && d === 'i') push('k'); i++; continue; } /* mihi, nihil */
    if (c === 't' && d === 'i' && isV(s[i + 2] || next[0] || '') && !/[stx]$/.test(prev + s.slice(0, i))) { push('ts'); i++; continue; }
    if (c === 'x') { push('k'); push('s'); if (v) cx = true; i++; continue; }
    if (c === 'z') { push('dz'); i++; continue; }
    if (c === 'r') { push(v || (initial && !on.length) || d === 'r' ? 'r' : 'ɾ'); i++; continue; }
    if (c === 'n' && (d === 'c' || d === 'g' || d === 'q') && !(d === 'g' && s[i + 2] === 'n')) {
      if (d === 'g' && FRONT.test(s.slice(i + 2) + next)) push('n'); else if (d === 'c' && FRONT.test(s.slice(i + 2) + next)) push('n'); else push('ŋ');
      i++; continue;
    }
    if ('bdfklmnpstv'.includes(c)) { push(c); i++; continue; }
    i++;
  }
  if (!v) return null;
  /* doubled consonants inside one syllable sound once */
  const dedup = a => a.filter((p, k) => p !== a[k - 1]);
  return { on: dedup(on), v, co: dedup(co), cf, cx };
}

export const keyOf = s => s ? `${s.on.join('')}.${s.v}.${s.co.join('')}` : '';

/* the sung syllables of a voice's notes: for every note that starts a syllable, its {on, v, co, key};
   words run over notes whose text ends in a hyphen */
export function syllablesOf(notes) {
  const res = new Map();
  let w = [];
  const flush = () => { if (!w.length) return; const ps = word(w.map(n => n.text)); w.forEach((n, k) => { if (ps[k]) res.set(n, { ...ps[k], key: keyOf(ps[k]) }); }); w = []; };
  for (const n of notes) {
    if (n.rest || !n.text) continue;
    w.push(n);
    if (!n.hyphen) flush();
  }
  flush();
  return res;
}

/* is a text Latin? (the library also holds French, Italian, Flemish and German songs) */
const LAT = new Set(('et in est qui quae quod de ad cum non dominus domine deus dei deo sanctus sancte spiritus spiritui gloria pax tibi te tu nobis nos me '
  + 'mihi meus mea sum sunt ex a ab per pro sed ut omnes omnia mundi peccata miserere kyrie christe eleison amen alleluia filius filii patris pater '
  + 'nunc semper virgo maria ave regina caeli coeli terra super sub quia propter natus crucifixus passus sepultus resurrexit ascendit sedet est '
  + 'cuius regni finis credo unum unam ecclesiam vitam benedictus venit nomine hosanna excelsis agnus tollis dona pacem laudamus nostram quoniam solus '
  + 'altissimus o salve mater sancta virginis domini dominum christi christus iesu ihesu jesu iesus ad atque eius sicut erat principio saecula '
  + 'saeculorum seculorum secula nostri nostra nostrum vobis tuum tua tui tuo meum sit fuit ego ille illa ipse hic haec hoc enim ergo autem').split(' '));
const OTHER = new Set(('le la les des du un une mon ma mes ton ta tes son sa ses je tu il elle nous vous ils que qui ne pas plus pour sans mais ou au aux '
  + 'en dont cueur coeur cuer amours amour moy moi toy suis fait faire bien bon belle dame jamais tout tous tant si par ce cest '
  + 'che di il lo gli per mi ti mio mia non sei ma come quando del della amor cor core '
  + 'ende het een mijn ic wel van den de mi u niet dat ghi hem '
  + 'ich und der die das mein dein nicht ist ein in mit zu '
  + 'the and my of to thy').split(' '));
export function isLatin(text) {
  const ws = []; let w = '';
  for (const t of (text || '').toLowerCase().split(/\s+/)) {
    if (!t || t === '.') continue;
    if (t.length > 1 && t.endsWith('-')) { w += t.slice(0, -1); continue; }
    ws.push((w + t).replace(/&[a-z]+;/g, 'e').replace(/[^a-zæœ'’]/g, '')); w = '';
  }
  let lat = 0, oth = 0;
  for (const w of ws) {
    if (/['’]/.test(w)) { oth += 2; continue; }
    const a = LAT.has(w), b = OTHER.has(w);
    if (a && !b) lat++; else if (b && !a) oth++;
    if (/(us|um|orum|arum|ibus|ae|tur|unt|amus|imus|atis|itis|ionem|tio|tia)$/.test(w)) lat += .5;
    if (/(eur|eux|oit|ez|aulx|ieux|oy|ay|ois|ait|ere|ette|elle|ijn|ght|lich|ung|zza)$/.test(w)) oth += .5;
  }
  return lat >= oth;
}
