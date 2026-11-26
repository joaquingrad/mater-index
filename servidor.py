#!/usr/bin/env python3
# Servidor local de MATER.INDEX: sirve el sitio en http://localhost:8000
# y guarda en el escritorio las fotos que saca la camara (carpeta fotos_visitantes).
import http.server, os, re

RAIZ = os.path.dirname(os.path.abspath(__file__))
FOTOS = os.path.join(os.path.expanduser('~'), 'Desktop', 'fotos_visitantes')
PUERTO = 8000
MAX_BYTES = 8 * 1024 * 1024

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=RAIZ, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        if not self.path.startswith('/foto'):
            self.send_error(404)
            return
        largo = int(self.headers.get('Content-Length', 0))
        if largo <= 0 or largo > MAX_BYTES:
            self.send_error(400)
            return
        datos = self.rfile.read(largo)
        m = re.search(r'nombre=([^&]+)', self.path)
        nombre = re.sub(r'[^A-Za-z0-9_.-]', '', m.group(1)) if m else 'visitante.jpg'
        if not nombre.lower().endswith('.jpg'):
            nombre += '.jpg'
        os.makedirs(FOTOS, exist_ok=True)
        with open(os.path.join(FOTOS, nombre), 'wb') as f:
            f.write(datos)
        print('foto guardada:', nombre)
        self.send_response(204)
        self.end_headers()

if __name__ == '__main__':
    print('MATER.INDEX en http://localhost:%d/splash.html' % PUERTO)
    print('Las fotos se guardan en:', FOTOS)
    http.server.ThreadingHTTPServer(('127.0.0.1', PUERTO), Handler).serve_forever()
