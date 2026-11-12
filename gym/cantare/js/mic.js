/* Microphone: opens the raw microphone, follows the sung pitch and records takes.

   The pitch is read with YIN (de Cheveigné and Kawahara 2002), made to hold on to the fundamental: the signal it
   reads is tilted towards the bass (a low-pass at 300 Hz), and of the dips in the YIN curve it takes the first one
   about as deep as the deepest, moving to twice (three, four times) that period when that one is clearly more
   periodic. Through speakers the organ's own notes are notched out of the signal (the harmonics of the notes
   sounding now and of those still ringing), and a reading on the organ's note or its octave is not counted. */

export const midiOfHz = (f, a4 = 440) => 69 + 12 * Math.log2(f / a4);
const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];
/* midi here is already in the app's own pitch (a′ = a4), so the name is that of the written note */
export function describe(midi) {
  const r = Math.round(midi), cents = Math.round((midi - r) * 100);
  return { name: NAMES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1), cents };
}
/* the sung note spelled the way early music spells it: C♯ E♭ F♯ G♯ B♭. s is the diatonic step (28 = c′) */
const SPELL = [[0, 0], [0, 1], [1, 0], [2, -1], [2, 0], [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [6, -1], [6, 0]];
export function spellMidi(m) { const [L, alt] = SPELL[((m % 12) + 12) % 12]; return { s: 7 * (Math.floor(m / 12) - 1) + L, L, alt }; }
export const median = a => { const s = [...a].sort((p, q) => p - q); return s[s.length >> 1]; };
const rmsOf = x => { let e = 0; for (let i = 0; i < x.length; i++) e += x[i] * x[i]; return Math.sqrt(e / x.length); };

const NB = 4, NOTCH_N = 8, FMIN = 70, FMAX = 1100, LEFT = .1, GATE = .005;

export function createMic(getCtx) {
  const m = {
    on: false, busy: false, stream: null, nodes: [], notch: [], raf: 0,
    /* set by the app */
    opt: { flex: true, phones: false, a4: 440 },
    organ: null,        /* () => { cur: [Hz], prev: [Hz], prevAge } — the organ notes the microphone may be hearing */
    onFrame: null,      /* (hit|null, rms) for the tuner and the dot */
    onRaw: null,        /* (now, midi|null, q, rms, onset) every frame, for writing out the singing */
    onTake: null, onRecState: null,
    /* the pitch being followed */
    hist: [], shown: null, snap: null, pend: null, pendT: 0, seen: 0, peak: 0, lastT: 0, q: 1, lowT: null, onset: false,
    /* recording */
    mr: null, chunks: [], recording: false, take: null, clapping: false,
  };
  let yd = null, dec = null, raw = null, tilt = null, preRaw = null, pre = null, an = null, pa = null;

  m.start = async () => {
    if (m.on || m.busy) return 'ok';
    const ctx = getCtx();
    if (!ctx || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'unsupported';
    m.busy = true;
    try {
      /* the raw microphone: echo cancelling and noise suppression bend a sung tone; the organ is taken out here instead */
      m.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) { m.busy = false; return e && e.name === 'NotAllowedError' ? 'blocked' : 'unsupported'; }
    m.busy = false;
    const src = ctx.createMediaStreamSource(m.stream);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 55; hp.Q.value = .7;
    src.connect(hp);
    pre = ctx.createAnalyser(); pre.fftSize = 2048; pre.smoothingTimeConstant = 0; hp.connect(pre);
    let node = hp;
    m.notch = [];
    for (let k = 0; k < NB * NOTCH_N; k++) {
      const n = ctx.createBiquadFilter(); n.type = 'notch'; n.frequency.value = 20000; n.Q.value = 40;
      node.connect(n); node = n; m.notch.push(n);
    }
    an = ctx.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0; node.connect(an);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = .6; /* tilts the voice towards its fundamental */
    pa = ctx.createAnalyser(); pa.fftSize = 2048; pa.smoothingTimeConstant = 0; node.connect(lp); lp.connect(pa);
    const mute = ctx.createGain(); mute.gain.value = 0; /* keeps the analysers running in every browser; nothing is heard */
    an.connect(mute); pre.connect(mute); pa.connect(mute); mute.connect(ctx.destination);
    m.nodes = [src, hp, pre, ...m.notch, an, lp, pa, mute];
    preRaw = new Float32Array(pre.fftSize); raw = new Float32Array(an.fftSize); tilt = new Float32Array(pa.fftSize);
    dec = new Float32Array(pa.fftSize >> 1); yd = new Float32Array(dec.length);
    m.on = true; m.hist = []; m.shown = null; m.snap = null; m.pend = null; m.seen = 0; m.peak = 0; m.lowT = null; m.onset = false;
    m.raf = requestAnimationFrame(tick);
    return 'ok';
  };

  m.stop = () => {
    if (!m.on) return;
    m.on = false; cancelAnimationFrame(m.raf);
    if (m.recording) m.endTake();
    m.nodes.forEach(n => { try { n.disconnect(); } catch (e) { /* ignore */ } });
    if (m.stream) m.stream.getTracks().forEach(t => t.stop());
    m.stream = null; m.nodes = []; m.notch = []; m.shown = null; m.snap = null;
    if (m.onFrame) m.onFrame(null, 0);
  };

  /* ---------- pitch ---------- */
  function localMin(d, t, lo, hi) {
    let b = t;
    for (let k = Math.max(lo, Math.floor(t * .96)); k <= Math.min(hi, Math.ceil(t * 1.04)); k++) if (d[k] < d[b]) b = k;
    return b;
  }
  function yin(x, sr) {
    const N = x.length, maxT = Math.min(Math.floor(sr / FMIN), N >> 1), minT = Math.max(2, Math.floor(sr / FMAX)), W = N - maxT, d = yd;
    for (let t = 1; t <= maxT; t++) {
      let s = 0;
      for (let i = 0; i < W; i++) { const v = x[i] - x[i + t]; s += v * v; }
      d[t] = s;
    }
    d[0] = 1;
    let run = 0;
    for (let t = 1; t <= maxT; t++) { run += d[t]; d[t] = run > 0 ? d[t] * t / run : 1; }
    let g = minT;
    for (let t = minT; t < maxT; t++) if (d[t] < d[g]) g = t;
    if (d[g] > .3) return null;
    const lim = Math.max(.1, d[g] * 1.5 + .02);
    let tau = g;
    for (let t = minT; t < maxT; t++) if (d[t] <= lim) { while (t + 1 < maxT && d[t + 1] < d[t]) t++; tau = t; break; }
    for (let k = 2; k <= 4; k++) {
      const tm = k * tau;
      if (tm >= maxT - 1) break;
      const j = localMin(d, tm, minT, maxT - 2);
      if (d[tau] > .03 && d[j] < .55 * d[tau]) { tau = j; k = 1; }
    }
    const a = d[tau - 1], b = d[tau], c = d[tau + 1], den = a + c - 2 * b;
    const sh = den > 0 ? Math.max(-.5, Math.min(.5, (a - c) / (2 * den))) : 0;
    m.q = b;
    return sr / (tau + sh);
  }
  function pitchOf(x, sr) {
    for (let i = 0; i < dec.length; i++) dec[i] = .5 * (x[2 * i] + x[2 * i + 1]);
    return yin(dec, sr / 2);
  }

  /* What the dot shows. A reading counts only when the voice is near its own recent loudness (not a fading release or
     the room) and the period is clean. A new note shows once clean readings agree for 45 ms; a jump of an octave or two
     only after 95 ms, so a moment of overtone confusion never makes the dot leap. Small changes are followed smoothly. */
  function track(mm, q, rms, t) {
    const dt = t - m.lastT; m.lastT = t;
    m.peak = Math.max(rms, m.peak * Math.pow(.5, Math.max(0, dt) / 700));
    /* a fresh attack: the voice dips under a quarter of its loudness for 30 ms or more, then comes back */
    if (rms < .25 * m.peak) { if (m.lowT === null) m.lowT = t; }
    else if (rms > .5 * m.peak) { if (m.lowT !== null && t - m.lowT >= 30) m.onset = true; m.lowT = null; }
    if (mm !== null && rms < .15 * m.peak) mm = null;
    const H = m.hist;
    H.push({ t, m: mm, q });
    while (H.length && t - H[0].t > 400) H.shift();
    if (mm !== null) {
      if (m.shown !== null && Math.abs(mm - m.shown) < 1.5) {
        if (q < .3) {
          const near = H.filter(h => h.m !== null && h.q < .3 && t - h.t < 90 && Math.abs(h.m - m.shown) < 1.5).map(h => h.m);
          m.shown += .35 * (median(near) - m.shown); m.seen = t;
        }
      } else if (q < .15) {
        const run = [];
        for (let i = H.length - 1; i >= 0 && H[i].m !== null && H[i].q < .15 && Math.abs(H[i].m - mm) < .8; i--) run.push(H[i]);
        const span = run.length ? t - run[run.length - 1].t : 0, dd = m.shown === null ? 0 : mm - m.shown;
        const oct = Math.abs(dd) > 10 && Math.abs(dd - 12 * Math.round(dd / 12)) < 1;
        if (run.length >= 3 && span >= (oct ? 95 : 45)) { m.shown = median(run.map(h => h.m)); m.seen = t; }
      }
    }
    if (m.shown !== null && t - m.seen > 270) m.shown = null;
    if (m.shown === null) { m.snap = null; m.pend = null; return; }
    const near = Math.round(m.shown);
    if (m.opt.flex) { if (m.snap === null || Math.abs(m.shown - m.snap) > .62) m.snap = near; return; }
    /* fixed pitch: the dot keeps to one note and moves only when the new one has held for 120 ms */
    if (m.snap === null) { m.snap = near; m.pend = null; }
    else if (Math.abs(m.shown - m.snap) > .7 && near !== m.snap) {
      if (m.pend !== near) { m.pend = near; m.pendT = t; }
      else if (t - m.pendT >= 120) { m.snap = near; m.pend = null; }
    } else m.pend = null;
  }

  /* the strongest harmonics of an organ note, as frequencies to notch */
  const partials = f => { const out = []; for (let k = 1; k <= NOTCH_N && f * k < 6000; k++) out.push(f * k); return out; };
  function setBank(b, freqs, now) {
    for (let k = 0; k < NOTCH_N; k++) {
      const n = m.notch[b * NOTCH_N + k], fq = freqs[k] || 20000;
      if (Math.abs(n.frequency.value - fq) > .01) n.frequency.setValueAtTime(fq, now);
    }
  }
  /* is this frequency the organ's note, or its octave, within so many cents? */
  const onOrgan = (f, list, ct) => list.some(o => o && [1, 2].some(k => Math.abs(1200 * Math.log2(f / (o * k))) < ct));

  function tick() {
    if (!m.on) return;
    const ctx = getCtx(), now = ctx.currentTime;
    const o = (m.organ && m.organ(now)) || { cur: [], prev: [], prevAge: 1 };
    const filt = !m.opt.phones;
    const banks = filt ? [...o.cur, ...o.prev.filter(p => !o.cur.includes(p))].slice(0, NB) : [];
    for (let b = 0; b < NB; b++) setBank(b, banks[b] ? partials(banks[b]) : [], now);
    pre.getFloatTimeDomainData(preRaw);
    const preRms = rmsOf(preRaw);
    an.getFloatTimeDomainData(raw);
    const rms = rmsOf(raw);
    const near = o.prevAge < .2 ? [...o.cur, ...o.prev] : o.cur;
    let f = null;
    /* with the organ filtered out, what is left must be a real part of the signal, not the organ's leftovers */
    if (!m.clapping && rms > GATE && (!filt || !banks.length || rms > LEFT * preRms)) {
      pa.getFloatTimeDomainData(tilt);
      f = pitchOf(tilt, ctx.sampleRate);
      /* through speakers, a reading on the organ's own note (or its octave) is the organ, not the singer */
      if (f && filt && onOrgan(f, near, 70)) f = null;
    }
    const mm = f ? midiOfHz(f, m.opt.a4) : null;
    track(mm, f ? m.q : 1, rms, performance.now());
    if (filt && m.shown !== null && onOrgan(m.opt.a4 * Math.pow(2, (m.shown - 69) / 12), near, 80)) { m.shown = null; m.snap = null; m.pend = null; }
    if (m.onRaw) m.onRaw(now, mm, f ? m.q : 1, rms, m.onset);
    m.onset = false;
    if (m.onFrame) m.onFrame(m.shown !== null ? { midi: m.shown, snap: m.snap } : null, rms);
    m.raf = requestAnimationFrame(tick);
  }

  /* seconds from the organ starting a note (audio clock) to that moment reaching the analyser in the singer's voice:
     out to the speakers, back in through the microphone, and half the analysis window */
  m.lag = (cal) => {
    const ctx = getCtx();
    if (cal != null) return cal + 1024 / ctx.sampleRate;
    let inLat = .02;
    try { const st = m.stream && m.stream.getAudioTracks()[0].getSettings(); if (st && st.latency >= 0 && st.latency < .3) inLat = st.latency; } catch (e) { /* ignore */ }
    return (ctx.outputLatency || 0) + (ctx.baseLatency || 0) + inLat + 1024 / ctx.sampleRate;
  };
  /* how long the sound takes from the speakers to the recording (for hearing a take back with the music) */
  m.latency = (cal) => m.lag(cal) - 1024 / getCtx().sampleRate;

  /* Clap test: eight clicks; the loudest sound near each one is the clap (louder than the click coming back through
     the speakers). The median distance, from the fourth click on, is the latency. click(t) schedules one click. */
  m.clapTest = async (click) => {
    if (!m.on || m.clapping) return null;
    const ctx = getCtx(), sr = ctx.sampleRate, n = 8, gap = .6, t0 = ctx.currentTime + .6;
    const clicks = [];
    for (let k = 0; k < n; k++) { click(t0 + k * gap); clicks.push(t0 + k * gap); }
    m.clapping = true;
    const buf = new Float32Array(pre.fftSize), peaks = [];
    let last = ctx.currentTime;
    await new Promise(done => {
      const step = () => {
        const now = ctx.currentTime;
        pre.getFloatTimeDomainData(buf);
        const fresh = Math.min(buf.length, Math.ceil((now - last) * sr) + 128);
        let a = 0, at = 0;
        for (let i = buf.length - fresh; i < buf.length; i++) { const v = Math.abs(buf[i]); if (v > a) { a = v; at = i; } }
        peaks.push({ t: now - (buf.length - at) / sr, a });
        last = now;
        if (now < t0 + n * gap + .3 && m.on) requestAnimationFrame(step); else done();
      };
      requestAnimationFrame(step);
    });
    m.clapping = false;
    const floor = median(peaks.map(q => q.a)) || 1e-4, offs = [];
    clicks.forEach((tc, k) => {
      if (k < 3) return;
      let best = null;
      for (const q of peaks) if (q.t > tc - .2 && q.t < tc + .45 && (!best || q.a > best.a)) best = q;
      if (best && best.a > 4 * floor) offs.push(best.t - tc);
    });
    if (offs.length < 3) return null;
    return Math.max(0, Math.min(.6, median(offs)));
  };

  /* ---------- a take: the voice recorded from now until endTake; remembers when the music started inside it ---------- */
  m.beginTake = (musicT0, from) => {
    if (!m.on || !m.stream || !window.MediaRecorder || m.recording) return false;
    const ctx = getCtx();
    try {
      m.chunks = [];
      const mr = new MediaRecorder(m.stream);
      mr.ondataavailable = e => { if (e.data && e.data.size) m.chunks.push(e.data); };
      const take = { startCtx: ctx.currentTime, t0: musicT0 ?? ctx.currentTime, from: from || 0, blob: null, buffer: null, url: '', mime: mr.mimeType || 'audio/webm', at: new Date() };
      mr.onstop = async () => {
        take.blob = new Blob(m.chunks, { type: take.mime });
        take.url = URL.createObjectURL(take.blob);
        try { take.buffer = await ctx.decodeAudioData(await take.blob.arrayBuffer()); } catch (e) { take.buffer = null; }
        m.recording = false; m.mr = null;
        if (m.take && m.take.url) URL.revokeObjectURL(m.take.url);
        m.take = take;
        if (m.onTake) m.onTake(take);
      };
      mr.start();
      m.mr = mr; m.recording = true;
      if (m.onRecState) m.onRecState(true);
      return true;
    } catch (e) { m.mr = null; return false; }
  };
  m.endTake = () => { if (m.mr && m.mr.state === 'recording') { try { m.mr.stop(); } catch (e) { /* ignore */ } } if (m.onRecState) m.onRecState(false); };
  return m;
}
