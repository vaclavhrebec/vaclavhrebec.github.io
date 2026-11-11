/* Ear training — shared core: helpers, sound, storage, quiz engine, router.
   Each room registers itself with E.room({...}) in its own file. */
'use strict';
window.E = (function () {
  const E = {};

  /* ---------- tiny DOM helper ---------- */
  E.h = function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (const c of kids.flat(9)) {
      if (c == null || c === false) continue;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    return el;
  };
  const h = E.h;

  E.rand = n => Math.floor(Math.random() * n);
  E.pick = a => a[E.rand(a.length)];
  E.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = E.rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  E.wpick = list => { // [{w, ...}]
    const tot = list.reduce((s, x) => s + (x.w || 1), 0); let r = Math.random() * tot;
    for (const x of list) { r -= (x.w || 1); if (r <= 0) return x; } return list[list.length - 1];
  };

  /* ---------- storage (best effort; the page works without it) ---------- */
  E.load = (k, d) => { try { const v = localStorage.getItem('ear.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  E.save = (k, v) => { try { localStorage.setItem('ear.' + k, JSON.stringify(v)); } catch (e) {} };

  /* ---------- sound ---------- */
  const A = E.audio = { ctx: null, out: null, live: new Set() };
  A.get = function () {
    if (!A.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      A.ctx = new C();
      const comp = A.ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .2;
      A.out = A.ctx.createGain(); A.out.gain.value = .8;
      A.out.connect(comp); comp.connect(A.ctx.destination);
      A.waves = {};
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
    return A.ctx;
  };
  A.stop = function () {
    const ctx = A.ctx; if (!ctx) return;
    const t = ctx.currentTime;
    A.live.forEach(n => { try { n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(n.g.gain.value, t); n.g.gain.linearRampToValueAtTime(0, t + .03); n.o.forEach(o => o.stop(t + .05)); } catch (e) {} });
    A.live.clear();
    (A.timers || []).forEach(clearTimeout); A.timers = [];
  };
  A.later = function (fn, ms) { (A.timers = A.timers || []).push(setTimeout(fn, ms)); };
  function wave(ctx, name) {
    if (A.waves[name]) return A.waves[name];
    const N = 24, re = new Float32Array(N), im = new Float32Array(N);
    for (let k = 1; k < N; k++) {
      let a = 0;
      if (name === 'organ') a = [0, 1, .55, .32, .2, .12, .07, .05, .035, .02][k] || 0;      // principal-like
      else if (name === 'piano') a = Math.pow(k, -1.35) * (k % 7 === 0 ? .3 : 1);
      else if (name === 'reed') a = (k % 2 ? 1 : .55) / Math.pow(k, .9);
      im[k] = a;
    }
    return (A.waves[name] = ctx.createPeriodicWave(re, im));
  }
  E.timbres = ['piano', 'organ', 'reed', 'sine'];
  E.mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  /* one tone. f in Hz, t0 = absolute ctx time, d = seconds */
  A.tone = function (f, t0, d, o) {
    o = o || {};
    const ctx = A.get(), tim = o.timbre || E.settings.timbre || 'piano';
    const g = ctx.createGain(), osc = ctx.createOscillator();
    if (tim === 'sine') osc.type = 'sine'; else osc.setPeriodicWave(wave(ctx, tim));
    osc.frequency.value = f;
    const v = (o.vol || .32) * (tim === 'sine' ? 1.1 : 1);
    const nodes = [osc];
    let src = osc;
    if (tim === 'piano') {   // brightness falls as the tone decays
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.min(12000, f * 12), t0);
      lp.frequency.exponentialRampToValueAtTime(Math.max(f * 2.5, 400), t0 + Math.max(.3, d));
      osc.connect(lp); src = lp;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(v, t0 + .006);
      g.gain.exponentialRampToValueAtTime(v * .35, t0 + .45);
      g.gain.exponentialRampToValueAtTime(v * .12, t0 + d);
      g.gain.linearRampToValueAtTime(0, t0 + d + .12);
    } else {
      const att = tim === 'organ' ? .035 : .05;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(v, t0 + att);
      g.gain.setValueAtTime(v, t0 + Math.max(att, d - .06));
      g.gain.linearRampToValueAtTime(0, t0 + d + .04);
    }
    src.connect(g); g.connect(A.out);
    osc.start(t0); osc.stop(t0 + d + .2);
    const n = { g, o: nodes }; A.live.add(n);
    osc.onended = () => A.live.delete(n);
  };
  /* short percussive click for metronome / rhythm */
  A.click = function (t0, o) {
    o = o || {};
    const ctx = A.get(), g = ctx.createGain(), osc = ctx.createOscillator();
    osc.type = 'triangle'; osc.frequency.value = o.f || 1600;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(o.vol || .35, t0 + .002);
    g.gain.exponentialRampToValueAtTime(.001, t0 + (o.d || .05));
    osc.connect(g); g.connect(A.out); osc.start(t0); osc.stop(t0 + .08);
    const n = { g, o: [osc] }; A.live.add(n); osc.onended = () => A.live.delete(n);
  };
  A.now = () => A.get().currentTime + .06;

  /* global listening settings */
  E.settings = Object.assign({ timbre: 'piano' }, E.load('settings', {}));
  E.saveSettings = () => E.save('settings', E.settings);

  /* ---------- pitch spelling & names ---------- */
  // pitch = {l: letter 0..6 (C..B), a: alteration -2..2, o: octave}
  const NAT = [0, 2, 4, 5, 7, 9, 11];
  E.midiOf = p => 12 * (p.o + 1) + NAT[p.l] + p.a;
  E.addInterval = function (p, steps, semis) {   // steps: diatonic steps (0 = unison)
    const l = (p.l + steps) % 7, o = p.o + Math.floor((p.l + steps) / 7);
    const base = 12 * (o + 1) + NAT[l];
    return { l, a: E.midiOf(p) + semis - base, o };
  };
  const ACC = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };
  E.noteName = function (p, lang) {
    lang = lang || E.lang;
    if (lang === 'fr') {
      const n = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'][p.l];
      return n + ({ '-2': ' double bémol', '-1': ' bémol', '0': '', '1': ' dièse', '2': ' double dièse' })[p.a];
    }
    if (lang === 'de' || lang === 'cs') {
      const L = 'CDEFGAH'[p.l];
      if (p.a === 0) return L;
      if (p.l === 6 && p.a === -1) return 'B';
      if (p.l === 6 && p.a === -2) return lang === 'de' ? 'Heses' : 'Heses';
      if (p.a > 0) return L + (p.a === 1 ? 'is' : 'isis');
      if (p.l === 2 || p.l === 5) return L + (p.a === -1 ? 's' : 'ses'); // Es, As
      return L + (p.a === -1 ? 'es' : 'eses');
    }
    return 'CDEFGAB'[p.l] + ACC[p.a];
  };

  /* ---------- language ---------- */
  E.LANGS = ['en', 'de', 'fr', 'cs'];
  E.lang = (function () {
    let l = new URL(location.href).searchParams.get('lang');
    if (!l) { try { l = localStorage.getItem('lang'); } catch (e) {} }
    if (!l) {
      const pref = (navigator.languages || [navigator.language || 'en']).map(x => x.slice(0, 2).toLowerCase());
      l = pref.find(x => ['de', 'fr', 'cs', 'sk', 'en'].includes(x)) || 'en';
      if (l === 'sk') l = 'cs';
    }
    return E.LANGS.includes(l) ? l : 'en';
  })();
  E.t = function (s, vars) {
    let r = (E.lang !== 'en' && window.EAR_T && EAR_T[E.lang] && EAR_T[E.lang][s]) || s;
    if (vars) for (const k in vars) r = r.split('{' + k + '}').join(vars[k]);
    return r;
  };
  E.colon = () => E.lang === 'fr' ? '\u202f: ' : ': ';
  E.tn = o => (o && (o[E.lang] || o.en)) || '';   // names given as {en,de,fr,cs}
  E.setLang = function (l) {
    E.lang = E.LANGS.includes(l) ? l : 'en';
    document.documentElement.lang = E.lang;
    try { localStorage.setItem('lang', E.lang); } catch (e) {}
    const u = new URL(location.href);
    if (E.lang === 'en') u.searchParams.delete('lang'); else u.searchParams.set('lang', E.lang);
    history.replaceState(null, '', u);
    E.render();
  };

  /* ---------- quiz engine shared by the identification rooms ----------
     spec: { id, title, lede, options(): [{id,label,group?}], ask(): question,
             play(q, which?), stage?(q, el), reveal(q): string, compare?(q, optionId),
             settings(el, rerun), cols? }
     question: { answer: id | [ids] } */
  E.quiz = function (spec, root) {
    const st = spec._st || (spec._st = { q: null, done: false, chosen: null, sess: { n: 0, ok: 0, streak: 0, best: 0 } });
    const all = E.load('stats.' + spec.id, { n: 0, ok: 0 });
    const pref = E.settings;
    const T = E.t;

    function correctIds(q) { return [].concat(q.answer); }
    function newQ(autoplay) {
      E.audio.stop();
      st.q = spec.ask(); st.done = false; st.chosen = null;
      draw();
      if (autoplay && spec.play) spec.play(st.q);
    }
    function answer(id) {
      if (!st.q || st.done) return;
      const ok = correctIds(st.q).includes(id);
      st.done = true; st.chosen = id;
      st.sess.n++; all.n++;
      if (ok) { st.sess.ok++; all.ok++; st.sess.streak++; st.sess.best = Math.max(st.sess.best, st.sess.streak); }
      else st.sess.streak = 0;
      E.save('stats.' + spec.id, all);
      if (spec.after) spec.after(st.q, ok);
      draw();
      if (ok && pref.autoNext !== false) {
        clearTimeout(st.timer);
        st.timer = setTimeout(() => { if (st.done && document.body.contains(root)) newQ(true); }, spec.autoDelay || 1300);
      }
    }

    let el = {};
    function draw() {
      root.innerHTML = '';
      const opts = spec.options();
      const q = st.q;
      el.stage = h('div', { class: 'stage' });
      if (spec.stage) spec.stage(q, el.stage, st);

      const playBtn = h('button', { class: 'btn primary', type: 'button', onclick: () => { if (!st.q) newQ(true); else spec.play && spec.play(st.q); } },
        q ? (spec.playLabel ? spec.playLabel(true) : T('Play again')) : T('Start'));
      const nextBtn = h('button', { class: 'btn', type: 'button', disabled: !q, onclick: () => newQ(true) }, T('Next'));
      const acts = h('div', { class: 'acts' }, spec.play ? playBtn : (!q ? playBtn : null), q ? nextBtn : null,
        h('span', { class: 'keys-hint' }, spec.play ? T('Space: play again · Enter: next') : T('Enter: next')));

      let fb = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
      if (q && st.done) {
        const ok = correctIds(q).includes(st.chosen);
        fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
        fb.append(h('b', null, ok ? T('Correct.') : T('Not quite.')), ' ', h('span', { html: spec.reveal(q) }));
        if (!ok && spec.compare) {
          fb.append(h('span', { class: 'cmp' },
            h('button', { type: 'button', class: 'mini', onclick: () => spec.play(q) }, '▶ ' + T('correct answer')),
            h('button', { type: 'button', class: 'mini', onclick: () => spec.compare(q, st.chosen) }, '▶ ' + T('your answer'))));
        }
      } else if (q) fb.append(h('span', { class: 'muted' }, spec.prompt ? spec.prompt(q) : T('Which one is it?')));
      else fb.append(h('span', { class: 'muted' }, T('Press Start. The first sound plays straight away.')));

      const grid = h('div', { class: 'answers', style: spec.cols ? '--cols:' + spec.cols : null });
      let lastGroup = null;
      opts.forEach((o, i) => {
        if (o.group && o.group !== lastGroup && spec.groupHeads) { grid.append(h('div', { class: 'ghead' }, o.group)); }
        lastGroup = o.group;
        const cls = ['ans'];
        if (q && st.done) {
          if (correctIds(q).includes(o.id)) cls.push('is-right');
          else if (o.id === st.chosen) cls.push('is-wrong');
        }
        grid.append(h('button', { type: 'button', class: cls.join(' '), disabled: !q, 'data-id': o.id, onclick: () => answer(o.id) },
          o.label, o.sub ? h('small', null, o.sub) : null));
      });

      const pct = st.sess.n ? Math.round(100 * st.sess.ok / st.sess.n) : 0;
      const stats = h('div', { class: 'stats' },
        h('span', null, T('This session'), E.colon(), h('b', null, st.sess.ok + ' / ' + st.sess.n), st.sess.n ? ' (' + pct + ' %)' : ''),
        h('span', null, T('Streak'), E.colon(), h('b', null, st.sess.streak)),
        h('span', { class: 'muted' }, T('All time'), E.colon(), all.ok + ' / ' + all.n),
        h('button', { type: 'button', class: 'linkish', onclick: () => { st.sess = { n: 0, ok: 0, streak: 0, best: 0 }; all.n = all.ok = 0; E.save('stats.' + spec.id, all); draw(); } }, T('Reset')));

      const set = h('details', { class: 'settings', open: spec._openSet || null, ontoggle: e => spec._openSet = e.target.open });
      set.append(h('summary', null, T('Settings')));
      const sb = h('div', { class: 'setbody' });
      spec.settings(sb, () => { st.q = null; st.done = false; draw(); });
      if (spec.play) sb.append(E.timbreField());
      sb.append(E.checkField(T('Go on to the next question automatically after a correct answer'), pref.autoNext !== false, v => { pref.autoNext = v; E.saveSettings(); }));
      set.append(sb);

      root.append(h('div', { class: 'panel' }, el.stage, acts, fb), grid, stats, set);
    }
    root._keys = function (e) {
      if (e.target.closest('input,select,textarea,summary')) return;
      if (e.code === 'Space' && spec.play) { e.preventDefault(); if (!st.q) newQ(true); else spec.play(st.q); }
      else if (e.key === 'Enter') { e.preventDefault(); newQ(true); }
    };
    draw();
    return { redraw: draw, next: newQ, state: st };
  };

  /* ---------- small form fields ---------- */
  E.checkField = (label, val, on) => h('label', { class: 'chk' },
    h('input', { type: 'checkbox', checked: !!val, onchange: e => on(e.target.checked) }), h('span', null, label));
  E.selectField = (label, val, opts, on) => h('label', { class: 'fld' }, h('span', null, label),
    h('select', { onchange: e => on(e.target.value) }, opts.map(o => h('option', { value: o.v, selected: String(o.v) === String(val) }, o.l))));
  E.rangeField = (label, val, min, max, step, fmt, on) => {
    const out = h('output', null, fmt(val));
    return h('label', { class: 'fld' }, h('span', null, label, ' ', out),
      h('input', { type: 'range', min, max, step, value: val, oninput: e => { out.textContent = fmt(+e.target.value); on(+e.target.value); } }));
  };
  E.chips = (items, onToggle) => h('div', { class: 'chips' }, items.map(it =>
    h('label', { class: 'chip' + (it.on ? ' on' : '') },
      h('input', { type: 'checkbox', checked: !!it.on, onchange: e => { e.target.parentNode.classList.toggle('on', e.target.checked); onToggle(it.id, e.target.checked); } }),
      it.label)));
  E.timbreField = () => E.selectField(E.t('Sound'), E.settings.timbre,
    [{ v: 'piano', l: E.t('Piano-like') }, { v: 'organ', l: E.t('Organ (principal)') }, { v: 'reed', l: E.t('Reed') }, { v: 'sine', l: E.t('Sine tone') }],
    v => { E.settings.timbre = v; E.saveSettings(); });

  /* ---------- rooms & router ---------- */
  E.rooms = [];
  E.room = r => E.rooms.push(r);
  let current = null;
  E.render = function () {
    const id = location.hash.slice(1);
    const room = E.rooms.find(r => r.id === id);
    E.audio.stop();
    if (current && current.leave) current.leave();
    current = room || null;
    document.body.classList.toggle('in-room', !!room);
    document.querySelectorAll('[data-t]').forEach(n => n.textContent = E.t(n.dataset.t));
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === E.lang));
    const main = document.getElementById('main');
    main.innerHTML = '';
    document.title = room ? E.t(room.title) + ' · The Ultimate Ear Trainer' : 'The Ultimate Ear Trainer · Václav Hřebec';
    if (!room) { E.hub(main); window.scrollTo(0, 0); return; }
    const box = h('div', { class: 'roombox' });
    main.append(
      h('div', { class: 'room-head' },
        h('a', { href: '#', class: 'back' }, '← ' + E.t('All exercises')),
        h('div', { class: 'num' }, room.num),
        h('h1', null, E.t(room.title)),
        h('p', { class: 'lede' }, E.t(room.lede))),
      box);
    room.mount(box);
    if (!E._scrolled) window.scrollTo(0, 0);
  };
  E.hub = function (main) {
    main.append(h('div', { class: 'rooms' }, E.rooms.map(r =>
      h('a', { class: 'card', href: '#' + r.id },
        h('div', { class: 'pic', html: r.icon ? r.icon() : '' }),
        h('div', { class: 'body' },
          h('span', { class: 'num' }, r.num),
          h('h2', null, E.t(r.title)),
          h('p', null, E.t(r.desc)),
          h('span', { class: 'meta' }, E.t(r.meta, r.metaVars)))))));
  };
  document.addEventListener('keydown', e => {
    const q = document.querySelector('.quiz');
    if (q && q._keys) q._keys(e);
  });
  window.addEventListener('hashchange', () => E.render());
  return E;
})();
