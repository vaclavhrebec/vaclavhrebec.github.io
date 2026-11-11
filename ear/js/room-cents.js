/* Room II — intonation: four tones, one is a few cents off */
'use strict';
(function () {
  const h = E.h, T = E.t;
  const LEVELS = [10, 8, 6, 5, 4, 3, 2, 1, .5];
  const cfg = Object.assign({ level: 0, auto: true, dir: false, dur: .7, fixed: false }, E.load('cfg.cents', {}));
  const save = () => E.save('cfg.cents', cfg);
  let run = 0, miss = 0;
  const fmtC = c => (c < 1 ? '½' : String(c)) + ' ' + T(c === 1 ? 'cent' : 'cents');

  function play(q, lights) {
    const A = E.audio; A.stop();
    const t = A.now(), d = cfg.dur, gap = .28;
    q.f.forEach((fr, i) => {
      A.tone(fr, t + i * (d + gap), d);
      A.later(() => light(i), (t - A.get().currentTime + i * (d + gap)) * 1000);
    });
    A.later(() => light(-1), (t - A.get().currentTime + 4 * (d + gap)) * 1000);
  }
  function light(i) {
    document.querySelectorAll('.lamp').forEach((l, k) => l.classList.toggle('on', k === i));
  }

  const spec = {
    id: 'cents', cols: 4, autoDelay: 1500,
    options: () => cfg.dir
      ? [0, 1, 2, 3].flatMap(i => [{ id: i + 'u', label: (i + 1) + ' ↑', sub: T('higher') }, { id: i + 'd', label: (i + 1) + ' ↓', sub: T('lower') }])
        .sort((a, b) => (a.id[1] === 'u' ? 0 : 1) - (b.id[1] === 'u' ? 0 : 1) || a.id[0] - b.id[0])
      : [0, 1, 2, 3].map(i => ({ id: String(i), label: T('Tone') + ' ' + (i + 1) })),
    ask() {
      const c = LEVELS[cfg.level];
      const base = cfg.fixed ? 440 : 220 * Math.pow(2, Math.random() * 1.6);   // 220–666 Hz
      const odd = E.rand(4), up = Math.random() < .5;
      const f = [0, 1, 2, 3].map(i => i === odd ? base * Math.pow(2, (up ? c : -c) / 1200) : base);
      return { f, odd, up, c, base, answer: cfg.dir ? odd + (up ? 'u' : 'd') : String(odd) };
    },
    play: q => play(q),
    prompt: () => cfg.dir ? T('Which tone is different, and is it higher or lower?') : T('Which tone is different?'),
    reveal: q => `${T('Tone')} <b>${q.odd + 1}</b> ${T('was')} <b>${fmtC(q.c)} ${T(q.up ? 'higher' : 'lower')}</b> (${q.base.toFixed(1)} Hz → ${q.f[q.odd].toFixed(2)} Hz).`,
    after(q, ok) {
      if (!cfg.auto) return;
      if (ok) { run++; miss = 0; if (run >= 5 && cfg.level < LEVELS.length - 1) { cfg.level++; run = 0; save(); spec._lvlMsg = 'up'; } }
      else { miss++; run = 0; if (miss >= 2 && cfg.level > 0) { cfg.level--; miss = 0; save(); spec._lvlMsg = 'down'; } }
    },
    stage(q, el) {
      const lv = h('div', { class: 'levelbar' },
        LEVELS.map((c, i) => h('button', {
          type: 'button', class: 'lv' + (i === cfg.level ? ' on' : '') + (i < cfg.level ? ' past' : ''),
          title: fmtC(c), onclick: () => { cfg.level = i; run = miss = 0; save(); spec._ctl.redraw(); }
        }, h('b', null, i + 1), h('small', null, c < 1 ? '½' : c))));
      const msg = spec._lvlMsg ? h('span', { class: 'lvmsg' }, T(spec._lvlMsg === 'up' ? 'Five in a row: next level.' : 'Two mistakes: one level easier.')) : null;
      spec._lvlMsg = null;
      el.append(
        h('div', { class: 'lvhead' }, h('span', null, T('Level'), ' ', h('b', null, cfg.level + 1), ' · ', fmtC(LEVELS[cfg.level])), msg),
        lv,
        h('div', { class: 'lamps' }, [0, 1, 2, 3].map(i => h('div', { class: 'lamp' }, h('span', null, i + 1)))));
    },
    settings(el, rerun) {
      el.append(
        E.checkField(T('Automatic levels: five correct in a row moves up, two mistakes in a row move down'), cfg.auto, v => { cfg.auto = v; save(); }),
        E.checkField(T('Also say whether the tone is higher or lower'), cfg.dir, v => { cfg.dir = v; save(); rerun(); }),
        E.checkField(T('Always start from A = 440 Hz (otherwise a random pitch each time)'), cfg.fixed, v => { cfg.fixed = v; save(); }),
        E.rangeField(T('Tone length'), cfg.dur, .3, 1.5, .1, v => v.toFixed(1) + ' s', v => { cfg.dur = v; save(); }));
    }
  };

  E.room({
    id: 'cents', num: 'II', title: 'Intonation',
    desc: 'Four tones of the same pitch, but one is slightly higher or lower. Nine levels, from 10 cents down to half a cent.',
    meta: '9 levels · 10 to ½ cent',
    lede: 'You hear four tones. Three are identical; one is raised or lowered by a few cents (a cent is a hundredth of an equal-tempered semitone). Find the odd one out.',
    icon: () => '<svg viewBox="0 0 160 80" class="score"><g class="stl">' + [0, 1, 2, 3].map(i => `<rect x="${14 + i * 36}" y="${i === 2 ? 30 : 36}" width="26" height="8" rx="2" class="${i === 2 ? 'acc' : ''}"/>`).join('') + '</g></svg>',
    mount(box) { box.classList.add('quiz'); spec._ctl = E.quiz(spec, box); }
  });
})();
