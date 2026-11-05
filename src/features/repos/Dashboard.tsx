import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { TrackedRepoView } from "../../domain/status";
import { t } from "../../i18n/es";
import { RepoList } from "./RepoList";

export function Dashboard() {
  const [repos, setRepos] = useState<TrackedRepoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setRepos(await api.list());
      setError("");
    } catch {
      setError(t.states.loadError);
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

  return (
    <div className="shell">
      <header className="topbar">
        <h1 className="logo">
          Deploy<span className="dot">Watch</span>
        </h1>
      </header>
      <p className="subtitle">{t.app.subtitle}</p>

      <section className="summary" aria-live="polite">
        <div className="stat">
          <b>{repos.length}</b>
          <span>{t.summary.tracked}</span>
        </div>
        <div className={`stat ${alerts ? "alert" : ""}`}>
          <b>{alerts}</b>
          <span>{t.summary.attention}</span>
        </div>
        <div className="stat ok">
          <b>{healthy}</b>
          <span>{t.summary.healthy}</span>
        </div>
        {!loading && repos.length > 0 && (
          <p className={`banner ${alerts ? "alert" : "clear"}`}>
            {alerts ? t.summary.attentionBanner(alerts) : t.summary.allClear}
          </p>
        )}
      </section>

      <form
        className="track-form"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.form.placeholder}
          aria-label={t.form.label}
        />
        <button type="submit" className="btn btn-primary">
          {t.form.add}
        </button>
      </form>
      {error && (
        <p role="alert" className="alert-error">
          {error}
        </p>
      )}

      {loading ? (
        <div className="state-box">
          <p>{t.states.loading}</p>
        </div>
      ) : repos.length === 0 ? (
        <div className="state-box">
          <p>{t.states.empty}</p>
          <p>{t.states.emptyHint}</p>
        </div>
      ) : (
        <RepoList repos={repos} onChange={refresh} />
      )}

      <footer className="footer">{t.footer.note}</footer>
    </div>
  );
}
