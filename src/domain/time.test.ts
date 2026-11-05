import { describe, expect, it } from "vitest";
import { formatAge } from "./time";

const NOW = new Date("2026-11-05T12:00:00Z").getTime();
const iso = (minsAgo: number) =>
  new Date(NOW - minsAgo * 60_000).toISOString();

describe("formatAge", () => {
  it("usa minutos, horas y días", () => {
    expect(formatAge(iso(0), NOW)).toBe("ahora mismo");
    expect(formatAge(iso(5), NOW)).toBe("hace 5 min");
    expect(formatAge(iso(180), NOW)).toBe("hace 3 h");
    expect(formatAge(iso(60 * 30), NOW)).toBe("ayer");
    expect(formatAge(iso(60 * 50), NOW)).toBe("hace 2 días");
  });

  it("pone fecha a lo antiguo y raya a lo ausente", () => {
    expect(formatAge(iso(60 * 24 * 10), NOW)).toBe("el 2026-10-26");
    expect(formatAge(null, NOW)).toBe("—");
    expect(formatAge("no-fecha", NOW)).toBe("—");
  });

  it("un reloj adelantado cuenta como ahora mismo", () => {
    expect(formatAge(new Date(NOW + 60_000).toISOString(), NOW)).toBe(
      "ahora mismo"
    );
  });
});
