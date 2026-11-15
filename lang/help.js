/* A small "?" that opens the user manual at the right place. Used by every project page: <script src="…/lang/help.js" data-help="canon" defer></script> */
(function () {
  'use strict';
  var s = document.currentScript, topic = (s && s.dataset.help) || '', base = new URL('../help/', s.src).href;
  var T = { en: 'Help: user manual', de: 'Hilfe: Handbuch', fr: 'Aide : mode d’emploi', cs: 'Nápověda: příručka' };
  /* the language currently shown: the page's own switch (select or buttons), else <html lang>, else ?lang=, else the stored choice */
  function lang() {
    var l = '', e = document.getElementById('lang'), b = document.querySelector('.lang button[aria-pressed="true"]');
    if (e && e.value) l = e.value; else if (b && b.dataset.lang) l = b.dataset.lang; else l = document.documentElement.lang || '';
    l = (l || '').slice(0, 2).toLowerCase(); if (T[l] && (l !== 'en' || e || b)) return l;
    try { l = new URL(location.href).searchParams.get('lang') || ''; } catch (x) { l = ''; } if (T[l]) return l;
    try { l = localStorage.getItem('lang') || ''; } catch (x) { l = ''; } return T[l] ? l : 'en';
  }
  function go() {
    if (document.querySelector('a.helplink')) return;
    var a = document.createElement('a'); a.className = 'helplink ib'; a.href = base + (topic ? '#' + topic : ''); var HT = { en: 'Help', de: 'Hilfe', fr: 'Aide', cs: 'Nápověda' }; a.innerHTML = '<b>?</b><span>' + HT[lang()] + '</span>';
    a.title = T[lang()]; a.setAttribute('aria-label', T[lang()]); a.setAttribute('data-no-lang', '');
    var st = document.createElement('style');
    st.textContent = 'a.helplink{display:inline-flex!important;align-items:center;gap:.4em;height:2rem!important;padding:0 .8rem 0 .35rem!important;border:0!important;border-radius:999px;background:#e8344a!important;color:#fff!important;font:600 .85rem/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif!important;font-style:normal!important;letter-spacing:.02em;text-decoration:none!important;flex:none;opacity:1;box-shadow:0 1px 4px rgba(0,0,0,.25);white-space:nowrap}a.helplink b{display:inline-flex;align-items:center;justify-content:center;width:1.4rem;height:1.4rem;border-radius:50%;background:#fff;color:#e8344a;font:800 1rem/1 system-ui,sans-serif}a.helplink:hover{filter:brightness(1.1)}@media(max-width:700px){a.helplink{padding:0 .3rem!important}a.helplink span{display:none}}';
    document.head.appendChild(st);
    var theme = document.getElementById('toggleTheme') || document.getElementById('theme'), host;
    if (document.querySelector('header.bar') && document.getElementById('toggleTheme')) { theme.parentNode.insertBefore(a, theme); }
    else if ((host = document.querySelector('.sitenav'))) { var lg = host.querySelector('.lang'); if (lg) host.insertBefore(a, lg); else host.appendChild(a); if (!host.querySelector('.lang')) { a.style.marginLeft = 'auto'; } }
    else if ((host = document.querySelector('.titlebar nav'))) host.appendChild(a);
    else if ((host = document.querySelector('.sketch'))) { host.appendChild(document.createTextNode(' · ')); host.appendChild(a); }
    else if ((host = document.querySelector('footer'))) { host.appendChild(document.createTextNode(' · ')); host.appendChild(a); }
    else { a.style.cssText += ';position:fixed;right:.7rem;bottom:.7rem'; document.body.appendChild(a); }
    var shown = lang();
    function refresh() { var l = lang(); if (l === shown) return; shown = l; var sp = a.querySelector('span'); if (sp) sp.textContent = HT[l]; a.title = T[l]; a.setAttribute('aria-label', T[l]); }
    document.addEventListener('langchange', refresh); document.addEventListener('click', function () { setTimeout(refresh, 60); setTimeout(refresh, 400); }); document.addEventListener('change', function () { setTimeout(refresh, 60); });
    setInterval(refresh, 700);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
