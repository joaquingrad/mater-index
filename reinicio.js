// MATER.INDEX — reinicio por mouse + manejo de enlaces.
//
// 1) Click derecho sobre "⊞ Inicio" (barra inferior izquierda) = lo mismo que Ctrl+R.
// 2) Enlaces internos: se les saca el "href" y se navega por JavaScript, así Chromium
//    no muestra la dirección (file:///...) abajo a la izquierda al pasar el mouse.
// 3) Color "visitado": el violeta ya no depende del historial del navegador sino de
//    localStorage ("visitadas"), que se borra con el reinicio. Un visitante nuevo
//    siempre ve los enlaces azules.
(function () {
  var CLAVE_VISITADAS = 'visitadas';

  // ---------- 1) REINICIO ----------
  function reiniciar(e) {
    e.preventDefault();
    localStorage.clear();
    localStorage.setItem('integridad', '71');
    window.location.href = 'splash.html';
  }

  function conectarInicio() {
    var botones = document.querySelectorAll('.task-btn');
    for (var i = 0; i < botones.length; i++) {
      if (botones[i].textContent.indexOf('Inicio') !== -1) {
        botones[i].addEventListener('contextmenu', reiniciar);
      }
    }
  }

  // ---------- 2) y 3) ENLACES ----------
  function leerVisitadas() {
    try { return JSON.parse(localStorage.getItem(CLAVE_VISITADAS)) || []; }
    catch (e) { return []; }
  }

  function nombreDe(ruta) {
    var n = (ruta || '').split('#')[0].split('?')[0].split('/').pop();
    try { n = decodeURIComponent(n); } catch (e) {}
    return n;
  }

  function marcarPaginaActual() {
    var v = leerVisitadas();
    var n = nombreDe(window.location.pathname);
    if (n && v.indexOf(n) < 0) {
      v.push(n);
      try { localStorage.setItem(CLAVE_VISITADAS, JSON.stringify(v)); } catch (e) {}
    }
  }

  var visitadas = [];

  function procesarEnlace(a) {
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#') return;
    if (/^(https?:|mailto:|javascript:)/i.test(h)) return;
    if (!/\.html?(#.*)?$/i.test(h)) return;
    if (visitadas.indexOf(nombreDe(h)) >= 0) a.classList.add('enlace-visitado');
    a.setAttribute('data-href', h);
    a.removeAttribute('href');
  }

  function procesarRaiz(raiz) {
    if (raiz.nodeType !== 1) return;
    if (raiz.matches && raiz.matches('a[href]')) procesarEnlace(raiz);
    var hijos = raiz.querySelectorAll ? raiz.querySelectorAll('a[href]') : [];
    for (var i = 0; i < hijos.length; i++) procesarEnlace(hijos[i]);
  }

  function inyectarEstilo() {
    var st = document.createElement('style');
    st.textContent =
      'a[data-href] { cursor: pointer; }\n' +
      'html body #articulo a.enlace-visitado,\n' +
      'html body #rizoma a.enlace-visitado,\n' +
      'html body .nav-lateral a.enlace-visitado,\n' +
      'html body a.enlace-visitado { color: #551a8b; }';
    document.head.appendChild(st);
  }

  function conectarEnlaces() {
    marcarPaginaActual();
    visitadas = leerVisitadas();
    inyectarEstilo();
    procesarRaiz(document.body);

    // enlaces que otras partes de la página agregan después
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          for (var j = 0; j < muts[i].addedNodes.length; j++) procesarRaiz(muts[i].addedNodes[j]);
        }
      }).observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('click', function (e) {
      if (e.button !== 0 || !e.target.closest) return;
      var a = e.target.closest('a[data-href]');
      if (!a || a.hasAttribute('href')) return;
      e.preventDefault();
      window.location.href = a.getAttribute('data-href');
    });
  }

  function iniciar() {
    conectarInicio();
    conectarEnlaces();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
