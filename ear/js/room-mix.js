/* Daily mix — a timed session drawing questions from the identification rooms.
   Rooms where the player goes wrong more often come up more often, and a question answered wrongly
   comes back (the same answer, a new sound) two or three questions later.
   Every room keeps its own settings, so a teacher's link can set up the whole mix. */
'use strict';
(function () {
  const h = E.h, T = E.t;
  const ALL = ['intervals', 'chords', 'scales', 'cadences', 'metre', 'cents', 'keys'];
  const cfg = Object.assign({ min: 10, rooms: ALL.slice() }, E.load('cfg.mix', {}));
  const save = () => E.save('cfg.mix', cfg);
  const titleOf = id => { const r = E.rooms.find(x => x.id === id); return r ? T(r.title) : id; };
  let cur = null, sess = null, retry = [], timer = 0, quizEl = null, outer = null, lastRetry = false;
  const recent = E.load('mix.recent', {});   // {room: [1, 0, 1, …]} the last 20 answers

  function rooms() { return cfg.rooms.filter(id => E.specs[id]); }
  function weight(id) {
    const r = recent[id] || [];
    const acc = r.length ? r.reduce((a, x) => a + x, 0) / r.length : .6;
    return 1 + 4 * (1 - acc);
  }
  function left() { return sess ? Math.max(0, sess.start + cfg.min * 60e3 - Date.now()) : cfg.min * 60e3; }
  const mmss = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  const spec = {
    id: 'mix',
    get cols() { return cur ? cur.cols || 3 : 3; },
    get groupHeads() { return cur ? !!cur.groupHeads : false; },
    get autoDelay() { return cur && cur.autoDelay || 1300; },
    options: () => cur ? cur.options() : [],
    ask() {
      if (!sess) sess = { start: Date.now(), n: 0, ok: 0, per: {} };
      retry.forEach(r => r.due--);
      // a missed question comes back once, never two retries in a row
      const due = !lastRetry && retry.find(r => r.due <= 0 && E.specs[r.room]);
      lastRetry = !!due;
      let id, q;
      if (due) {
        retry.splice(retry.indexOf(due), 1);
        id = due.room; cur = E.specs[id];
        for (let k = 0; k < 40; k++) { q = cur.ask(); if ([].concat(q.answer).includes(due.answer)) break; }
      } else {
        const ids = rooms().length ? rooms() : ['intervals'];
        id = E.wpick(ids.map(x => ({ id: x, w: weight(x) }))).id; cur = E.specs[id];
        q = cur.ask();
      }
      q._room = id; q._retry = !!due;
      return q;
    },
    play: q => { const s = E.specs[q._room]; if (s && s.play) s.play(q); },
    compare: (q, id) => { const s = E.specs[q._room]; if (s && s.compare) s.compare(q, id); else spec.play(q); },
    prompt: q => { const s = E.specs[q._room]; return s.prompt ? s.prompt(q) : T('Which one is it?'); },
    reveal: q => E.specs[q._room].reveal(q),
    stage(q, el, st) {
      el.append(h('div', { class: 'mixhead' },
        h('span', { class: 'mixroom' }, q ? titleOf(q._room) : T('Daily mix')),
        h('span', { class: 'mixtime', 'aria-live': 'off' }, mmss(left()))));
      const s = q && E.specs[q._room];
      if (s && s.stage) s.stage(q, el, st);
    },
    after(q, ok) {
      const id = q._room, s = E.specs[id];
      if (s.after) s.after(q, ok);
      const all = E.load('stats.' + id, { n: 0, ok: 0 }); all.n++; if (ok) all.ok++; E.save('stats.' + id, all);
      (recent[id] = recent[id] || []).push(ok ? 1 : 0); if (recent[id].length > 20) recent[id].shift(); E.save('mix.recent', recent);
      sess.n++; if (ok) sess.ok++;
      const p = sess.per[id] = sess.per[id] || { n: 0, ok: 0 }; p.n++; if (ok) p.ok++;
      if (!ok && !q._retry && !Array.isArray(q.answer)) retry.push({ room: id, answer: q.answer, due: 2 + E.rand(2) });
      if (left() <= 0) setTimeout(finish, ok ? 900 : 2600);
    },
    settings(el, rerun) {
      el.append(
        E.selectField(T('Length'), cfg.min, [5, 10, 15, 20, 30].map(m => ({ v: m, l: T('{n} minutes', { n: m }) })), v => { cfg.min = +v; save(); }),
        h('div', { class: 'sethead' }, T('Rooms in the mix')),
        E.chips(ALL.filter(id => E.specs[id]).map(id => ({ id, label: titleOf(id), on: cfg.rooms.includes(id) })), (id, on) => {
          cfg.rooms = ALL.filter(x => x === id ? on : cfg.rooms.includes(x)); if (!cfg.rooms.length) cfg.rooms = ['intervals']; save();
        }),
        h('p', { class: 'note' }, T('Each room keeps its own settings: what you chose in Intervals, Chords and the others is what the mix asks.')));
    }
  };

  function finish() {
    if (!outer || !sess) return;
    clearInterval(timer); E.audio.stop();
    const s = sess; sess = null; retry = [];
    if (quizEl) quizEl.remove();
    const pct = s.n ? Math.round(100 * s.ok / s.n) : 0;
    const rows = Object.keys(s.per).sort((a, b) => (s.per[a].ok / s.per[a].n) - (s.per[b].ok / s.per[b].n));
    outer.append(h('div', { class: 'panel mixdone' },
      h('h2', null, T('Done for today.')),
      h('p', null, T('{ok} of {n} right ({p} %).', { ok: s.ok, n: s.n, p: pct })),
      rows.length ? h('table', { class: 'mixtable' }, rows.map(id => h('tr', null, h('td', null, h('a', { href: '#' + id }, titleOf(id))), h('td', null, s.per[id].ok + ' / ' + s.per[id].n)))) : null,
      rows.length ? h('p', { class: 'note' }, T('Hardest first. Tap a room to practise it on its own.')) : null,
      h('div', { class: 'acts' }, h('button', { type: 'button', class: 'btn primary', onclick: () => mount(outer) }, T('Another round')), h('a', { class: 'btn', href: '#' }, T('All exercises')))));
  }
  function mount(box) {
    outer = box; box.innerHTML = ''; sess = null; retry = []; cur = null; spec._st = null;
    quizEl = h('div', { class: 'quiz' }); box.append(quizEl);
    E.quiz(spec, quizEl);
    clearInterval(timer);
    timer = setInterval(() => {
      const el = document.querySelector('.mixtime'); if (el && sess) el.textContent = mmss(left());
      if (sess && left() <= 0) { const q = spec._st && spec._st.q; if (!q || spec._st.done) finish(); }
    }, 500);
  }
  E.room({
    id: 'mix', hidden: true, num: '', title: 'Daily mix',
    desc: '', meta: '',
    lede: 'Questions from all rooms in turn, for as long as you choose. What you get wrong comes back a little later, and rooms where you make more mistakes come up more often.',
    mount(box) { spec._st = null; mount(box); },
    leave() { clearInterval(timer); outer = null; }
  });
})();
