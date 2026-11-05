# DeployWatch · Frontend

Dashboard web para registrar repositorios públicos de GitHub (por URL) y ver bajo
demanda si tienen despliegue configurado y si el último fue exitoso. La notificación
es dentro de la aplicación: insignia 🔔 cuando el backend marca `needs_attention`.

> Repositorio hermano: `deploywatch-backend` (API FastAPI).

## Arquitectura

```
src/
├── domain/          # Tipos (DeployOutcome, LastCheck, TrackedRepoView) y la regla
│                    # needsAttention() + status.test.ts
├── i18n/            # Diccionarios por idioma (solo `es` por ahora) + es.test.ts.
│                    # Todo el texto visible sale de aquí; sin texto hardcodeado.
├── api/             # Cliente HTTP hacia /api del backend
├── styles.css       # Tema oscuro tipo consola: design tokens, tarjetas, botones
└── features/repos/  # Dashboard (resumen + formulario) y RepoList con tarjetas
```

La regla `needsAttention` replica al backend: `failure`, `no_deploy_setup` y
`never_deployed` generan alerta; `success` e `in_progress`, no.

## Requisitos

- Node 20+
- Backend en marcha (`http://localhost:8000` en desarrollo)

## Instalación y uso local

```bash
npm install
npm run dev     # http://localhost:5173 (proxy /api -> localhost:8000)
```

| Script | Descripción |
|---|---|
| `npm run dev` | Desarrollo con proxy al backend local |
| `npm test` | Pruebas Vitest con cobertura |
| `npm run lint` | ESLint |
| `npm run build` | Compilación de producción a `dist/` |

## Conexión con el backend

- En desarrollo, `vite.config.ts` redirige `/api` a `http://localhost:8000`.
- En Docker, `nginx.conf.template` redirige `/api/` a `${BACKEND_URL}`
  (por defecto `http://host.docker.internal:8000`, es decir, el backend
  corriendo en tu máquina). Para apuntar a otra URL:
  ```bash
  BACKEND_URL=http://mi-backend:8000 docker compose up --build
  ```

## Docker (compose)

```bash
docker compose up --build   # web en http://localhost:5173
```

El `compose` usa BuildKit (`docker compose build`), sin el builder clásico
deprecado. La imagen se construye en dos etapas: `node` compila `dist/` y
`nginx:alpine` la sirve con la plantilla ya renderizada.

## Pruebas y calidad

```bash
npm test
```

- `src/domain/status.test.ts`: regla de alerta y mensaje para repos sin chequear.
- CI (`.github/workflows/ci.yml`): install + tests + build.
- SonarCloud (`sonar-project.properties`): usa `coverage/lcov.info`.
