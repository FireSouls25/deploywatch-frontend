import { describe, expect, it } from "vitest";
import { providerLabel } from "./ProviderMark";

describe("providerLabel", () => {
  it("nombra cada proveedor conocido", () => {
    expect(providerLabel("cloudflare")).toBe("Cloudflare");
    expect(providerLabel("vercel")).toBe("Vercel");
    expect(providerLabel("netlify")).toBe("Netlify");
    expect(providerLabel("github-actions")).toBe("Actions");
    expect(providerLabel("github-pages")).toBe("Pages");
    expect(providerLabel("external")).toBe("Externo");
    expect(providerLabel("none")).toBe("—");
  });

  it("devuelve tal cual lo desconocido", () => {
    expect(providerLabel("otro")).toBe("otro");
  });
});
