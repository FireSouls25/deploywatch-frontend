import { api } from "../../api/client";
import type { TrackedRepoView } from "../../domain/status";

export function StatusBadge({ repo }: { repo: TrackedRepoView }) {
  const check = repo.last_check;
  const color = !check ? "gray" : check.needs_attention ? "crimson" : "green";
  const text = !check ? "NOT CHECKED" : check.outcome.toUpperCase();
  return (
    <span style={{ color, border: `1px solid ${color}`, padding: "2px 8px", borderRadius: 12 }}>
      {check?.needs_attention ? "🔔 " : ""}{text}
    </span>
  );
}

export function RepoList({ repos, onChange }: { repos: TrackedRepoView[]; onChange: () => void }) {
  const check = async (id: string) => { await api.check(id); onChange(); };
  const remove = async (id: string) => { await api.remove(id); onChange(); };

  if (!repos.length) return <p>No repos tracked yet.</p>;
  return (
    <ul>
      {repos.map((r) => (
        <li key={r.id} style={{ margin: "12px 0" }}>
          <a href={r.url} target="_blank" rel="noreferrer">{r.full_name}</a>{" "}
          <StatusBadge repo={r} />
          <p>{r.last_check?.message ?? "Press Check now."}</p>
          <button onClick={() => check(r.id)}>Check now</button>{" "}
          <button onClick={() => remove(r.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
