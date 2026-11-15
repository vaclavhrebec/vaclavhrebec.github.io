/* A small "?" that opens the user manual at the right place. Used by every project page: <script src="…/lang/help.js" data-help="canon" defer></script> */
(function () {
  'use strict';
  var s = document.currentScript, topic = (s && s.dataset.help) || '', base = new URL('../help/', s.src).href;
  var T = { en: 'Help: user manual', de: 'Hilfe: Handbuch', fr: 'Aide : mode d’emploi', cs: 'Nápověda: příručka' };
  function lang() { var l = ''; try { l = localStorage.getItem('lang') || ''; } catch (e) { /* none */ } return T[l] ? l : 'en'; }
  function go() {
    if (document.querySelector('a.helplink')) return;
    var a = document.createElement('a'); a.className = 'helplink ib'; a.href = base + (topic ? '#' + topic : ''); a.textContent = '?';
    a.title = T[lang()]; a.setAttribute('aria-label', T[lang()]); a.setAttribute('data-no-lang', '');
    var st = document.createElement('style');
    st.textContent = 'a.helplink{display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;padding:0!important;border:1px solid currentColor!important;border-color:color-mix(in srgb,currentColor 35%,transparent)!important;border-radius:50%;font:600 .8rem/1 system-ui,sans-serif!important;font-style:normal!important;color:inherit;opacity:.75;text-decoration:none;flex:none}a.helplink:hover{opacity:1;border-color:currentColor!important}';
    document.head.appendChild(st);
    var theme = document.getElementById('toggleTheme') || document.getElementById('theme'), host;
    if (document.querySelector('header.bar') && document.getElementById('toggleTheme')) { theme.parentNode.insertBefore(a, theme); }
    else if ((host = document.querySelector('.sitenav'))) { var lg = host.querySelector('.lang'); if (lg) host.insertBefore(a, lg); else host.appendChild(a); if (!host.querySelector('.lang')) { a.style.marginLeft = 'auto'; } }
    else if ((host = document.querySelector('.titlebar nav'))) host.appendChild(a);
    else if ((host = document.querySelector('.sketch'))) { host.appendChild(document.createTextNode(' · ')); host.appendChild(a); }
    else if ((host = document.querySelector('footer'))) { host.appendChild(document.createTextNode(' · ')); a.style.cssText = 'width:auto;height:auto;border:0;opacity:1;text-decoration:underline'; a.textContent = T[lang()].split(':')[0]; host.appendChild(a); }
    else { a.style.cssText += ';position:fixed;right:.7rem;bottom:.7rem'; document.body.appendChild(a); }
    document.addEventListener('langchange', function () { a.title = T[lang()]; a.setAttribute('aria-label', T[lang()]); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
