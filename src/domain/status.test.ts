import { describe, expect, it } from "vitest";
import { badgeFor, needsAttention } from "./status";

describe("status domain", () => {
  it("flags failures and missing setup", () => {
    expect(needsAttention("failure")).toBe(true);
    expect(needsAttention("no_deploy_setup")).toBe(true);
    expect(needsAttention("never_deployed")).toBe(true);
    expect(needsAttention("success")).toBe(false);
    expect(needsAttention("in_progress")).toBe(false);
  });

  it("badges unchecked repos", () => {
    expect(
      badgeFor({ id: "1", full_name: "o/r", url: "", last_check: null })
    ).toContain("Not checked");
  });
});
