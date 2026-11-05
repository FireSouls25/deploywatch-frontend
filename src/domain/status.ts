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
  provider: string;
}

export interface TrackedRepoView {
  id: string;
  full_name: string;
  url: string;
  last_check: LastCheck | null;
}

/** Replica la regla del backend: estos resultados generan alerta en la app. */
export function needsAttention(outcome: DeployOutcome): boolean {
  return outcome === "failure" || outcome === "no_deploy_setup" || outcome === "never_deployed";
}
