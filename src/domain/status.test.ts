import { describe, expect, it } from "vitest";
import { needsAttention } from "./status";

describe("regla de alerta del dominio", () => {
  it("marca fallos y falta de despliegue", () => {
    expect(needsAttention("failure")).toBe(true);
    expect(needsAttention("no_deploy_setup")).toBe(true);
    expect(needsAttention("never_deployed")).toBe(true);
    expect(needsAttention("success")).toBe(false);
    expect(needsAttention("in_progress")).toBe(false);
    expect(needsAttention("unknown")).toBe(false);
  });
});
