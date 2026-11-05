import { useState } from "react";
import { api } from "../../api/client";
import type { DeployOutcome, TrackedRepoView } from "../../domain/status";
import { t } from "../../i18n/es";

const toneFor = (outcome: DeployOutcome | null): string => {
  switch (outcome) {
    case "success":
      return "ok";
    case "failure":
    case "never_deployed":
    case "no_deploy_setup":
      return "bad";
    case "in_progress":
      return "warn";
    default:
      return "idle";
  }
};

export function StatusBeacon({ repo }: { repo: TrackedRepoView }) {
  const check = repo.last_check;
  const tone = toneFor(check?.outcome ?? null);
  const label = check ? t.status[check.outcome] : t.card.notChecked;
  return (
    <span
      className={`beacon${check?.needs_attention ? " pulse" : ""}`}
      data-tone={tone}
    >
      <i aria-hidden="true" />
      {label}
    </span>
  );
}

export function RepoList({
  repos,
  onChange,
}: {
  repos: TrackedRepoView[];
  onChange: () => void;
}) {
  const [checking, setChecking] = useState<string | null>(null);

  const check = async (id: string) => {
    setChecking(id);
    try {
      await api.check(id);
      onChange();
    } finally {
      setChecking(null);
    }
  };

  const remove = async (id: string) => {
    await api.remove(id);
    onChange();
  };

  return (
    <ul className="grid">
      {repos.map((r) => {
        const checkState = r.last_check;
        const stateClass = !checkState
          ? ""
          : checkState.needs_attention
            ? "attention"
            : "healthy";
        return (
          <li key={r.id} className={`card ${stateClass}`}>
            <div className="card-head">
              <a
                className="repo-link"
                href={r.url}
                target="_blank"
                rel="noreferrer"
              >
                {r.full_name}
              </a>
              <StatusBeacon repo={r} />
            </div>
            <p className="card-message">
              {checkState ? checkState.message : t.card.notCheckedHint}
            </p>
            <div className="card-meta">
              {checkState?.workflow_name && (
                <span>
                  {t.card.origin}: <code>{checkState.workflow_name}</code>
                </span>
              )}
              {checkState?.run_url && (
                <a
                  className="deploy-link"
                  href={checkState.run_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.card.viewDeploy} →
                </a>
              )}
            </div>
            <div className="card-actions">
              <button
                className="btn btn-small"
                onClick={() => check(r.id)}
                disabled={checking === r.id}
              >
                {checking === r.id ? t.card.checking : t.card.checkNow}
              </button>
              <button
                className="btn btn-small btn-danger"
                onClick={() => remove(r.id)}
              >
                {t.card.remove}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
