/* FEEDBACK & WISHES — one shared form for the whole Counterpoint Gym.
   Include on any gym page with:  <script src="…/feedback.js" data-topic="Name of this room" defer></script>
   - On a page with an element [data-feedback-slot], the button goes there.
   - Otherwise it is placed next to the "← back" link in the header.
   - Any element with [data-feedback-open] (optionally data-topic="…") also opens the form.
   Messages are delivered by FormSubmit (formsubmit.co) to the address below. The very first
   message triggers a one-time activation email from FormSubmit: click "Activate Form" in it. */
(function () {
  const TO = 'vaclavhrebec2000@gmail.com';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  const TOPICS = ['General', 'Cantare super librum', 'Improvising canons', 'Guidonian hand', 'Idea for a new room'];
  const me = document.currentScript;
  const pageTopic = (me && me.dataset.topic) || 'General';

  const css = `
  .fb-open{font:inherit;font-size:.9rem;cursor:pointer;background:none;border:1px solid var(--line,#e4ddd1);
    color:var(--accent,#c8102e);border-radius:999px;padding:.3rem .85rem;line-height:1.2;white-space:nowrap}
  .fb-open:hover{background:var(--accent,#c8102e);color:var(--accent-ink,#fff);border-color:var(--accent,#c8102e)}
  .fb-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem 1rem}
  dialog.fb{border:1px solid var(--line,#e4ddd1);border-radius:14px;padding:0;width:min(520px,calc(100vw - 32px));
    max-height:calc(100vh - 32px);background:var(--card,var(--surface,#fff));color:var(--fg,var(--text,#1c1a17));
    box-shadow:0 20px 60px rgba(0,0,0,.35);font-family:"EB Garamond",Georgia,serif;font-size:17px}
  dialog.fb::backdrop{background:rgba(20,16,12,.55)}
  .fb form{display:grid;gap:.8rem;padding:1.4rem 1.4rem 1.2rem}
  .fb h2{font-family:"IM Fell Double Pica","IM Fell English",Georgia,serif;font-weight:400;font-size:1.9rem;margin:0;line-height:1.1}
  .fb p{margin:0;color:var(--muted,#6b655c);font-size:.95rem;line-height:1.4}
  .fb label{display:grid;gap:.25rem;font-size:.85rem;color:var(--muted,#6b655c)}
  .fb .two{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
  @media (max-width:480px){.fb .two{grid-template-columns:1fr}}
  .fb input,.fb textarea,.fb select{font:inherit;font-size:16px;color:inherit;background:var(--bg,var(--ground,#faf7f2));
    border:1px solid var(--line,#e4ddd1);border-radius:8px;padding:.5rem .65rem;width:100%;box-sizing:border-box}
  .fb textarea{min-height:8rem;resize:vertical}
  .fb input:focus,.fb textarea:focus,.fb select:focus{outline:2px solid var(--accent,#c8102e);outline-offset:1px;border-color:transparent}
  .fb .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
  .fb .acts{display:flex;align-items:center;justify-content:space-between;gap:.8rem;flex-wrap:wrap}
  .fb .send{font:inherit;cursor:pointer;border:0;border-radius:999px;padding:.5rem 1.4rem;
    background:var(--accent,#c8102e);color:var(--accent-ink,#fff)}
  .fb .send:disabled{opacity:.6;cursor:wait}
  .fb .x{position:absolute;top:.6rem;right:.7rem;font-size:1.5rem;line-height:1;background:none;border:0;cursor:pointer;color:var(--muted,#6b655c)}
  .fb .mail{font-size:.9rem;color:var(--muted,#6b655c)} .fb .mail a{color:var(--accent,#c8102e)}
  .fb .st{min-height:1.3em;font-size:.95rem;margin:0} .fb .st.ok{color:#2e7d32} .fb .st.err{color:var(--accent,#c8102e)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const dlg = document.createElement('dialog');
  dlg.className = 'fb';
  dlg.innerHTML = `
    <form novalidate>
      <button type="button" class="x" aria-label="Close">×</button>
      <h2>Feedback &amp; wishes</h2>
      <p>Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.</p>
      <label>About<select name="topic">${TOPICS.map(t => `<option>${t}</option>`).join('')}</select></label>
      <label>Your message<textarea name="message" required maxlength="5000"></textarea></label>
      <div class="two">
        <label>Name (optional)<input name="name" type="text" autocomplete="name" maxlength="120"></label>
        <label>Email (optional, for a reply)<input name="email" type="email" autocomplete="email" maxlength="200"></label>
      </div>
      <div class="hp" aria-hidden="true"><input type="text" name="_honey" tabindex="-1" autocomplete="off"></div>
      <div class="acts">
        <span class="mail">or write directly: <a href="mailto:${TO}">${TO}</a></span>
        <button type="submit" class="send">Send</button>
      </div>
      <p class="st" role="status" aria-live="polite"></p>
    </form>`;
  document.body.appendChild(dlg);
  const f = dlg.querySelector('form'), E = f.elements, status = dlg.querySelector('.st'), btn = dlg.querySelector('.send');
  const show = (t, c) => { status.textContent = t; status.className = 'st ' + (c || ''); };

  function open(topic) {
    E.topic.value = TOPICS.includes(topic) ? topic : pageTopic;
    show('');
    dlg.showModal();
    setTimeout(() => E.message.focus(), 30);
  }
  dlg.querySelector('.x').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  f.addEventListener('submit', async e => {
    e.preventDefault();
    if (E._honey.value) return;
    const msg = E.message.value.trim(), email = E.email.value.trim();
    if (!msg) { show('Please write a message.', 'err'); E.message.focus(); return; }
    if (email && !E.email.checkValidity()) { show('Please check the email address.', 'err'); E.email.focus(); return; }
    btn.disabled = true; show('Sending…');
    const body = {
      _subject: 'Counterpoint Gym — ' + E.topic.value,
      _template: 'table', _captcha: 'false',
      About: E.topic.value, Message: msg,
      Name: E.name.value.trim() || '—', Email: email || '—',
      Page: location.href
    };
    if (email) body._replyto = email;
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && String(j.success) === 'true') {
        E.message.value = ''; show('Thank you! Your message has been sent.', 'ok');
      } else show('Sorry, the message could not be sent. Please try again later, or write to ' + TO + '.', 'err');
    } catch (err) {
      show('Sorry, the message could not be sent. Please check your connection, or write to ' + TO + '.', 'err');
    }
    btn.disabled = false;
  });

  function makeButton() {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'fb-open'; b.textContent = '✎ Feedback & wishes';
    b.addEventListener('click', () => open(pageTopic));
    return b;
  }
  const slot = document.querySelector('[data-feedback-slot]');
  if (slot) slot.appendChild(makeButton());
  else {
    const back = document.querySelector('header .back, header .gymback');
    if (back) {
      const row = document.createElement('div'); row.className = 'fb-row';
      if (back.classList.contains('gymback')) { row.style.flexBasis = '100%'; back.style.flexBasis = 'auto'; }
      back.replaceWith(row); row.append(back, makeButton());
    }
  }
  document.querySelectorAll('[data-feedback-open]').forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); open(el.dataset.topic || pageTopic); }));
})();
