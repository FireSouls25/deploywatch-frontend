"""Despliegue del frontend a staging con smoke test y rollback automático.

Uso:
    python scripts/deploy.py IMAGEN_NUEVA [IMAGEN_ESTABLE] [--simular-fallo]

1. Levanta un backend simulado y la versión estable actual (si existe).
2. Reemplaza nginx por la imagen nueva y ejecuta el smoke test: la página
   principal, el archivo JavaScript que carga y el proxy /api hacia el backend.
3. Si falla, vuelve a la versión estable y termina con código 1.

--simular-fallo (o SIMULAR_FALLO=true) despliega la imagen nueva apuntando a
un backend que no existe: nginx no arranca, como pasaría con una
configuración errónea.

Solo usa la biblioteca estándar y el cliente de Docker: funciona igual en
Linux, macOS y Windows.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

NET = "deploywatch-web-staging"
API = "staging-api"
WEB = "staging-web"
BASE = "http://localhost:8080"
BACKEND_OK = f"http://{API}:8000"
BACKEND_ROTO = "http://backend-inexistente:8000"
STUB_IMG = "python:3.12-alpine@sha256:c5ba3deef00c7758561a0f03c26f44f10589263d40e732b8748e0d1f38f6dd89"
STUB = """
import http.server, json
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({"status": "ok"} if self.path == "/api/health" else []).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json")
        self.end_headers(); self.wfile.write(body)
http.server.HTTPServer(("", 8000), H).serve_forever()
"""
EN_ACTIONS = os.getenv("GITHUB_ACTIONS") == "true"


def docker(*args: str, check: bool = True) -> None:
    subprocess.run(["docker", *args], check=check,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def grupo(titulo: str) -> None:
    print(f"::group::{titulo}" if EN_ACTIONS else f"\n-- {titulo}", flush=True)


def fin_grupo() -> None:
    if EN_ACTIONS:
        print("::endgroup::", flush=True)


def salida(resultado: str) -> None:
    ruta = os.getenv("GITHUB_OUTPUT")
    if ruta:
        with open(ruta, "a", encoding="utf-8") as f:
            f.write(f"resultado={resultado}\n")
    print(f"Resultado: {resultado}")


def iniciar_backend_simulado() -> None:
    grupo("Backend simulado de staging")
    docker("network", "create", NET, check=False)
    docker("rm", "-f", API, check=False)
    docker("run", "-d", "--name", API, "--network", NET, STUB_IMG, "python", "-c", STUB)
    print("Backend simulado listo")
    fin_grupo()


def arrancar_web(imagen: str, backend_url: str) -> None:
    docker("rm", "-f", WEB, check=False)
    docker("run", "-d", "--name", WEB, "--network", NET, "-p", "8080:8080",
           "-e", f"BACKEND_URL={backend_url}", imagen)


def _get(ruta: str) -> bytes:
    with urllib.request.urlopen(BASE + ruta, timeout=3) as r:
        return r.read()


def smoke_test(intentos: int = 15) -> bool:
    for _ in range(intentos):
        try:
            html = _get("/").decode("utf-8", "replace")
            js = re.search(r'src="(/assets/[^"]+\.js)"', html)
            if 'id="root"' in html and js:
                _get(js.group(1))
                if json.loads(_get("/api/health")).get("status") == "ok":
                    print(f"Smoke test OK: página principal, {js.group(1)} y /api/health (proxy)")
                    return True
        except (urllib.error.URLError, OSError, ValueError):
            pass
        time.sleep(2)
    print(f"Smoke test FALLÓ: {BASE} no sirve la aplicación o el proxy /api")
    logs = subprocess.run(["docker", "logs", "--tail", "3", WEB],
                          capture_output=True, text=True, check=False)
    print((logs.stdout + logs.stderr).strip())
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("nueva", help="imagen a desplegar")
    parser.add_argument("estable", nargs="?", default="", help="versión estable actual")
    parser.add_argument("--simular-fallo", action="store_true")
    args = parser.parse_args()
    simular = args.simular_fallo or os.getenv("SIMULAR_FALLO", "false") == "true"
    estable = args.estable

    iniciar_backend_simulado()

    if estable:
        grupo(f"Versión estable actual: {estable}")
        arrancar_web(estable, BACKEND_OK)
        if not smoke_test():
            print("La versión estable no pasa el smoke test: no sirve como punto de rollback.")
            estable = ""
        fin_grupo()

    grupo(f"Desplegando versión nueva: {args.nueva}")
    if simular:
        print("SIMULAR_FALLO=true (backend inexistente)")
    arrancar_web(args.nueva, BACKEND_ROTO if simular else BACKEND_OK)
    ok = smoke_test()
    fin_grupo()
    if ok:
        salida("desplegado")
        return 0

    if not estable:
        print("No hay versión estable a la que volver.")
        salida("fallido")
        return 1

    grupo(f"ROLLBACK a {estable}")
    arrancar_web(estable, BACKEND_OK)
    smoke_test()
    fin_grupo()
    salida("rollback")
    return 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    sys.exit(main())
