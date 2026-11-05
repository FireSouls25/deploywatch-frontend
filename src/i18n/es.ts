/** Único idioma por ahora: español. Estructura lista para más locales. */
export const es = {
  app: {
    title: "DeployWatch",
    subtitle:
      "Registra cualquier repositorio público de GitHub y comprueba bajo demanda si tiene despliegue configurado y si el último fue exitoso.",
  },
  summary: {
    tracked: "rastreados",
    attention: "con alerta",
    healthy: "sanos",
    attentionBanner: (n: number) =>
      n === 1
        ? "1 repositorio necesita tu atención."
        : `${n} repositorios necesitan tu atención.`,
    allClear: "Todo desplegando sin novedad.",
  },
  form: {
    placeholder: "https://github.com/propietario/repo",
    add: "Rastrear",
    label: "URL o propietario/repo del repositorio público",
  },
  card: {
    checkNow: "Comprobar ahora",
    checking: "Comprobando…",
    remove: "Eliminar",
    viewDeploy: "Ver despliegue",
    notChecked: "Sin comprobar",
    notCheckedHint: "Pulsa «Comprobar ahora» para consultar GitHub.",
    origin: "Origen",
  },
  states: {
    loading: "Cargando repositorios…",
    empty: "Aún no rastreas ningún repositorio.",
    emptyHint: "Pega arriba la URL de un repo público para empezar.",
    loadError: "No se pudo cargar la lista.",
    actionError: "La operación no se pudo completar.",
  },
  status: {
    success: "Desplegado",
    failure: "Fallo",
    in_progress: "En curso",
    never_deployed: "Nunca desplegado",
    no_deploy_setup: "Sin despliegue",
    unknown: "Desconocido",
  },
  footer: {
    note: "Lee workflows, deployments (Cloudflare, Vercel, Netlify…) y environments directamente de la API de GitHub.",
  },
} as const;

export type Locale = "es";
export type Strings = typeof es;

const dictionaries: Record<Locale, Strings> = { es };

export const locale: Locale = "es";
export const t: Strings = dictionaries[locale];
