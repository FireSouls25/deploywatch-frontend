import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./client";

function mockFetch(status: number, body: unknown = null) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === null ? null : JSON.stringify(body), { status })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("api client", () => {
  it("track envía la URL como JSON", async () => {
    const fetchMock = mockFetch(201, { id: "1", full_name: "octo/repo" });

    const created = await api.track("octo/repo");

    expect(created.id).toBe("1");
    const [path, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(path).toBe("/api/repos");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ url: "octo/repo" });
  });

  it.each([
    ["list", () => api.list(), 500],
    ["track", () => api.track("x"), 400],
    ["check", () => api.check("1"), 502],
    ["remove", () => api.remove("1"), 404],
  ])("%s rechaza cuando la API responde un error", async (_name, call, status) => {
    mockFetch(status, { detail: "error" });

    await expect(call()).rejects.toThrow(`HTTP ${status}`);
  });

  it("remove resuelve sin cuerpo con 204", async () => {
    mockFetch(204);

    await expect(api.remove("1")).resolves.toBeUndefined();
  });
});
