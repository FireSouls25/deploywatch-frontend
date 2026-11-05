import type { TrackedRepoView } from "../domain/status";

async function json(res: Response) {
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  list: (): Promise<TrackedRepoView[]> =>
    fetch("/api/repos").then(json),
  track: (url: string): Promise<TrackedRepoView> =>
    fetch("/api/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).then(json),
  check: (id: string): Promise<{ last_check: TrackedRepoView["last_check"] }> =>
    fetch(`/api/repos/${id}/check`, { method: "POST" }).then(json),
  remove: (id: string): Promise<void> =>
    fetch(`/api/repos/${id}`, { method: "DELETE" }).then(() => undefined),
};
