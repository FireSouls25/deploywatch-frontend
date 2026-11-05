import { describe, expect, it } from "vitest";
import { t } from "./es";

function leaves(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object")
    return Object.values(value).flatMap(leaves);
  return [];
}

describe("diccionario español", () => {
  it("no deja textos vacíos", () => {
    const texts = leaves(t);
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) expect(text.trim()).not.toBe("");
  });

  it("cubre todos los estados y proveedores", () => {
    for (const outcome of [
      "success",
      "failure",
      "in_progress",
      "never_deployed",
      "no_deploy_setup",
      "unknown",
    ] as const)
      expect(t.status[outcome].trim()).not.toBe("");
    for (const provider of [
      "cloudflare",
      "vercel",
      "netlify",
      "github-actions",
      "github-pages",
      "external",
      "none",
    ] as const)
      expect(t.provider[provider].trim()).not.toBe("");
  });

  it("conjuga el aviso según el conteo", () => {
    expect(t.notice.attention(1)).toContain("1 repositorio");
    expect(t.notice.attention(3)).toContain("3 repositorios");
  });
});
