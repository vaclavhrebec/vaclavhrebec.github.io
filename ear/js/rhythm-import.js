/* Rhythm room: examples from outside. Text in a simple notation (easy for Claude to write from a photo of a book),
   MusicXML (.musicxml, .xml, compressed .mxl) and MIDI files (.mid). Every route ends in the same example object
   that the generator makes: { bars: [{ ts, showTs, ev, ev2?, groups, len }], attacks, dur, hands }. */
'use strict';
(function () {
  const L = () => E.rhythmLib;
  const eps = 1e-4;
  const ERR = m => { throw new Error(m); };
  let tupId = 1e6;

  const HELP = [
    'tempo: 80                 (optional; quarter notes per minute)',
    'R: 4/4 | q 8 8 q q | 3[8 8 8] q h | w',
    'L: 4/4 | h h | q q q q | w',
    '',
    'R: = right hand (upper line), L: = left hand (lower line). One hand only: write only R:.',
    'Bars are separated by |. The metre (4/4, 6/8 …) is written at the start of a bar when it begins or changes.',
    'Notes: w h q 8 16 32 (whole, half, quarter, eighth …). A dot after the note makes it dotted: q.  8.',
    'Rests: r in front: rq r8 rh.   Tie to the next note: ~ after the note: q~ 8~',
    'Tuplets: 3[8 8 8] (three in the time of two), 5[16 16 16 16 16], 6[…], 7[…], 2[8 8] (in compound time).',
    'Other ratios: 5:3[q q q q q] means five in the time of three; 9:8[…] nine in the time of eight.',
    'Every bar must add up to the metre. A first bar that is shorter is read as an upbeat.',
    'Lines may be continued: a second R: line adds more bars. Lines beginning with # are comments.'
  ].join('\n');
  const PROMPT = [
    'Please read the rhythm exercises in the attached picture (or file) and write each one as plain text in exactly this format, one exercise in one code block, with nothing else in the block:',
    '',
    HELP,
    '',
    'Rules: write only the rhythm (ignore the pitches). If the exercise has two staves or two hands, write the upper one as R: and the lower one as L:. Keep every bar, tie and tuplet. After writing, check that each bar adds up to its metre and correct any bar that does not. If a bar in the source is unclear, say so under the code block instead of guessing.'
  ].join('\n');

  const STD = [[4, 'w', 0], [3, 'h', 1], [2, 'h', 0], [1.5, 'q', 1], [1, 'q', 0], [.75, '8', 1], [.5, '8', 0], [.375, '16', 1], [.25, '16', 0], [.1875, '32', 1], [.125, '32', 0]];
  const stdOf = d => STD.find(s => Math.abs(s[0] - d) < eps);
  const TUP = [[3, 2], [5, 4], [6, 4], [7, 4], [9, 8], [2, 3], [4, 3]];
  const CANDS = [];
  TUP.forEach(([n, m]) => [.125, .25, .5, 1, 2].forEach(w => CANDS.push({ n, m, w, T: m * w })));
  CANDS.sort((a, b) => a.T - b.T || a.n - b.n);

  /* durations (in quarters) of one bar, as notes and rests, to engraved events */
  function notate(items, t0) {
    const out = []; let pos = 0, i = 0;
    const ev = (it, v, dot, d, tie, tup) => { out.push({ rest: it.rest, v, dot, d, tie: !it.rest && tie, tup: tup || null, t: t0 + pos }); pos += d; };
    while (i < items.length) {
      const it = items[i], s = stdOf(it.d);
      if (s) { ev(it, s[1], s[2], it.d, it.tie); i++; continue; }
      // a tuplet: n notes in the time of m, filling exactly m written values
      let done = false;
      for (const c of CANDS) {
        const unit = c.T / c.n, mod = c.T <= 1 ? c.T : 1;
        if (Math.abs(pos / mod - Math.round(pos / mod)) > 1e-3) continue;
        let acc = 0, j = i; const ks = [];
        while (j < items.length && acc < c.T - eps) {
          const k = items[j].d / unit;
          if (Math.abs(k - Math.round(k)) > 1e-3 || Math.round(k) < 1) { acc = -1; break; }
          acc += items[j].d; ks.push(Math.round(k)); j++;
        }
        if (acc < 0 || Math.abs(acc - c.T) > 1e-3 || ks.length < 2) continue;
        const wr = ks.map(k => stdOf(k * c.w));
        if (wr.some(x => !x)) continue;
        const tup = { id: ++tupId, n: c.n, m: c.m, ratio: L().DEF_M[c.n] !== c.m };
        ks.forEach((k, n) => { const x = items[i + n]; ev(x, wr[n][1], wr[n][2], x.d, x.tie, tup); });
        i += ks.length; done = true; break;
      }
      if (done) continue;
      // otherwise: tied standard values
      let r = it.d; const parts = [];
      while (r > .12) { const s2 = STD.find(x => x[0] <= r + eps); if (!s2) break; parts.push(s2); r -= s2[0]; }
      if (!parts.length) parts.push(STD[STD.length - 1]);
      parts.forEach((s2, n) => ev(it, s2[1], s2[2], s2[0], n < parts.length - 1 ? true : it.tie));
      i++;
    }
    return out;
  }

  /* hands: [ [ bar items ], … ]; bars: [{ ts, len }]. bar items: [{ d (quarters), rest, tie }] */
  function assemble(bars, hands) {
    const lib = L();
    let t = 0, prev = null;
    const out = bars.map((b, i) => {
      const G = lib.groupsFor(b.ts), beat = b.ts[1] === 8 && b.ts[0] % 3 === 0 ? 1.5 : 1;
      const bar = { ts: b.ts, showTs: !prev || prev.join() !== b.ts.join(), groups: G.split(''), len: b.len };
      prev = b.ts;
      hands.forEach((hh, hi) => {
        const items = hh[i] || [];
        let ev;
        if (items.ev) { ev = items.ev; let pos = 0; ev.forEach(e => { e.t = t + pos; pos += e.d; }); }   // already notated (text)
        else {
          const sum = items.reduce((a, x) => a + x.d, 0);
          const its = items.slice();
          if (sum < b.len - eps) its.push({ d: b.len - sum, rest: true, tie: false });
          ev = notate(its, t);
        }
        lib.rebeam(ev, beat);
        bar[hi ? 'ev2' : 'ev'] = ev;
      });
      t += b.len;
      return bar;
    });
    hands.forEach((hh, hi) => lib.link(out.flatMap(b => (hi ? b.ev2 : b.ev))));
    const attacks = out.reduce((a, b) => a + b.ev.concat(b.ev2 || []).filter(e => !e.rest && !e.held).length, 0);
    if (!attacks) ERR('No notes were found.');
    return { bars: out, attacks, level: 0, dur: t, hands: hands.length };
  }

  /* ---------------- text ---------------- */
  function fromText(text) {
    const lib = L();
    const lines = String(text || '').split(/\r?\n/).map(s => s.replace(/#.*$/, '').trim()).filter(Boolean);
    let bpm = 0; const seg = { R: [], L: [] };
    lines.forEach(l => {
      let m;
      if ((m = /^tempo\s*:\s*(\d+)/i.exec(l))) { bpm = +m[1]; return; }
      if (/^title\s*:/i.test(l)) return;
      if ((m = /^(R|RH|L|LH)\s*:\s*(.*)$/i.exec(l))) { seg[/^L/i.test(m[1]) ? 'L' : 'R'].push(m[2]); return; }
      seg.R.push(l);
    });
    if (!seg.R.length && seg.L.length) { seg.R = seg.L; seg.L = []; }
    if (!seg.R.length) ERR('The text is empty.');
    const parseHand = (strs, name, defTs) => {
      const bars = []; let ts = defTs && defTs[0] || [4, 4];
      strs.join(' | ').split('|').map(s => s.trim()).filter(Boolean).forEach(bs => {
        const m = /^(\d+)\s*\/\s*(\d+)\s*(.*)$/.exec(bs);
        let body = bs;
        if (m) { ts = [+m[1], +m[2]]; body = m[3]; }
        else if (defTs && defTs[bars.length]) ts = defTs[bars.length];
        if (!/[whq\d]/.test(body)) return;
        const len = ts[0] * 4 / ts[1], g = lib.groupsFor(ts)[0];
        const ev = lib.parseCell(body, g);
        const sum = ev.reduce((a, e) => a + e.d, 0);
        const n = bars.length + 1;
        if (Math.abs(sum - len) > 1e-3 && !(n === 1 && sum < len)) ERR('Bar ' + n + (name ? ' (' + name + ')' : '') + ': ' + Math.round(sum * 1000) / 1000 + ' quarter notes, but ' + ts[0] + '/' + ts[1] + ' needs ' + len + '.');
        bars.push({ ts, len: n === 1 && sum < len ? sum : len, items: ev.map(e => ({ d: e.d, rest: e.rest, tie: e.tie })), ev });
      });
      return bars;
    };
    const R = parseHand(seg.R, seg.L.length ? 'R' : '');
    if (!R.length) ERR('The text has no bars.');
    let Lh = null;
    if (seg.L.length) {
      Lh = parseHand(seg.L, 'L', R.map(b => b.ts));
      if (Lh.length !== R.length) ERR('The two hands need the same number of bars: R has ' + R.length + ', L has ' + Lh.length + '.');
    }
    const barsInfo = R.map(b => ({ ts: b.ts, len: b.len }));
    const ex = assemble(barsInfo, Lh ? [R.map(b => ({ ev: b.ev })), Lh.map(b => ({ ev: b.ev }))] : [R.map(b => ({ ev: b.ev }))]);
    return { ex, bpm };
  }

  /* ---------------- MusicXML ---------------- */
  async function unzip(buf) {
    const v = new DataView(buf), u8 = new Uint8Array(buf);
    let e = buf.byteLength - 22;
    while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) ERR('This is not a valid .mxl file.');
    const n = v.getUint16(e + 10, true); let p = v.getUint32(e + 16, true);
    const files = {};
    for (let i = 0; i < n; i++) {
      const method = v.getUint16(p + 10, true), csz = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
      const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
      const lo = off + 30 + v.getUint16(off + 26, true) + v.getUint16(off + 28, true);
      files[name] = { method, data: u8.subarray(lo, lo + csz) };
      p += 46 + nl + xl + cl;
    }
    const get = async name => {
      const f = files[name]; if (!f) return null;
      if (f.method === 0) return new TextDecoder().decode(f.data);
      const ds = new DecompressionStream('deflate-raw');
      const out = new Response(new Blob([f.data]).stream().pipeThrough(ds));
      return new TextDecoder().decode(await out.arrayBuffer());
    };
    let root = null;
    const cont = await get('META-INF/container.xml');
    if (cont) { const m = /full-path="([^"]+)"/.exec(cont); if (m) root = m[1]; }
    if (!root) root = Object.keys(files).find(f => /\.(xml|musicxml)$/i.test(f) && !/^META-INF/.test(f));
    const x = root && await get(root);
    if (!x) ERR('No score was found inside this .mxl file.');
    return x;
  }
  function fromXML(text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) ERR('The file is not valid MusicXML.');
    const parts = [...doc.getElementsByTagName('part')];
    if (!parts.length) ERR('No music was found in this file.');
    const tx = (el, tag) => { const c = el && [...el.children].find(k => k.tagName === tag); return c ? c.textContent.trim() : ''; };
    const lineDefs = [];
    parts.forEach((p, pi) => {
      const staves = new Set();
      [...p.getElementsByTagName('note')].forEach(n => staves.add(+(tx(n, 'staff') || 1)));
      [...staves].sort().forEach(st => lineDefs.push({ pi, st }));
    });
    const chosen = lineDefs.slice(0, 2);
    if (!chosen.length) ERR('No notes were found.');
    let bpm = 0; const tm = /<sound[^>]*tempo="([\d.]+)"/.exec(text); if (tm) bpm = +tm[1];
    const nm = parts[0].getElementsByTagName('measure').length;
    const barsInfo = []; const handItems = chosen.map(() => []);
    chosen.forEach((ld, hi) => {
      const ms = [...parts[ld.pi].getElementsByTagName('measure')];
      let div = 1, ts = [4, 4]; const notes = [...parts[ld.pi].getElementsByTagName('note')].filter(n => +(tx(n, 'staff') || 1) === ld.st && !n.getElementsByTagName('grace').length);
      const voice0 = Math.min(...notes.map(n => +(tx(n, 'voice') || 1)));
      ms.forEach((m, mi) => {
        const items = [];
        [...m.children].forEach(c => {
          if (c.tagName === 'attributes') {
            if (tx(c, 'divisions')) div = +tx(c, 'divisions');
            const t = [...c.children].find(k => k.tagName === 'time');
            if (t && tx(t, 'beats')) { const b = parseInt(tx(t, 'beats'), 10), d = parseInt(tx(t, 'beat-type'), 10); if (b && d) ts = [b, d]; }
          } else if (c.tagName === 'note') {
            if (c.getElementsByTagName('grace').length || c.getElementsByTagName('chord').length) return;
            if (+(tx(c, 'staff') || 1) !== ld.st || +(tx(c, 'voice') || 1) !== voice0) return;
            const d = +tx(c, 'duration') / div; if (!(d > 0)) return;
            const rest = !!c.getElementsByTagName('rest').length;
            const tie = [...c.getElementsByTagName('tie')].some(t => t.getAttribute('type') === 'start');
            items.push({ d, rest, tie });
          } else if (c.tagName === 'forward' && +(tx(c, 'voice') || voice0) === voice0 && +(tx(c, 'staff') || ld.st) === ld.st) {
            items.push({ d: +tx(c, 'duration') / div, rest: true, tie: false });
          }
        });
        handItems[hi].push(items);
        if (hi === 0) { const sum = items.reduce((a, x) => a + x.d, 0), len = ts[0] * 4 / ts[1]; barsInfo.push({ ts, len: mi === 0 && sum && sum < len - eps ? sum : len }); }
      });
    });
    const keep = barsInfo.map((b, i) => handItems.some(h => h[i] && h[i].length));
    const last = keep.lastIndexOf(true);
    if (last < 0) ERR('No notes were found.');
    return { ex: assemble(barsInfo.slice(0, last + 1), handItems.map(h => h.slice(0, last + 1))), bpm };
  }

  /* ---------------- MIDI ---------------- */
  function fromMidi(buf) {
    const v = new DataView(buf); let p = 0;
    const str = n => { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(v.getUint8(p++)); return s; };
    const vlq = () => { let x = 0, b; do { b = v.getUint8(p++); x = (x << 7) | (b & 127); } while (b & 128); return x; };
    if (str(4) !== 'MThd') ERR('This is not a MIDI file.');
    p += 4; p += 2; const nt = v.getUint16(p); p += 2; const div = v.getUint16(p); p += 2;
    if (div & 0x8000) ERR('This MIDI file counts in time code, not in beats.');
    const tracks = []; const tss = [{ tick: 0, ts: [4, 4] }]; let bpm = 0;
    for (let k = 0; k < nt && p < buf.byteLength - 8; k++) {
      if (str(4) !== 'MTrk') break;
      const l = v.getUint32(p); p += 4; const end = Math.min(buf.byteLength, p + l);
      let tick = 0, run = 0; const notes = [], open = new Map();
      while (p < end) {
        tick += vlq();
        let st = v.getUint8(p);
        if (st < 0x80) st = run; else p++;
        if (st === 0xFF) {
          const ty = v.getUint8(p++), ln = vlq();
          if (ty === 0x58 && ln >= 2) tss.push({ tick, ts: [v.getUint8(p), 1 << v.getUint8(p + 1)] });
          if (ty === 0x51 && ln === 3 && !bpm) bpm = 60e6 / ((v.getUint8(p) << 16) | (v.getUint8(p + 1) << 8) | v.getUint8(p + 2));
          p += ln;
        } else if (st === 0xF0 || st === 0xF7) { p += vlq(); }
        else {
          run = st; const c = st & 0xF0, ch = st & 15, a = v.getUint8(p++), b = (c === 0xC0 || c === 0xD0) ? 0 : v.getUint8(p++);
          const key = ch * 128 + a;
          if (c === 0x90 && b > 0) { const n = { on: tick, off: tick, pitch: a, ch }; notes.push(n); open.set(key, n); }
          else if (c === 0x80 || (c === 0x90 && b === 0)) { const n = open.get(key); if (n) { n.off = tick; open.delete(key); } }
        }
      }
      p = end;
      if (notes.length) tracks.push(notes);
    }
    let lines = tracks;
    if (lines.length === 1) {   // one track: perhaps one channel for each hand
      const byCh = {}; lines[0].forEach(n => (byCh[n.ch] = byCh[n.ch] || []).push(n));
      const chs = Object.values(byCh); if (chs.length > 1) lines = chs;
    }
    if (!lines.length) ERR('No notes were found.');
    lines = lines.sort((a, b) => b.length - a.length).slice(0, 2);
    const mean = a => a.reduce((s, n) => s + n.pitch, 0) / a.length;
    lines.sort((a, b) => mean(b) - mean(a));   // the higher line is the right hand
    // grid
    const all = lines.flatMap(l => l.flatMap(n => [n.on / div, n.off / div]));
    let G = 0;
    for (const g of [4, 8, 12, 16, 20, 24, 28, 48, 60]) { if (all.every(x => Math.abs(x * g - Math.round(x * g)) / g <= .02)) { G = g; break; } }
    if (!G) G = 12;
    const q = x => Math.round(x * G);
    // bars
    tss.sort((a, b) => a.tick - b.tick);
    const endU = Math.max(...lines.map(l => Math.max(...l.map(n => q(n.off / div)))));
    const barsInfo = []; let u = 0, ti = 0;
    while (u < endU || !barsInfo.length) {
      while (ti + 1 < tss.length && q(tss[ti + 1].tick / div) <= u) ti++;
      const ts = tss[ti].ts, len = ts[0] * 4 / ts[1];
      barsInfo.push({ ts, len, u0: u, u1: u + Math.round(len * G) }); u += Math.round(len * G);
      if (barsInfo.length > 400) ERR('This file is too long.');
    }
    const total = barsInfo[barsInfo.length - 1].u1;
    const hands = lines.map(notes => {
      const byOn = new Map();
      notes.forEach(n => { const o = q(n.on / div), f = q(n.off / div); const c = byOn.get(o); if (!c || f > c) byOn.set(o, f); });
      const ons = [...byOn.keys()].sort((a, b) => a - b);
      let legato = 0; ons.forEach((o, i) => { const nx = i + 1 < ons.length ? ons[i + 1] : o + 1; if (Math.abs(byOn.get(o) - nx) <= 1) legato++; });
      const notated = legato >= ons.length * .7;
      const segs = [];
      if (ons[0] > 0) segs.push({ a: 0, b: ons[0], rest: true });
      ons.forEach((o, i) => {
        const nx = i + 1 < ons.length ? ons[i + 1] : Math.max(byOn.get(o), o + 1);
        let e = nx; const f = Math.max(byOn.get(o), o + 1);
        if (f < nx && (notated ? nx - f >= 1 : nx - f >= G)) e = f;
        segs.push({ a: o, b: e, rest: false });
        if (e < nx) segs.push({ a: e, b: nx, rest: true });
      });
      // cut at the bar lines
      return barsInfo.map(bi => {
        const items = [];
        segs.forEach(s => {
          const a = Math.max(s.a, bi.u0), b = Math.min(s.b, bi.u1);
          if (b > a) items.push({ d: (b - a) / G, rest: s.rest, tie: !s.rest && s.b > bi.u1 });
        });
        return items;
      });
    });
    const ex = assemble(barsInfo.map(b => ({ ts: b.ts, len: b.len })), hands);
    return { ex, bpm };
  }

  async function fromFile(file) {
    if (file.size > 8e6) ERR('The file is too large.');
    const name = file.name.toLowerCase();
    if (/\.(mid|midi)$/.test(name)) return fromMidi(await file.arrayBuffer());
    if (/\.mxl$/.test(name)) return fromXML(await unzip(await file.arrayBuffer()));
    const text = await file.text();
    if (/^\s*</.test(text)) return fromXML(text);
    return fromText(text);
  }
  E.rhythmImport = { fromText, fromXML, fromMidi, fromFile, notate, assemble, HELP, PROMPT };
})();
