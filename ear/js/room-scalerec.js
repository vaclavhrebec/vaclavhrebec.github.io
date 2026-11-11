/* Room VI, second mode — scales in real music.
   Freely licensed recordings (Wikimedia Commons) are listed in recordings.js.
   A random moment inside a marked section is played; first the family, then the
   concrete scale is chosen. With ?review=1 in the address a review table appears
   in which marks and labels can be corrected and copied out. */
'use strict';
(function () {
  const h = E.h, T = E.t;
  const REVIEW = /[?&]review=1\b/.test(location.search);
  const CENT = ['15', '16', '17', '18', '19', '20', '21'];
  const centName = c => ({ en: c + 'th century', de: c + '. Jahrhundert', fr: c + 'e siècle', cs: c + '. století' })[E.lang] || c + 'th century';
  const cfg = Object.assign({ cents: CENT.slice(), len: 15 }, E.load('cfg.scalerec', {}));
  const save = () => E.save('cfg.scalerec', cfg);

  /* review edits are kept in this browser and laid over the data */
  const edits = E.load('rec.edits', {});
  const saveEdits = () => E.save('rec.edits', edits);
  function recs() {
    return (window.EAR_REC || []).map(r => Object.assign({}, r, edits[r.id] || {})).filter(r => !r.off);
  }
  const fmtT = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const parseT = s => { const m = String(s).trim().match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/); return m ? +m[1] * 60 + +m[2] : (isFinite(+s) && String(s).trim() !== '' ? +s : NaN); };
  const fmtSec = sec => sec.map(x => fmtT(x[0]) + '–' + fmtT(x[1])).join(', ');
  const parseSec = str => str.split(',').map(p => p.split(/[–-]/).map(parseT)).filter(p => p.length === 2 && p.every(isFinite) && p[1] > p[0]);

  /* ---------- one shared audio element ---------- */
  const au = new Audio(); au.preload = 'auto';
  let stopTimer = null, fadeTimer = null, onTick = null;
  function stopRec() {
    clearTimeout(stopTimer); clearInterval(fadeTimer);
    try { au.pause(); } catch (e) {}
    au.volume = 1;
  }
  function playAt(src, start, len) {
    E.audio.stop(); stopRec();
    const go = () => {
      try { au.currentTime = start; } catch (e) {}
      au.volume = 0;
      const p = au.play(); if (p && p.catch) p.catch(() => {});
      let v = 0; fadeTimer = setInterval(() => { v = Math.min(1, v + .1); try { au.volume = v; } catch (e) {} if (v >= 1) clearInterval(fadeTimer); }, 40);
      stopTimer = setTimeout(() => {
        clearInterval(fadeTimer); let w = au.volume;
        fadeTimer = setInterval(() => { w -= .1; if (w <= 0) { clearInterval(fadeTimer); au.pause(); au.volume = 1; } else try { au.volume = w; } catch (e) {} }, 40);
      }, Math.max(0, len - .4) * 1000);
    };
    if (au.dataset.src !== src) {
      au.dataset.src = src; au.src = src;
      au.addEventListener('loadedmetadata', go, { once: true });
      au.load();
    } else if (au.readyState >= 1) go(); else au.addEventListener('loadedmetadata', go, { once: true });
  }
  au.addEventListener('timeupdate', () => onTick && onTick(au.currentTime));
  window.addEventListener('hashchange', stopRec);

  function credit(r, withLink) {
    const lic = r.licUrl ? h('a', { href: r.licUrl, target: '_blank', rel: 'noopener' }, r.lic) : r.lic;
    return h('span', { class: 'credit' },
      h('b', null, r.composer), ', ', h('i', null, r.work), r.year ? ' (' + r.year + ')' : '', '. ',
      r.perf ? [T('Performed by'), ' ', r.perf, '. '] : '',
      T('Licence'), E.colon(), lic, '. ',
      withLink !== false ? h('a', { href: r.page, target: '_blank', rel: 'noopener' }, T('Source: Wikimedia Commons')) : '');
  }

  /* ---------- the quiz ---------- */
  E.recQuiz = function (root) {
    const SD = E.scaleData;
    const st = { q: null, step: 0, fam: null, sc: null, sess: { n: 0, ok: 0, streak: 0 } };
    const all = E.load('stats.scalerec', { n: 0, ok: 0 });
    const pool = () => recs().filter(r => cfg.cents.includes(r.cent) && r.sec && r.sec.length);
    const famName = id => E.tn((SD.GROUPS.find(g => g.id === id) || {}).name);
    const fams = r => [].concat(r.fam);
    const scName = id => SD.BY[id] ? E.tn(SD.BY[id].name) : id;

    function ask() {
      const P = pool(); if (!P.length) return null;
      const r = E.pick(P);
      const secs = r.sec.map(s => ({ s, room: Math.max(0, s[1] - s[0] - cfg.len) + .01 }));
      const ch = E.wpick(secs.map(x => Object.assign(x, { w: x.room + 1 })));
      const len = Math.min(cfg.len, ch.s[1] - ch.s[0]);
      const start = ch.s[0] + Math.random() * Math.max(0, ch.s[1] - ch.s[0] - len);
      return { r, start, len };
    }
    function newQ(autoplay) {
      stopRec(); st.q = ask(); st.step = 0; st.fam = st.sc = null; draw();
      if (autoplay && st.q) play();
    }
    function play() { if (st.q) playAt(st.q.r.src, st.q.start, st.q.len); }
    function finish(ok) {
      st.step = 2; st.ok = ok; st.sess.n++; all.n++;
      if (ok) { st.sess.ok++; all.ok++; st.sess.streak++; } else st.sess.streak = 0;
      E.save('stats.scalerec', all); draw();
    }
    function chooseFam(id) {
      if (!st.q || st.step !== 0) return;
      st.fam = id;
      if (!fams(st.q.r).includes(id)) return finish(false);
      st.step = 1; draw();
    }
    function chooseSc(id) {
      if (!st.q || st.step !== 1) return;
      st.sc = id; finish(st.q.r.sc.includes(id));
    }

    function draw() {
      root.innerHTML = '';
      const q = st.q, P = pool();
      const bar = h('div', { class: 'recbar' }, h('span', { class: 'recfill' }));
      onTick = t => { if (!q) return; const f = Math.max(0, Math.min(1, (t - q.start) / q.len)); bar.firstChild.style.width = (f * 100).toFixed(1) + '%'; };
      const acts = h('div', { class: 'acts' },
        h('button', { class: 'btn primary', type: 'button', disabled: !P.length, onclick: () => { if (!st.q) newQ(true); else play(); } }, q ? T('Play again') : T('Start')),
        q ? h('button', { class: 'btn', type: 'button', onclick: () => newQ(true) }, T('Next')) : null,
        q ? h('button', { class: 'btn', type: 'button', onclick: stopRec }, T('Stop')) : null,
        h('span', { class: 'keys-hint' }, T('Space: play again · Enter: next')));

      const fb = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
      if (!P.length) fb.append(h('span', { class: 'muted' }, T('No recordings for the chosen centuries. Change the settings below.')));
      else if (!q) fb.append(h('span', { class: 'muted' }, T('Press Start. A random moment from a real recording is played.')));
      else if (st.step === 0) fb.append(h('span', { class: 'muted' }, T('First: which family of scales?')));
      else if (st.step === 1) fb.append(h('span', null, h('b', null, famName(st.fam)), ' ✓ ', h('span', { class: 'muted' }, T('Now: which scale exactly?'))));
      else {
        const r = q.r;
        fb.className = 'feedback ' + (st.ok ? 'ok' : 'bad');
        fb.append(h('b', null, st.ok ? T('Correct.') : T('Not quite.')), ' ',
          T('It was'), E.colon(), h('b', null, scName(r.sc[0])), r.tonic ? ' ' + T('on') + ' ' + r.tonic : '',
          r.sc.length > 1 ? h('span', { class: 'muted' }, ' (' + T('also accepted') + E.colon() + r.sc.slice(1).map(scName).join(', ') + ')') : '',
          ' · ', fams(r).map(famName).join(' / '), '. ',
          r.note ? h('span', null, E.tn(r.note) + ' ') : '',
          h('br'), credit(r), ' · ', h('span', { class: 'muted' }, T('Excerpt from') + ' ' + fmtT(q.start) + '.'));
      }

      const grid = h('div', { class: 'answers', style: '--cols:3' });
      const famList = SD.GROUPS.filter(g => P.some(r => fams(r).includes(g.id)));
      if (!q || st.step === 0 || (st.step === 2 && !fams(q.r).includes(st.fam))) {
        grid.append(h('div', { class: 'ghead' }, T('Family')));
        famList.forEach(g => {
          const cls = ['ans'];
          if (q && st.step === 2) { if (fams(q.r).includes(g.id)) cls.push('is-right'); else if (g.id === st.fam) cls.push('is-wrong'); }
          grid.append(h('button', { type: 'button', class: cls.join(' '), disabled: !q || st.step !== 0, onclick: () => chooseFam(g.id) }, E.tn(g.name)));
        });
      } else {
        const fam = st.fam;
        const ids = SD.S.filter(s => s.g === fam && recs().some(r => fams(r).includes(fam) && r.sc.includes(s.id))).map(s => s.id);
        grid.append(h('div', { class: 'ghead' }, famName(fam)));
        ids.forEach(id => {
          const cls = ['ans'];
          if (st.step === 2) { if (q.r.sc.includes(id)) cls.push('is-right'); else if (id === st.sc) cls.push('is-wrong'); }
          grid.append(h('button', { type: 'button', class: cls.join(' '), disabled: st.step !== 1, onclick: () => chooseSc(id) }, scName(id)));
        });
      }

      const pct = st.sess.n ? Math.round(100 * st.sess.ok / st.sess.n) : 0;
      const stats = h('div', { class: 'stats' },
        h('span', null, T('This session'), E.colon(), h('b', null, st.sess.ok + ' / ' + st.sess.n), st.sess.n ? ' (' + pct + ' %)' : ''),
        h('span', null, T('Streak'), E.colon(), h('b', null, st.sess.streak)),
        h('span', { class: 'muted' }, T('All time'), E.colon(), all.ok + ' / ' + all.n));

      const set = h('details', { class: 'settings' }, h('summary', null, T('Settings')));
      const sb = h('div', { class: 'setbody' });
      const counts = {}; recs().forEach(r => counts[r.cent] = (counts[r.cent] || 0) + 1);
      sb.append(h('div', { class: 'sethead' }, T('Centuries')),
        E.chips(CENT.filter(c => counts[c]).map(c => ({ id: c, label: centName(c) + ' (' + counts[c] + ')', on: cfg.cents.includes(c) })), (id, on) => {
          cfg.cents = CENT.filter(c => c === id ? on : cfg.cents.includes(c)); save(); st.q = null; draw();
        }),
        E.rangeField(T('Length of the excerpt'), cfg.len, 6, 40, 1, v => v + ' s', v => { cfg.len = v; save(); }));
      set.append(sb);

      const cred = h('details', { class: 'settings' }, h('summary', null, T('Recordings and licences')),
        h('div', { class: 'setbody' },
          h('p', { class: 'note' }, T('All recordings are freely licensed (public domain, CC0, CC BY or CC BY-SA) and are streamed from Wikimedia Commons. The works are in the public domain or published by their composers under the same licences.')),
          h('ol', { class: 'credits' }, recs().slice().sort((a, b) => a.cent.localeCompare(b.cent) || a.composer.localeCompare(b.composer)).map(r => h('li', null, credit(r))))));

      root.append(h('div', { class: 'panel' }, q ? bar : null, acts, fb), grid, stats, set, cred);
      if (REVIEW) root.append(reviewPanel(() => { st.q = null; draw(); }));
    }
    root._keys = function (e) {
      if (e.target.closest('input,select,textarea,summary')) return;
      if (e.code === 'Space') { e.preventDefault(); if (!st.q) newQ(true); else play(); }
      else if (e.key === 'Enter') { e.preventDefault(); newQ(true); }
    };
    draw();
  };

  /* ---------- review table (only with ?review=1) ---------- */
  function reviewPanel(refresh) {
    const SD = E.scaleData;
    const box = h('details', { class: 'settings review', open: true }, h('summary', null, 'Review (' + (window.EAR_REC || []).length + ')'));
    const body = h('div', { class: 'setbody' });
    body.append(h('p', { class: 'note' }, 'Your changes are kept in this browser. When done, press “Copy my changes” and paste the text into the chat with Claude.'),
      h('div', { class: 'acts' },
        h('button', { type: 'button', class: 'btn primary', onclick: e => {
          const txt = JSON.stringify(edits, null, 1);
          (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { e.target.textContent = 'Copied ✓'; }, () => { ta.hidden = false; ta.value = txt; ta.select(); });
        } }, 'Copy my changes (' + Object.keys(edits).length + ')'),
        h('button', { type: 'button', class: 'btn', onclick: () => { if (Object.keys(edits).length) { Object.keys(edits).forEach(k => delete edits[k]); saveEdits(); refresh(); } } }, 'Discard my changes')));
    const ta = h('textarea', { hidden: true, rows: 6, style: 'width:100%' }); body.append(ta);
    const famOpts = SD.GROUPS.map(g => ({ v: g.id, l: E.tn(g.name) }));
    (window.EAR_REC || []).slice().sort((a, b) => a.cent.localeCompare(b.cent)).forEach(r0 => {
      const r = Object.assign({}, r0, edits[r0.id] || {});
      const ed = () => (edits[r0.id] = edits[r0.id] || {});
      const changed = () => { saveEdits(); row.classList.add('edited'); };
      const pos = h('span', { class: 'muted pos' }, '0:00');
      const row = h('div', { class: 'revrow' + (edits[r0.id] ? ' edited' : '') + (r.off ? ' off' : '') },
        h('div', null, h('b', null, r.cent + '. '), credit(r)),
        h('div', { class: 'revctl' },
          h('label', null, 'Family ', h('select', { onchange: e => { ed().fam = e.target.value; changed(); } }, famOpts.map(o => h('option', { value: o.v, selected: o.v === [].concat(r.fam)[0] }, o.l)))),
          h('label', null, 'Accepted scales ', h('input', { type: 'text', size: 24, value: r.sc.join(' '), title: 'ids separated by spaces, first = main answer: ' + SD.S.map(s => s.id).join(' '),
            onchange: e => { const v = e.target.value.trim().split(/\s+/).filter(x => SD.BY[x]); if (v.length) { ed().sc = v; changed(); } } })),
          h('label', null, 'Tonic ', h('input', { type: 'text', size: 4, value: r.tonic || '', onchange: e => { ed().tonic = e.target.value.trim(); changed(); } })),
          h('label', null, 'Sections ', h('input', { type: 'text', size: 28, value: fmtSec(r.sec || []), onchange: e => { const v = parseSec(e.target.value); ed().sec = v; changed(); e.target.value = fmtSec(v); } })),
          h('label', null, h('input', { type: 'checkbox', checked: !!r.off, onchange: e => { ed().off = e.target.checked; changed(); row.classList.toggle('off', e.target.checked); } }), ' leave out'),
          h('label', null, 'Comment ', h('input', { type: 'text', size: 30, value: r.comment || '', onchange: e => { ed().comment = e.target.value; changed(); } }))),
        h('div', { class: 'revctl' },
          (r.sec || []).map(s => h('button', { type: 'button', class: 'mini', onclick: () => { onTick = t => pos.textContent = fmtT(t); playAt(r.src, s[0], s[1] - s[0]); } }, '▶ ' + fmtT(s[0]) + '–' + fmtT(s[1]))),
          h('button', { type: 'button', class: 'mini', onclick: () => { onTick = t => pos.textContent = fmtT(t); playAt(r.src, 0, 36000); } }, '▶ whole'),
          h('button', { type: 'button', class: 'mini', onclick: () => { onTick = t => pos.textContent = fmtT(t); playAt(r.src, Math.max(0, au.currentTime - 10), 36000); } }, '−10 s'),
          h('button', { type: 'button', class: 'mini', onclick: () => { onTick = t => pos.textContent = fmtT(t); playAt(r.src, au.currentTime + 10, 36000); } }, '+10 s'),
          h('button', { type: 'button', class: 'mini', onclick: stopRec }, '■'), pos,
          r.dur ? h('span', { class: 'muted' }, ' / ' + fmtT(r.dur)) : '',
          r.why ? h('span', { class: 'muted' }, ' · ' + r.why) : ''));
      body.append(row);
    });
    box.append(body);
    return box;
  }
})();
