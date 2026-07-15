import { getBusinessDisplayName, type BusinessSnapshot } from "./businessSnapshot";

export type GrowthOsAgentId =
  | "intake"
  | "visibility"
  | "fulfillment"
  | "review"
  | "ops"
  | "writer";

export type GrowthOsOrchestratorStage =
  | "reconcile"
  | "plan"
  | "assign"
  | "execute"
  | "verify"
  | "archive";

export type GrowthOsOrchestratorStep = {
  id: string;
  stage: GrowthOsOrchestratorStage;
  owner: GrowthOsAgentId;
  title: string;
  summary: string;
  status: "pending" | "ready" | "blocked";
};

export type GrowthOsOrchestratorSkeleton = {
  businessName: string;
  latestAuditStatus: string;
  steps: GrowthOsOrchestratorStep[];
  notes: string[];
};

export function createGrowthOsOrchestratorSkeleton(snapshot: BusinessSnapshot): GrowthOsOrchestratorSkeleton {
  return {
    businessName: getBusinessDisplayName(snapshot.profile),
    latestAuditStatus: snapshot.summary.latestAuditStatusLabel,
    steps: [
      {
        id: "reconcile-snapshot",
        stage: "reconcile",
        owner: "ops",
        title: "Reconcile business snapshot",
        summary: "Normalize profile, audit, and report state before any agent work starts.",
        status: "ready"
      },
      {
        id: "plan-follow-up",
        stage: "plan",
        owner: "intake",
        title: "Plan the next action",
        summary: "Draft the next customer-safe follow-up from the canonical snapshot.",
        status: "pending"
      },
      {
        id: "assign-fulfillment",
        stage: "assign",
        owner: "fulfillment",
        title: "Assign operational work",
        summary: "Route audit, report, and account tasks to the correct Growth OS agent.",
        status: "pending"
      },
      {
        id: "verify-output",
        stage: "verify",
        owner: "review",
        title: "Verify generated output",
        summary: "Check that every output matches the reconciled snapshot before release.",
        status: "pending"
      },
      {
        id: "archive-audit-trail",
        stage: "archive",
        owner: "writer",
        title: "Archive the execution trail",
        summary: "Persist the decisions, prompts, and approvals into the change log.",
        status: "pending"
      }
    ],
    notes: [
      "This is a skeleton only. Do not attach live agent execution until the validation pass is green.",
      "All future Growth OS agents should read from BusinessSnapshot instead of reaching into raw table rows.",
      `Current package label: ${snapshot.summary.packageLabel}.`
    ]
  };
}
