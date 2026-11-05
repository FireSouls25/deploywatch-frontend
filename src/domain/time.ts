import { t } from "../i18n/es";

/** Edad de una comprobación en palabras del producto. nowMs es inyectable. */
export function formatAge(checkedAt: string | null, nowMs: number): string {
  if (!checkedAt) return t.age.never;
  const diffMs = nowMs - new Date(checkedAt).getTime();
  if (Number.isNaN(diffMs)) return t.age.never;
  if (diffMs < 0) return t.age.now;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t.age.now;
  if (minutes < 60) return t.age.minutes(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.age.hours(hours);
  const days = Math.floor(hours / 24);
  if (days < 7) return t.age.days(days);
  return t.age.date(checkedAt);
}
