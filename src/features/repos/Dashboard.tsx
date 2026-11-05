import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { TrackedRepoView } from "../../domain/status";
import { RepoList } from "./RepoList";

export function Dashboard() {
  const [repos, setRepos] = useState<TrackedRepoView[]>([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const refresh = () => api.list().then(setRepos).catch((e) => setError(String(e)));
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    try {
      setError("");
      await api.track(url);
      setUrl("");
      await refresh();
    } catch (e) { setError(String(e)); }
  };

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>DeployWatch</h1>
      <p>Paste any public repo URL. On-demand check reports deploy setup + last result.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          style={{ flex: 1 }}
        />
        <button onClick={add}>Track</button>
      </div>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      <RepoList repos={repos} onChange={refresh} />
    </main>
  );
}
