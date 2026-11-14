/* Scores from other programs, and back. A file from the visitor's computer – MuseScore (.mscz, .mscx), MusicXML
   (.musicxml, .xml, .mxl) or MIDI (.mid) – becomes a Cantare piece: one voice per part (and per voice inside a part),
   the notes in mensural values (a whole note is a semibrevis), the text under the notes. Ties become ~ (the second
   note goes on sounding). Going the other way, the piece is written out as MusicXML, which MuseScore, Sibelius,
   Finale and Dorico all open. */
import { spellMidi } from './mic.js';
import { fitClef, CLEF_ORDER } from './music.js';

/* ---------------------------------------------------------------- reading ZIP archives (.mscz, .mxl) */
async function unzip(buf) {
  const dv = new DataView(buf), files = {};
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not a zip');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  for (let k = 0; k < count; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(buf, p + 46, nlen));
    files[name] = { method, csize, off };
    p += 46 + nlen + xlen + clen;
  }
  const read = async name => {
    const f = files[name]; if (!f) return null;
    const lo = f.off, start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
    const data = new Uint8Array(buf, start, f.csize);
    if (f.method === 0) return dec.decode(data);
    if (f.method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('compressed');
    const out = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
    return dec.decode(out);
  };
  return { names: Object.keys(files), read };
}

/* ---------------------------------------------------------------- from timed notes to Cantare voices */
/* a voice in, as events in quarter notes: { at, len, midi | null, letter?, alter?, octave?, syl?, hyph? } */
const VALS = [[16, 'Mx'], [12, 'L', 1], [8, 'L'], [6, 'B', 1], [4, 'B'], [3, 'S', 1], [2, 'S'], [1.5, 'M', 1], [1, 'M'], [.75, 'Sm', 1], [.5, 'Sm'], [.375, 'F', 1], [.25, 'F']];
function pieces(len) { /* a length in minims as the fewest written values */
  const out = []; let left = Math.round(len * 8) / 8;
  for (const [v, name, dot] of VALS) while (left >= v - 1e-6) { out.push([name, !!dot]); left -= v; }
  return out;
}
function stepOf(e) {
  if (e.letter) return 7 * e.octave + 'CDEFGAB'.indexOf(e.letter);
  return spellMidi(e.midi).s;
}
function accOf(e, bflat) {
  let L, alt;
  if (e.letter) { L = 'CDEFGAB'.indexOf(e.letter); alt = Math.round(e.alter || 0); } else { const sp = spellMidi(e.midi); L = sp.L; alt = sp.alt; }
  const sig = bflat && L === 6 ? -1 : 0;
  if (alt === sig) return '';
  return alt < 0 ? 'b' : alt > 0 ? '#' : 'n';
}
/* the scale: a whole note is a semibrevis, unless the piece has notes shorter than an eighth – then a whole note is a brevis */
function toVoice(evs, scale, bflat, name) {
  evs = evs.filter(e => e.len > 1e-6).sort((a, b) => a.at - b.at);
  const grid = x => Math.round(x * scale * 4) / 4; /* minims, on a grid of fusae */
  const toks = [], syl = []; let t = 0, texted = false;
  const rest = until => { pieces(until - t).forEach(([v, d]) => toks.push('r' + v + (d ? '.' : ''))); t = Math.max(t, until); };
  for (const e of evs) {
    const a = grid(e.at), b = grid(e.at + e.len);
    if (b <= t + 1e-6) continue; /* a chord's lower notes or an overlap: the first note kept */
    if (a > t + 1e-6) rest(a);
    const len = b - Math.max(a, t);
    if (e.midi == null && !e.letter) { rest(t + len); continue; }
    const step = stepOf(e), acc = accOf(e, bflat);
    pieces(len).forEach(([v, d], k) => {
      toks.push(step + acc + v + (d ? '.' : '') + (k || e.tieIn ? '~' : ''));
      if (k === 0 && e.syl && !e.tieIn) { syl.push(e.syl.replace(/\s+/g, '_') + (e.hyph ? '-' : '')); texted = true; } else syl.push('.');
    });
    t += len;
  }
  const steps = toks.filter(x => !x.startsWith('r')).map(x => +x.match(/^\d+/)[0]);
  const clef = steps.length ? fitClef(steps, 5, 'c4', CLEF_ORDER).id : 'c4';
  return { c: clef, nm: name || '', n: toks.join(' '), lyr: texted ? syl.join(' ') : undefined };
}
function itemFrom(title, voices, bflat) {
  voices = voices.filter(v => v.evs.some(e => e.midi != null || e.letter));
  if (!voices.length) throw new Error('empty');
  const short = Math.min(...voices.flatMap(v => v.evs.filter(e => e.len > 1e-6).map(e => e.len)));
  const scale = short < .45 ? 1 : .5; /* minims per quarter */
  const vs = voices.map(v => toVoice(v.evs, scale, bflat, v.name));
  const it = { title: title || 'Uploaded score', t: 'C', b: bflat || undefined, mine: true, imported: true };
  if (vs.length === 1) Object.assign(it, { c: vs[0].c, n: vs[0].n, lyr: vs[0].lyr });
  else it.poly = vs;
  return it;
}

/* ---------------------------------------------------------------- MusicXML */
const kids = (n, tag) => n ? [...n.children].filter(c => c.tagName === tag) : [];
const kid = (n, tag) => kids(n, tag)[0] || null;
const txt = (n, tag) => { const k = kid(n, tag); return k ? k.textContent.trim() : ''; };
function fromMusicXML(xml, fileName) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  let root = doc.documentElement;
  if (root.tagName === 'parsererror' || doc.querySelector('parsererror')) throw new Error('xml');
  if (root.tagName === 'score-timewise') throw new Error('timewise');
  const title = txt(kid(root, 'work'), 'work-title') || txt(root, 'movement-title') || fileName;
  const names = {};
  kids(kid(root, 'part-list'), 'score-part').forEach(sp => { names[sp.getAttribute('id')] = txt(sp, 'part-name'); });
  let bflat = null;
  const voices = [];
  kids(root, 'part').forEach(part => {
    const pid = part.getAttribute('id'), lanes = new Map();
    let div = 1, t = 0, fifths = 0, measStart = 0;
    const tiedOpen = new Map();
    kids(part, 'measure').forEach(m => {
      measStart = t;
      let maxT = t;
      [...m.children].forEach(x => {
        if (x.tagName === 'attributes') {
          const d = txt(x, 'divisions'); if (d) div = +d;
          const k = kid(x, 'key'); if (k && txt(k, 'fifths') !== '') { fifths = +txt(k, 'fifths'); if (bflat === null) bflat = fifths === -1; }
        } else if (x.tagName === 'backup') { t -= (+txt(x, 'duration') || 0) / div; }
        else if (x.tagName === 'forward') { t += (+txt(x, 'duration') || 0) / div; maxT = Math.max(maxT, t); }
        else if (x.tagName === 'note') {
          if (kid(x, 'grace') || kid(x, 'cue')) return;
          const chord = !!kid(x, 'chord'), dur = (+txt(x, 'duration') || 0) / div;
          const key = (txt(x, 'staff') || '1') + '/' + (txt(x, 'voice') || '1');
          if (!lanes.has(key)) lanes.set(key, []);
          const lane = lanes.get(key);
          if (chord) return; /* the top note of a chord is the one written first; the others are left out */
          const ev = { at: t, len: dur, midi: null };
          const p = kid(x, 'pitch');
          if (p && !kid(x, 'rest')) {
            ev.letter = txt(p, 'step'); ev.alter = +txt(p, 'alter') || 0; ev.octave = +txt(p, 'octave'); ev.midi = 1;
            const ties = kids(x, 'tie').map(e => e.getAttribute('type'));
            const nm = ev.letter + ev.alter + ev.octave;
            if (ties.includes('stop') && tiedOpen.get(key) === nm) ev.tieIn = true;
            tiedOpen.set(key, ties.includes('start') ? nm : null);
            const ly = kids(x, 'lyric').find(l => !l.getAttribute('number') || l.getAttribute('number') === '1') || kid(x, 'lyric');
            if (ly && txt(ly, 'text')) { ev.syl = txt(ly, 'text'); const s = txt(ly, 'syllabic'); ev.hyph = s === 'begin' || s === 'middle'; }
          }
          lane.push(ev);
          t += dur; maxT = Math.max(maxT, t);
        }
      });
      t = Math.max(t, maxT, measStart);
    });
    const n = lanes.size;
    [...lanes.values()].forEach((evs, i) => voices.push({ name: (names[pid] || '') + (n > 1 ? ' ' + (i + 1) : ''), evs }));
  });
  return itemFrom(title, voices, !!bflat);
}

/* ---------------------------------------------------------------- MuseScore (.mscx inside .mscz) */
const DT = { long: 16, breve: 8, whole: 4, half: 2, quarter: 1, eighth: .5, '16th': .25, '32nd': .125, '64th': .0625, '128th': .03125 };
const frac = s => { const [a, b] = (s || '0/1').split('/').map(Number); return b ? a / b * 4 : 0; };
function fromMSCX(xml, fileName) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('xml');
  const score = doc.querySelector('museScore > Score') || doc.querySelector('Score');
  if (!score) throw new Error('mscx');
  let title = '';
  kids(score, 'metaTag').forEach(m => { if (m.getAttribute('name') === 'workTitle' && m.textContent.trim()) title = m.textContent.trim(); });
  if (!title) { const t = score.querySelector('VBox Text[style="title"] text, VBox Text text'); if (t) title = t.textContent.replace(/<[^>]+>/g, '').trim(); }
  /* which staff belongs to which part, and the part's name */
  const staffName = {};
  kids(score, 'Part').forEach(part => {
    const nm = txt(part, 'trackName') || part.querySelector('Instrument longName')?.textContent.trim() || '';
    kids(part, 'Staff').forEach((st, i, all) => { staffName[st.getAttribute('id')] = nm + (all.length > 1 ? ' ' + (i + 1) : ''); });
  });
  let bflat = null;
  const voices = [];
  kids(score, 'Staff').forEach(st => {
    const id = st.getAttribute('id'), lanes = [[], [], [], []];
    let t = 0, sig = 4;
    const open = [null, null, null, null];
    kids(st, 'Measure').forEach(m => {
      const len0 = m.getAttribute('len');
      const start = t; let longest = 0;
      kids(m, 'voice').forEach((v, vi) => {
        let u = start; const ratio = [], defs = {};
        const walk = node => [...node.children].forEach(x => {
          const tag = x.tagName;
          if (tag === 'TimeSig') { sig = +txt(x, 'sigN') / +txt(x, 'sigD') * 4 || sig; }
          else if (tag === 'KeySig') { const k = +(txt(x, 'accidental') || txt(x, 'concertKey') || txt(x, 'key') || 0); if (bflat === null) bflat = k === -1; }
          else if (tag === 'Tuplet') {
            /* MuseScore 3: a numbered definition, which the notes name; MuseScore 4: it opens, and endTuplet closes it */
            const r = +txt(x, 'normalNotes') / +txt(x, 'actualNotes') || 1;
            if (x.getAttribute('id')) defs[x.getAttribute('id')] = r; else ratio.push(r);
          } else if (tag === 'endTuplet') ratio.pop();
          else if (tag === 'location') { u += frac(txt(x, 'fractions')); }
          else if (tag === 'Chord' || tag === 'Rest') {
            if (kid(x, 'acciaccatura') || kid(x, 'appoggiatura') || kid(x, 'grace4') || kid(x, 'grace8') || kid(x, 'grace16') || kid(x, 'grace32')) return;
            const dtype = txt(x, 'durationType');
            let d = dtype === 'measure' ? (frac(txt(x, 'duration')) || (len0 ? frac(len0) : sig)) : (DT[dtype] || 1);
            const dots = +txt(x, 'dots') || 0; let add = d; for (let k = 0; k < dots; k++) { add /= 2; d += add; }
            d *= ratio.reduce((a, b) => a * b, 1);
            const ref = kid(x, 'Tuplet'); if (ref && !ref.children.length && defs[ref.textContent.trim()]) d *= defs[ref.textContent.trim()];
            const ev = { at: u, len: d, midi: null };
            if (tag === 'Chord') {
              const notes = kids(x, 'Note'); if (!notes.length) return;
              const n = notes.reduce((a, b) => (+txt(b, 'pitch') > +txt(a, 'pitch') ? b : a));
              const pitch = +txt(n, 'pitch'), tpc = +txt(n, 'tpc');
              ev.midi = pitch;
              if (txt(n, 'tpc') !== '') { ev.letter = 'FCGDAEB'[((tpc + 1) % 7 + 7) % 7]; ev.alter = Math.floor((tpc + 1) / 7) - 2; ev.octave = Math.floor((pitch - ev.alter) / 12) - 1; }
              const spannerIn = [...n.children].some(c => c.tagName === 'Spanner' && c.getAttribute('type') === 'Tie' && kid(c, 'prev'));
              const tieOld = !!kid(n, 'Tie'); /* MuseScore 3: <Tie> on the first note */
              if ((spannerIn || open[vi] === pitch) && lanes[vi].length) ev.tieIn = true;
              open[vi] = tieOld || [...n.children].some(c => c.tagName === 'Spanner' && c.getAttribute('type') === 'Tie' && kid(c, 'next')) ? pitch : null;
              const ly = kids(x, 'Lyrics').find(l => !txt(l, 'no') || txt(l, 'no') === '0') || kid(x, 'Lyrics');
              if (ly && txt(ly, 'text')) { ev.syl = txt(ly, 'text').replace(/<[^>]+>/g, ''); const s = txt(ly, 'syllabic'); ev.hyph = s === 'begin' || s === 'middle'; }
            } else open[vi] = null;
            lanes[vi].push(ev);
            u += d;
          }
        });
        walk(v);
        longest = Math.max(longest, u - start);
      });
      t = start + Math.max(longest, len0 ? frac(len0) : 0);
    });
    const used = lanes.filter(l => l.some(e => e.midi != null));
    used.forEach((evs, i) => voices.push({ name: (staffName[id] || '') + (used.length > 1 ? ' ' + (i + 1) : ''), evs }));
  });
  return itemFrom(title || fileName, voices, !!bflat);
}

/* ---------------------------------------------------------------- MIDI */
function fromMIDI(buf, fileName) {
  const b = new Uint8Array(buf); let p = 0;
  const u32 = () => (b[p++] << 24 | b[p++] << 16 | b[p++] << 8 | b[p++]) >>> 0, u16 = () => b[p++] << 8 | b[p++];
  const vlq = () => { let v = 0, c; do { c = b[p++]; v = (v << 7) | (c & 127); } while (c & 128); return v; };
  if (String.fromCharCode(...b.slice(0, 4)) !== 'MThd') throw new Error('midi');
  p = 8; u16(); const ntr = u16(), tpq = u16();
  if (tpq & 0x8000) throw new Error('smpte');
  p = 14; let title = '';
  const voices = [];
  for (let k = 0; k < ntr && p < b.length; k++) {
    if (String.fromCharCode(...b.slice(p, p + 4)) !== 'MTrk') break;
    p += 4; const len = u32(), end = p + len;
    let tick = 0, run = 0, name = '';
    const on = {}, notes = [];
    while (p < end) {
      tick += vlq();
      let st = b[p];
      if (st & 128) p++; else st = run;
      if (st === 0xff) { const type = b[p++], l = vlq(); if (type === 3) name = new TextDecoder().decode(b.slice(p, p + l)); p += l; continue; }
      if (st === 0xf0 || st === 0xf7) { p += vlq(); continue; }
      run = st;
      const hi = st & 0xf0, ch = st & 15;
      const d1 = b[p++], d2 = (hi === 0xc0 || hi === 0xd0) ? 0 : b[p++];
      if (ch === 9) continue; /* drums */
      if (hi === 0x90 && d2 > 0) { (on[d1] ||= []).push(tick); }
      else if (hi === 0x80 || (hi === 0x90 && d2 === 0)) { const s = (on[d1] || []).shift(); if (s != null) notes.push({ a: s / tpq, b: tick / tpq, midi: d1 }); }
    }
    p = end;
    if (!notes.length) { if (!title && name) title = name.trim(); continue; }
    /* a track that plays chords is split into lines, each note going to the highest line that is free */
    notes.sort((x, y) => x.a - y.a || y.midi - x.midi);
    const q = x => Math.round(x * 8) / 8;
    const lines = [];
    notes.forEach(n => {
      const a = q(n.a), bb = Math.max(a + .125, q(n.b));
      let line = lines.find(l => l.end <= a + 1e-6);
      if (!line) { line = { end: 0, evs: [] }; lines.push(line); }
      line.evs.push({ at: a, len: bb - a, midi: n.midi }); line.end = bb;
    });
    lines.forEach((l, i) => voices.push({ name: name.trim() + (lines.length > 1 ? ' ' + (i + 1) : ''), evs: l.evs }));
  }
  /* the parts from the highest down, as a choirbook has them */
  const mean = v => v.evs.reduce((s, e) => s + e.midi, 0) / v.evs.length;
  voices.sort((x, y) => mean(y) - mean(x));
  return itemFrom(title || fileName, voices.slice(0, 12), false);
}

/* ---------------------------------------------------------------- the one entry point */
export const ACCEPT = '.mscz,.mscx,.musicxml,.xml,.mxl,.mid,.midi';
export async function readScoreFile(file) {
  const name = file.name.replace(/\.[^.]+$/, ''), ext = (file.name.match(/\.([^.]+)$/) || [])[1]?.toLowerCase() || '';
  const buf = await file.arrayBuffer();
  if (ext === 'mid' || ext === 'midi') return fromMIDI(buf, name);
  if (ext === 'mscz' || ext === 'mxl') {
    const z = await unzip(buf);
    if (ext === 'mscz') {
      const f = z.names.find(n => /\.mscx$/i.test(n) && !n.includes('/')) || z.names.find(n => /\.mscx$/i.test(n));
      if (!f) throw new Error('mscz');
      return fromMSCX(await z.read(f), name);
    }
    const cont = await z.read('META-INF/container.xml');
    const root = cont && /full-path="([^"]+)"/.exec(cont)?.[1] || z.names.find(n => /\.(musicxml|xml)$/i.test(n) && !n.startsWith('META-INF'));
    return fromMusicXML(await z.read(root), name);
  }
  const text = new TextDecoder().decode(buf);
  if (ext === 'mscx' || /<museScore\b/.test(text.slice(0, 500))) return fromMSCX(text, name);
  return fromMusicXML(text, name);
}

/* ---------------------------------------------------------------- writing MusicXML */
const XCLEF = { c1: ['C', 1], c2: ['C', 2], c3: ['C', 3], c4: ['C', 4], c5: ['C', 5], baritone: ['F', 3], bass: ['F', 4], f5: ['F', 5], g1: ['G', 1], treble: ['G', 2], treble8: ['G', 2, -1], gamma3: ['F', 3], gamma4: ['F', 4], gamma5: ['F', 5] };
const TYPES = [[8, 'breve'], [4, 'whole'], [2, 'half'], [1, 'quarter'], [.5, 'eighth'], [.25, '16th'], [.125, '32nd']];
function typeOf(q) { /* a length in quarters as a written type with dots, or null */
  for (const [v, t] of TYPES) { if (Math.abs(q - v) < 1e-6) return [t, 0]; if (Math.abs(q - v * 1.5) < 1e-6) return [t, 1]; if (Math.abs(q - v * 1.75) < 1e-6) return [t, 2]; }
  return null;
}
function split(q) { const out = []; let left = q; while (left > 1e-6) { const [v] = TYPES.find(([x]) => x <= left + 1e-6) || [.125]; const d = typeOf(left) ? left : v; out.push(d); left -= d; } return out; }
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* piece: as the app keeps it (voices with notes stamped in minims, step 28 = c′); a semibrevis is written as a whole note */
export function toMusicXML(piece, midiOf) {
  const DIV = 8, meas = 8 * DIV; /* one bar per brevis (4/2) */
  const parts = piece.voices.map((v, i) => {
    const xc = XCLEF[v.clef] || XCLEF.c4;
    const bars = []; let cur = '', inBar = 0;
    const head = `<attributes><divisions>${DIV}</divisions><key><fifths>${piece.bflat ? -1 : 0}</fifths></key><time><beats>4</beats><beat-type>2</beat-type></time><clef><sign>${xc[0]}</sign><line>${xc[1]}</line>${xc[2] ? `<clef-octave-change>${xc[2]}</clef-octave-change>` : ''}</clef></attributes>`;
    const put = (q, n, tieStart, tieStop, lyric) => {
      const ty = typeOf(q);
      let x = '<note>';
      if (!n) x += '<rest/>';
      else {
        const m = midiOf(n), L = ((n.step % 7) + 7) % 7, oct = Math.floor(n.step / 7);
        const alter = m - ([0, 2, 4, 5, 7, 9, 11][L] + 12 * (oct + 1));
        x += `<pitch><step>${'CDEFGAB'[L]}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${oct}</octave></pitch>`;
      }
      x += `<duration>${Math.round(q * DIV)}</duration>`;
      if (tieStop) x += '<tie type="stop"/>';
      if (tieStart) x += '<tie type="start"/>';
      if (ty) x += `<type>${ty[0]}</type>` + '<dot/>'.repeat(ty[1]);
      if (n && n.acc && !tieStop) x += `<accidental>${n.acc === 'b' ? 'flat' : n.acc === '#' ? 'sharp' : 'natural'}</accidental>`;
      if (tieStart || tieStop) x += `<notations>${tieStop ? '<tied type="stop"/>' : ''}${tieStart ? '<tied type="start"/>' : ''}</notations>`;
      if (lyric) x += `<lyric number="1"><syllabic>${lyric[1]}</syllabic><text>${esc(lyric[0])}</text></lyric>`;
      return x + '</note>';
    };
    let open = false;
    const ns = v.notes;
    ns.forEach((n, k) => {
      let q = n.len * 2, first = true;
      const tiedIn = !n.rest && !!n.tie && k > 0 && !ns[k - 1].rest;
      const tiedOut = !n.rest && !!ns[k + 1] && !!ns[k + 1].tie && !ns[k + 1].rest;
      let lyric = null;
      if (n.text && !n.rest) { lyric = [n.text, open ? (n.hyphen ? 'middle' : 'end') : (n.hyphen ? 'begin' : 'single')]; open = !!n.hyphen; }
      while (q > 1e-6) {
        const take = Math.min(q, (meas - inBar) / DIV);
        split(take).forEach(d => {
          q -= d;
          cur += put(d, n.rest ? null : n, !n.rest && (q > 1e-6 || tiedOut), !n.rest && (!first || tiedIn), first ? lyric : null);
          first = false; inBar += Math.round(d * DIV);
        });
        if (inBar >= meas) { bars.push(cur); cur = ''; inBar = 0; }
      }
    });
    if (inBar) { split((meas - inBar) / DIV).forEach(d => { cur += put(d, null); }); bars.push(cur); }
    if (!bars.length) bars.push(put(8, null));
    return `<part id="P${i + 1}">` + bars.map((x, j) => `<measure number="${j + 1}">${j ? '' : head}${x}</measure>`).join('') + '</part>';
  });
  const list = piece.voices.map((v, i) => `<score-part id="P${i + 1}"><part-name>${esc(v.name || 'Voice ' + (i + 1))}</part-name></score-part>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0"><work><work-title>${esc(piece.title)}</work-title></work><identification><encoding><software>Cantare super librum</software></encoding></identification><part-list>${list}</part-list>${parts.join('')}</score-partwise>`;
}
