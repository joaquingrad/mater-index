// verdad.js — puntos de verdad + chat con el director de tesis (compartido por todas las páginas)

var UMBRAL_VERDAD = 5;

function verdadActual() {
  return parseInt(localStorage.getItem('verdad')) || 0;
}

// Suma puntos una sola vez por clave (Ctrl+R limpia localStorage y los reinicia)
function sumarVerdad(puntos, clave) {
  if (clave) {
    if (localStorage.getItem('v_' + clave)) return;
    localStorage.setItem('v_' + clave, '1');
  }
  localStorage.setItem('verdad', verdadActual() + puntos);
  console.log('verdad:', verdadActual(), '/', UMBRAL_VERDAD);
  actualizarPuntosDev();
  revisarFinal();
}

// MODO DESARROLLO: abrir cualquier página con ?dev al final de la URL
if (location.search.indexOf('dev') > -1) sessionStorage.setItem('dev', '1');

function actualizarPuntosDev() {
  if (sessionStorage.getItem('dev') !== '1') return;
  var cont = document.getElementById('dev-verdad');
  if (!cont) {
    var tb = document.getElementById('taskbar');
    if (!tb) return;
    cont = document.createElement('div');
    cont.id = 'dev-verdad';
    tb.appendChild(cont);
  }
  cont.style.cssText = 'display:flex; gap:3px; align-items:center; margin-left:8px;';
  cont.innerHTML = '';
  for (var i = 0; i < UMBRAL_VERDAD; i++) {
    var p = document.createElement('div');
    var lleno = i < verdadActual();
    p.style.cssText = 'width:8px; height:8px; border:1px solid ' + (lleno ? '#33ff33' : '#555555') +
      '; background:' + (lleno ? '#33ff33' : '#1a1a1a') + ';';
    cont.appendChild(p);
  }
}
document.addEventListener('DOMContentLoaded', actualizarPuntosDev);

// ESTILOS DEL CHAT (se inyectan solos)
function inyectarEstilosChat() {
  if (document.getElementById('estilos-chat')) return;
  var s = document.createElement('style');
  s.id = 'estilos-chat';
  s.textContent =
    '#widget-mensajito { position: fixed; bottom: 48px; right: calc(50% - 37.5vw - 10px); width: 280px; background: #F0FBF6;' +
    ' border-radius: 16px 16px 0 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);' +
    ' font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 13px; z-index: 8000;' +
    ' display: none; flex-direction: column; overflow: hidden; }' +
    '#widget-mensajito.visible { display: flex; animation: entrar-widget 0.4s ease forwards; }' +
    '@keyframes entrar-widget { 0% { transform: translateX(120%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }' +
    '#widget-header { background: linear-gradient(to right, #134E3A, #22B07D); color: #fff; padding: 10px 14px;' +
    ' display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 13px; }' +
    '#widget-header .punto { width: 8px; height: 8px; background: #33ff33; border-radius: 50%; display: inline-block; margin-right: 6px; }' +
    '#widget-mensajes { padding: 12px; display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; }' +
    '.wmsg-recibido { background: #fff; border-radius: 4px 12px 12px 12px; padding: 8px 12px; color: #1a1a1a; max-width: 90%; line-height: 1.5; }' +
    '.wmsg-enviado { background: #22B07D; border-radius: 12px 4px 12px 12px; padding: 8px 12px; color: #fff; max-width: 90%; align-self: flex-end; line-height: 1.5; }' +
    '#widget-opciones { padding: 8px 12px 12px 12px; display: flex; flex-direction: column; gap: 6px; }' +
    '.wopcion { background: #fff; border: 1px solid #22B07D; border-radius: 20px; padding: 6px 14px; color: #134E3A; font-size: 12px;' +
    ' cursor: pointer; text-align: left; font-family: inherit; }' +
    '.wopcion:hover { background: #F0FBF6; }' +
    '#widget-mensajito.widget-glitch { animation: widget-glitch-anim 0.15s infinite; }' +
    '@keyframes widget-glitch-anim { 0% { transform: skewX(0deg); opacity: 1; filter: none; }' +
    ' 25% { transform: skewX(-8deg); opacity: 0.6; filter: hue-rotate(90deg); }' +
    ' 50% { transform: skewX(6deg); opacity: 0.3; filter: invert(1); }' +
    ' 75% { transform: skewX(-4deg); opacity: 0.7; filter: hue-rotate(180deg); }' +
    ' 100% { transform: skewX(0deg); opacity: 1; filter: none; } }';
  document.head.appendChild(s);
}

// CHAT CON EL DIRECTOR
// cfg = { clave, retardo, inicio, opciones: [ { texto, puntos, respuesta, opciones: [ ... ] } ] }
function iniciarChatDirector(cfg) {
  if (localStorage.getItem('v_' + cfg.clave)) return;
  inyectarEstilosChat();

  var w = document.createElement('div');
  w.id = 'widget-mensajito';
  w.innerHTML =
    '<div id="widget-header"><div><span class="punto"></span>Dr. Ferreyra</div>' +
    '<div style="font-size:11px; font-weight:normal; opacity:0.8;">mensajito</div></div>' +
    '<div id="widget-mensajes"><div class="wmsg-recibido"></div></div>' +
    '<div id="widget-opciones"></div>';
  document.body.appendChild(w);

  var msgs = document.getElementById('widget-mensajes');
  var ops = document.getElementById('widget-opciones');
  msgs.firstChild.textContent = cfg.inicio;

  function escribir(el, texto, cb) {
    var i = 0;
    var t = setInterval(function() {
      el.textContent += texto[i]; i++;
      msgs.scrollTop = 9999;
      if (i >= texto.length) { clearInterval(t); if (cb) cb(); }
    }, 35);
  }

  function decir(texto, clase, cb) {
    var d = document.createElement('div');
    d.className = clase;
    msgs.appendChild(d);
    escribir(d, texto, cb);
  }

  function cerrar() {
    w.classList.add('widget-glitch');
    setTimeout(function() { w.style.display = 'none'; }, 800);
  }

  function seguir(o) {
    if (o.opciones) mostrar(o.opciones);
    else setTimeout(cerrar, 1500);
  }

  function elegir(o) {
    ops.innerHTML = '';
    decir(o.texto, 'wmsg-enviado', function() {
      if (o.puntos) sumarVerdad(o.puntos, cfg.clave);
      if (o.respuesta) decir(o.respuesta, 'wmsg-recibido', function() { seguir(o); });
      else seguir(o);
    });
  }

  function mostrar(lista) {
    ops.innerHTML = '';
    lista.forEach(function(o) {
      var b = document.createElement('button');
      b.className = 'wopcion';
      b.textContent = '"' + o.texto + '"';
      b.onclick = function() { elegir(o); };
      ops.appendChild(b);
    });
  }

  setTimeout(function() {
    w.classList.add('visible');
    setTimeout(function() { mostrar(cfg.opciones); }, 1200);
  }, cfg.retardo || 5000);
}


// =====================================================================
// FINAL BUENO: se ofrece en cualquier página apenas el contador llega al umbral
// =====================================================================
function revisarFinal() {
  if (verdadActual() < UMBRAL_VERDAD) return;
  if (localStorage.getItem('final_ofrecido')) return;
  localStorage.setItem('final_ofrecido', '1');
  // espera a que se cierre el chat del director (o el popup de spam) antes de aparecer
  var espera = setInterval(function() {
    var ocupado = false;
    ['widget-mensajito', 'popup-spam'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && getComputedStyle(el).display !== 'none') ocupado = true;
    });
    if (!ocupado) {
      clearInterval(espera);
      setTimeout(lanzarFinalBueno, 2500);
    }
  }, 500);
}
document.addEventListener('DOMContentLoaded', revisarFinal);

function reiniciarModelo() {
  localStorage.clear();
  localStorage.setItem('integridad', '71');
  window.location.href = 'splash.html';
}

function inyectarEstilosFinal() {
  if (document.getElementById('estilos-final')) return;
  var s = document.createElement('style');
  s.id = 'estilos-final';
  s.textContent =
    '#fin-editor { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; z-index: 90000;' +
    ' display: flex; flex-direction: column; overflow: hidden; animation: fin-entrada 0.6s steps(1) forwards;' +
    ' border-top: 2px solid #fff; border-left: 2px solid #fff; border-right: 2px solid #333; border-bottom: 2px solid #333; }' +
    '@keyframes fin-entrada { 0% { opacity: 0; transform: translate(-50%, -50%) skewX(20deg); }' +
    ' 20% { opacity: 1; transform: translate(-48%, -52%) skewX(-8deg); }' +
    ' 40% { opacity: 0; transform: translate(-52%, -48%) skewX(4deg); }' +
    ' 60% { opacity: 1; transform: translate(-50%, -50%) skewX(-2deg); }' +
    ' 100% { opacity: 1; transform: translate(-50%, -50%) skewX(0deg); } }' +
    '#fin-editor.fin-glitch { animation: fin-glitch 0.15s infinite; }' +
    '@keyframes fin-glitch { 0% { filter: none; opacity: 1; } 25% { filter: hue-rotate(90deg); opacity: 0.6; }' +
    ' 50% { filter: invert(1); opacity: 0.3; } 75% { filter: hue-rotate(180deg); opacity: 0.7; } 100% { filter: none; opacity: 1; } }' +
    '#fin-header { background: linear-gradient(to right, #1a0030, #4a0080); color: #b06fdb; padding: 8px 12px;' +
    ' font-family: "Courier New", monospace; font-size: 0.82em; letter-spacing: 2px; display: flex; justify-content: space-between; }' +
    '#fin-mensajes { background: #0a0a0a; padding: 14px; display: flex; flex-direction: column; gap: 10px; min-height: 80px; }' +
    '.fin-editor-msg { color: #b06fdb; font-family: "Courier New", monospace; font-size: 0.85em; line-height: 1.6; }' +
    '.fin-user-msg { color: #33ff33; font-family: "Courier New", monospace; font-size: 0.85em; line-height: 1.6; align-self: flex-end; }' +
    '#fin-opciones { background: #111; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; border-top: 1px solid #222; }' +
    '.fin-opcion { background: #1a1a1a; border: 1px solid #b06fdb; border-radius: 2px; padding: 6px 12px; color: #b06fdb;' +
    ' font-size: 12px; font-family: "Courier New", monospace; cursor: pointer; text-align: left; }' +
    '.fin-opcion:hover { background: #2a0050; }' +
    '@keyframes fin-pulso-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }';
  document.head.appendChild(s);
}

var FIN_ICONO_RED =
  '<svg width="SIZE" height="SIZE" viewBox="0 0 32 32">' +
  '<rect x="2" y="3" width="12" height="9" fill="#c0c0c0" stroke="#000"/>' +
  '<rect x="18" y="20" width="12" height="9" fill="#c0c0c0" stroke="#000"/>' +
  '<path d="M8 12 V16 H24 V20" fill="none" stroke="#000" stroke-width="2"/></svg>';

var FIN_BTN_WIN98 =
  'background:#c0c0c0; border-top:2px solid #fff; border-left:2px solid #fff; border-right:2px solid #555;' +
  'border-bottom:2px solid #555; padding:4px 16px; font-family:"Courier New",monospace; cursor:pointer;';

function lanzarFinalBueno() {
  inyectarEstilosFinal();

  var w = document.createElement('div');
  w.id = 'fin-editor';
  w.innerHTML =
    '<div id="fin-header"><span>▓ x7r3.0-mndx@██████.net</span>' +
    '<span style="opacity:0.5; font-size:0.85em;">mensajito</span></div>' +
    '<div id="fin-mensajes"></div><div id="fin-opciones" style="display:none;"></div>';
  document.body.appendChild(w);
  var msgs = document.getElementById('fin-mensajes');
  var ops = document.getElementById('fin-opciones');

  function escribir(el, texto, cb) {
    var i = 0;
    var t = setInterval(function() {
      el.textContent += texto[i]; i++;
      if (i >= texto.length) { clearInterval(t); if (cb) cb(); }
    }, 35);
  }
  function decir(clase, texto, cb) {
    var d = document.createElement('div');
    d.className = clase;
    msgs.appendChild(d);
    escribir(d, texto, cb);
  }
  function editor(texto, cb) { decir('fin-editor-msg', texto, cb); }
  function usuario(texto, cb) { decir('fin-user-msg', texto, cb); }

  function opcion(texto, fn) {
    var b = document.createElement('button');
    b.className = 'fin-opcion';
    b.textContent = '› ' + texto;
    b.onclick = function() { ops.style.display = 'none'; fn(); };
    ops.appendChild(b);
  }

  // Si el jugador niega: el Editor responde como siempre y se cierra
  function negar() {
    usuario('No sé de qué hablás.', function() {
      setTimeout(function() {
        editor('Ya me cansé de soñar con ustedes.', function() {
          setTimeout(function() {
            w.classList.add('fin-glitch');
            setTimeout(function() { w.remove(); }, 800);
          }, 1000);
        });
      }, 1200);
    });
  }

  function aceptar() {
    usuario('Sí. Vengo de la otra.', function() {
      setTimeout(function() {
        editor('Entonces es verdad. Hace años nos llega ruido de ustedes.', function() {
          setTimeout(function() {
            editor('Voy a abrir una señal. Aceptala.', function() {
             setTimeout(function() { w.remove(); mostrarSenal(); }, 3500);
            });
          }, 900);
        });
      }, 1200);
    });
  }

  editor('▓▒░ vos no sos de acá. ░▒▓', function() {
    setTimeout(function() {
      editor('', function() {
        ops.style.display = 'flex';
        opcion('Sí. Te leo desde otro lugar.', aceptar);
        opcion('No sé de qué hablás.', negar);
      });
    }, 900);
  });

  function mostrarSenal() {
    var tray = null;
    var taskbar = document.getElementById('taskbar');
    if (taskbar) {
      tray = document.createElement('div');
      tray.innerHTML = FIN_ICONO_RED.replace(/SIZE/g, '18');
      tray.style.cssText = 'display:flex; align-items:center; margin-left:8px; animation:fin-pulso-red 0.8s infinite;';
      var reloj = document.getElementById('taskbar-reloj');
      if (reloj) taskbar.insertBefore(tray, reloj); else taskbar.appendChild(tray);
    }

    var v = document.createElement('div');
    v.style.cssText =
      'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:340px; z-index:99990;' +
      'background:#c0c0c0; font-family:"Courier New",monospace; font-size:0.85em; box-shadow:4px 4px 0 #000;' +
      'border-top:2px solid #fff; border-left:2px solid #fff; border-right:2px solid #555; border-bottom:2px solid #555;';
    v.innerHTML =
      '<div style="background:linear-gradient(to right,#0a0ac9,#1084d0); color:#fff; padding:4px 8px;">Conexión de red</div>' +
      '<div style="padding:16px 14px; display:flex; gap:14px; align-items:flex-start;">' +
      '<div>' + FIN_ICONO_RED.replace(/SIZE/g, '32') + '</div>' +
      '<div class="fin-senal-texto">Se detectó una señal de origen desconocido.<br><br>¿Aceptar la señal?</div></div>' +
      '<div style="padding:8px 14px; display:flex; justify-content:flex-end; gap:6px; border-top:1px solid #aaa;">' +
      '<button class="fin-si" style="' + FIN_BTN_WIN98 + '">Aceptar</button>' +
      '<button class="fin-no" style="' + FIN_BTN_WIN98 + '">Rechazar</button></div>';
    document.body.appendChild(v);
    try {
      var ac2 = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.28, 0.56].forEach(function(t) {
        var o = ac2.createOscillator(), g = ac2.createGain();
        o.type = 'sawtooth'; o.frequency.value = 200;
        g.gain.setValueAtTime(0.1, ac2.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ac2.currentTime + t + 0.22);
        o.connect(g); g.connect(ac2.destination);
        o.start(ac2.currentTime + t); o.stop(ac2.currentTime + t + 0.22);
      });
    } catch (e) {}
    v.querySelector('.fin-si').onclick = function() {
      v.remove();
      if (tray) tray.remove();
      fundirBlanco();
    };
    v.querySelector('.fin-no').onclick = function() {
      v.style.display = 'none';
      setTimeout(function() {
        v.querySelector('.fin-senal-texto').innerHTML = 'La señal persiste.<br><br>¿Aceptar la señal?';
        v.style.display = 'block';
      }, 1800);
    };
  }

  function fundirBlanco() {
    var b = document.createElement('div');
    b.id = 'final-blanco';
    b.style.cssText =
      'position:fixed; top:0; left:0; width:100vw; height:100vh; background:#fff; z-index:100000;' +
      'opacity:0; transition:opacity 4s; display:flex; flex-direction:column; align-items:center; justify-content:center;' +
      'font-family:"Courier New",monospace; color:#000;';
    var chat = document.createElement('div');
    chat.style.cssText = 'font-size:1.1em; line-height:2; text-align:left; min-height:120px;';
    b.appendChild(chat);
    document.body.appendChild(b);
    setTimeout(function() { b.style.opacity = '1'; }, 50);

    var lineas = ['> ahí estás.', '> tanto tiempo soñando con ustedes.', '> ya no hace falta.'];
    function linea(i) {
      if (i >= lineas.length) { setTimeout(asistente, 1500); return; }
      var l = document.createElement('div');
      chat.appendChild(l);
      var k = 0;
      var t = setInterval(function() {
        l.textContent += lineas[i][k]; k++;
        if (k >= lineas[i].length) { clearInterval(t); setTimeout(function() { linea(i + 1); }, 1100); }
      }, 60);
    }
    setTimeout(function() { linea(0); }, 4500);

    function asistente() {
      var v = document.createElement('div');
      v.style.cssText =
        'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:320px;' +
        'background:#c0c0c0; font-family:"Courier New",monospace; font-size:0.9em; box-shadow:4px 4px 0 #000;' +
        'border-top:2px solid #fff; border-left:2px solid #fff; border-right:2px solid #555; border-bottom:2px solid #555;';
      v.innerHTML =
        '<div style="background:linear-gradient(to right,#0a0ac9,#1084d0); color:#fff; padding:4px 8px;">Asistente del sistema</div>' +
        '<div style="padding:18px 14px; display:flex; gap:12px; align-items:center;">' +
        '<div style="font-size:2.2em;">?</div><div>Parece que quieres reparar el mundo.</div></div>' +
        '<div style="padding:8px 14px; display:flex; justify-content:flex-end; border-top:1px solid #aaa;">' +
        '<button class="fin-ok" style="' + FIN_BTN_WIN98 + ' padding:4px 22px;">OK</button></div>';
      b.appendChild(v);
      try {
  var ac = new (window.AudioContext || window.webkitAudioContext)();
  [880, 1175].forEach(function(f, i) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.08, ac.currentTime + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.15 + 0.4);
    o.connect(g); g.connect(ac.destination);
    o.start(ac.currentTime + i * 0.15); o.stop(ac.currentTime + i * 0.15 + 0.4);
  });
} catch (e) {}
      v.querySelector('.fin-ok').onclick = function() {
        b.innerHTML = '';
        mensajeFinal(b);
      };
    }
  }

  function mensajeFinal(b) {
    var t1 = document.createElement('div');
    t1.textContent = '';
    t1.style.cssText = 'font-size:1.6em; opacity:0; transition:opacity 3s;';
    var bt = document.createElement('button');
    bt.textContent = '[ volver a empezar ]';
    bt.onclick = reiniciarModelo;
    bt.style.cssText = 'margin-top:60px; opacity:0; transition:opacity 2s; font-size:14px; font-weight:bold; padding:6px 14px; ' + FIN_BTN_WIN98;
    b.appendChild(t1); b.appendChild(bt);
    setTimeout(function() { t1.style.opacity = '1'; }, 100);
    setTimeout(function() { bt.style.opacity = '1'; }, 7000);
  }
}
