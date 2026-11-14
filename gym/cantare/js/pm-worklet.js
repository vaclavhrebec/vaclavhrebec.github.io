/* Physical models of Renaissance instruments, after the waveguide models of the Synthesis ToolKit
   (Perry Cook and Gary Scavone, CCRMA, Stanford; STK is free software under a permissive licence),
   adapted for Cantare super librum. Each note is one small simulation: a breath (or a bellows) pushes
   against a reed, a pair of lips or an air jet, and the sound travels along a tube that is cut to the
   length of the note. Nothing here is a recording.

   chalumeau a single reed on a cylindrical bore (the clarinet model: hollow, odd harmonics, soft)
   crumhorn  a capped double reed on a narrow cylindrical bore (the clarinet model, brighter and buzzier)
   shawm     a double reed on a conical bore (two delay lines meeting at the reed)
   cornett   lips on a short conical horn of wood (the brass model with a soft, round lip)
   recorder  an air jet blown across the edge of a pipe (the flute model)
   regal     a brass tongue beating against its shallot, with a tiny resonator: the reed sets the pitch */

class Delay {
  constructor(max) { this.b = new Float32Array(max); this.w = 0; this.d = 1; this.last = 0; }
  set(d) { this.d = Math.max(1, Math.min(this.b.length - 2, d)); }
  tick(x) {
    const b = this.b, n = b.length;
    b[this.w] = x;
    let r = this.w - this.d; while (r < 0) r += n;
    const i = Math.floor(r), fr = r - i, j = (i + 1) % n;
    /* linear interpolation between the two samples around the fractional read point (read backwards in time) */
    this.last = b[i] * (1 - fr) + b[j] * fr;
    this.w = (this.w + 1) % n;
    return this.last;
  }
}

const clip = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

export class Model {
  constructor(type, f0, sr, tune = 1, seed = 1, jet = .32) {
    this.type = type; this.sr = sr; this.f0 = f0; this.jet = jet;
    this.d1 = new Delay(Math.ceil(sr / 20) + 8); this.d2 = new Delay(Math.ceil(sr / 20) + 8);
    this.z1 = 0; this.z2 = 0; this.z3 = 0; this.z4 = 0; this.dcx = 0; this.dcy = 0;
    this.ph = 0; this.vph = Math.random() * 6.28; this.seed = seed * 9973 + 17;
    this.tune = tune;
    this.setFreq(f0);
  }
  noise() { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 2147483648 - 1; }
  setFreq(f) {
    const sr = this.sr, t = this.tune;
    this.f0 = f;
    if (this.type === 'crumhorn' || this.type === 'chalumeau') this.d1.set((sr / f) * .5 * t - 1.5);
    else if (this.type === 'shawm') { const d = (sr / f) * t - 3; this.d1.set(d * .8); this.d2.set(d * .2); }
    else if (this.type === 'cornett') {
      this.d1.set((sr / f) * t);
    } else if (this.type === 'recorder') { const d = (sr / f) * t - 2; this.d1.set(d); this.d2.set(d * this.jet); }
    else if (this.type === 'regal') {
      /* the resonator: a short tube, a fraction of the note's length, with a body resonance */
      this.d1.set(Math.max(2, (sr / f) * .19 * t));
      const fr = Math.min(3200, Math.max(1100, f * 5)), r = .93, th = 2 * Math.PI * fr / sr;
      this.ra1 = -2 * r * Math.cos(th); this.ra2 = r * r;
    }
  }
  /* p: breath (0 … 1). Returns one sample. */
  tick(p) {
    const sr = this.sr;
    this.vph += 2 * Math.PI * 4.8 / sr;
    const vib = Math.sin(this.vph);
    switch (this.type) {
      case 'crumhorn': {
        /* clarinet waveguide: the reed table is a pressure-controlled valve; the bore reflects with inversion */
        const bp = p * (.76 + .022 * this.noise() + .004 * vib);
        const back = this.d1.last;
        const lp = .62 * back + .38 * this.z1; this.z1 = back;          /* bore losses, brighter than a clarinet */
        let pd = -.95 * lp - bp;
        const reed = clip(.72 - .34 * pd, -1, 1);
        this.d1.tick(bp + pd * reed);
        return this.d1.last * .9;
      }
      case 'chalumeau': {
        /* the clarinet loop of the crumhorn with a gentler breath and less buzz; the wooden bell and the player's
           soft embouchure take off the top (two gentle low-passes after the bore) */
        const bp = p * (.74 + .01 * this.noise() + .003 * vib);
        const back = this.d1.last;
        const lp = .62 * back + .38 * this.z1; this.z1 = back;
        const pd = -.95 * lp - bp;
        const reed = clip(.72 - .34 * pd, -1, 1);
        this.d1.tick(bp + pd * reed);
        const c = Math.min(.92, Math.max(.35, 1 - this.f0 / 1400));
        this.z2 = (1 - c) * this.d1.last + c * this.z2;
        this.z3 = (1 - c) * this.z2 + c * this.z3;
        return this.z3 * 1.6;
      }
      case 'shawm': {
        /* conical bore: two delay lines meeting at the reed; a wide-open reed table makes it loud and bright */
        const b0 = p * .78, bp = b0 + b0 * (.2 * this.noise() + .02 * vib);
        const a = this.d1.last;
        const lp = .5 * a + .5 * this.z1; this.z1 = a;
        const temp = -.95 * lp;
        const out = temp - this.d2.last;
        const pd = bp - out;
        const reed = clip(.72 + .3 * pd, -1, 1);
        this.d2.tick(temp);
        this.d1.tick(bp - pd * reed - temp);
        return out * .5;
      }
      case 'cornett': {
        /* the lips buzz at the note (a smooth valve, open for about half the period); the puffs of air
           excite a conical horn whose length is the note's period, so its resonances reinforce the harmonics */
        this.ph += this.f0 * (1 + .0008 * this.noise() + .003 * vib) / sr;
        if (this.ph >= 1) this.ph -= 1;
        const c = .5 - .5 * Math.cos(2 * Math.PI * this.ph);
        const open = Math.pow(c, 1.6 - .8 * Math.min(1, p));           /* more breath, wider lips, brighter */
        const flow = open * p * (1 + .03 * this.noise());
        const fb = .62 * (.5 * this.d1.last + .5 * this.z3); this.z3 = this.d1.last;
        this.d1.tick(flow - fb * .9);
        const o = flow - this.d1.last;
        const dc = o - this.dcx + .995 * this.dcy; this.dcx = o; this.dcy = dc;
        const s = .45 * dc + .55 * this.z2; this.z2 = s;              /* wood and finger holes: a soft top */
        return s * 1.3;
      }
      case 'recorder': {
        /* air jet: breath with turbulence enters the jet delay, the jet table is the edge, the bore returns */
        const b0 = p * 1.15, bp = b0 + b0 * (.12 * this.noise() + .03 * vib);
        const b = this.d1.last, pole = .7 - .1 * 22050 / sr;
        const yv = -(1 - pole) * b + pole * this.z1; this.z1 = yv;    /* one-pole loss, inverted */
        const t = -yv;
        const dc = t - this.dcx + .995 * this.dcy; this.dcx = t; this.dcy = dc;
        let pd = bp - .5 * dc;
        pd = this.d2.tick(pd);
        pd = clip(pd * (pd * pd - 1), -1, 1) + .5 * dc;
        this.d1.tick(pd);
        return this.d1.last * .3;
      }
      case 'regal': {
        /* the tongue swings at the note; while it is off the shallot, wind flows; the flow beats shut once a period */
        this.ph += this.f0 * (1 + .0012 * this.noise()) / sr;
        if (this.ph >= 1) this.ph -= 1;
        const swing = Math.sin(2 * Math.PI * this.ph) * (.6 + .9 * p);
        const open = Math.max(0, swing - .15);
        const flow = open * Math.sqrt(Math.max(0, p)) * (1 + .06 * this.noise() * open);
        const d = flow - this.z4; this.z4 = flow;                     /* the sound is the change of flow */
        /* tiny resonator: a short tube (comb) and a body resonance */
        const tube = d + .55 * this.d1.last; this.d1.tick(tube);
        const y = tube * .35 - this.ra1 * this.z1 - this.ra2 * this.z2; this.z2 = this.z1; this.z1 = y;
        return (y * .5 + tube * .55) * 1.4;
      }
    }
    return 0;
  }
}

/* tuning and loudness corrections measured offline for every model (see the note at the end) */
export const CAL = {"chalumeau":[[36,1,0.316],[38,1,0.318],[40,0.9,0.318],[42,0.9,0.337],[44,1,0.324],[46,1.3,0.327],[48,1.3,0.525],[50,1.5,0.326],[52,1.7,0.326],[54,1.8,0.326],[56,2,0.385],[58,2.4,0.326],[60,2.5,0.326],[62,2.8,0.326],[64,3.3,0.327],[66,3.7,0.326],[68,4,0.327],[70,4.4,0.327],[72,5,0.328],[74,5.7,0.325],[76,6.2,0.326],[78,7.3,0.332],[80,8.1,0.327],[82,9.2,0.333],[84,9.9,0.345],[86,11.6,0.351],[88,13,0.358]],"crumhorn":[[36,0.7,0.521],[38,0.7,0.545],[40,0.8,0.532],[42,0.9,0.551],[44,1,0.54],[46,1.1,0.519],[48,1.3,0.558],[50,1.4,0.539],[52,1.7,0.522],[54,1.8,0.546],[56,2,0.551],[58,2.3,0.524],[60,2.5,0.552],[62,2.8,0.53],[64,3.2,0.532],[66,3.6,0.531],[68,3.9,0.538],[70,4.4,0.553],[72,5,0.545],[74,5.7,0.539],[76,6.2,0.544],[78,7.3,0.559],[80,8,0.552],[82,9.3,0.566],[84,9.9,0.585],[86,11.6,0.591],[88,13.1,0.6]],"cornett":[[36,8.6,1.723],[38,10.2,1.685],[40,12.4,1.652],[42,9.7,1.625],[44,9.8,1.603],[46,9.8,1.586],[48,10.5,1.574],[50,9.3,1.562],[52,8.6,1.554],[54,9.9,1.547],[56,9.1,1.542],[58,7.9,1.537],[60,3.1,1.535],[62,8.5,1.533],[64,5.2,1.53],[66,2.6,1.53],[68,1.9,1.53],[70,2.5,1.53],[72,1.2,1.531],[74,1.6,1.533],[76,0.9,1.535],[78,1.9,1.537],[80,1.1,1.544],[82,0.8,1.548],[84,0.3,1.555],[86,0.9,1.562],[88,1.1,1.572]],"regal":[[36,2.4,3.839],[38,5.1,3.509],[40,6.2,3.215],[42,4.6,2.911],[44,5.9,2.618],[46,1.3,2.339],[48,1.1,2.103],[50,-0.5,1.887],[52,2,1.686],[54,0.4,1.511],[56,-2.1,1.35],[58,-3.4,1.302],[60,-1.7,1.361],[62,-0.1,1.429],[64,-0.5,1.494],[66,0.6,1.56],[68,0.2,1.621],[70,-1.3,1.669],[72,-1.6,1.72],[74,0.1,1.764],[76,-0.2,1.756],[78,-0.2,1.577],[80,0.2,1.446],[82,0.1,1.396],[84,0.1,1.265],[86,-0.4,1.097],[88,0,0.908]]};

/* the measured pitch error (cents) and loudness correction at a frequency, interpolated between measured notes */
export function correction(type, f0) {
  const t = CAL[type]; if (!t || !t.length) return [0, 1];
  const m = 69 + 12 * Math.log2(f0 / 440);
  if (m <= t[0][0]) return [t[0][1], t[0][2]];
  for (let i = 1; i < t.length; i++) if (m <= t[i][0]) {
    const a = t[i - 1], b = t[i], k = (m - a[0]) / (b[0] - a[0]);
    return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }
  const z = t[t.length - 1]; return [z[1], z[2]];
}

if (typeof AudioWorkletProcessor !== 'undefined') {
  class PM extends AudioWorkletProcessor {
    static get parameterDescriptors() { return [{ name: 'breath', defaultValue: 0, minValue: 0, maxValue: 1.5, automationRate: 'a-rate' }]; }
    constructor(opt) {
      super();
      const o = opt.processorOptions || {};
      const [cents, g] = correction(o.type, o.f0);
      this.m = new Model(o.type, o.f0 / Math.pow(2, cents / 1200), sampleRate, o.tune || 1, o.seed || 1, o.jet || .32);
      this.gain = (o.gain || 1) * g; this.end = o.end || 1e9;
    }
    process(_, outputs, params) {
      const out = outputs[0][0], br = params.breath;
      if (!out) return true;
      for (let i = 0; i < out.length; i++) out[i] = this.m.tick(br.length > 1 ? br[i] : br[0]) * this.gain;
      for (let c = 1; c < outputs[0].length; c++) outputs[0][c].set(out);
      return currentTime < this.end;
    }
  }
  registerProcessor('pm', PM);
}
