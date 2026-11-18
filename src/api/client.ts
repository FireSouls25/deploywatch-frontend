import type { TrackedRepoView } from "../domain/status";

async function ensureOk(res: Response) {
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res;
}

async function json<T>(res: Response): Promise<T> {
  return (await ensureOk(res)).json() as Promise<T>;
}

export const api = {
  list: (): Promise<TrackedRepoView[]> =>
    fetch("/api/repos").then(json<TrackedRepoView[]>),
  track: (url: string): Promise<TrackedRepoView> =>
    fetch("/api/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).then(json<TrackedRepoView>),
  check: (id: string): Promise<{ last_check: TrackedRepoView["last_check"] }> =>
    fetch(`/api/repos/${id}/check`, { method: "POST" }).then(
      json<{ last_check: TrackedRepoView["last_check"] }>
    ),
  remove: (id: string): Promise<void> =>
    fetch(`/api/repos/${id}`, { method: "DELETE" })
      .then(ensureOk)
      .then(() => undefined),
};
