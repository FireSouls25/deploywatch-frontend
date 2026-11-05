export type DeployOutcome =
  | "success"
  | "failure"
  | "in_progress"
  | "never_deployed"
  | "no_deploy_setup"
  | "unknown";

export interface LastCheck {
  outcome: DeployOutcome;
  message: string;
  workflow_name: string | null;
  run_url: string | null;
  checked_at: string;
  needs_attention: boolean;
}

export interface TrackedRepoView {
  id: string;
  full_name: string;
  url: string;
  last_check: LastCheck | null;
}

/** Mirrors backend domain rule: which outcomes raise an in-app alert. */
export function needsAttention(outcome: DeployOutcome): boolean {
  return outcome === "failure" || outcome === "no_deploy_setup" || outcome === "never_deployed";
}

export function badgeFor(repo: TrackedRepoView): string {
  if (!repo.last_check) return "Not checked yet — press Check now.";
  return repo.last_check.message;
}
