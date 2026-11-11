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
  const TOPICS = ['General', 'Cantare super librum', 'Improvising canons', 'Guidonian hand', 'Ear training', 'Idea for a new room'];
  /* translations: the page's <html lang> decides (en, de, fr, cs); topics are always sent in English */
  const L = {
    de: { 'Feedback & wishes': 'Feedback & Wünsche', 'Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.': 'Einen Fehler gefunden, fehlt ein Choral, wünschen Sie sich eine neue Übung? Schreiben Sie mir – jede Nachricht hilft dem Projekt zu wachsen.',
      'About': 'Betreff', 'Your message': 'Ihre Nachricht', 'Name (optional)': 'Name (freiwillig)', 'Email (optional, for a reply)': 'E-Mail (freiwillig, für eine Antwort)', 'or write directly:': 'oder direkt an:', 'Send': 'Senden', 'Close': 'Schließen',
      'Please write a message.': 'Bitte schreiben Sie eine Nachricht.', 'Please check the email address.': 'Bitte prüfen Sie die E-Mail-Adresse.', 'Sending…': 'Wird gesendet …', 'Thank you! Your message has been sent.': 'Vielen Dank! Ihre Nachricht wurde gesendet.',
      'Sorry, the message could not be sent. Please try again later, or write to ': 'Die Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an ',
      'Sorry, the message could not be sent. Please check your connection, or write to ': 'Die Nachricht konnte leider nicht gesendet werden. Bitte prüfen Sie Ihre Verbindung oder schreiben Sie an ',
      'General': 'Allgemein', 'Improvising canons': 'Kanons improvisieren', 'Guidonian hand': 'Guidonische Hand', 'Ear training': 'Gehörbildung', 'Idea for a new room': 'Idee für einen neuen Raum' },
    fr: { 'Feedback & wishes': 'Remarques et souhaits', 'Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.': 'Une erreur, un chant qui manque, l’envie d’un nouvel exercice ? Écrivez-moi – chaque message aide le projet à grandir.',
      'About': 'Sujet', 'Your message': 'Votre message', 'Name (optional)': 'Nom (facultatif)', 'Email (optional, for a reply)': 'E-mail (facultatif, pour une réponse)', 'or write directly:': 'ou directement à :', 'Send': 'Envoyer', 'Close': 'Fermer',
      'Please write a message.': 'Veuillez écrire un message.', 'Please check the email address.': 'Veuillez vérifier l’adresse e-mail.', 'Sending…': 'Envoi…', 'Thank you! Your message has been sent.': 'Merci ! Votre message a bien été envoyé.',
      'Sorry, the message could not be sent. Please try again later, or write to ': 'Le message n’a pas pu être envoyé. Veuillez réessayer plus tard ou écrire à ',
      'Sorry, the message could not be sent. Please check your connection, or write to ': 'Le message n’a pas pu être envoyé. Veuillez vérifier votre connexion ou écrire à ',
      'General': 'Général', 'Improvising canons': 'Improviser des canons', 'Guidonian hand': 'Main guidonienne', 'Ear training': 'Formation de l’oreille', 'Idea for a new room': 'Idée pour une nouvelle salle' },
    cs: { 'Feedback & wishes': 'Připomínky a přání', 'Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.': 'Našli jste chybu, chybí vám chorál, přejete si nové cvičení? Napište mi – každá zpráva pomáhá projektu růst.',
      'About': 'Téma', 'Your message': 'Vaše zpráva', 'Name (optional)': 'Jméno (nepovinné)', 'Email (optional, for a reply)': 'E-mail (nepovinný, pro odpověď)', 'or write directly:': 'nebo přímo na:', 'Send': 'Odeslat', 'Close': 'Zavřít',
      'Please write a message.': 'Napište prosím zprávu.', 'Please check the email address.': 'Zkontrolujte prosím e-mailovou adresu.', 'Sending…': 'Odesílám…', 'Thank you! Your message has been sent.': 'Děkuji! Vaše zpráva byla odeslána.',
      'Sorry, the message could not be sent. Please try again later, or write to ': 'Zprávu se nepodařilo odeslat. Zkuste to prosím později nebo napište na ',
      'Sorry, the message could not be sent. Please check your connection, or write to ': 'Zprávu se nepodařilo odeslat. Zkontrolujte prosím připojení nebo napište na ',
      'General': 'Obecné', 'Improvising canons': 'Improvizace kánonů', 'Guidonian hand': 'Guidonská ruka', 'Ear training': 'Sluchová výchova', 'Idea for a new room': 'Nápad na novou místnost' }
  };
  const tr = s => { const l = (document.documentElement.lang || 'en').slice(0, 2); return (L[l] && L[l][s]) || s; };
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
      <button type="button" class="x" aria-label="Close" data-tr-aria="Close">×</button>
      <h2 data-tr="Feedback & wishes">Feedback &amp; wishes</h2>
      <p data-tr="Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.">Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.</p>
      <label><span data-tr="About">About</span><select name="topic">${TOPICS.map(t => `<option value="${t}" data-tr="${t}">${t}</option>`).join('')}</select></label>
      <label><span data-tr="Your message">Your message</span><textarea name="message" required maxlength="5000"></textarea></label>
      <div class="two">
        <label><span data-tr="Name (optional)">Name (optional)</span><input name="name" type="text" autocomplete="name" maxlength="120"></label>
        <label><span data-tr="Email (optional, for a reply)">Email (optional, for a reply)</span><input name="email" type="email" autocomplete="email" maxlength="200"></label>
      </div>
      <div class="hp" aria-hidden="true"><input type="text" name="_honey" tabindex="-1" autocomplete="off"></div>
      <div class="acts">
        <span class="mail"><span data-tr="or write directly:">or write directly:</span> <a href="mailto:${TO}">${TO}</a></span>
        <button type="submit" class="send" data-tr="Send">Send</button>
      </div>
      <p class="st" role="status" aria-live="polite"></p>
    </form>`;
  document.body.appendChild(dlg);
  const f = dlg.querySelector('form'), E = f.elements, status = dlg.querySelector('.st'), btn = dlg.querySelector('.send');
  const show = (t, c) => { status.textContent = t; status.className = 'st ' + (c || ''); };

  function open(topic) {
    dlg.querySelectorAll('[data-tr]').forEach(n => n.textContent = tr(n.dataset.tr));
    dlg.querySelectorAll('[data-tr-aria]').forEach(n => n.setAttribute('aria-label', tr(n.dataset.trAria)));
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
    if (!msg) { show(tr('Please write a message.'), 'err'); E.message.focus(); return; }
    if (email && !E.email.checkValidity()) { show(tr('Please check the email address.'), 'err'); E.email.focus(); return; }
    btn.disabled = true; show(tr('Sending…'));
    const body = {
      _subject: (E.topic.value === 'Ear training' ? 'Ear Training — ' : 'Counterpoint Gym — ') + E.topic.value,
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
        E.message.value = ''; show(tr('Thank you! Your message has been sent.'), 'ok');
      } else show(tr('Sorry, the message could not be sent. Please try again later, or write to ') + TO + '.', 'err');
    } catch (err) {
      show(tr('Sorry, the message could not be sent. Please check your connection, or write to ') + TO + '.', 'err');
    }
    btn.disabled = false;
  });

  function makeButton() {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'fb-open'; b.textContent = '✎ ' + tr('Feedback & wishes');
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
