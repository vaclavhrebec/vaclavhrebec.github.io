/* Light / dark for the pages that have no switch of their own.
   Applies the visitor's choice at once (shared by all the sites: localStorage "theme"), then puts a sun/moon
   button at the end of the page's .sitenav, or in the top corner when the page has none. */
(function () {
  var root = document.documentElement;
  try { var t = localStorage.getItem('theme'); if (t === 'dark' || t === 'light') root.dataset.theme = t; } catch (e) {}
  var SUN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function dark() { return root.dataset.theme ? root.dataset.theme === 'dark' : !!(mq && mq.matches); }
  function add() {
    if (root.dataset.embed || document.querySelector('[data-theme-toggle], #theme, .theme')) return;
    var st = document.createElement('style');
    st.textContent = '.theme-toggle{display:inline-grid;place-items:center;width:32px;height:32px;border:1px solid var(--line);border-radius:50%;background:var(--card,transparent);color:var(--muted);cursor:pointer;padding:0;align-self:center;margin-left:auto}' +
      '.theme-toggle:hover{color:var(--fg,var(--ink));border-color:var(--muted)}' +
      '.theme-toggle svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}' +
      '.theme-toggle.corner{position:fixed;top:12px;right:12px;z-index:50}';
    document.head.appendChild(st);
    var b = document.createElement('button'); b.type = 'button'; b.className = 'theme-toggle'; b.setAttribute('data-theme-toggle', '');
    var nav = document.querySelector('.sitenav');
    if (nav) nav.appendChild(b); else { b.classList.add('corner'); document.body.appendChild(b); }
    function show() {
      var d = dark(), l = { en: d ? 'Light mode' : 'Dark mode', de: d ? 'Heller Modus' : 'Dunkler Modus', fr: d ? 'Mode clair' : 'Mode sombre', cs: d ? 'Světlý režim' : 'Tmavý režim' };
      b.innerHTML = d ? SUN : MOON; var t = l[root.lang] || l.en; b.title = t; b.setAttribute('aria-label', t);
    }
    b.addEventListener('click', function () {
      root.dataset.theme = dark() ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      show();
    });
    if (mq && mq.addEventListener) mq.addEventListener('change', show);
    new MutationObserver(show).observe(root, { attributes: true, attributeFilter: ['lang'] });
    show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
