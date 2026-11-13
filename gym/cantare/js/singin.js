/* Sing in a chant. The singer sings a new chant into the microphone; its pitches are read (YIN, as for the tuner),
   cut into notes and written as plainchant: square notes on four lines, one breve each, in a clef that holds them.
   The text is typed (or, where the browser can, heard as it is sung, to be corrected), divided into Latin syllables,
   and laid under the notes: a new syllable where the voice articulated (a breath, a consonant, a fresh attack), a
   ligature where it moved to another pitch on the same vowel. The chant is kept in this browser under Your melodies. */
import { createMic, spellMidi, median } from './mic.js';

/* ---------- Latin syllables, as chant books divide them ---------- */
const VOW = 'aeiouy';
const isVow = c => !!c && VOW.includes(c);
const base = ch => ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace('æ', 'e').replace('œ', 'e');
const MUTA = 'bcdgptf', LIQ = 'lr';

/* one word → its syllables, keeping the letters as written (accents, capitals, punctuation) */
export function syllabify(word) {
  const ch = [...word], b = ch.map(base);
  const isL = i => /[a-z]/.test(b[i] || '');
  /* which letters are vowels here: u after q (and after ng) and i before a vowel at the start or between vowels sound as consonants */
  const vow = [];
  b.forEach((c, i) => {
    let v = isVow(c);
    if (v && c === 'u' && (b[i - 1] === 'q' || (b[i - 1] === 'g' && b[i - 2] === 'n')) && isVow(b[i + 1])) v = false;
    if (v && c === 'i' && isVow(b[i + 1]) && (i === 0 || !isL(i - 1) || vow[i - 1])) v = false;
    vow.push(v);
  });
  /* nuclei: a vowel, or a diphthong ae oe au (eu, ei only when written with no accent on the second vowel) */
  const nuc = [];
  for (let i = 0; i < ch.length; i++) {
    if (!vow[i]) continue;
    const pair = b[i] + (b[i + 1] || '');
    const second = ch[i + 1] && ch[i + 1].normalize('NFD').length > 1;
    if (vow[i + 1] && (pair === 'ae' || pair === 'oe' || pair === 'au') && !second) { nuc.push([i, i + 1]); i++; }
    else nuc.push([i, i]);
  }
  if (nuc.length < 2) return [word];
  const cuts = [];
  for (let k = 0; k + 1 < nuc.length; k++) {
    const a = nuc[k][1] + 1, z = nuc[k + 1][0];
    const cons = []; for (let i = a; i < z; i++) if (isL(i)) cons.push(i);
    if (!cons.length) { cuts.push(a); continue; }
    /* the consonants as units (ch ph th, qu gu, gn, muta cum liquida, s before p t c); the last unit begins the next
       syllable, except x, which stays with the vowel before it (ex-áu-di) */
    const units = [];
    for (let j = 0; j < cons.length;) {
      const i = cons[j], c = b[i], d = cons[j + 1] === i + 1 ? b[i + 1] : '';
      const pair = d && ((d === 'h' && 'cpt'.includes(c)) || (MUTA.includes(c) && LIQ.includes(d)) || (c === 'g' && d === 'n') || (c === 's' && 'ptc'.includes(d)) || ((c === 'q' || c === 'g') && d === 'u'));
      units.push(i); j += pair ? 2 : 1;
    }
    const last = units[units.length - 1];
    cuts.push(units.length === 1 && b[last] === 'x' ? last + 1 : last);
  }
  /* punctuation before the first letter stays with the first syllable, after the last with the last */
  const out = []; let from = 0;
  cuts.forEach(c => { out.push(ch.slice(from, c).join('')); from = c; });
  out.push(ch.slice(from).join(''));
  return out.filter(Boolean);
}
export const syllablesOfText = text => (text || '').trim().split(/\s+/).filter(Boolean).map(syllabify);

/* ---------- the singing, cut into notes ---------- */
export function transcribe(frames) {
  const voicedRms = frames.filter(f => f.m !== null).map(f => f.rms).sort((a, b) => a - b);
  if (voicedRms.length < 10) return [];
  const peak = voicedRms[Math.floor(voicedRms.length * .9)];
  const ok = f => f.m !== null && f.q < .25 && f.rms > .1 * peak;
  const segs = [];
  let cur = null, lastT = -1e9, onsetSince = false, pend = [];
  const close = () => { if (cur) { segs.push(cur); cur = null; } };
  for (const f of frames) {
    if (f.onset) onsetSince = true;
    if (!ok(f)) continue;
    const gap = f.t - lastT; lastT = f.t;
    if (!cur || gap > .07 || onsetSince) {
      close(); pend = [];
      cur = { fr: [f], art: true, gap: Math.min(gap, 2), onset: onsetSince };
      onsetSince = false; continue;
    }
    const med = median(cur.fr.slice(-7).map(x => x.m));
    if (Math.abs(f.m - med) > .7) {
      pend.push(f);
      while (pend.length > 1 && Math.abs(pend[pend.length - 1].m - pend[0].m) >= .7) pend.shift(); /* still on its way */
      /* the voice has moved to another pitch and stays there: a new note in the same breath (a ligature) */
      if (pend.length >= 3 && Math.abs(pend[pend.length - 1].m - pend[0].m) < .7 && pend[pend.length - 1].t - pend[0].t >= .04) {
        close(); cur = { fr: pend, art: false, gap: 0, onset: false }; pend = [];
      }
    } else { cur.fr.push(f); pend = []; }
  }
  close();
  /* a consonant sung through (m, n, l, d…) does not stop the voice but makes it dip: the note is cut there, and the
     syllable after it begins with a fresh attack */
  const cutAtDips = sg => {
    const fr = sg.fr, n = fr.length, r = fr.map((x, i) => (fr[Math.max(0, i - 1)].rms + x.rms + fr[Math.min(n - 1, i + 1)].rms) / 3);
    for (let i = 1; i < n - 1; i++) {
      if (!(r[i] <= r[i - 1] && r[i] < r[i + 1])) continue;
      if (fr[i].t - fr[0].t < .1 || fr[n - 1].t - fr[i].t < .1) continue;
      let a = 0, b = 0;
      for (let j = i; j >= 0 && fr[i].t - fr[j].t < .16; j--) a = Math.max(a, r[j]);
      for (let j = i; j < n && fr[j].t - fr[i].t < .16; j++) b = Math.max(b, r[j]);
      if (r[i] < .72 * Math.min(a, b)) {
        return [{ ...sg, fr: fr.slice(0, i) }, ...cutAtDips({ fr: fr.slice(i), art: true, gap: 0, onset: false, dip: 1 - r[i] / Math.min(a, b) })];
      }
    }
    return [sg];
  };
  const cutSegs = segs.flatMap(cutAtDips);
  segs.length = 0; segs.push(...cutSegs);
  /* the pitch of each note, leaving out its first moments (the scoop into the note) */
  let notes = segs.map(s => {
    const fr = s.fr, skip = Math.floor(fr.length * .3), body = fr.length - skip >= 2 ? fr.slice(skip) : fr;
    return { m: median(body.map(x => x.m)), t0: fr[0].t, t1: fr[fr.length - 1].t, art: s.art, gap: s.gap, onset: s.onset, dip: s.dip || 0 };
  });
  /* glides and blips: a short slurred note is a passage between two others; a short attack belongs to the note it begins */
  notes = notes.filter((n, i) => {
    const d = n.t1 - n.t0;
    if (d >= (n.art ? .08 : .13)) return true;
    if (n.art && notes[i + 1] && !notes[i + 1].art) { notes[i + 1].art = true; notes[i + 1].gap = n.gap; notes[i + 1].onset = n.onset; }
    return false;
  });
  /* one note held on: two neighbours of the same pitch in one breath are one note */
  const out = [];
  for (const n of notes) {
    const p = out[out.length - 1];
    if (p && !n.art && Math.abs(p.m - n.m) < .5) { p.t1 = n.t1; continue; }
    out.push({ ...n });
  }
  return out;
}

/* the notes as chant: the singer's tuning taken out, and moved (unless kept) so that as many notes as possible fall on
   the white keys, where the church modes lie; b molle where the music needs it */
const WHITE = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
export function toChant(notes, keepPitch = false) {
  if (!notes.length) return { s: [], a: [] };
  let sx = 0, sy = 0;
  notes.forEach(n => { const w = n.t1 - n.t0 + .05, ph = 2 * Math.PI * (n.m - Math.round(n.m)); sx += w * Math.cos(ph); sy += w * Math.sin(ph); });
  const off = Math.atan2(sy, sx) / (2 * Math.PI);
  const semis = notes.map(n => Math.round(n.m - off));
  let best = 0, bc = Infinity;
  if (!keepPitch) for (let k = -6; k <= 5; k++) {
    let c = 0;
    semis.forEach((m, i) => { const pc = ((m + k) % 12 + 12) % 12, w = notes[i].t1 - notes[i].t0 + .05; c += w * (WHITE[pc] ? 0 : pc === 10 ? .35 : 1); });
    c += Math.abs(k) * .01;
    if (c < bc) { bc = c; best = k; }
  }
  const s = [], a = [];
  semis.forEach(m => {
    const sp = spellMidi(m + best);
    s.push(sp.s); a.push(sp.alt < 0 ? 'b' : sp.alt > 0 ? '#' : '');
  });
  return { s, a };
}

/* the syllables laid under the notes: a new syllable on the notes the voice began most clearly */
export function underlay(notes, words) {
  const syl = words.flatMap(w => w.map((x, i) => (i < w.length - 1 ? x + '-' : x)));
  if (!notes.length) return '';
  if (!syl.length) return '';
  const n = notes.length, k = Math.min(syl.length, n);
  const score = notes.map((x, i) => (i === 0 ? 1e9 : (x.art ? 3 : 0) + (x.onset ? 2 : 0) + x.dip * 2 + Math.min(x.gap, .5) * 8 + Math.min(x.t1 - x.t0, 1) * .5 - i * 1e-6));
  const starts = new Set(score.map((v, i) => [v, i]).sort((p, q) => q[0] - p[0]).slice(0, k).map(p => p[1]));
  let j = 0;
  const toks = notes.map((_, i) => (starts.has(i) ? syl[j++].replace(/ /g, '_') : '.'));
  /* syllables left over (more text than notes) go with the last note */
  if (syl.length > n) toks[n - 1] = syl.slice(n - 1).join('').replace(/-/g, '') ;
  return toks.join(' ');
}

/* ---------- GABC, the plain-text form of chant (Gregorio), for sending and keeping ---------- */
export function gabcOf(title, clef, notes) {
  /* clef: { kind, line, bottom } of the four-line staff */
  const head = `name:${title};\n%%\n(${clef.kind === 'F' ? 'f' : 'c'}${clef.line})`;
  const letter = st => String.fromCharCode(100 + st - clef.bottom); /* the lowest line is d */
  let out = '', group = '', text = null, joined = false;
  /* the syllables of one word are written together: Cón(e)di(c)tor(e) al(g)me(h) */
  const flush = () => { if (text !== null || group) out += (text || '') + '(' + group + ')' + (joined ? '' : ' '); group = ''; text = null; };
  notes.forEach(n => {
    if (n.rest) return;
    if (n.text != null && n.text !== '') { flush(); text = n.text; joined = !!n.hyphen; }
    const l = letter(n.step);
    group += (n.acc === 'b' ? l + 'x' : n.acc === '#' ? l + '#' : n.acc === 'n' ? l + 'y' : '') + l;
  });
  flush();
  return head + ' ' + out + '(::)\n';
}

/* ---------- the dialog ---------- */
export function openSingIn(app) {
  const { el, tr, pop, getCtx, draw, play, save, a4 } = app;
  const mic = createMic(getCtx);
  mic.opt = { flex: true, phones: true, a4: a4() };
  let frames = [], notes = [], rec = false, t0 = 0, timer = 0, sr = null, heard = '';
  const live = el('div', { class: 'si-live' }, el('span', { class: 'si-dot' }), el('b', { class: 'si-note' }, '–'), el('span', { class: 'si-time' }, '0:00'));
  const recBtn = el('button', { type: 'button', class: 'chip primary si-rec' }, tr('Start singing'));
  const name = el('input', { type: 'text', class: 'nm-in', maxlength: 120, placeholder: tr('e.g. Conditor alme siderum'), 'aria-label': tr('Name of the chant') });
  const text = el('textarea', { class: 'nm-in si-text', rows: 3, placeholder: tr('Cónditor alme síderum, aetérna lux credéntium …'), 'aria-label': tr('The text') });
  const keep = el('input', { type: 'checkbox' });
  const listen = el('input', { type: 'checkbox' });
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const view = el('div', { class: 'si-view' }, el('p', { class: 'hint' }, tr('Sing the chant on a vowel or with its words. The notes appear here when you stop.')));
  const sylView = el('p', { class: 'hint si-syl' });
  const actions = el('div', { class: 'nm-go' });
  let send = true; try { send = localStorage.getItem('cantare-next:send') !== 'no'; } catch (e) { /* ignore */ }
  const sendBox = el('input', { type: 'checkbox', checked: send });

  const item = () => {
    const { s, a } = toChant(notes, keep.checked);
    const words = syllablesOfText(text.value);
    const it = { title: name.value.trim() || tr('My sung chant'), c: 'c4', s, sung: true, mine: true };
    if (a.some(Boolean)) it.a = a;
    const lyr = underlay(notes, words);
    if (lyr) it.lyr = lyr;
    return it;
  };
  const refresh = () => {
    const words = syllablesOfText(text.value);
    sylView.textContent = words.length ? words.map(w => w.join('-')).join(' ') : '';
    if (!notes.length) return;
    view.innerHTML = draw(item());
    const nsyl = words.reduce((x, w) => x + w.length, 0);
    if (nsyl > notes.length) view.append(el('p', { class: 'hint warn' }, tr('More syllables than notes: the rest go with the last note.')));
    actions.hidden = false;
  };
  text.addEventListener('input', refresh); name.addEventListener('input', () => { if (notes.length) refresh(); });
  keep.addEventListener('change', refresh);

  mic.onFrame = hit => { live.querySelector('.si-note').textContent = hit ? noteName(hit.midi) : '–'; live.classList.toggle('on', !!hit); };
  mic.onRaw = (now, m, q, rms, onset) => { if (rec) frames.push({ t: now, m, q, rms, onset }); };

  const startRec = async () => {
    const r = await mic.start();
    if (r !== 'ok') { view.replaceChildren(el('p', { class: 'hint warn' }, r === 'blocked' ? tr('The microphone is blocked. Allow it for this page and try again.') : tr('This browser cannot open the microphone.'))); return; }
    frames = []; heard = ''; rec = true; t0 = performance.now();
    recBtn.textContent = tr('Stop'); recBtn.classList.add('on');
    timer = setInterval(() => { const s = Math.floor((performance.now() - t0) / 1000); live.querySelector('.si-time').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 250);
    if (listen.checked && SR) {
      try {
        sr = new SR(); sr.lang = 'it-IT'; sr.continuous = true; sr.interimResults = false;
        sr.onresult = e => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) heard += ' ' + e.results[i][0].transcript; };
        sr.start();
      } catch (e) { sr = null; }
    }
  };
  const stopRec = () => {
    rec = false; clearInterval(timer); mic.stop();
    recBtn.textContent = tr('Sing again'); recBtn.classList.remove('on');
    const finish = () => {
      if (heard.trim() && !text.value.trim()) text.value = heard.trim();
      window.__singFrames = frames; /* for checking the transcription */
      notes = transcribe(frames);
      if (!notes.length) { view.replaceChildren(el('p', { class: 'hint warn' }, tr('No notes were heard. Sing a little louder or nearer the microphone.'))); return; }
      refresh();
    };
    if (sr) { try { sr.onend = finish; sr.stop(); } catch (e) { finish(); } sr = null; setTimeout(() => { if (!notes.length && frames.length) finish(); }, 1500); }
    else finish();
  };
  recBtn.addEventListener('click', () => (rec ? stopRec() : startRec()));
  const close = () => { if (rec) stopRec(); mic.stop(); pop.hidden = true; pop.classList.remove('singin'); };

  actions.hidden = true;
  actions.append(
    el('button', { type: 'button', class: 'chip', onclick: () => play(item()) }, tr('Listen')),
    el('button', { type: 'button', class: 'chip primary', onclick: () => {
      if (!name.value.trim()) { name.focus(); name.classList.add('need'); return; }
      try { localStorage.setItem('cantare-next:send', sendBox.checked ? 'yes' : 'no'); } catch (e) { /* ignore */ }
      close(); save(item());
    } }, tr('Save')));

  pop.classList.add('singin');
  pop.replaceChildren(
    el('div', { class: 'clefpop-head' }, el('h3', {}, tr('Sing a new chant')), el('button', { type: 'button', 'aria-label': tr('Close'), onclick: close }, '×')),
    el('div', { class: 'nm' },
      el('div', { class: 'si-bar' }, recBtn, live),
      view,
      el('label', {}, tr('Name of the chant'), name),
      el('label', {}, tr('The text (in Latin, as you sang it; it is divided into syllables for you)'), text),
      sylView,
      el('label', { class: 'nm-send' }, keep, el('span', {}, tr('Keep the pitch I sang (otherwise the chant is moved to where the modes lie, on the white keys)'))),
      SR ? el('label', { class: 'nm-send' }, listen, el('span', {}, tr('Also listen for the words while I sing (experimental: the browser hears Latin as Italian; correct the text afterwards)'))) : '',
      el('label', { class: 'nm-send' }, sendBox, el('span', {}, tr('Send a copy to Václav Hřebec, who collects the chants people add here (the notes, the text, and a link that opens the score).'))),
      el('p', { class: 'hint' }, tr('Your chant is saved in this browser under Your melodies in the library; there you can correct it with Edit and save it as a PDF.')),
      actions));
  pop.hidden = false;
  /* closed any way (×, Escape, a click outside): the microphone is closed with it */
  const mo = new MutationObserver(() => { if (pop.hidden) { mo.disconnect(); rec = false; clearInterval(timer); try { sr && sr.stop(); } catch (e) { /* ignore */ } mic.stop(); pop.classList.remove('singin'); } });
  mo.observe(pop, { attributes: true, attributeFilter: ['hidden'] });
}

const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];
const noteName = m => { const r = Math.round(m); return NAMES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1); };
