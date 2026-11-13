/* FEEDBACK & WISHES — one shared form for the whole Counterpoint Gym (and the Ear Trainer).
   It also adds the closing row at the bottom of every page: Feedback · Share · Support.
   A page can choose where that row goes with an element [data-foot-slot]; otherwise it is placed
   before the page's <footer>, or at the end of the page.
   Include on any gym page with:  <script src="…/feedback.js" data-topic="Name of this room" defer></script>
   - On a page with an element [data-feedback-slot], the button goes there.
   - Otherwise it is placed next to the "← back" link in the header.
   - Any element with [data-feedback-open] (optionally data-topic="…") also opens the form.
   Messages are delivered by FormSubmit (formsubmit.co) to the address below. The very first
   message triggers a one-time activation email from FormSubmit: click "Activate Form" in it. */
(function () {
  const TO = 'vaclavhrebec2000@gmail.com';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  const TOPICS = ['General', 'Cantare super librum', 'Improvising canons', 'Guidonian hand', 'The Ultimate Ear Trainer', 'Atlas of Musical Style', 'Idea for a new room'];
  /* translations: the page's <html lang> decides (en, de, fr, cs); topics are always sent in English */
  const L = {
    de: { 'Feedback & wishes': 'Feedback & Wünsche', 'Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.': 'Einen Fehler gefunden, fehlt ein Choral, wünschen Sie sich eine neue Übung? Schreiben Sie mir – jede Nachricht hilft dem Projekt zu wachsen.',
      'About': 'Betreff', 'Your message': 'Ihre Nachricht', 'Name (optional)': 'Name (freiwillig)', 'Email (optional, for a reply)': 'E-Mail (freiwillig, für eine Antwort)', 'or write directly:': 'oder direkt an:', 'Send': 'Senden', 'Close': 'Schließen',
      'Send it from your email app instead': 'Stattdessen aus Ihrer Mail-App senden', 'Please write a message.': 'Bitte schreiben Sie eine Nachricht.', 'Please check the email address.': 'Bitte prüfen Sie die E-Mail-Adresse.', 'Sending…': 'Wird gesendet …', 'Thank you! Your message has been sent.': 'Vielen Dank! Ihre Nachricht wurde gesendet.',
      'Sorry, the message could not be sent. Please try again later, or write to ': 'Die Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie an ',
      'Sorry, the message could not be sent. Please check your connection, or write to ': 'Die Nachricht konnte leider nicht gesendet werden. Bitte prüfen Sie Ihre Verbindung oder schreiben Sie an ',
      'General': 'Allgemein', 'Improvising canons': 'Kanons improvisieren', 'Guidonian hand': 'Guidonische Hand', 'Idea for a new room': 'Idee für einen neuen Raum', 'Found a mistake, a wrong date, a missing element or style? Tell me — every message helps the atlas grow.': 'Einen Fehler gefunden, ein falsches Datum, fehlt ein Element oder Stil? Schreiben Sie mir – jede Nachricht hilft dem Atlas zu wachsen.' },
    fr: { 'Feedback & wishes': 'Remarques et souhaits', 'Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.': 'Une erreur, un chant qui manque, l’envie d’un nouvel exercice ? Écrivez-moi – chaque message aide le projet à grandir.',
      'About': 'Sujet', 'Your message': 'Votre message', 'Name (optional)': 'Nom (facultatif)', 'Email (optional, for a reply)': 'E-mail (facultatif, pour une réponse)', 'or write directly:': 'ou directement à :', 'Send': 'Envoyer', 'Close': 'Fermer',
      'Send it from your email app instead': 'L’envoyer plutôt depuis votre application de messagerie', 'Please write a message.': 'Veuillez écrire un message.', 'Please check the email address.': 'Veuillez vérifier l’adresse e-mail.', 'Sending…': 'Envoi…', 'Thank you! Your message has been sent.': 'Merci ! Votre message a bien été envoyé.',
      'Sorry, the message could not be sent. Please try again later, or write to ': 'Le message n’a pas pu être envoyé. Veuillez réessayer plus tard ou écrire à ',
      'Sorry, the message could not be sent. Please check your connection, or write to ': 'Le message n’a pas pu être envoyé. Veuillez vérifier votre connexion ou écrire à ',
      'General': 'Général', 'Improvising canons': 'Improviser des canons', 'Guidonian hand': 'Main guidonienne', 'Idea for a new room': 'Idée pour une nouvelle salle', 'Found a mistake, a wrong date, a missing element or style? Tell me — every message helps the atlas grow.': 'Une erreur, une date fausse, un élément ou un style qui manque ? Écrivez-moi – chaque message aide l’atlas à grandir.' },
    cs: { 'Feedback & wishes': 'Připomínky a přání', 'Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.': 'Našli jste chybu, chybí vám chorál, přejete si nové cvičení? Napište mi – každá zpráva pomáhá projektu růst.',
      'About': 'Téma', 'Your message': 'Vaše zpráva', 'Name (optional)': 'Jméno (nepovinné)', 'Email (optional, for a reply)': 'E-mail (nepovinný, pro odpověď)', 'or write directly:': 'nebo přímo na:', 'Send': 'Odeslat', 'Close': 'Zavřít',
      'Send it from your email app instead': 'Odeslat místo toho z vaší e-mailové aplikace', 'Please write a message.': 'Napište prosím zprávu.', 'Please check the email address.': 'Zkontrolujte prosím e-mailovou adresu.', 'Sending…': 'Odesílám…', 'Thank you! Your message has been sent.': 'Děkuji! Vaše zpráva byla odeslána.',
      'Sorry, the message could not be sent. Please try again later, or write to ': 'Zprávu se nepodařilo odeslat. Zkuste to prosím později nebo napište na ',
      'Sorry, the message could not be sent. Please check your connection, or write to ': 'Zprávu se nepodařilo odeslat. Zkontrolujte prosím připojení nebo napište na ',
      'General': 'Obecné', 'Improvising canons': 'Improvizace kánonů', 'Guidonian hand': 'Guidonská ruka', 'Idea for a new room': 'Nápad na novou místnost', 'Found a mistake, a wrong date, a missing element or style? Tell me — every message helps the atlas grow.': 'Našli jste chybu, špatné datum, chybí vám prvek nebo styl? Napište mi – každá zpráva pomáhá atlasu růst.' }
  };
  const tr = s => { const l = (document.documentElement.lang || 'en').slice(0, 2); return (L[l] && L[l][s]) || s; };
  const me = document.currentScript;
  const pageTopic = (me && me.dataset.topic) || 'General';
  const INTRO = /\/atlas\//.test(location.pathname) ? 'Found a mistake, a wrong date, a missing element or style? Tell me — every message helps the atlas grow.' : 'Found a mistake, missing a chant, wishing for a new exercise? Tell me — every message helps the gym grow.';

  const css = `
  .fb-open{font:inherit;font-size:.9rem;cursor:pointer;background:none;border:1px solid var(--line,#e4ddd1);
    color:var(--accent,#c8102e);border-radius:999px;padding:.3rem .85rem;line-height:1.2;white-space:nowrap}
  .fb-open:hover{background:var(--accent,#c8102e);color:var(--accent-ink,#fff);border-color:var(--accent,#c8102e)}
  .fb-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem 1rem}
  dialog.fb{position:fixed;inset:0;margin:auto;height:fit-content;border:1px solid var(--line,#e4ddd1);border-radius:14px;padding:0;width:min(520px,calc(100vw - 32px));
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
      <p data-tr="${INTRO}">${INTRO}</p>
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
      _subject: (E.topic.value === 'The Ultimate Ear Trainer' ? 'The Ultimate Ear Trainer — ' : 'Counterpoint Gym — ') + E.topic.value,
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
      } else { console.warn('feedback', r.status, j); fail(tr('Sorry, the message could not be sent. Please try again later, or write to ') + TO + '.'); }
    } catch (err) {
      fail(tr('Sorry, the message could not be sent. Please check your connection, or write to ') + TO + '.');
    }
    btn.disabled = false;
    /* if the form service fails, the same message can still go out from the visitor's own mail app */
    function fail(t) {
      show(t, 'err');
      const a = document.createElement('a');
      a.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(body._subject) + '&body=' + encodeURIComponent(msg + '\n\n' + (E.name.value.trim() ? E.name.value.trim() + '\n' : '') + body.Page);
      a.textContent = tr('Send it from your email app instead'); a.className = 'fb-mailto'; a.style.cssText = 'display:block;margin-top:8px;font-weight:600';
      status.append(' ', a);
    }
  });

  function makeButton() {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'fb-open';
    const label = () => { b.textContent = '✎ ' + tr('Feedback & wishes'); };
    label(); new MutationObserver(label).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
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

  /* ---------- closing row: feedback · share · support ---------- */
  const EAR = /\/ear\//.test(location.pathname), MORPH = /\/atlas\//.test(location.pathname);
  const SITE = MORPH ? 'Atlas of Musical Style' : EAR ? 'The Ultimate Ear Trainer' : 'The Ultimate Counterpoint Gym';
  const F = {
    de: { 'Do you find {s} useful?': 'Ist {s} für Sie nützlich?',
      'Tell me what to improve, share it with friends and colleagues, or support its development.': 'Sagen Sie mir, was ich verbessern kann, teilen Sie es mit Freunden und Kollegen oder unterstützen Sie die Weiterentwicklung.',
      'Feedback': 'Feedback', 'Share': 'Teilen', 'Support': 'Unterstützen', 'Share this page': 'Diese Seite teilen',
      'Copy link': 'Link kopieren', 'Link copied.': 'Link kopiert.', 'Email': 'E-Mail', 'More…': 'Mehr …',
      'counterpoint and improvisation exercises in the browser': 'Übungen zu Kontrapunkt und Improvisation im Browser',
      'musical elements and styles from plainchant to today, as linked notes, a graph and a timeline': 'Musikalische Elemente und Stile vom gregorianischen Choral bis heute – als verknüpfte Notizen, Graph und Zeitleiste',
      'ear training in the browser: intervals, intonation, key signatures, rhythm, chords and scales': 'Gehörbildung im Browser: Intervalle, Intonation, Vorzeichen, Rhythmus, Akkorde und Skalen' },
    fr: { 'Do you find {s} useful?': '{s} vous est utile ?',
      'Tell me what to improve, share it with friends and colleagues, or support its development.': 'Dites-moi ce qu’il faudrait améliorer, partagez-le avec vos amis et collègues, ou soutenez son développement.',
      'Feedback': 'Remarques', 'Share': 'Partager', 'Support': 'Soutenir', 'Share this page': 'Partager cette page',
      'Copy link': 'Copier le lien', 'Link copied.': 'Lien copié.', 'Email': 'E-mail', 'More…': 'Plus…',
      'counterpoint and improvisation exercises in the browser': 'exercices de contrepoint et d’improvisation dans le navigateur',
      'musical elements and styles from plainchant to today, as linked notes, a graph and a timeline': 'éléments et styles musicaux du plain-chant à nos jours, en notes reliées, graphe et frise chronologique',
      'ear training in the browser: intervals, intonation, key signatures, rhythm, chords and scales': 'formation de l’oreille dans le navigateur : intervalles, justesse, armures, rythme, accords et gammes' },
    cs: { 'Do you find {s} useful?': 'Je pro vás {s} užitečný?',
      'Tell me what to improve, share it with friends and colleagues, or support its development.': 'Napište mi, co zlepšit, sdílejte ho s přáteli a kolegy, nebo podpořte jeho další rozvoj.',
      'Feedback': 'Připomínky', 'Share': 'Sdílet', 'Support': 'Podpořit', 'Share this page': 'Sdílet tuto stránku',
      'Copy link': 'Kopírovat odkaz', 'Link copied.': 'Odkaz zkopírován.', 'Email': 'E-mail', 'More…': 'Další…',
      'counterpoint and improvisation exercises in the browser': 'cvičení kontrapunktu a improvizace v prohlížeči',
      'musical elements and styles from plainchant to today, as linked notes, a graph and a timeline': 'hudební prvky a styly od gregoriánského chorálu po současnost jako propojené poznámky, graf a časová osa',
      'ear training in the browser: intervals, intonation, key signatures, rhythm, chords and scales': 'sluchová výchova v prohlížeči: intervaly, intonace, předznamenání, rytmus, akordy a stupnice' }
  };
  const tf = s => { const l = (document.documentElement.lang || 'en').slice(0, 2); return ((F[l] && F[l][s]) || s).replace('{s}', SITE); };
  const ICON = {
    pen: '<path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm17.7-10.2a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
    share: '<path d="M18 16.1c-.76 0-1.44.3-1.96.77L8.9 12.7c.05-.23.1-.46.1-.7s-.05-.47-.1-.7l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .24.04.47.09.7L8.04 9.81a3 3 0 1 0 0 4.38l7.12 4.16c-.05.21-.08.43-.08.65A2.92 2.92 0 1 0 18 16.1z"/>',
    heart: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>'
  };
  const svg = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
  const fcss = `
  .ft-row{margin:2.6rem auto 1.4rem;max-width:720px;padding:1.6rem 16px 0;border-top:1px solid var(--line,#e4ddd1);text-align:center;
    font-family:"EB Garamond",Georgia,serif;color:var(--muted,var(--leaf-muted,#6b655c));clear:both}
  .ft-row .q{font-size:1.25rem;color:var(--fg,var(--text,#1c1a17));margin:0 0 .25rem}
  .ft-row .s{font-size:1.05rem;margin:0 0 1.1rem;line-height:1.45}
  .ft-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:.6rem}
  .ft-btns button,.ft-btns a{display:inline-flex;align-items:center;gap:.45rem;font:500 .9rem/1.2 "Inter",system-ui,sans-serif;cursor:pointer;
    text-decoration:none;border:1px solid var(--line,#d8d0c2);background:transparent;color:var(--fg,var(--text,#1c1a17));border-radius:999px;padding:.5rem 1.05rem}
  .ft-btns button:hover,.ft-btns a:hover{border-color:var(--accent,#c8102e);color:var(--accent,#c8102e)}
  .ft-btns svg{width:15px;height:15px;fill:currentColor;opacity:.85}
  dialog.fb.sh form{gap:.7rem}
  .sh-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}
  .sh-grid a,.sh-grid button{font:500 .92rem "Inter",system-ui,sans-serif;text-align:center;text-decoration:none;cursor:pointer;
    border:1px solid var(--line,#e4ddd1);border-radius:8px;padding:.6rem .5rem;background:transparent;color:inherit}
  .sh-grid a:hover,.sh-grid button:hover{border-color:var(--accent,#c8102e);color:var(--accent,#c8102e)}
  .sh-link{display:flex;gap:.5rem}.sh-link input{flex:1;min-width:0}`;
  const st2 = document.createElement('style'); st2.textContent = fcss; document.head.appendChild(st2);

  const shareUrl = () => location.origin + location.pathname;
  const shareText = () => SITE + ' – ' + tf(MORPH ? 'musical elements and styles from plainchant to today, as linked notes, a graph and a timeline' : EAR ? 'ear training in the browser: intervals, intonation, key signatures, rhythm, chords and scales' : 'counterpoint and improvisation exercises in the browser');
  const sh = document.createElement('dialog'); sh.className = 'fb sh';
  document.body.appendChild(sh);
  function openShare() {
    const u = shareUrl(), t = shareText(), eu = encodeURIComponent(u), et = encodeURIComponent(t);
    sh.innerHTML = `<form method="dialog">
      <button type="button" class="x" aria-label="${tr('Close')}">×</button>
      <h2>${tf('Share this page')}</h2>
      <p>${t}</p>
      <div class="sh-link"><input type="text" readonly value="${u}" aria-label="URL"><button type="button" class="send" data-copy>${tf('Copy link')}</button></div>
      <div class="sh-grid">
        <a href="https://wa.me/?text=${et}%20${eu}" target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${eu}" target="_blank" rel="noopener">Facebook</a>
        <a href="https://t.me/share/url?url=${eu}&text=${et}" target="_blank" rel="noopener">Telegram</a>
        <a href="https://x.com/intent/tweet?url=${eu}&text=${et}" target="_blank" rel="noopener">X</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${eu}" target="_blank" rel="noopener">LinkedIn</a>
        <a href="mailto:?subject=${encodeURIComponent(SITE)}&body=${et}%0A${eu}">${tf('Email')}</a>
        ${navigator.share ? `<button type="button" data-native style="grid-column:1/-1">${tf('More…')}</button>` : ''}
      </div>
      <p class="st" role="status" aria-live="polite"></p></form>`;
    sh.querySelector('.x').onclick = () => sh.close();
    const inp = sh.querySelector('input'), msg = sh.querySelector('.st');
    sh.querySelector('[data-copy]').onclick = async () => {
      try { await navigator.clipboard.writeText(u); } catch (e) { inp.select(); try { document.execCommand('copy'); } catch (_) {} }
      msg.textContent = tf('Link copied.'); msg.className = 'st ok';
    };
    const nat = sh.querySelector('[data-native]');
    if (nat) nat.onclick = () => navigator.share({ title: SITE, text: t, url: u }).catch(() => {});
    sh.showModal();
  }
  sh.addEventListener('click', e => { if (e.target === sh) sh.close(); });

  function footRow() {
    if (document.documentElement.classList.contains('embedded') || document.querySelector('.ft-row')) return;
    const row = document.createElement('section'); row.className = 'ft-row';
    const draw = () => {
      row.innerHTML = `<p class="q">${tf('Do you find {s} useful?')}</p>
        <p class="s">${tf('Tell me what to improve, share it with friends and colleagues, or support its development.')}</p>
        <div class="ft-btns">
          <button type="button" data-a="fb">${svg('pen')}${tf('Feedback')}</button>
          <button type="button" data-a="sh">${svg('share')}${tf('Share')}</button>
          <a href="https://ko-fi.com/vaclavhrebec" target="_blank" rel="noopener">${svg('heart')}${tf('Support')}</a>
        </div>`;
      row.querySelector('[data-a=fb]').onclick = () => open(pageTopic);
      row.querySelector('[data-a=sh]').onclick = openShare;
    };
    draw();
    new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const slot = document.querySelector('[data-foot-slot]');
    const foot = !slot && [...document.querySelectorAll('footer')].pop();
    if (slot) slot.appendChild(row);
    else if (foot) foot.parentNode.insertBefore(row, foot);
    else document.body.appendChild(row);
  }
  footRow();
})();
