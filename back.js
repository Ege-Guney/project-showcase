/* Adds a "Back to projects" bar to the top of a demo page. Skipped when the URL carries ?embed (the page is framed by another portfolio page).
   Usage: <script src="../back.js" data-href="../#diana" data-label="Back to projects"></script> */
(function () {
  if (/[?&]embed\b/.test(location.search)) return;
  var me = document.currentScript;
  var href = (me && me.dataset.href) || '../';
  var label = (me && me.dataset.label) || 'Back to projects';
  var font = me ? new URL('fonts/instrument-sans.woff2', me.src).href : '';
  function add() {
    if (document.querySelector('.eg-back')) return;
    var st = document.createElement('style');
    st.textContent =
      (font ? '@font-face{font-family:"EG Instrument Sans";src:url("' + font + '") format("woff2");font-weight:400 700;font-display:swap}' : '') +
      '.eg-back{position:relative;z-index:2147483000;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:46px;padding:0 max(16px,env(safe-area-inset-left));' +
      'padding-top:env(safe-area-inset-top,0px);background:#08101f;border-bottom:1px solid #1a2843;box-sizing:border-box;' +
      'font:600 14.5px/1 "EG Instrument Sans","Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}' +
      '.eg-back a{color:#eef3fb;text-decoration:none;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 2px}' +
      '.eg-back a:hover{color:#ff86a6}.eg-back a:focus-visible{outline:2px solid #ff5c8a;outline-offset:2px;border-radius:4px}' +
      '.eg-back svg{width:16px;height:16px;flex:none}.eg-back .eg-name{color:#7d8db0;font-weight:500}';
    document.head.appendChild(st);
    var bar = document.createElement('nav');
    bar.className = 'eg-back';
    bar.setAttribute('aria-label', 'Portfolio');
    bar.innerHTML =
      '<a href="' + href + '"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></a>' +
      '<a class="eg-name" href="' + new URL('./', me ? me.src : location.href).href + '">Ege Guney</a>';
    bar.querySelector('span').textContent = label;
    document.body.insertBefore(bar, document.body.firstChild);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
