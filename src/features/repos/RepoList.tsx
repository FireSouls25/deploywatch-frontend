import { useState } from "react";
import { api } from "../../api/client";
import type { DeployOutcome, TrackedRepoView } from "../../domain/status";
import { formatAge } from "../../domain/time";
import { t } from "../../i18n/es";
import { ProviderMark } from "./ProviderMark";

function toneOf(outcome: DeployOutcome | null): string {
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
}

export function RepoList({
  repos,
  onChange,
  nowMs,
}: {
  repos: TrackedRepoView[];
  onChange: () => void;
  nowMs: number;
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

  const remove = async (repo: TrackedRepoView) => {
    if (!window.confirm(t.card.confirmRemove(repo.full_name))) return;
    await api.remove(repo.id);
    onChange();
  };

  return (
    <ul className="repo-list">
      {repos.map((r) => {
        const checkState = r.last_check;
        return (
          <li key={r.id} className="repo-row">
            <div>
              <div className="repo-id">
                <ProviderMark provider={checkState?.provider ?? "none"} />
                <a
                  className="repo-link"
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {r.full_name}
                </a>
                <span className="pill" data-tone={toneOf(checkState?.outcome ?? null)}>
                  {checkState ? t.status[checkState.outcome] : t.card.notChecked}
                </span>
              </div>
              <p className="repo-sub">
                {checkState ? (
                  <>
                    {checkState.message}{" "}
                    {checkState.workflow_name &&
                      !checkState.message.includes(checkState.workflow_name) && (
                        <code>{checkState.workflow_name}</code>
                      )}{" "}
                    {checkState.run_url && (
                      <a
                        className="deploy-link"
                        href={checkState.run_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.card.viewDeploy}
                      </a>
                    )}
                  </>
                ) : (
                  t.card.notChecked
                )}
              </p>
            </div>
            <div className="repo-side">
              <span className="age">
                {formatAge(checkState?.checked_at ?? null, nowMs)}
              </span>
              <div className="row-actions">
                <button
                  className="btn btn-small"
                  onClick={() => check(r.id)}
                  disabled={checking === r.id}
                >
                  {checking === r.id ? t.card.checking : t.card.checkNow}
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => remove(r)}
                >
                  {t.card.remove}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
