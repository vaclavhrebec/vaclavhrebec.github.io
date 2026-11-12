/* Room VII — Sing the next note: atonal melodies, 100 levels, checked with the microphone.
   The first note is played; the singer finds each next note by ear and holds it in tune (equal temperament)
   for a moment, then the staff moves on. Pitch is read with YIN (de Cheveigné and Kawahara 2002). */
'use strict';
(function () {
  const h = E.h, T = E.t, N = E.notation;

  /* ---------- voices, levels ---------- */
  const VOICES = {          // lowest comfortable note (MIDI) of a window of a major tenth
    bass: ['Bass', 40], baritone: ['Baritone', 43], tenor: ['Tenor', 48],
    alto: ['Alto', 55], mezzo: ['Mezzo-soprano', 57], soprano: ['Soprano', 60]
  };
  const PHASES = [
    [1, 8, 'Tonal', 'White keys only: steps and thirds.'],
    [9, 29, 'Colouring', 'The first chromatic notes, leaps up to a sixth or seventh.'],
    [30, 49, 'Chromatic', 'Any note of the octave, leaps up to an octave, short and long notes.'],
    [50, 69, 'Atonal leaps', 'Wide and dissonant leaps: sevenths, ninths, tritones, up to the full tenth.'],
    [70, 89, 'Chord cells', 'Triads in scrambled order: Bb – F♯ – Eb is an E♭ minor chord. Think, then sing.'],
    [90, 100, 'Expert', 'Seventh chords, the widest leaps, every rhythm.']
  ];
  const phaseOf = L => PHASES.find(p => L >= p[0] && L <= p[1]);
  const HOLD = { e: .7, q: 1, qd: 1.4, h: 1.6, w: 2.4 };     // the hold time of a quarter note is the base
  const CELLS = [[0, 4, 7], [0, 3, 7], [0, 3, 6], [0, 4, 8], [0, 5, 7]];
  const CELLS7 = [[0, 4, 7, 10], [0, 3, 6, 9], [0, 3, 7, 10], [0, 3, 6, 10], [0, 4, 7, 11], [0, 3, 7, 11]];
  const WHITE = [0, 2, 4, 5, 7, 9, 11];
  const UP = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1], [6, 0]];   // [letter, alteration] spelled with sharps
  const DN = [[0, 0], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [4, -1], [4, 0], [5, -1], [5, 0], [6, -1], [6, 0]];   // and with flats
  const CLEFMID = { treble: 71, bass: 50, alto: 60, tenor: 57, soprano: 64 };

  const cfg = Object.assign({ level: 1, best: 1, done: 0, voice: 'baritone', tol: 7, hold: .5, live: true, anyOct: false, tim: 'organ' }, E.load('cfg.sing', {}));
  const save = () => E.save('cfg.sing', cfg);

  function params(L) {
    return {
      n: Math.min(16, 6 + Math.floor(L / 8)),
      W: Math.min(16, 7 + Math.floor(L / 5)),
      chrom: Math.max(0, Math.min(1, (L - 8) / 22)),
      maxLeap: L < 10 ? 4 : L < 20 ? 7 : L < 30 ? 9 : L < 45 ? 12 : 16,
      minLeap: L < 50 ? 1 : L < 70 ? 2 : 3,
      wide: L < 50 ? 0 : Math.min(1, (L - 50) / 40),
      cell: L < 70 ? 0 : Math.min(.45, (L - 60) / 80),
      sevenths: L >= 85,
      rhythm: L < 20 ? 0 : L < 40 ? 1 : L < 60 ? 2 : 3
    };
  }

  /* ---------- melody generator ---------- */
  function gen(L, voice) {
    const P = params(L), low = VOICES[voice][1];
    const lo = low + E.rand(16 - P.W + 1), hi = lo + P.W;
    const any = cfg.anyOct;
    const okStep = (a, b) => b !== a && (!any || (b - a) % 12 !== 0);
    const pool = [];
    for (let m = lo; m <= hi; m++) pool.push(m);
    const pickNote = prev => {
      let cand = pool.filter(m => okStep(prev, m) && Math.abs(m - prev) >= P.minLeap && Math.abs(m - prev) <= P.maxLeap);
      if (!cand.length) cand = pool.filter(m => okStep(prev, m));
      const white = Math.random() >= P.chrom;
      const wc = white ? cand.filter(m => WHITE.includes(m % 12)) : cand;
      if (wc.length) cand = wc;
      const wide = new Set([6, 10, 11, 13, 14, 15, 16]);
      return E.wpick(cand.map(m => {
        const d = Math.abs(m - prev);
        let w = P.wide ? 1 + P.wide * (wide.has(d) ? 6 : 0) : d <= 2 ? 3 : d <= 4 ? 2.2 : d <= 7 ? 1.4 : 1;
        return { m, w };
      })).m;
    };
    const ms = [];
    let first = pool.filter(m => P.chrom > 0 || WHITE.includes(m % 12));
    first = first.filter(m => m >= lo + 2 && m <= hi - 2);
    ms.push(E.pick(first.length ? first : pool));
    while (ms.length < P.n) {
      const prev = ms[ms.length - 1];
      if (P.cell && Math.random() < P.cell) {
        const type = E.pick(P.sevenths && Math.random() < .5 ? CELLS7 : CELLS), root = E.rand(12);
        const pcs = type.map(i => (root + i) % 12);
        let made = null;
        for (let k = 0; k < 30 && !made; k++) {
          const cell = pcs.map(pc => { const o = pool.filter(m => m % 12 === pc); return o.length ? E.pick(o) : null; });
          if (cell.some(x => x === null)) continue;
          const sh = E.shuffle(cell);
          let ok = okStep(prev, sh[0]) && Math.abs(sh[0] - prev) <= P.maxLeap;
          for (let i = 1; i < sh.length && ok; i++) ok = okStep(sh[i - 1], sh[i]);
          if (ok) made = sh;
        }
        if (made) { made.forEach(m => ms.push(m)); continue; }
      }
      ms.push(pickNote(prev));
    }
    ms.length = Math.min(ms.length, P.n + 2);
    /* clef: one that holds the window without many ledger lines */
    const center = (lo + hi) / 2;
    const names = L < 15 ? ['treble', 'bass'] : Object.keys(CLEFMID);
    let fit = names.filter(c => Math.abs(center - CLEFMID[c]) <= 8);
    if (!fit.length) fit = [names.slice().sort((a, b) => Math.abs(center - CLEFMID[a]) - Math.abs(center - CLEFMID[b]))[0]];
    const clef = E.pick(fit);
    /* values */
    const vals = P.rhythm === 0 ? [{ v: 'q', w: 1 }]
      : P.rhythm === 1 ? [{ v: 'q', w: 5 }, { v: 'h', w: 2 }, { v: 'e', w: 2 }]
      : P.rhythm === 2 ? [{ v: 'q', w: 4 }, { v: 'h', w: 2 }, { v: 'e', w: 3 }, { v: 'qd', w: 1.5 }, { v: 'w', w: 1 }]
      : [{ v: 'q', w: 3 }, { v: 'h', w: 2 }, { v: 'e', w: 3 }, { v: 'qd', w: 2 }, { v: 'w', w: 1.5 }];
    const notes = ms.map((m, i) => {
      const pc = m % 12, up = i === 0 ? Math.random() < .5 : m > ms[i - 1];
      const sp = (up ? UP : DN)[pc];
      const o = Math.floor(m / 12) - 1;
      return { m, l: sp[0], a: sp[1], o, dia: o * 7 + sp[0], v: i === 0 ? 'h' : E.wpick(vals).v };
    });
    notes.forEach((n, i) => {      // every altered note carries its sign; a natural sign where one of the last three notes had the same letter altered
      n.acc = n.a === 1 ? 'sharp' : n.a === -1 ? 'flat'
        : notes.slice(Math.max(0, i - 3), i).some(p => p.l === n.l && p.a !== 0) ? 'natural' : null;
    });
    return { L, clef, notes, lo, hi };
  }

  /* ---------- the staff ---------- */
  const SP = 11, PAD = 6, H = (PAD * 2 + 4) * SP, TOP = PAD * SP, CLEFW = SP * 4.6, NOW = SP * 9;
  function layout(mel) {
    let x = SP * 2; const xs = [];
    mel.notes.forEach(n => {
      if (n.acc) x += SP * 1.9;
      xs.push(x);
      x += SP * (3.3 + (n.v === 'w' ? 2.2 : n.v === 'h' ? 1.3 : n.v === 'e' ? -.5 : 0) + (n.v === 'qd' ? .8 : 0));
    });
    return { xs, W: x + SP * 14 };
  }
  function noteSVG(mel, n, i, x) {
    const y = N.yOf(mel.clef, n.dia, TOP, SP);
    let s = '';
    const st = Math.round((TOP + 4 * SP - y) / (SP / 2));
    for (let l = -2; l >= st; l -= 2) s += N.line(x - SP, TOP + 4 * SP - l * SP / 2, x + SP, TOP + 4 * SP - l * SP / 2, SP * .1, 'stl');
    for (let l = 10; l <= st; l += 2) s += N.line(x - SP, TOP + 4 * SP - l * SP / 2, x + SP, TOP + 4 * SP - l * SP / 2, SP * .1, 'stl');
    if (n.acc) s += N.acc(n.acc, x - SP * 2.0, y, SP, 2.8);
    const hollow = n.v === 'h' || n.v === 'w';
    s += N.head(x, y, SP, hollow);
    const mid = N.CLEFS[mel.clef].bottom + 4;          // middle line
    const up = n.dia < mid;
    if (n.v !== 'w') {
      const sx = up ? x + SP * .62 : x - SP * .62, ye = up ? y - SP * 3.4 : y + SP * 3.4;
      s += N.line(sx, y, sx, ye, SP * .13);
      if (n.v === 'e') {
        const d = up ? 1 : -1;
        s += `<path class="fl" fill="none" style="stroke:currentColor;stroke-width:${SP * .3}" d="M${sx} ${ye} C${sx + SP * .1} ${ye + d * SP * 1.0} ${sx + SP * 1.5} ${ye + d * SP * 1.3} ${sx + SP * 1.0} ${ye + d * SP * 3}"/>`;
      }
    }
    if (n.v === 'qd') {
      const online = (n.dia - N.CLEFS[mel.clef].bottom) % 2 === 0 && n.dia >= N.CLEFS[mel.clef].bottom && n.dia <= N.CLEFS[mel.clef].bottom + 8;
      s += `<circle cx="${x + SP * 1.25}" cy="${y - (online ? SP / 2 : 0)}" r="${SP * .2}"/>`;
    }
    return `<g class="nt" data-i="${i}">${s}</g>`;
  }

  /* ---------- pitch detection ---------- */
  const FMIN = 70, FMAX = 1000;
  function yin(x, sr) {
    const N2 = x.length, maxT = Math.min(N2 >> 1, Math.floor(sr / FMIN)), minT = Math.max(2, Math.floor(sr / FMAX)), W = N2 - maxT;
    const d = new Float32Array(maxT + 2);
    for (let t = 1; t <= maxT; t++) { let s = 0; for (let i = 0; i < W; i++) { const v = x[i] - x[i + t]; s += v * v; } d[t] = s; }
    let run = 0; const dp = new Float32Array(maxT + 2); dp[0] = 1;
    for (let t = 1; t <= maxT; t++) { run += d[t]; dp[t] = run ? d[t] * t / run : 1; }
    let t = minT;
    while (t < maxT && dp[t] >= .15) t++;
    if (t >= maxT) {                           // no dip below the threshold: the deepest one, if it is clear enough
      let b = minT; for (let k = minT; k < maxT; k++) if (dp[k] < dp[b]) b = k;
      if (dp[b] > .3) return null; t = b;
    } else while (t + 1 < maxT && dp[t + 1] < dp[t]) t++;
    const a = dp[t - 1], b = dp[t], c = dp[t + 1], den = a - 2 * b + c;
    const tb = den ? t + (a - c) / (2 * den) : t;
    return { f: sr / tb, clarity: 1 - b };
  }
  const mic = { on: false, stream: null, an: null, raw: null, dec: null, nodes: [], sr: 44100 };
  async function micStart() {
    if (mic.on) return true;
    const ctx = E.audio.get();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { st.msg = 'This browser cannot use the microphone here.'; return false; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
    catch (e) { st.msg = e && e.name === 'NotAllowedError' ? 'The microphone is blocked. Allow it for this site, then press Start again.' : 'No microphone could be opened.'; return false; }
    const src = ctx.createMediaStreamSource(stream);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 55; hp.Q.value = .7;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = .6;   /* tilts the voice towards its fundamental */
    const an = ctx.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0;
    const mute = ctx.createGain(); mute.gain.value = 0;
    src.connect(hp); hp.connect(lp); lp.connect(an); an.connect(mute); mute.connect(ctx.destination);
    mic.nodes = [src, hp, lp, an, mute]; mic.an = an; mic.stream = stream; mic.sr = ctx.sampleRate / 2;
    mic.raw = new Float32Array(an.fftSize); mic.dec = new Float32Array(an.fftSize >> 1);
    mic.on = true;
    return true;
  }
  function micStop() {
    mic.on = false;
    mic.nodes.forEach(n => { try { n.disconnect(); } catch (e) {} });
    if (mic.stream) mic.stream.getTracks().forEach(t => t.stop());
    mic.stream = null; mic.nodes = []; mic.an = null;
  }
  /* one reading: {f, clarity} or null (silence, noise) */
  function listen() {
    if (E.sing && E.sing._f !== undefined) return E.sing._f ? { f: E.sing._f, clarity: 1 } : null;
    if (!mic.on) return null;
    mic.an.getFloatTimeDomainData(mic.raw);
    let e = 0;
    for (let i = 0; i < mic.dec.length; i++) { const v = (mic.raw[2 * i] + mic.raw[2 * i + 1]) / 2; mic.dec[i] = v; e += v * v; }
    if (Math.sqrt(e / mic.dec.length) < .008) return null;
    const r = yin(mic.dec, mic.sr);
    return r && r.clarity > .8 && r.f >= FMIN && r.f <= FMAX ? r : null;
  }

  /* ---------- state and flow ---------- */
  const st = { mel: null, i: 1, state: 'idle', hits: 0, hints: 0, held: 0, last: 0, gap: 0, mute: 0, msg: '', hist: [], cents: null, sung: null, raf: 0, nodes: null, W: 0 };
  const midiName = m => { const sp = (DN[m % 12][1] === 0 ? DN : UP)[m % 12]; return E.noteName({ l: sp[0], a: sp[1], o: 0 }) + (Math.floor(m / 12) - 1); };
  const holdOf = n => cfg.hold * HOLD[n.v];
  const target = () => st.mel.notes[st.i];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function newMelody(box) {
    E.audio.stop(); clearTimeout(st.t1);
    st.mel = gen(cfg.level, cfg.voice); st.i = 1; st.state = micOn() ? 'ref' : 'idle'; st.hints = 0; st.held = 0; st.msg = ''; st.cents = null; st.sung = null; st.hist = [];
    draw(box);
    if (micOn()) playFirst();
  }
  const micOn = () => mic.on || (E.sing && E.sing._f !== undefined);
  function tone(m, d) { const A = E.audio, t = A.now(); A.tone(hz(m), t, d, { timbre: cfg.tim }); st.mute = performance.now() + (d + .45) * 1000; }
  function playFirst() {
    const n = st.mel.notes[0];
    st.state = 'ref'; tone(n.m, 1.0); setStatus();
    st.t1 = setTimeout(() => { if (st.state === 'ref') { st.state = 'sing'; st.held = 0; st.hist = []; setStatus(); } }, 1300);
  }
  function hear() { if (st.state === 'done' || !st.mel) return; st.hints++; tone(target().m, 1.0); setStatus(); }
  async function start(box) {
    E.audio.get();
    if (!E.sing || E.sing._f === undefined) { const ok = await micStart(); if (!ok) { setStatus(); return; } }
    if (st.state === 'done') return newMelody(box);
    st.i = 1; st.state = 'ref'; mark(); playFirst(); loop();
  }
  function stopAll() { clearTimeout(st.t1); cancelAnimationFrame(st.raf); st.raf = 0; E.audio.stop(); }

  function loop() {
    cancelAnimationFrame(st.raf);
    let prev = performance.now();
    const frame = now => {
      st.raf = requestAnimationFrame(frame);
      const dt = Math.min(100, now - prev); prev = now;
      if (st.state !== 'sing' || now < st.mute) { updateMeter(null); return; }
      let r = listen();
      if (r) {
        st.hist.push(r.f); if (st.hist.length > 3) st.hist.shift();
        const f = st.hist.slice().sort((a, b) => a - b)[st.hist.length >> 1];
        let c = 1200 * Math.log2(f / hz(target().m));
        if (cfg.anyOct) c = ((c + 600) % 1200 + 1200) % 1200 - 600;
        st.cents = c; st.sung = 69 + 12 * Math.log2(f / 440); st.gap = 0;
        if (Math.abs(c) <= cfg.tol) st.held += dt; else st.held = 0;
      } else {
        st.gap += dt; if (st.gap > 140) { st.held = 0; st.cents = null; st.sung = null; st.hist = []; }
      }
      updateMeter(r);
      if (st.held >= holdOf(target()) * 1000) hit();
    };
    st.raf = requestAnimationFrame(frame);
  }
  function hit() {
    const A = E.audio, t = A.now();
    A.tone(hz(target().m), t, .18, { timbre: 'sine', vol: .12 });
    E.practised(); cfg.done++;
    st.nodes && st.nodes[st.i] && st.nodes[st.i].classList.replace('now', 'done');
    st.i++; st.held = 0; st.hist = []; st.cents = null; st.sung = null; st.mute = performance.now() + 250;
    if (st.i >= st.mel.notes.length) { finish(); return; }
    mark(); setStatus();
  }
  function finish() {
    st.state = 'done';
    const up = st.hints <= Math.floor(st.mel.notes.length / 4);
    if (up && cfg.level < 100) { cfg.level++; cfg.best = Math.max(cfg.best, cfg.level); st.msg = 'Melody finished. On to the next level.'; }
    else if (up) st.msg = 'Melody finished. You have reached the last level.';
    else st.msg = 'Melody finished, but with many hints: the level stays. Try a new melody.';
    save(); mark(); setStatus(); redrawHead();
  }

  /* ---------- screen ---------- */
  let root = null;
  const css = `
  .singroom .sing-staff{position:relative;height:${H}px;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}
  .singroom .sing-staff svg.fix{position:absolute;left:0;top:0}
  .singroom .sing-staff .vp{position:absolute;left:${CLEFW}px;right:0;top:0;bottom:0;overflow:hidden;-webkit-mask-image:linear-gradient(to right,transparent,#000 22px);mask-image:linear-gradient(to right,transparent,#000 22px)}
  .singroom .sing-staff svg.mv{position:absolute;left:0;top:0;height:${H}px;transition:transform .5s cubic-bezier(.3,.7,.2,1)}
  .singroom .nt{color:var(--fg)} .singroom .nt.done{color:var(--ok)} .singroom .nt.now{color:var(--accent)} .singroom .nt.first{color:var(--muted)}
  .singroom svg.mv .nt ellipse,.singroom svg.mv .nt circle,.singroom svg.mv .nt path:not(.fl){fill:currentColor!important}
  .singroom svg.mv .nt .hole{fill:var(--card)!important}
  .singroom svg.mv .nt line{stroke:currentColor!important}
  .singroom svg.mv .nt path.fl{stroke:currentColor!important;fill:none!important}
  .singroom .meter{position:relative;height:34px;border-radius:8px;background:var(--soft);border:1px solid var(--line);overflow:hidden}
  .singroom .meter .zone{position:absolute;top:0;bottom:0;background:var(--ok-soft);border-left:2px solid var(--ok);border-right:2px solid var(--ok)}
  .singroom .meter .zero{position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--line)}
  .singroom .meter .dot{position:absolute;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:var(--accent);transition:left .06s linear;display:none}
  .singroom .meter .dot.in{background:var(--ok)}
  .singroom .meter .fill{position:absolute;left:0;bottom:0;height:4px;background:var(--ok);width:0}
  .singroom .mstat{font-size:.92rem;color:var(--muted);min-height:1.5em;display:flex;flex-wrap:wrap;gap:.3rem 1.2rem}
  .singroom .mstat b{color:var(--fg);font-variant-numeric:tabular-nums}
  .singroom .status{font:600 1.15rem/1.35 var(--serif);min-height:1.6em}
  .singroom .lvsel{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
  .singroom .lvsel input[type=range]{flex:1 1 220px;accent-color:var(--accent)}
  .singroom .phases{display:flex;flex-wrap:wrap;gap:6px}
  .singroom .hint{font-size:.88rem;color:var(--muted);margin:0}`;
  if (!document.getElementById('singcss')) document.head.append(h('style', { id: 'singcss' }, css));

  function redrawHead() {
    if (!root) return;
    const hd = root.querySelector('.lvhead'); if (!hd) return;
    const p = phaseOf(cfg.level);
    hd.innerHTML = '';
    hd.append(h('span', null, T('Level'), ' ', h('b', null, cfg.level), ' / 100 · ', T(p[2])), h('span', { class: 'hint' }, T(p[3])));
    const r = root.querySelector('.lvsel input'); if (r) r.value = cfg.level;
    const o = root.querySelector('.lvsel output'); if (o) o.textContent = cfg.level;
  }
  function setStatus() {
    if (!root) return;
    const s = root.querySelector('.status'); if (!s) return;
    const tx = st.state === 'idle' ? (st.msg ? T(st.msg) : T('Press Start. The first note is played for you, then you sing each next note.'))
      : st.state === 'ref' ? T('Listen to the first note…')
      : st.state === 'done' ? T(st.msg)
      : T('Sing the next note (red). Hold it steady.');
    s.textContent = tx;
    const b = root.querySelector('#sg-start');
    if (b) b.textContent = st.state === 'done' ? '▶ ' + T('Next melody') : micOn() ? '↻ ' + T('Start again') : '🎤 ' + T('Start');
  }
  function mark() {
    if (!st.nodes) return;
    st.nodes.forEach((g, i) => { g.classList.toggle('done', i > 0 && i < st.i); g.classList.toggle('first', i === 0); g.classList.toggle('now', i === st.i && st.state !== 'done'); });
    const mv = root.querySelector('svg.mv'), xs = st.lay.xs;
    const k = Math.min(st.i, xs.length - 1);
    mv.style.transform = `translateX(${NOW - xs[k]}px)`;
  }
  function updateMeter(r) {
    if (!root) return;
    const dot = root.querySelector('.dot'), fill = root.querySelector('.fill'), info = root.querySelector('.mstat');
    if (!dot) return;
    if (st.cents === null || st.state !== 'sing') {
      dot.style.display = 'none'; fill.style.width = '0'; if (info && st.state === 'sing') info.innerHTML = '<span>' + T('Listening…') + '</span>';
      return;
    }
    const c = st.cents, cl = Math.max(-50, Math.min(50, c));
    dot.style.display = cfg.live ? 'block' : 'none';
    dot.style.left = (50 + cl) + '%'; dot.classList.toggle('in', Math.abs(c) <= cfg.tol);
    fill.style.width = Math.min(100, st.held / (holdOf(target()) * 10)) + '%';
    if (!info) return;
    const near = Math.round(st.sung), dev = Math.round((st.sung - near) * 100);
    let hint = '';
    const raw = (st.sung - target().m) * 100;
    if (!cfg.anyOct && Math.abs(Math.abs(raw) - 1200) < 60) hint = T(raw > 0 ? 'An octave too high' : 'An octave too low');
    else if (Math.abs(c) > cfg.tol) hint = T(c > 0 ? 'higher than the note' : 'lower than the note');
    info.innerHTML = cfg.live ? `<span>${T('You sing')} <b>${midiName(near)}</b> (${dev > 0 ? '+' : ''}${dev} ¢)</span><span>${hint}</span>` : '';
  }
  function draw(box) {
    root = box; box.innerHTML = '';
    const mel = st.mel, lay = st.lay = layout(mel);
    const mv = `<svg class="score sing mv" width="${lay.W}" height="${H}" viewBox="0 0 ${lay.W} ${H}">${mel.notes.map((n, i) => noteSVG(mel, n, i, lay.xs[i])).join('')}</svg>`;
    const staff = h('div', { class: 'sing-staff', html: '<svg class="score fix"></svg><div class="vp">' + mv + '</div>' });
    st.nodes = [...staff.querySelectorAll('.nt')];
    const zw = cfg.tol * 2;
    const meter = h('div', { class: 'meter', html: `<div class="zone" style="left:${50 - cfg.tol}%;width:${zw}%"></div><div class="zero"></div><div class="dot"></div><div class="fill"></div>` });
    const lvl = h('div', { class: 'lvsel' },
      h('button', { type: 'button', class: 'mini', onclick: () => setLevel(cfg.level - 1, box) }, '−'),
      h('input', { type: 'range', min: 1, max: 100, step: 1, value: cfg.level, 'aria-label': T('Level'), oninput: e => { cfg.level = +e.target.value; redrawHead(); }, onchange: e => setLevel(+e.target.value, box) }),
      h('button', { type: 'button', class: 'mini', onclick: () => setLevel(cfg.level + 1, box) }, '+'),
      h('output', null, cfg.level),
      h('span', { class: 'hint' }, T('Furthest so far') + ': ' + cfg.best));
    const phases = h('div', { class: 'phases' }, PHASES.map(p => h('button', { type: 'button', class: 'mini', title: T(p[3]), onclick: () => setLevel(p[0], box) }, p[0] + '–' + p[1] + ' ' + T(p[2]))));
    const panel = h('div', { class: 'panel' },
      h('div', { class: 'lvhead' }), lvl, phases, staff, meter, h('div', { class: 'mstat' }), h('div', { class: 'status', 'aria-live': 'polite' }),
      h('div', { class: 'acts' },
        h('button', { id: 'sg-start', class: 'btn primary', type: 'button', onclick: () => start(box) }, ''),
        h('button', { class: 'btn', type: 'button', onclick: hear }, '🔊 ' + T('Hear this note')),
        h('button', { class: 'btn', type: 'button', onclick: () => { if (micOn() && st.state !== 'done') { st.state = 'ref'; playFirst(); } else if (st.mel) tone(st.mel.notes[0].m, 1); } }, T('First note again')),
        h('button', { class: 'btn', type: 'button', onclick: () => newMelody(box) }, T('New melody')),
        h('button', { class: 'btn', type: 'button', onclick: () => { if (st.state === 'sing') { st.hints++; hit(); } } }, T('Skip note'))),
      h('p', { class: 'hint' }, T('Use headphones: otherwise the microphone hears the played notes. The pitch is judged in equal temperament (A = 440 Hz); the written notes are the sounding notes.')));
    const set = h('details', { class: 'settings', open: draw._open || null, ontoggle: e => draw._open = e.target.open },
      h('summary', null, T('Settings')),
      h('div', { class: 'setbody' },
        E.selectField(T('Voice'), cfg.voice, Object.keys(VOICES).map(k => ({ v: k, l: T(VOICES[k][0]) + ' (' + midiName(VOICES[k][1]) + '–' + midiName(VOICES[k][1] + 16) + ')' })), v => { cfg.voice = v; save(); newMelody(box); }),
        E.rangeField(T('Tolerance'), cfg.tol, 3, 30, 1, v => '± ' + v + ' ¢', v => { cfg.tol = v; save(); const z = box.querySelector('.zone'); if (z) { z.style.left = (50 - v) + '%'; z.style.width = (2 * v) + '%'; } }),
        E.rangeField(T('Hold time of a quarter note'), cfg.hold, .2, 1, .05, v => v.toFixed(2) + ' s', v => { cfg.hold = v; save(); }),
        E.checkField(T('Show my pitch live'), cfg.live, v => { cfg.live = v; save(); }),
        E.checkField(T('Accept any octave (sing in the octave that suits you)'), cfg.anyOct, v => { cfg.anyOct = v; save(); }),
        E.selectField(T('Sound of the played notes'), cfg.tim, [{ v: 'organ', l: T('Organ (principal)') }, { v: 'sine', l: T('Sine tone') }, { v: 'piano', l: T('Piano-like') }, { v: 'reed', l: T('Reed') }], v => { cfg.tim = v; save(); }),
        h('button', { type: 'button', class: 'mini', onclick: () => { cfg.level = 1; cfg.best = 1; cfg.done = 0; save(); newMelody(box); } }, T('Start again at level 1'))));
    box.append(panel, set);
    const paint = () => {      // the fixed layer: staff lines, clef and the band of the note to sing, drawn at the real width
      const w = Math.max(300, staff.clientWidth), fx = staff.querySelector('svg.fix');
      fx.setAttribute('viewBox', `0 0 ${w} ${H}`); fx.setAttribute('width', w); fx.setAttribute('height', H);
      fx.innerHTML = N.staff(0, w, TOP, SP) + N.CLEFS[mel.clef].draw(SP * .8, TOP, SP) +
        `<rect x="${CLEFW + NOW - SP * 1.7}" y="${TOP - SP * 3.5}" width="${SP * 3.4}" height="${SP * 11}" rx="${SP * .6}" fill="var(--accent)" opacity=".08" stroke="none"/>`;
    };
    paint();
    if (draw._ro) draw._ro.disconnect();
    draw._ro = new ResizeObserver(paint); draw._ro.observe(staff);
    redrawHead(); setStatus(); mark();
  }
  function setLevel(L, box) { cfg.level = Math.max(1, Math.min(100, L)); cfg.best = Math.max(cfg.best, cfg.level); save(); newMelody(box); }

  E.room({
    id: 'sing', num: 'VII', title: 'Sing the next note',
    desc: 'Atonal melodies in 100 levels. You hear the first note and sing each next one, checked by the microphone to within a few cents. From white keys to scrambled chords.',
    meta: '100 levels · microphone · equal temperament',
    lede: 'The first note is played. Look at the second and sing it: when you hold it in tune for a moment, the staff moves on. No key signature, random clefs, and from level 9 more and more chromatic notes, wide leaps and scrambled chords.',
    icon: () => N.notesSVG('treble', [{ dia: 30, acc: 'flat' }, { dia: 33, acc: 'sharp' }, { dia: 28 }, { dia: 36, acc: 'flat' }], { SP: 9, gap: 4.2, minW: 190 }),
    mount(box) {
      box.classList.add('singroom');
      newMelody(box);
      if (micOn()) loop();
    },
    leave() { stopAll(); micStop(); root = null; if (draw._ro) draw._ro.disconnect(); }
  });
  E.sing = { _f: undefined, gen, params, yin, state: () => ({ i: st.i, state: st.state, level: cfg.level, notes: st.mel && st.mel.notes.length, held: st.held, hints: st.hints }), mel: () => st.mel };
})();
