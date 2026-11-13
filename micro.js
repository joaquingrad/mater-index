// MATER.INDEX — comportamiento compartido de los artículos mínimos.
// (Historial ◄ ►, integridad, reloj, Ctrl+R global y "Artículo aleatorio".)
// Lista de artículos a los que puede saltar "Artículo aleatorio":
var MICRO_LISTA = [
  "anos_monstruos.html",
  "campamento_oferta_y_demanda.html",
  "cosmismo.html",
  "datos_salvajes.html",
  "diseno_de_oscuridad_y_silencio.html",
  "el_ojo_humano.html",
  "esclavitud_etica.html",
  "genealogia_del_descanso.html",
  "los_alambres.html",
  "moonwashing.html",
  "morir_afuera.html",
  "nivel_vidrio.html",
  "plutonium_jazz.html",
  "que_hora_es_alla.html",
  "radio_tormenta.html",
  "sol_argentino_rodriguez.html",
  "variante_reconquista.html",
  "videos_masculinos.html",
  "washington.html"
];

var PAGINA_ACTUAL = decodeURIComponent(window.location.pathname.split('/').pop());

function irAzar(e) {
  if (e) e.preventDefault();
  var lista = MICRO_LISTA.filter(function(x) { return x !== PAGINA_ACTUAL; });
  window.location.href = lista[Math.floor(Math.random() * lista.length)];
}
    // AUDIO (se activa con el primer movimiento del mouse)
    var audioCtx = null;
    document.addEventListener('mousemove', function iniciarAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        document.removeEventListener('mousemove', iniciarAudio);
      }
    });

    // INTEGRIDAD
    var integridad = parseInt(localStorage.getItem('integridad')) || 71;
    actualizarMonitor(integridad);
    if (integridad <= 0) window.location.href = 'gameover.html';

    function actualizarMonitor(porcentaje) {
      var valor = document.getElementById('integridad-valor');
      if (valor) valor.textContent = porcentaje + '%';
      var bloques = document.querySelectorAll('.bloque-barra');
      var llenos = Math.round(porcentaje / 10);
      bloques.forEach(function(b, i) {
        b.className = 'bloque-barra';
        if (i < llenos) {
          if (porcentaje <= 30) b.classList.add('critico');
        } else {
          b.classList.add('vacio');
        }
      });
    }

    // PÁGINA ANTERIOR (la usa 404.html para el botón "volver")
    localStorage.setItem('paginaAnterior', window.location.href);

    // HISTORIAL ATRÁS / ADELANTE
    var historial = [];
    try { historial = JSON.parse(localStorage.getItem('historial')) || []; } catch (e) { historial = []; }
    var posicion = parseInt(localStorage.getItem('posicion'));
    if (isNaN(posicion)) posicion = historial.length - 1;

    // Si llegamos por un link normal (no por ◄ ►), se descarta el "futuro" y se agrega esta página
    if (historial[posicion] !== PAGINA_ACTUAL) {
      historial = historial.slice(0, posicion + 1);
      historial.push(PAGINA_ACTUAL);
      posicion = historial.length - 1;
      localStorage.setItem('historial', JSON.stringify(historial));
      localStorage.setItem('posicion', posicion);
    }

    var btnAtras = document.getElementById('btn-atras');
    var btnAdelante = document.getElementById('btn-adelante');

    if (posicion > 0) btnAtras.classList.remove('deshabilitado');
    if (posicion < historial.length - 1) btnAdelante.classList.remove('deshabilitado');

    btnAtras.addEventListener('click', function() {
      if (posicion <= 0) return;
      localStorage.setItem('posicion', posicion - 1);
      window.location.href = historial[posicion - 1];
    });

    btnAdelante.addEventListener('click', function() {
      if (posicion >= historial.length - 1) return;
      localStorage.setItem('posicion', posicion + 1);
      window.location.href = historial[posicion + 1];
    });

    // RELOJ
    function actualizarReloj() {
      var ahora = new Date();
      var h = ahora.getHours().toString().padStart(2, '0');
      var m = ahora.getMinutes().toString().padStart(2, '0');
      document.getElementById('taskbar-reloj').textContent = h + ':' + m;
    }
    actualizarReloj();
    setInterval(actualizarReloj, 30000);

    // CTRL+R: REINICIO GLOBAL
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        localStorage.clear();
        localStorage.setItem('integridad', '71');
        window.location.href = 'splash.html';
      }
    });
  
