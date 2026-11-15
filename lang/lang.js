/* A small translator shared by the pages that have no language switch of their own (canons, hand, Atlas, Concordantia, Fiorire, help).
   The dictionary maps the English text of a label to [German, French, Czech] (window.LANG_DICT, from dict.js); a label without an entry stays in English.
   The language is the same as on the homepage, the gym and the ear trainer: localStorage 'lang', or ?lang=de. */
(function () {
  'use strict';
  var LANGS = ['en', 'de', 'fr', 'cs'], IDX = { de: 0, fr: 1, cs: 2 }, D = window.LANG_DICT || {}, PAT = (window.LANG_PATTERNS || []).map(function (p) { return [new RegExp(p[0]), p[1]]; });
  var MONTHS = { January: ['Januar', 'janvier', 'ledna'], February: ['Februar', 'février', 'února'], March: ['März', 'mars', 'března'], April: ['April', 'avril', 'dubna'], May: ['Mai', 'mai', 'května'], June: ['Juni', 'juin', 'června'], July: ['Juli', 'juillet', 'července'], August: ['August', 'août', 'srpna'], September: ['September', 'septembre', 'září'], October: ['Oktober', 'octobre', 'října'], November: ['November', 'novembre', 'listopadu'], December: ['Dezember', 'décembre', 'prosince'] };
  function look(key, i) {
    var v = D[key]; if (v && v[i]) return v[i];
    for (var k = 0; k < PAT.length; k++) {
      var m = key.match(PAT[k][0]);
      if (m && PAT[k][1][i]) return PAT[k][1][i].replace(/\$(\d)/g, function (_, d) { var x = m[+d]; return (MONTHS[x] && MONTHS[x][i]) || x; });
    }
    return null;
  }
  var ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
  var lang = 'en', busy = false, txt = new WeakMap(), att = new WeakMap();
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  function pick() {
    var q = new URL(location.href).searchParams.get('lang'), l = q;
    if (!l) { try { l = localStorage.getItem('lang'); } catch (e) { /* no storage */ } }
    if (!l) {
      var pref = (navigator.languages || [navigator.language || 'en']).map(function (x) { return x.slice(0, 2).toLowerCase(); });
      l = pref.filter(function (x) { return ['de', 'fr', 'cs', 'sk', 'en'].indexOf(x) >= 0; })[0] || 'en';
      if (l === 'sk') l = 'cs';
    }
    return LANGS.indexOf(l) >= 0 ? l : 'en';
  }
  function tr(en) { if (lang === 'en') return en; return look(norm(en), IDX[lang]) || en; }
  function node(n) {
    var rec = txt.get(n), cur = n.nodeValue;
    if (rec && cur === rec.out) { /* still ours */ } else { if (!norm(cur)) return; rec = { en: cur, out: cur }; txt.set(n, rec); }
    var key = norm(rec.en), v = lang === 'en' ? null : look(key, IDX[lang]);
    var out = v ? rec.en.replace(key, function () { return v; }) : rec.en;
    if (out !== cur) { n.nodeValue = out; rec.out = out; }
  }
  function el(e) {
    var rec = att.get(e) || {}, any = false;
    ATTRS.forEach(function (a) {
      if (!e.hasAttribute(a)) return;
      var cur = e.getAttribute(a), r = rec[a];
      if (!(r && cur === r.out)) { r = rec[a] = { en: cur, out: cur }; }
      var v = lang === 'en' ? null : look(norm(r.en), IDX[lang]), out = v || r.en;
      if (out !== cur) { e.setAttribute(a, out); r.out = out; }
      any = true;
    });
    if (any) att.set(e, rec);
  }
  function walk(root) {
    if (root.nodeType === 3) { if (root.parentNode && !/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(root.parentNode.tagName)) node(root); return; }
    if (root.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(root.tagName) || root.closest('[data-no-lang]')) return;
    el(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { var p = n.parentNode; if (!/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.tagName) && !p.closest('[data-no-lang]')) node(n); }
      else if (!/^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.tagName)) el(n);
    }
  }
  function run(root) { busy = true; try { walk(root || document.body); } finally { busy = false; } }
  function set(l) {
    lang = LANGS.indexOf(l) >= 0 ? l : 'en'; document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (e) { /* no storage */ }
    var u = new URL(location.href); if (lang === 'en') u.searchParams.delete('lang'); else u.searchParams.set('lang', lang);
    history.replaceState(null, '', u);
    run(); document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  function switcher() {
    if (document.querySelector('.lang')) return;
    var css = document.createElement('style');
    css.textContent = '.lang{display:inline-flex;border:1px solid currentColor;border-color:color-mix(in srgb,currentColor 30%,transparent);border-radius:999px;padding:2px;margin-left:auto;font-style:normal}' +
      '.lang button{font:500 .74rem/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.05em;color:inherit;opacity:.7;background:none;border:0;border-radius:999px;padding:.32em .6em;cursor:pointer}' +
      '.lang button[aria-pressed="true"]{opacity:1;font-weight:700;background:color-mix(in srgb,currentColor 16%,transparent);box-shadow:inset 0 -2px 0 currentColor}' +
      '.lang.float{position:fixed;right:.7rem;bottom:.7rem;z-index:60;background:var(--bg,#fff);color:var(--fg,#111);box-shadow:0 2px 10px rgba(0,0,0,.25)}';
    document.head.appendChild(css);
    var box = document.createElement('span'); box.className = 'lang'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Language'); box.setAttribute('data-no-lang', '');
    [['en', 'EN'], ['de', 'DE'], ['fr', 'FR'], ['cs', 'CZ']].forEach(function (x) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.lang = x[0]; b.textContent = x[1]; b.addEventListener('click', function () { set(x[0]); }); box.appendChild(b);
    });
    var host = document.querySelector('.sitenav') || document.querySelector('header nav') || document.querySelector('.titlebar nav');
    if (host) host.appendChild(box); else { box.classList.add('float'); document.body.appendChild(box); }
  }
  lang = pick();
  function start() {
    switcher(); set(lang);
    new MutationObserver(function (ms) {
      if (busy) return;
      busy = true;
      try { ms.forEach(function (m) {
        if (m.type === 'characterData') walk(m.target);
        else if (m.type === 'attributes') el(m.target);
        else m.addedNodes.forEach(function (n) { walk(n); });
      }); } finally { busy = false; }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  window.LANG = { get lang() { return lang; }, set: set, t: tr, run: run };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
