import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { TrackedRepoView } from "../../domain/status";
import { formatAge } from "../../domain/time";
import { t } from "../../i18n/es";
import { RepoList } from "./RepoList";

export function Dashboard() {
  const [repos, setRepos] = useState<TrackedRepoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  const refresh = async () => {
    try {
      setRepos(await api.list());
      setFailed(false);
      setError("");
      setNowMs(Date.now());
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const add = async () => {
    if (!url.trim()) return;
    try {
      setError("");
      await api.track(url.trim());
      setUrl("");
      await refresh();
    } catch {
      setError(t.states.actionError);
    }
  };

  const alerts = repos.filter((r) => r.last_check?.needs_attention).length;
  const healthy = repos.filter(
    (r) => r.last_check && !r.last_check.needs_attention
  ).length;
  const sorted = repos
    .map((r) => r.last_check?.checked_at ?? null)
    .filter((v): v is string => v !== null)
    .sort();
  const latest = sorted.length ? sorted[sorted.length - 1] : undefined;

  return (
    <div className="shell">
      <div className="title-row">
        <div>
          <h1>{t.app.title}</h1>
          <p className="scope-line">
            {t.app.scope(repos.length, latest ? formatAge(latest, nowMs) : t.age.never)}
          </p>
        </div>
      </div>

      <section className="kpis" aria-label={t.kpis.tracked}>
        <div className="kpi">
          <p className="label">{t.kpis.tracked}</p>
          <p className="value">{repos.length}</p>
        </div>
        <div className="kpi">
          <p className="label">{t.kpis.attention}</p>
          <p className={`value${alerts ? " bad" : ""}`}>{alerts}</p>
        </div>
        <div className="kpi">
          <p className="label">{t.kpis.healthy}</p>
          <p className="value">{healthy}</p>
        </div>
        <div className="kpi">
          <p className="label">{t.kpis.lastCheck}</p>
          <p className="value">{latest ? formatAge(latest, nowMs) : "—"}</p>
        </div>
      </section>

      {alerts > 0 && <p className="notice">{t.notice.attention(alerts)}</p>}

      <form
        className="track-form"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label htmlFor="repo-url">{t.form.label}</label>
        <div className="track-row">
          <input
            id="repo-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.form.placeholder}
          />
          <button type="submit" className="btn btn-primary">
            {t.form.add}
          </button>
        </div>
      </form>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}

      <div className="list-head">
        <h2>{t.list.title}</h2>
        <span className="count">{t.list.total(repos.length)}</span>
      </div>

      {loading ? (
        <ul className="skeleton" aria-label={t.states.loading}>
          <li />
          <li />
          <li />
        </ul>
      ) : failed ? (
        <div className="state-box">
          <p>{t.states.loadError}</p>
          <button className="btn" onClick={refresh}>
            {t.states.retry}
          </button>
        </div>
      ) : repos.length === 0 ? (
        <div className="state-box">
          <p>{t.states.empty}</p>
          <p>{t.states.emptyHint}</p>
        </div>
      ) : (
        <RepoList repos={repos} onChange={refresh} nowMs={nowMs} />
      )}
    </div>
  );
}
