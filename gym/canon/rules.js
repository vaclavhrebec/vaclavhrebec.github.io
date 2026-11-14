/* The rules of a canon, worked out note by note.
   A disposition is a list of voices [delay, interval]: the dux is [0, 0]; a comes [k, t] enters k notes later,
   t steps of the scale higher (negative: lower). The dux sings one note for every unit of the delay.
   At every moment all the voices must sound together as consonances (thirds, fifths, sixths, octaves and unisons
   against the lowest voice; a fourth only between two upper voices), and no two voices may move in fifths or
   octaves (or unisons) one after another. From that follows which melodic steps the dux may take. */

export const MOTIONS = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, 7, -7];
const K = MOTIONS.length;

export const MOTION_NAME = { 0: 'stay', 1: 'second up', '-1': 'second down', 2: 'third up', '-2': 'third down', 3: 'fourth up', '-3': 'fourth down',
  4: 'fifth up', '-4': 'fifth down', 5: 'sixth up', 7: 'octave up', '-7': 'octave down' };
export const INTERVAL_NAME = t => {
  if (t === 0) return 'unison';
  const a = Math.abs(t), n = ['', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'octave', 'ninth', 'tenth', 'eleventh', 'twelfth'][a] || a + 1 + 'th';
  return (t > 0 ? 'upper ' : 'lower ') + n;
};

const mod7 = x => ((x % 7) + 7) % 7;
const OVER_BASS = new Set([0, 2, 4, 5]);
const PERFECT = new Set([0, 4]);

/* pitches of all voices at the end of a window of motions (the dux's present note = 0) */
function pitches(voices, win) {
  /* win[0] is the oldest motion, win[win.length-1] the newest */
  return voices.map(([d, t]) => { let s = 0; for (let i = 0; i < d; i++) s += win[win.length - 1 - i]; return t - s; });
}
function consonant(p) {
  const low = Math.min(...p);
  for (let j = 0; j < p.length; j++) if (!OVER_BASS.has(mod7(p[j] - low))) return false;
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) {
    if (p[i] === low || p[j] === low) continue;
    const r = mod7(Math.abs(p[i] - p[j])); if (r === 1 || r === 6) return false;
  }
  return Math.max(...p) - low <= 18;
}
/* fifths or octaves (unisons) one after another between two voices that both move */
function parallels(voices, win) {
  /* win has D+1 motions: the state before (first D) and the newest motion */
  const before = pitches(voices, win.slice(0, -1)), last = win.at(-1);
  const after = pitches(voices, win).map(v => v + last); /* the same frame: the dux has moved by `last` */
  const mv = voices.map(([d]) => win[win.length - 1 - d]);
  for (let i = 0; i < voices.length; i++) for (let j = i + 1; j < voices.length; j++) {
    if (!mv[i] || !mv[j]) continue;
    const a = mod7(Math.abs(before[i] - before[j])), b = mod7(Math.abs(after[i] - after[j]));
    if (PERFECT.has(a) && a === b) return true;
  }
  return false;
}

export function analyse(voices) {
  const D = Math.max(1, ...voices.map(v => v[0]));
  const N = K ** D;
  const dec = s => { const w = new Array(D); for (let i = D - 1; i >= 0; i--) { w[i] = MOTIONS[s % K]; s = Math.floor(s / K); } return w; };
  const ok = new Uint8Array(N);
  for (let s = 0; s < N; s++) ok[s] = consonant(pitches(voices, dec(s))) ? 1 : 0;
  /* transitions: s (m1..mD) -> s' (m2..mD, m) */
  const next = new Array(N);
  for (let s = 0; s < N; s++) {
    if (!ok[s]) { next[s] = []; continue; }
    const w = dec(s), out = [];
    for (let k = 0; k < K; k++) {
      const s2 = (s * K + k) % N; if (!ok[s2]) continue;
      if (parallels(voices, [...w, MOTIONS[k]])) continue;
      out.push(s2);
    }
    next[s] = out;
  }
  /* the viable core: states from which the canon can go on for ever and which can be reached again */
  const alive = Uint8Array.from(ok);
  for (let changed = true; changed;) {
    changed = false;
    const inc = new Uint8Array(N);
    for (let s = 0; s < N; s++) if (alive[s]) for (const t of next[s]) if (alive[t]) inc[t] = 1;
    for (let s = 0; s < N; s++) if (alive[s] && (!inc[s] || !next[s].some(t => alive[t]))) { alive[s] = 0; changed = true; }
  }
  /* how free the dux is: the growth of the number of correct melodies, per note */
  let v = new Float64Array(N); for (let s = 0; s < N; s++) v[s] = alive[s];
  let lambda = 0;
  for (let it = 0; it < 60; it++) {
    const w = new Float64Array(N); let sum = 0;
    for (let s = 0; s < N; s++) if (v[s]) for (const t of next[s]) if (alive[t]) w[t] += v[s];
    for (let s = 0; s < N; s++) sum += w[s];
    if (!sum) { lambda = 0; break; }
    const tot = v.reduce((a, b) => a + b, 0); lambda = sum / tot;
    for (let s = 0; s < N; s++) w[s] /= sum; v = w;
  }
  return { voices, D, N, dec, ok, next, alive, lambda, enc: w => w.reduce((s, m) => s * K + MOTIONS.indexOf(m), 0) };
}

/* the rules in words: the steps the dux may take, and the successions to avoid */
export function rules(A) {
  const { D, N, dec, next, alive } = A;
  /* every window of D+1 motions that can occur in a correct canon */
  const wins = [];
  for (let s = 0; s < N; s++) if (alive[s]) for (const t of next[s]) if (alive[t]) wins.push([...dec(s), dec(t).at(-1)]);
  const seen = new Set();
  for (const w of wins) for (let k = 1; k <= Math.min(4, w.length); k++) for (let i = 0; i + k <= w.length; i++) seen.add(w.slice(i, i + k).join(','));
  const allowed = MOTIONS.filter(m => seen.has(String(m)));
  const can = a => seen.has(a.join(','));
  const pairs = [], triples = [];
  for (const a of allowed) for (const b of allowed) if (!can([a, b])) pairs.push([a, b]);
  if (D + 1 >= 3) for (const a of allowed) for (const b of allowed) for (const c of allowed)
    if (can([a, b]) && can([b, c]) && !can([a, b, c])) triples.push([a, b, c]);
  return { allowed, pairs, triples, lambda: A.lambda };
}

/* what may come next after the dux's last motions (the newest last) */
export function nextSteps(A, recent) {
  const { D, next, alive, enc } = A;
  if (recent.length < D || recent.some(m => !MOTIONS.includes(m))) return null;
  const s = enc(recent.slice(-D));
  return next[s].filter(t => alive[t]).map(t => A.dec(t).at(-1));
}
