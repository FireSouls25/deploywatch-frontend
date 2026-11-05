import { t } from "../../i18n/es";

export type ProviderId =
  | "cloudflare"
  | "vercel"
  | "netlify"
  | "github-actions"
  | "github-pages"
  | "external"
  | "none";

const LABELS: Record<ProviderId, string> = {
  cloudflare: t.provider.cloudflare,
  vercel: t.provider.vercel,
  netlify: t.provider.netlify,
  "github-actions": t.provider["github-actions"],
  "github-pages": t.provider["github-pages"],
  external: t.provider.external,
  none: t.provider.none,
};

export function providerLabel(provider: string): string {
  return (LABELS as Record<string, string>)[provider] ?? provider;
}

function Mark({ provider }: { provider: ProviderId }) {
  switch (provider) {
    case "cloudflare":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="#f6821f"
            d="M12.5 11.5H5a2.75 2.75 0 0 1-.53-5.45 3.75 3.75 0 0 1 7.33-.85A2.5 2.5 0 0 1 12.5 11.5Z"
          />
        </svg>
      );
    case "vercel":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path fill="#ffffff" d="M8 13.5 2.5 4h11L8 13.5Z" />
        </svg>
      );
    case "netlify":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="#00ad9f"
            d="M8 1.5 14 5v6l-6 3.5L2 11V5l6-3.5Zm0 2.3L3.7 6.1v3.8L8 12.2l4.3-2.3V6.1L8 3.8Z"
          />
        </svg>
      );
    case "github-actions":
    case "github-pages":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="#bdbdc0"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="4.5" cy="4" r="1.8" />
          <circle cx="4.5" cy="12" r="1.8" />
          <circle cx="11.5" cy="8" r="1.8" />
          <path d="M4.5 5.8v4.4M6 7.2c2.5 0 1.5.8 3.7.8" />
        </svg>
      );
    case "external":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="#8a8c92"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M2 8h12M8 2c-4 4-4 8 0 12M8 2c4 4 4 8 0 12" />
        </svg>
      );
    case "none":
      return <span className="dash">—</span>;
  }
}

/** Marca de 16px de la plataforma que desplegó, con su nombre al lado. */
export function ProviderMark({ provider }: { provider: string }) {
  const id = (Object.keys(LABELS) as ProviderId[]).includes(provider as ProviderId)
    ? (provider as ProviderId)
    : "external";
  if (id === "none") {
    return (
      <span className="provider" title={providerLabel(id)} aria-label={providerLabel(id)}>
        <span className="dash">—</span>
      </span>
    );
  }
  return (
    <span className="provider" title={providerLabel(id)} aria-label={providerLabel(id)}>
      <Mark provider={id} />
      {providerLabel(id)}
    </span>
  );
}
