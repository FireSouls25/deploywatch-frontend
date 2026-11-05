/** Único idioma por ahora: español. Estructura lista para más locales. */
export const es = {
  app: {
    title: "DeployWatch",
    scope: (n: number, age: string) =>
      n === 0
        ? "Sin repositorios rastreados"
        : `${n} ${n === 1 ? "repositorio" : "repositorios"} · comprobado ${age}`,
  },
  kpis: {
    tracked: "Rastreados",
    attention: "Con alerta",
    healthy: "Sanos",
    lastCheck: "Última comprobación",
  },
  notice: {
    attention: (n: number) =>
      n === 1
        ? "1 repositorio necesita atención"
        : `${n} repositorios necesitan atención`,
  },
  form: {
    label: "Añadir repositorio público por URL o propietario/repo",
    placeholder: "https://github.com/propietario/repo",
    add: "Rastrear",
  },
  list: {
    title: "Repositorios",
    total: (n: number) => `${n} en total`,
    origin: "Origen",
  },
  card: {
    checkNow: "Comprobar",
    checking: "Comprobando…",
    remove: "Eliminar",
    viewDeploy: "Ver despliegue",
    notChecked: "Sin comprobar",
    confirmRemove: (name: string) => `¿Dejar de rastrear ${name}?`,
  },
  age: {
    now: "ahora mismo",
    minutes: (n: number) => `hace ${n} min`,
    hours: (n: number) => `hace ${n} h`,
    days: (n: number) => (n === 1 ? "ayer" : `hace ${n} días`),
    date: (iso: string) => `el ${iso.slice(0, 10)}`,
    never: "—",
  },
  states: {
    loading: "Cargando repositorios…",
    empty: "Aún no rastreas ningún repositorio.",
    emptyHint: "Añade arriba la URL de un repo público para empezar.",
    loadError: "No se pudo cargar la lista.",
    actionError: "La operación no se pudo completar.",
    retry: "Reintentar",
  },
  status: {
    success: "Desplegado",
    failure: "Fallo",
    in_progress: "En curso",
    never_deployed: "Sin estrenar",
    no_deploy_setup: "Sin despliegue",
    unknown: "Desconocido",
  },
  provider: {
    cloudflare: "Cloudflare",
    vercel: "Vercel",
    netlify: "Netlify",
    "github-actions": "Actions",
    "github-pages": "Pages",
    external: "Externo",
    none: "—",
  },
} as const;

export type Locale = "es";
export type Strings = typeof es;

const dictionaries: Record<Locale, Strings> = { es };

export const locale: Locale = "es";
export const t: Strings = dictionaries[locale];
