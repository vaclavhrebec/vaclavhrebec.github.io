/* Room VIII — melodic dictation.
   A short melody is played; the first note is given. The player writes the rest on the staff:
   tap a place on the staff to add a note (or tap a written note's column to move it), ▲▼ and the
   accidentals change the selected note. With rhythm on, a duration is chosen before tapping.
   Melodies are generated in a key or mode, graded in eight levels. */
'use strict';
(function () {
  const h = E.h, T = E.t, N = E.notation;
  const NAT = [0, 2, 4, 5, 7, 9, 11];
  const SH = [3, 0, 4, 1, 5, 2, 6], FL = [6, 2, 5, 1, 4, 0, 3];        // letters of the sharps and flats, in order
  const MODES = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10]
  };
  const MODE_NAME = {
    major: { en: 'major', de: 'Dur', fr: 'majeur', cs: 'dur' }, minor: { en: 'minor', de: 'Moll', fr: 'mineur', cs: 'moll' },
    dorian: { en: 'Dorian', de: 'dorisch', fr: 'dorien', cs: 'dórský' }, phrygian: { en: 'Phrygian', de: 'phrygisch', fr: 'phrygien', cs: 'frygický' },
    lydian: { en: 'Lydian', de: 'lydisch', fr: 'lydien', cs: 'lydický' }, mixolydian: { en: 'Mixolydian', de: 'mixolydisch', fr: 'mixolydien', cs: 'mixolydický' }
  };
  // [tonic letter, alteration, mode, fifths]
  const KEYS = [
    [0, 0, 'major', 0], [4, 0, 'major', 1], [3, 0, 'major', -1], [1, 0, 'major', 2], [6, -1, 'major', -2], [5, 0, 'major', 3], [2, -1, 'major', -3], [2, 0, 'major', 4], [5, -1, 'major', -4],
    [5, 0, 'minor', 0], [2, 0, 'minor', 1], [1, 0, 'minor', -1], [6, 0, 'minor', 2], [4, 0, 'minor', -2], [3, 1, 'minor', 3], [0, 0, 'minor', -3], [0, 1, 'minor', 4], [3, 0, 'minor', -4],
    [1, 0, 'dorian', 0], [4, 0, 'dorian', -1], [2, 0, 'phrygian', 0], [5, 0, 'phrygian', -1], [4, 0, 'mixolydian', 0], [0, 0, 'mixolydian', -1], [3, 0, 'lydian', 0]
  ].map(k => ({ l: k[0], a: k[1], mode: k[2], fifths: k[3] }));
  const LEVELS = [
    { n: 4, steps: 1, modes: ['major'], name: 'Steps' },
    { n: 5, steps: 2, modes: ['major'], name: 'Thirds' },
    { n: 6, steps: 4, triad: true, modes: ['major'], name: 'Triad leaps' },
    { n: 6, steps: 5, modes: ['major', 'minor'], name: 'Leaps to the sixth' },
    { n: 8, steps: 7, modes: ['major', 'minor'], name: 'Octave', start: true },
    { n: 8, steps: 7, modes: ['major', 'minor', 'dorian', 'phrygian', 'mixolydian'], name: 'Modes', start: true, rhythm: true },
    { n: 9, steps: 7, modes: ['major', 'minor', 'dorian', 'mixolydian'], name: 'Chromatic notes', start: true, rhythm: true, chrom: true },
    { n: 11, steps: 9, modes: ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian'], name: 'Long melodies', start: true, rhythm: true, chrom: true }
  ];
  const DUR = [{ d: 3, label: '𝅗𝅥.' }, { d: 2, label: '𝅗𝅥' }, { d: 1.5, label: '♩.' }, { d: 1, label: '♩' }, { d: .5, label: '♪' }];
  const CLEFS = ['treble', 'bass', 'alto', 'tenor', 'soprano'];
  const CLEF_NAME = { treble: { en: 'treble', de: 'Violinschlüssel', fr: 'clé de sol', cs: 'houslový' }, bass: { en: 'bass', de: 'Bassschlüssel', fr: 'clé de fa', cs: 'basový' },
    alto: { en: 'alto (C3)', de: 'Alt (C3)', fr: 'ut 3', cs: 'altový (C3)' }, tenor: { en: 'tenor (C4)', de: 'Tenor (C4)', fr: 'ut 4', cs: 'tenorový (C4)' }, soprano: { en: 'soprano (C1)', de: 'Sopran (C1)', fr: 'ut 1', cs: 'sopránový (C1)' } };

  const cfg = Object.assign({ level: 0, clefs: ['treble'], keys: 2, rhythm: 'level', bpm: 80, ref: true }, E.load('cfg.melody', {}));
  const save = () => E.save('cfg.melody', cfg);
  const stats = E.load('stats.melody', { n: 0, ok: 0, notes: 0, notesOk: 0 });

  /* ---------- pitches ---------- */
  const dia = p => p.o * 7 + p.l;                          // diatonic number, as in notation.js
  const midi = p => 12 * (p.o + 1) + NAT[p.l] + p.a;
  const fromDia = (d, a) => ({ l: ((d % 7) + 7) % 7, o: Math.floor(d / 7), a: a || 0 });
  function keyAlt(fifths, l) {                             // alteration the key signature gives to a letter
    if (fifths > 0) return SH.slice(0, fifths).includes(l) ? 1 : 0;
    if (fifths < 0) return FL.slice(0, -fifths).includes(l) ? -1 : 0;
    return 0;
  }
  function scalePitch(key, k, oct) {                       // degree k (any integer) above the tonic in octave oct
    const kk = k + 21, base = { l: key.l, a: key.a, o: oct - 3 };
    const semis = MODES[key.mode][kk % 7] + 12 * Math.floor(kk / 7);
    return E.addInterval(base, kk, semis);
  }

  /* ---------- a melody ---------- */
  function rhythmOn() { return cfg.rhythm === 'always' || (cfg.rhythm === 'level' && LEVELS[cfg.level].rhythm); }
  function makeRhythm(target) {
    const beats = E.pick([4, 4, 3]), out = [];
    let bars = Math.max(2, Math.round(target / (beats * 1.1)));
    for (let b = 0; b < bars; b++) {
      if (b === bars - 1) { out.push(beats === 3 ? { d: 2, dot: 1 } : { d: 2 }); if (beats === 4) { out.splice(out.length - 1, 0, { d: 1 }, { d: 1 }); } continue; }
      let t = 0;
      while (t < beats) {
        const r = Math.random();
        if (t % 2 === 0 && t + 2 <= beats && r < .18) { out.push({ d: 2 }); t += 2; }
        else if (t + 2 <= beats && r < .32) { out.push({ d: 1.5 }, { d: .5 }); t += 2; }
        else if (r < .6) { out.push({ d: .5 }, { d: .5 }); t += 1; }
        else { out.push({ d: 1 }); t += 1; }
      }
    }
    // the last bar of 4/4 above became: quarter, quarter, half
    return { beats, durs: out.map(x => x.dot ? 3 : x.d) };
  }
  function makeMelody() {
    const L = LEVELS[cfg.level];
    const modes = L.modes;
    let keys = KEYS.filter(k => modes.includes(k.mode) && Math.abs(k.fifths) <= cfg.keys);
    if (!keys.length) keys = KEYS.filter(k => k.fifths === 0 && modes.includes(k.mode));
    const key = E.pick(keys);
    let rh = null;
    if (rhythmOn()) for (let k = 0; k < 60; k++) { rh = makeRhythm(L.n); if (rh.durs.length >= L.n - 2 && rh.durs.length <= L.n + 3) break; }
    const n = rh ? rh.durs.length : L.n;
    const triad = [0, 2, 4, 7, -3, -5];
    for (let tries = 0; tries < 400; tries++) {
      let k = L.start ? E.pick([0, 0, 2, 4]) : 0;
      const ks = [k];
      let ok = true;
      for (let i = 1; i < n; i++) {
        const prev = ks[i - 1], last2 = i > 1 ? prev - ks[i - 2] : 0;
        let mv;
        if (Math.abs(last2) >= 3) mv = -Math.sign(last2);                        // after a leap, a step back
        else if (i === n - 1) { mv = 0 - (((prev % 7) + 7) % 7); if (mv < -3) mv += 7; if (Math.abs(mv) > L.steps) { ok = false; break; } }
        else {
          const r = Math.random();
          if (r < .55 || L.steps === 1) mv = E.pick([1, -1]);
          else { const sz = 2 + E.rand(L.steps - 1); mv = E.pick([1, -1]) * sz; }
          if (L.triad && Math.abs(mv) >= 3 && !triad.includes(((prev + mv) % 7 + 7) % 7)) mv = Math.sign(mv);
        }
        // the note before the last: a step above or below the final
        if (i === n - 2) { const fin = Math.round(prev / 7) * 7; mv = E.pick([fin + 1, fin - 1]) - prev; if (Math.abs(mv) > Math.max(L.steps, 2)) mv = Math.sign(mv); }
        const nk = prev + mv;
        if (nk < -4 || nk > (L.steps >= 7 ? 9 : 7)) { ok = false; break; }
        if (mv === 0 && (cfg.level < 3 || Math.random() < .7)) { ok = false; break; }
        ks.push(nk);
      }
      if (!ok) continue;
      // the final is the tonic, approached by step
      const fin = ks[n - 1];
      if (((fin % 7) + 7) % 7 !== 0 || Math.abs(ks[n - 1] - ks[n - 2]) !== 1) continue;
      let notes = ks.map(k => scalePitch(key, k, 4));
      // the leading note in minor before the final
      if (key.mode === 'minor') notes.forEach((p, i) => { if (i < n - 1 && ((ks[i] % 7) + 7) % 7 === 6 && ks[i + 1] === ks[i] + 1) notes[i] = Object.assign({}, p, { a: p.a + 1 }); });
      // chromatic neighbours: the raised fourth below the fifth, the lowered seventh above the sixth
      if (L.chrom) notes.forEach((p, i) => {
        if (i === 0 || i >= n - 1) return;
        const d0 = ((ks[i] % 7) + 7) % 7;
        if (d0 === 3 && ks[i + 1] === ks[i] + 1 && Math.random() < .6) notes[i] = Object.assign({}, p, { a: p.a + 1 });
        else if (d0 === 6 && ks[i + 1] === ks[i] - 1 && key.mode === 'major' && Math.random() < .6) notes[i] = Object.assign({}, p, { a: p.a - 1 });
      });
      // no augmented or diminished leaps (tritones, augmented seconds) before the chromatic levels
      let bad = false;
      for (let i = 1; i < n && !bad; i++) {
        const s = Math.abs(midi(notes[i]) - midi(notes[i - 1])), st = Math.abs(dia(notes[i]) - dia(notes[i - 1]));
        if (!L.chrom && (s === 6 || (st === 1 && s === 3) || (st === 2 && s === 2) || (st === 3 && s === 6) || (st === 4 && s === 6) || (st === 4 && s === 8))) bad = true;
      }
      if (bad) continue;
      // a clef among the chosen ones, and the octave with the fewest notes off the staff
      const clef = E.pick(cfg.clefs.length ? cfg.clefs : ['treble']);
      const bot = N.CLEFS[clef].bottom, ds = notes.map(dia);
      const off = sh => ds.reduce((a, d) => { const pos = d + sh - bot; return a + (pos < -2 ? -2 - pos : pos > 10 ? pos - 10 : 0); }, 0);
      const c = Math.round((bot + 4 - (Math.min(...ds) + Math.max(...ds)) / 2) / 7) * 7;
      const shift = [c, c - 7, c + 7].sort((a, b) => off(a) - off(b))[0];
      if (off(shift) > (L.steps >= 9 ? 2 : 0)) continue;        // at most one ledger line, a little more for the longest melodies
      notes = notes.map(p => Object.assign({}, p, { o: p.o + shift / 7 }));
      const durs = rh ? rh.durs : notes.map(() => 1);
      return { key, clef, beats: rh ? rh.beats : 0, notes: notes.map((p, i) => Object.assign(p, { d: durs[i] })) };
    }
    return makeMelodyFallback(key);
  }
  function makeMelodyFallback(key) {
    const ks = [0, 1, 2, 1, 0];
    const clef = cfg.clefs[0] || 'treble', mid = N.CLEFS[clef].bottom + 4;
    let notes = ks.map(k => scalePitch(key, k, 4));
    const shift = Math.round((mid - dia(notes[0]) - 1) / 7) * 7;
    notes = notes.map(p => Object.assign({}, p, { o: p.o + shift / 7, d: 1 }));
    return { key, clef, beats: 0, notes };
  }

  /* ---------- sound ---------- */
  function playNotes(notes, opts) {
    const A = E.audio; A.stop();
    let t = A.now();
    const beat = 60 / cfg.bpm;
    if (opts && opts.ref) {                                // the key: tonic chord, then a breath
      const k = st.q.key, root = midi(scalePitch(k, 0, 3)), third = MODES[k.mode][2], fifth = MODES[k.mode][4];
      [0, third, fifth, 12].forEach(s => A.tone(E.mtof(root + s), t, 1.2, { vol: .18 }));
      t += 1.8;
    }
    notes.forEach(p => { A.tone(E.mtof(midi(p)), t, Math.max(.2, p.d * beat * .92), { vol: .3 }); t += p.d * beat; });
  }

  /* ---------- state ---------- */
  const st = { q: null, mine: [], sel: -1, dur: 1, acc: null, checked: false, result: null };
  function newQ(play) {
    st.q = makeMelody();
    const f = st.q.notes[0];
    st.mine = [Object.assign({}, f)];
    st.sel = -1; st.checked = false; st.result = null; st.dur = 1;
    draw();
    if (play) playNotes(st.q.notes, { ref: cfg.ref });
  }

  /* ---------- engraving ---------- */
  const SPX = 12;
  function stem(x, y, up, SP, d) {
    let s = N.line(up ? x + SP * .62 : x - SP * .62, y, up ? x + SP * .62 : x - SP * .62, up ? y - SP * 3.4 : y + SP * 3.4, SP * .13);
    if (d === .5) {
      const fx = up ? x + SP * .62 : x - SP * .62, fy = up ? y - SP * 3.4 : y + SP * 3.4, dir = up ? 1 : -1;
      s += `<path d="M${fx} ${fy} C${fx + SP * .15} ${fy + dir * SP * 1.1} ${fx + SP * 1.45} ${fy + dir * SP * 1.5} ${fx + SP * .95} ${fy + dir * SP * 2.9} C${fx + SP * 1.2} ${fy + dir * SP * 1.8} ${fx + SP * .5} ${fy + dir * SP * 1.35} ${fx} ${fy + dir * SP * 1.05}Z"/>`;
    }
    return s;
  }
  /* draws one staff with notes. notes = [{l,a,o,d}], marks[i] = 'ok' | 'bad' | 'sel' | 'given' */
  function staffSVG(notes, opts) {
    const q = st.q, SP = SPX, clef = q.clef, top = SP * 4.5;
    const rh = !!q.beats;
    const ks = N.keySig(clef, q.key.fifths, SP * 1.2 + N.clefWidth(SP) + SP * .5, top, SP);
    let x0 = SP * 1.2 + N.clefWidth(SP) + SP * .5 + ks.w + SP * 1.2;
    let s = '';
    if (rh) {
      const tx = x0 + SP * .6;
      s += `<text x="${tx}" y="${top + SP * 1.85}" font-size="${SP * 2.3}" text-anchor="middle">${q.beats}</text><text x="${tx}" y="${top + SP * 3.85}" font-size="${SP * 2.3}" text-anchor="middle">4</text>`;
      x0 += SP * 2.4;
    }
    const total = q.notes.length;
    const W = opts.W;
    const avail = W - x0 - SP * 2;
    const unit = rh ? avail / q.notes.reduce((a, p) => a + (.6 + p.d * .8), 0) : avail / total;
    const xs = [];
    let x = x0 + SP;
    let beatPos = 0;
    q.notes.forEach((p, i) => { xs.push(x); x += rh ? unit * (.6 + p.d * .8) : unit; });
    const bottomDia = N.CLEFS[clef].bottom;
    notes.forEach((p, i) => {
      const xi = xs[i], d = dia(p), y = N.yOf(clef, d, top, SP);
      const pos = d - bottomDia;
      for (let l = -2; l >= pos; l -= 2) s += N.line(xi - SP, top + 4 * SP - l * SP / 2, xi + SP, top + 4 * SP - l * SP / 2, SP * .1, 'stl');
      for (let l = 10; l <= pos; l += 2) s += N.line(xi - SP, top + 4 * SP - l * SP / 2, xi + SP, top + 4 * SP - l * SP / 2, SP * .1, 'stl');
      const ka = keyAlt(q.key.fifths, p.l);
      const cls = opts.marks && opts.marks[i] ? 'm-' + opts.marks[i] : '';
      s += `<g class="${cls}">`;
      if (p.a !== ka) s += N.acc(p.a === 1 ? 'sharp' : p.a === -1 ? 'flat' : 'natural', xi - SP * 2.2, y, SP, 2.8);
      const hollow = rh && p.d >= 2;
      s += N.head(xi, y, SP, hollow);
      if (rh) {
        s += stem(xi, y, pos < 4, SP, p.d);
        if (p.d === 1.5 || p.d === 3) s += `<circle cx="${xi + SP * 1.25}" cy="${y - (pos % 2 === 0 ? SP * .5 : 0)}" r="${SP * .2}"/>`;
      }
      s += '</g>';
      if (opts.marks && opts.marks[i] === 'sel') s += `<rect class="selbox" x="${xi - SP * 1.3}" y="${top - SP * 2.5}" width="${SP * 2.6}" height="${SP * 9}" rx="${SP * .4}"/>`;
    });
    // barlines between bars
    if (rh) {
      let t = 0;
      q.notes.forEach((p, i) => { t += p.d; if (i < q.notes.length - 1 && Math.abs(t / q.beats - Math.round(t / q.beats)) < 1e-6) { const bx = (xs[i] + xs[i + 1]) / 2 - (p.d >= 1.5 ? 0 : 0); s += N.line(bx, top, bx, top + 4 * SP, SP * .12, 'stl'); } });
    }
    // empty places still to fill
    if (opts.slots) for (let i = notes.length; i < total; i++) s += `<circle class="slot" cx="${xs[i]}" cy="${top + 2 * SP}" r="${SP * .5}"/>`;
    s += N.line(W - SP * .9, top, W - SP * .9, top + 4 * SP, SP * .12, 'stl') + N.line(W - SP * .35, top, W - SP * .35, top + 4 * SP, SP * .4, 'stl');
    const H = top + 4 * SP + SP * 4.5;
    return { svg: `<svg class="score dict" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">` + N.staff(0, W, top, SP) + N.CLEFS[clef].draw(SP * 1.2, top, SP) + ks.svg + s + '</svg>', xs, top, SP };
  }

  /* ---------- the room ---------- */
  let root = null, lay = null;
  function width() { return Math.max(320, Math.min(980, (root && root.clientWidth || 700) - 30)); }
  function setPitchAt(i, d) {
    const q = st.q, l = ((d % 7) + 7) % 7;
    const a = st.acc != null ? st.acc : keyAlt(q.key.fifths, l);
    const p = Object.assign(fromDia(d, a), { d: q.beats ? st.dur : 1 });
    if (i < st.mine.length) { p.d = q.beats ? st.mine[i].d : 1; st.mine[i] = p; }
    else st.mine.push(p);
    st.sel = i; st.acc = null;
    E.audio.stop(); E.audio.tone(E.mtof(midi(p)), E.audio.now(), .45, { vol: .26 });
  }
  function tap(ev) {
    if (!st.q || st.checked || !lay) return;
    const svg = ev.currentTarget, pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const d = N.CLEFS[st.q.clef].bottom + Math.round((lay.top + 4 * lay.SP - p.y) / (lay.SP / 2));
    // which column?
    let col = -1, best = Infinity;
    lay.xs.forEach((x, i) => { const dd = Math.abs(x - p.x); if (dd < best) { best = dd; col = i; } });
    if (col <= 0) return;                                          // the first note is given
    if (col > st.mine.length) col = st.mine.length;               // fill from left to right
    if (col >= st.q.notes.length) return;
    setPitchAt(col, Math.max(N.CLEFS[st.q.clef].bottom - 6, Math.min(N.CLEFS[st.q.clef].bottom + 14, d)));
    draw();
  }
  function moveSel(by) {
    const i = st.sel; if (i <= 0 || i >= st.mine.length || st.checked) return;
    const p = st.mine[i], nd = dia(p) + by, l = ((nd % 7) + 7) % 7;
    st.mine[i] = Object.assign(fromDia(nd, keyAlt(st.q.key.fifths, l)), { d: p.d });
    E.audio.stop(); E.audio.tone(E.mtof(midi(st.mine[i])), E.audio.now(), .45, { vol: .26 });
    draw();
  }
  function setAcc(a) {
    const i = st.sel;
    if (i > 0 && i < st.mine.length && !st.checked) {
      st.mine[i] = Object.assign({}, st.mine[i], { a });
      E.audio.stop(); E.audio.tone(E.mtof(midi(st.mine[i])), E.audio.now(), .45, { vol: .26 });
    } else st.acc = a;
    draw();
  }
  function setDur(d) {
    st.dur = d;
    const i = st.sel;
    if (i > 0 && i < st.mine.length && !st.checked) st.mine[i] = Object.assign({}, st.mine[i], { d });
    draw();
  }
  function del() {
    if (st.checked) return;
    if (st.sel > 0 && st.sel < st.mine.length) st.mine.splice(st.sel, 1);
    else if (st.mine.length > 1) st.mine.pop();
    st.sel = Math.min(st.sel, st.mine.length - 1); if (st.sel === 0) st.sel = -1;
    draw();
  }
  function check() {
    const q = st.q; if (!q || st.checked || st.mine.length < q.notes.length) return;
    const marks = q.notes.map((p, i) => i === 0 ? 'given' : (midi(st.mine[i]) === midi(p) && (!q.beats || st.mine[i].d === p.d)) ? 'ok' : 'bad');
    const right = marks.filter(m => m === 'ok').length, of = q.notes.length - 1;
    st.checked = true; st.result = { marks, right, of };
    stats.n++; if (right === of) stats.ok++; stats.notes += of; stats.notesOk += right;
    E.save('stats.melody', stats); E.practised();
    // a whole melody right three times in a row at a level suggests the next one
    st.run = right === of ? (st.run || 0) + 1 : 0;
    draw();
  }

  function draw() {
    if (!root) return;
    root.innerHTML = '';
    const q = st.q;
    const L = LEVELS[cfg.level];
    const lv = h('div', { class: 'levelbar wide' }, LEVELS.map((x, i) => h('button', { type: 'button', class: 'lv' + (i === cfg.level ? ' on' : i < cfg.level ? ' past' : ''), title: T(x.name),
      onclick: () => { cfg.level = i; save(); newQ(false); } }, h('b', null, String(i + 1)), h('small', null, x.n + (LEVELS[i].rhythm ? ' ♪' : '')))));
    const head = h('div', { class: 'lvhead' }, h('span', null, T('Level'), ' ', h('b', null, String(cfg.level + 1)), ' · ', T(L.name)),
      st.run >= 3 && cfg.level < LEVELS.length - 1 ? h('button', { type: 'button', class: 'mini', onclick: () => { cfg.level++; st.run = 0; save(); newQ(true); } }, T('Three right in a row. Next level →')) : null);

    const sheet = h('div', { class: 'dictsheet' });
    if (q) {
      const W = width();
      const marks = st.checked ? st.result.marks : st.mine.map((_, i) => i === 0 ? 'given' : i === st.sel ? 'sel' : '');
      lay = staffSVG(st.mine, { W, marks, slots: !st.checked });
      sheet.innerHTML = lay.svg;
      const svg = sheet.querySelector('svg');
      svg.addEventListener('pointerdown', tap);
      if (st.checked) {
        const ans = staffSVG(q.notes, { W });
        sheet.append(h('div', { class: 'cap' }, T('The melody')), h('div', { html: ans.svg }));
      }
    } else sheet.append(h('div', { class: 'veil' }, T('Press Start. The first note of the melody is written for you.')));

    const playBtn = h('button', { class: 'btn primary', type: 'button', onclick: () => { if (!q) newQ(true); else playNotes(q.notes, {}); } }, q ? T('Play again') : T('Start'));
    const refBtn = q ? h('button', { class: 'btn', type: 'button', onclick: () => playNotes(q.notes.slice(0, 0), { ref: true }) }, T('Key chord')) : null;
    const mineBtn = q ? h('button', { class: 'btn', type: 'button', onclick: () => playNotes(st.mine, {}) }, T('Play what I wrote')) : null;
    const checkBtn = q && !st.checked ? h('button', { class: 'btn', type: 'button', disabled: st.mine.length < q.notes.length, onclick: check }, T('Check')) : null;
    const nextBtn = q && st.checked ? h('button', { class: 'btn', type: 'button', onclick: () => newQ(true) }, T('Next')) : null;
    const acts = h('div', { class: 'acts' }, playBtn, refBtn, mineBtn, checkBtn, nextBtn,
      h('span', { class: 'keys-hint' }, T('Space: play · ↑↓ move the note · Backspace: delete · Enter: check')));

    const tools = q && !st.checked ? h('div', { class: 'dicttools' },
      q.beats ? h('div', { class: 'seg', role: 'group', 'aria-label': T('Duration') }, DUR.map(x => h('button', { type: 'button', class: 'mini' + (Math.abs((st.sel > 0 && st.sel < st.mine.length ? st.mine[st.sel].d : st.dur) - x.d) < 1e-6 ? ' on' : ''), onclick: () => setDur(x.d) }, x.label))) : null,
      h('div', { class: 'seg', role: 'group', 'aria-label': T('Accidental') },
        h('button', { type: 'button', class: 'mini', onclick: () => setAcc(-1) }, '♭'),
        h('button', { type: 'button', class: 'mini', onclick: () => setAcc(0) }, '♮'),
        h('button', { type: 'button', class: 'mini', onclick: () => setAcc(1) }, '♯')),
      h('div', { class: 'seg' },
        h('button', { type: 'button', class: 'mini', 'aria-label': T('Up'), onclick: () => moveSel(1) }, '▲'),
        h('button', { type: 'button', class: 'mini', 'aria-label': T('Down'), onclick: () => moveSel(-1) }, '▼'),
        h('button', { type: 'button', class: 'mini', onclick: del }, T('Delete')))) : null;

    const fb = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    if (q && st.checked) {
      const r = st.result, all = r.right === r.of;
      fb.className = 'feedback ' + (all ? 'ok' : 'bad');
      fb.append(h('b', null, all ? T('Correct.') : T('{n} of {m} notes right.', { n: r.right, m: r.of })), ' ',
        h('span', null, E.tn(MODE_NAME[q.key.mode]) === '' ? '' : T('Key') + E.colon() + E.noteName({ l: q.key.l, a: q.key.a, o: 4 }) + ' ' + E.tn(MODE_NAME[q.key.mode]) + '.'));
    } else if (q) fb.append(h('span', { class: 'muted' }, st.mine.length < q.notes.length
      ? T('Tap the staff to write note {n} of {m}.', { n: st.mine.length + 1, m: q.notes.length })
      : T('All notes written. Change any of them, or press Check.')));
    else fb.append(h('span', { class: 'muted' }, T('A short melody plays. Write it on the staff.')));

    const pct = stats.notes ? Math.round(100 * stats.notesOk / stats.notes) : 0;
    const statsEl = h('div', { class: 'stats' },
      h('span', null, T('Melodies right'), E.colon(), h('b', null, stats.ok + ' / ' + stats.n)),
      h('span', null, T('Notes right'), E.colon(), h('b', null, pct + ' %')),
      h('button', { type: 'button', class: 'linkish', onclick: () => { Object.assign(stats, { n: 0, ok: 0, notes: 0, notesOk: 0 }); E.save('stats.melody', stats); draw(); } }, T('Reset')));

    const set = h('details', { class: 'settings', open: draw._open || null, ontoggle: e => draw._open = e.target.open });
    set.append(h('summary', null, T('Settings')));
    const sb = h('div', { class: 'setbody' });
    sb.append(h('div', { class: 'sethead' }, T('Clefs')), E.chips(CLEFS.map(c => ({ id: c, label: E.tn(CLEF_NAME[c]), on: cfg.clefs.includes(c) })), (id, on) => {
      cfg.clefs = CLEFS.filter(c => c === id ? on : cfg.clefs.includes(c)); if (!cfg.clefs.length) cfg.clefs = ['treble']; save();
    }));
    sb.append(
      E.selectField(T('Keys'), cfg.keys, [{ v: 0, l: T('no sharps or flats') }, { v: 2, l: T('up to 2 sharps or flats') }, { v: 4, l: T('up to 4 sharps or flats') }], v => { cfg.keys = +v; save(); }),
      E.selectField(T('Rhythm'), cfg.rhythm, [{ v: 'level', l: T('from level 6') }, { v: 'never', l: T('never: notes only') }, { v: 'always', l: T('always') }], v => { cfg.rhythm = v; save(); }),
      E.rangeField(T('Tempo'), cfg.bpm, 50, 140, 5, v => v + ' ' + T('beats per minute'), v => { cfg.bpm = v; save(); }),
      E.checkField(T('Play the key chord before the melody'), cfg.ref, v => { cfg.ref = v; save(); }),
      E.timbreField(), E.shareField('melody'));
    set.append(sb);
    root.append(h('div', { class: 'panel' }, lv, head, sheet, tools, acts, fb), statsEl, set);
  }
  function keys(e) {
    if (e.target.closest('input,select,textarea,summary')) return;
    if (e.code === 'Space') { e.preventDefault(); if (!st.q) newQ(true); else playNotes(st.q.notes, {}); }
    else if (e.key === 'Enter') { e.preventDefault(); if (!st.q) newQ(true); else if (st.checked) newQ(true); else check(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(-1); }
    else if (e.key === 'ArrowLeft' && st.sel > 1) { st.sel--; draw(); }
    else if (e.key === 'ArrowRight' && st.sel > 0 && st.sel < st.mine.length - 1) { st.sel++; draw(); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); del(); }
  }
  let ro = null;
  E._melody = { make: makeMelody, cfg, LEVELS, midi, dia };   // for testing
  E.room({
    id: 'melody', num: 'VIII', title: 'Melodic dictation',
    desc: 'Hear a short melody and write it on the staff. From four stepwise notes to long modal melodies with rhythm and chromatic notes.',
    meta: '8 levels · 5 clefs · major, minor and modes',
    lede: 'A melody plays, after its key chord. The first note is written. Tap the staff to write the others, then press Check. Tap a written note to move it, or use ▲▼ and the accidentals.',
    icon: () => N.notesSVG('treble', [{ dia: 30 }, { dia: 31 }, { dia: 32 }, { dia: 30 }, { dia: 34 }], { SP: 8, gap: 2.4, minW: 150 }),
    mount(box) {
      root = box; box.classList.add('quiz', 'dictroom'); box._keys = keys;
      draw();
      if (window.ResizeObserver) { ro && ro.disconnect(); let w = box.clientWidth; ro = new ResizeObserver(() => { if (Math.abs(box.clientWidth - w) > 20) { w = box.clientWidth; draw(); } }); ro.observe(box); }
    },
    leave() { ro && ro.disconnect(); root = null; }
  });
})();
