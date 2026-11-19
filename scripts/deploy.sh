#!/usr/bin/env bash
# Despliegue del frontend a staging con smoke test y rollback automático.
#
# Uso: deploy.sh <imagen-nueva> [<imagen-estable>]
#
#   1. Levanta un backend simulado y la versión estable actual (si existe).
#   2. Reemplaza nginx por la imagen nueva y ejecuta el smoke test:
#      index.html, el bundle JS que referencia y el proxy /api hacia el backend.
#   3. Si falla, vuelve a la versión estable y termina con código 1.
#
# SIMULAR_FALLO=true despliega la imagen nueva con un BACKEND_URL que no
# resuelve: nginx no arranca, como ocurriría con una configuración errónea.
set -euo pipefail

NEW_IMAGE=${1:?Falta la imagen nueva}
STABLE_IMAGE=${2:-}
NET=deploywatch-web-staging
API=staging-api
WEB=staging-web
BASE=http://localhost:8080

log() { echo "::group::$*"; }
end() { echo "::endgroup::"; }

start_backend() {
  log "Backend simulado de staging"
  docker network create "$NET" >/dev/null 2>&1 || true
  docker rm -f "$API" >/dev/null 2>&1 || true
  docker run -d --name "$API" --network "$NET" \
    python:3.12-alpine@sha256:c5ba3deef00c7758561a0f03c26f44f10589263d40e732b8748e0d1f38f6dd89 python -c '
import http.server, json
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({"status": "ok"} if self.path == "/api/health" else []).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json")
        self.end_headers(); self.wfile.write(body)
http.server.HTTPServer(("", 8000), H).serve_forever()' >/dev/null
  end
}

run_web() { # <imagen> <backend-url>
  docker rm -f "$WEB" >/dev/null 2>&1 || true
  docker run -d --name "$WEB" --network "$NET" -p 8080:8080 -e BACKEND_URL="$2" "$1" >/dev/null
}

smoke_test() {
  for _ in $(seq 1 15); do
    if html=$(curl -fsS "$BASE/" 2>/dev/null) && grep -q 'id="root"' <<<"$html"; then
      js=$(grep -o 'src="/assets/[^"]*\.js"' <<<"$html" | head -1 | cut -d'"' -f2)
      if [[ -n "$js" ]] && curl -fsS -o /dev/null "$BASE$js" \
         && curl -fsS "$BASE/api/health" 2>/dev/null | grep -q '"ok"'; then
        echo "Smoke test OK: / , $js y /api/health (proxy)"
        return 0
      fi
    fi
    sleep 2
  done
  echo "Smoke test FALLÓ: $BASE no sirve la app o el proxy /api"
  docker logs --tail 15 "$WEB" 2>&1 || true
  return 1
}

start_backend
GOOD_URL="http://$API:8000"
BROKEN_URL="http://backend-inexistente:8000"

if [[ -n "$STABLE_IMAGE" ]]; then
  log "Versión estable actual: $STABLE_IMAGE"
  run_web "$STABLE_IMAGE" "$GOOD_URL"
  if ! smoke_test; then
    echo "La versión estable no pasa el smoke test: no sirve como punto de rollback."
    STABLE_IMAGE=""
  fi
  end
fi

log "Desplegando versión nueva: $NEW_IMAGE"
url="$GOOD_URL"
[[ "${SIMULAR_FALLO:-false}" == "true" ]] && { echo "SIMULAR_FALLO=true"; url="$BROKEN_URL"; }
run_web "$NEW_IMAGE" "$url"
if smoke_test; then
  end
  echo "resultado=desplegado" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 0
fi
end

if [[ -z "$STABLE_IMAGE" ]]; then
  echo "No hay versión estable a la que volver."
  echo "resultado=fallido" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 1
fi

log "ROLLBACK a $STABLE_IMAGE"
run_web "$STABLE_IMAGE" "$GOOD_URL"
smoke_test
end
echo "resultado=rollback" >> "${GITHUB_OUTPUT:-/dev/null}"
exit 1
