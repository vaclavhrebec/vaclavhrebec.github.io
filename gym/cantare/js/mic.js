/* Microphone: opens the raw microphone, reads the sung pitch (YIN) and records takes. */

/* YIN pitch detection on one buffer of samples. Returns { f, clarity } or null. */
export function yin(buf, rate, fmin = 70, fmax = 1100) {
  const n = buf.length, half = n >> 1;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < .008) return null;
  const tauMin = Math.max(2, Math.floor(rate / fmax)), tauMax = Math.min(half - 1, Math.floor(rate / fmin));
  const d = new Float32Array(tauMax + 1), cm = new Float32Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let s = 0;
    for (let i = 0; i < half; i++) { const x = buf[i] - buf[i + tau]; s += x * x; }
    d[tau] = s;
  }
  let run = 0; cm[0] = 1;
  for (let tau = 1; tau <= tauMax; tau++) { run += d[tau]; cm[tau] = run ? d[tau] * tau / run : 1; }
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (cm[t] < .15) { while (t + 1 <= tauMax && cm[t + 1] < cm[t]) t++; tau = t; break; }
  }
  if (tau < 0) return null;
  /* parabolic refinement */
  const a = cm[tau - 1] ?? cm[tau], b = cm[tau], c = cm[tau + 1] ?? cm[tau];
  const den = a + c - 2 * b, shift = den ? (a - c) / (2 * den) : 0;
  return { f: rate / (tau + shift), clarity: 1 - cm[tau], rms };
}

export const midiOfHz = f => 69 + 12 * Math.log2(f / 440);
const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
export function describe(midi, a4 = 440) {
  const m = midi + 12 * Math.log2(440 / a4); /* concert pitch of this app is a′ = a4 */
  const r = Math.round(m), cents = Math.round((m - r) * 100);
  return { name: NAMES[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1), cents };
}

export function createMic(getCtx) {
  const m = { on: false, busy: false, stream: null, an: null, src: null, buf: null, raf: 0, last: null, onFrame: null, mr: null, chunks: [], recording: false, take: null };

  m.start = async () => {
    if (m.on || m.busy) return 'ok';
    const ctx = getCtx();
    if (!ctx || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'unsupported';
    m.busy = true;
    try {
      /* the raw microphone: echo cancelling and noise suppression bend a sung tone */
      m.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) { m.busy = false; return e && e.name === 'NotAllowedError' ? 'blocked' : 'unsupported'; }
    m.busy = false;
    m.src = ctx.createMediaStreamSource(m.stream);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 60;
    m.an = ctx.createAnalyser(); m.an.fftSize = 2048; m.an.smoothingTimeConstant = 0;
    m.src.connect(hp); hp.connect(m.an);
    m.buf = new Float32Array(m.an.fftSize);
    m.on = true;
    const tick = () => {
      if (!m.on) return;
      m.an.getFloatTimeDomainData(m.buf);
      const r = yin(m.buf, ctx.sampleRate);
      const t = ctx.currentTime;
      if (r && r.clarity > .8) m.last = { midi: midiOfHz(r.f), f: r.f, t };
      else if (m.last && t - m.last.t > .35) m.last = null;
      if (m.onFrame) m.onFrame(m.last && t - m.last.t < .35 ? m.last : null, r ? r.rms : 0);
      m.raf = requestAnimationFrame(tick);
    };
    m.raf = requestAnimationFrame(tick);
    return 'ok';
  };

  m.stop = () => {
    if (!m.on) return;
    m.on = false; cancelAnimationFrame(m.raf);
    if (m.recording) m.endTake();
    try { m.src.disconnect(); } catch (e) { /* ignore */ }
    if (m.stream) m.stream.getTracks().forEach(t => t.stop());
    m.stream = null; m.last = null;
    if (m.onFrame) m.onFrame(null, 0);
  };

  /* a take: the voice recorded from now until endTake; remembers when the music started inside it */
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
        m.recording = false; m.mr = null; m.take = take;
        if (m.onTake) m.onTake(take);
      };
      mr.start();
      m.mr = mr; m.recording = true; m.take = null;
      if (m.onRecState) m.onRecState(true);
      return true;
    } catch (e) { m.mr = null; return false; }
  };
  m.endTake = () => { if (m.mr && m.mr.state === 'recording') { try { m.mr.stop(); } catch (e) { /* ignore */ } } if (m.onRecState) m.onRecState(false); };
  /* how long the sound takes from the speakers to the recording */
  m.latency = () => { const c = getCtx(); return (c.outputLatency || 0) + (c.baseLatency || 0) + .03; };
  return m;
}
