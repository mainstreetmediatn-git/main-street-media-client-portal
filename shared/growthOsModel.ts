import {
  canAccessPackage,
  getPackageDefinition,
  packageLabel,
  type CanonicalPackageId,
  type PackageType
} from "./packageCatalog";

export const GROWTH_OS_PHASES = ["Production", "MVP", "In Progress", "Roadmap"] as const;

export const GROWTH_OS_LIFECYCLE_STAGES = [
  "lead",
  "visibility_audit",
  "proposal",
  "payment",
  "customer_provisioning",
  "project_creation",
  "task_expansion",
  "ai_agent_provisioning",
  "implementation",
  "qa",
  "launch",
  "monthly_services",
  "renewal"
] as const;

export type GrowthOsPhase = (typeof GROWTH_OS_PHASES)[number];
export type GrowthOsLifecycleStage = (typeof GROWTH_OS_LIFECYCLE_STAGES)[number];

export type GrowthOsLifecycleStageDefinition = {
  id: GrowthOsLifecycleStage;
  label: string;
  phase: GrowthOsPhase;
  implemented: boolean;
  description: string;
  upstream?: GrowthOsLifecycleStage | null;
  downstream?: GrowthOsLifecycleStage | null;
};

export const growthOsLifecycle: GrowthOsLifecycleStageDefinition[] = [
  { id: "lead", label: "Lead", phase: "Production", implemented: true, description: "A prospect enters through signup, inbound sales, or manual intake.", downstream: "visibility_audit" },
  { id: "visibility_audit", label: "Visibility Audit", phase: "Production", implemented: true, description: "The customer submits or receives an audit request and the portal records it.", upstream: "lead", downstream: "proposal" },
  { id: "proposal", label: "Proposal", phase: "MVP", implemented: false, description: "Sales packages and scopes are prepared for customer approval.", upstream: "visibility_audit", downstream: "payment" },
  { id: "payment", label: "Payment", phase: "MVP", implemented: false, description: "A verified payment should activate downstream provisioning and package access.", upstream: "proposal", downstream: "customer_provisioning" },
  { id: "customer_provisioning", label: "Customer Provisioning", phase: "MVP", implemented: false, description: "Create the customer record, workspace, knowledge base, and portal access.", upstream: "payment", downstream: "project_creation" },
  { id: "project_creation", label: "Project Creation", phase: "In Progress", implemented: false, description: "Create implementation work and operational tracking for the customer.", upstream: "customer_provisioning", downstream: "task_expansion" },
  { id: "task_expansion", label: "Task Expansion", phase: "In Progress", implemented: false, description: "Expand the purchased package into task templates and dependencies.", upstream: "project_creation", downstream: "ai_agent_provisioning" },
  { id: "ai_agent_provisioning", label: "AI Agent Provisioning", phase: "In Progress", implemented: false, description: "Provision managed agents inside the platform when the package requires them.", upstream: "task_expansion", downstream: "implementation" },
  { id: "implementation", label: "Implementation", phase: "Roadmap", implemented: false, description: "Execute the scoped work required to deliver the customer outcome.", upstream: "ai_agent_provisioning", downstream: "qa" },
  { id: "qa", label: "QA", phase: "Roadmap", implemented: false, description: "Validate outputs before customer delivery.", upstream: "implementation", downstream: "launch" },
  { id: "launch", label: "Launch", phase: "Roadmap", implemented: false, description: "Deliver the approved work and mark the customer ready for recurring service.", upstream: "qa", downstream: "monthly_services" },
  { id: "monthly_services", label: "Monthly Services", phase: "Roadmap", implemented: false, description: "Run recurring fulfillment, monitoring, reporting, and recommendations.", upstream: "launch", downstream: "renewal" },
  { id: "renewal", label: "Renewal", phase: "Roadmap", implemented: false, description: "Renew, expand, or suspend the customer lifecycle based on value and health.", upstream: "monthly_services", downstream: null }
];

export type GrowthOsLifecycleTransition = {
  from: GrowthOsLifecycleStage;
  to: GrowthOsLifecycleStage;
  trigger: string;
  humanApprovalRequired: boolean;
  phase: GrowthOsPhase;
};

export const growthOsLifecycleTransitions: GrowthOsLifecycleTransition[] = [
  { from: "lead", to: "visibility_audit", trigger: "signup or audit request", humanApprovalRequired: false, phase: "Production" },
  { from: "visibility_audit", to: "proposal", trigger: "sales review complete", humanApprovalRequired: true, phase: "MVP" },
  { from: "proposal", to: "payment", trigger: "customer accepts proposal", humanApprovalRequired: true, phase: "MVP" },
  { from: "payment", to: "customer_provisioning", trigger: "verified payment event", humanApprovalRequired: false, phase: "MVP" },
  { from: "customer_provisioning", to: "project_creation", trigger: "workspace and package ready", humanApprovalRequired: false, phase: "In Progress" },
  { from: "project_creation", to: "task_expansion", trigger: "project created", humanApprovalRequired: false, phase: "In Progress" },
  { from: "task_expansion", to: "ai_agent_provisioning", trigger: "package requires managed agents", humanApprovalRequired: true, phase: "In Progress" },
  { from: "ai_agent_provisioning", to: "implementation", trigger: "agents provisioned", humanApprovalRequired: true, phase: "Roadmap" },
  { from: "implementation", to: "qa", trigger: "work complete", humanApprovalRequired: true, phase: "Roadmap" },
  { from: "qa", to: "launch", trigger: "qa approved", humanApprovalRequired: true, phase: "Roadmap" },
  { from: "launch", to: "monthly_services", trigger: "customer delivery complete", humanApprovalRequired: false, phase: "Roadmap" },
  { from: "monthly_services", to: "renewal", trigger: "billing cycle or renewal window", humanApprovalRequired: false, phase: "Roadmap" }
];

export type GrowthOsRole = "intake" | "ops" | "fulfillment" | "review" | "writer" | "agent" | "customer";
export type GrowthOsPriority = "low" | "normal" | "high" | "critical";

export type GrowthOsTaskTemplate = {
  id: string;
  title: string;
  description: string;
  owner: GrowthOsRole;
  assignedAgent: string | null;
  humanReviewer: string | null;
  priority: GrowthOsPriority;
  dependencies: string[];
  qaRequired: boolean;
  outputs: string[];
};

export type GrowthOsPackageWorkflow = {
  packageId: CanonicalPackageId;
  label: string;
  phase: GrowthOsPhase;
  includesManagedAgents: boolean;
  tasks: GrowthOsTaskTemplate[];
};

const coreWorkflow: GrowthOsTaskTemplate[] = [
  { id: "activate-customer-workspace", title: "Activate customer workspace", description: "Create or unlock the customer-facing workspace after successful payment.", owner: "ops", assignedAgent: null, humanReviewer: "ops", priority: "critical", dependencies: [], qaRequired: true, outputs: ["workspace", "portal-access"] },
  { id: "create-implementation-project", title: "Create implementation project", description: "Create the delivery project that tracks the paid-pilot work.", owner: "ops", assignedAgent: null, humanReviewer: "ops", priority: "high", dependencies: ["activate-customer-workspace"], qaRequired: true, outputs: ["project", "project-history"] },
  { id: "seed-business-snapshot", title: "Seed BusinessSnapshot", description: "Initialize the canonical customer state used by the dashboard and mobile app.", owner: "ops", assignedAgent: null, humanReviewer: "ops", priority: "high", dependencies: ["create-implementation-project"], qaRequired: true, outputs: ["business-snapshot", "audit-history"] },
  { id: "generate-core-workflow", title: "Generate core workflow tasks", description: "Expand the purchased package into the standard implementation template.", owner: "fulfillment", assignedAgent: "agent", humanReviewer: "review", priority: "high", dependencies: ["seed-business-snapshot"], qaRequired: true, outputs: ["task-plan", "delivery-checklist"] }
];

const eliteWorkflow: GrowthOsTaskTemplate[] = [
  { id: "add-elite-workflow", title: "Add Elite-specific tasks", description: "Extend the core workflow with growth reporting and deeper visibility work.", owner: "fulfillment", assignedAgent: "agent", humanReviewer: "review", priority: "high", dependencies: ["generate-core-workflow"], qaRequired: true, outputs: ["elite-task-set", "growth-plan"] },
  { id: "prepare-performance-reports", title: "Prepare performance reports", description: "Create the monthly reporting and recommendation bundle for the customer.", owner: "writer", assignedAgent: "agent", humanReviewer: "review", priority: "normal", dependencies: ["add-elite-workflow"], qaRequired: true, outputs: ["report-plan", "recommendations"] }
];

const agentWorkflow: GrowthOsTaskTemplate[] = [
  { id: "provision-managed-agents", title: "Provision managed agents", description: "Create platform-managed AI agents for the customer workspace.", owner: "agent", assignedAgent: "agent", humanReviewer: "ops", priority: "critical", dependencies: ["add-elite-workflow"], qaRequired: true, outputs: ["agent-workspace", "agent-records"] },
  { id: "initialize-agent-memory", title: "Initialize agent memory", description: "Seed the customer-specific memory store with approved operational context.", owner: "agent", assignedAgent: "agent", humanReviewer: "ops", priority: "high", dependencies: ["provision-managed-agents"], qaRequired: true, outputs: ["memory-store", "memory-policy"] },
  { id: "install-workflow-library", title: "Install workflow library", description: "Attach the package-specific workflow template library to the workspace.", owner: "agent", assignedAgent: "agent", humanReviewer: "fulfillment", priority: "high", dependencies: ["initialize-agent-memory"], qaRequired: true, outputs: ["workflow-library", "task-templates"] },
  { id: "configure-integrations", title: "Configure integrations", description: "Wire in approved integrations needed for implementation and recurring service.", owner: "agent", assignedAgent: "agent", humanReviewer: "ops", priority: "high", dependencies: ["install-workflow-library"], qaRequired: true, outputs: ["integration-map", "activation-log"] },
  { id: "qa-and-launch", title: "QA and launch", description: "Run QA gates and release the customer into the live service workflow.", owner: "review", assignedAgent: null, humanReviewer: "review", priority: "critical", dependencies: ["configure-integrations"], qaRequired: true, outputs: ["qa-approval", "launch-record"] }
];

export const packageWorkflows: Record<CanonicalPackageId, GrowthOsPackageWorkflow> = {
  core: { packageId: "core", label: packageLabel("core"), phase: "MVP", includesManagedAgents: false, tasks: coreWorkflow },
  elite: { packageId: "elite", label: packageLabel("elite"), phase: "In Progress", includesManagedAgents: false, tasks: [...coreWorkflow, ...eliteWorkflow] },
  agent_workflow_24_7: {
    packageId: "agent_workflow_24_7",
    label: packageLabel("agent_workflow_24_7"),
    phase: "Roadmap",
    includesManagedAgents: true,
    tasks: [...coreWorkflow, ...eliteWorkflow, ...agentWorkflow]
  }
};

export type GrowthOsOperationsQueue =
  | "today_projects"
  | "implementation_queue"
  | "ai_queue"
  | "human_queue"
  | "blocked_tasks"
  | "qa_queue"
  | "launch_queue"
  | "customer_health"
  | "renewals"
  | "agent_health"
  | "system_health";

export const operationsQueues: Array<{ id: GrowthOsOperationsQueue; label: string; phase: GrowthOsPhase }> = [
  { id: "today_projects", label: "Today's Projects", phase: "In Progress" },
  { id: "implementation_queue", label: "Implementation Queue", phase: "In Progress" },
  { id: "ai_queue", label: "AI Queue", phase: "In Progress" },
  { id: "human_queue", label: "Human Queue", phase: "In Progress" },
  { id: "blocked_tasks", label: "Blocked Tasks", phase: "In Progress" },
  { id: "qa_queue", label: "QA Queue", phase: "Roadmap" },
  { id: "launch_queue", label: "Launch Queue", phase: "Roadmap" },
  { id: "customer_health", label: "Customer Health", phase: "Roadmap" },
  { id: "renewals", label: "Renewals", phase: "Roadmap" },
  { id: "agent_health", label: "Agent Health", phase: "Roadmap" },
  { id: "system_health", label: "System Health", phase: "Roadmap" }
];

export const customerKnowledgeSections = [
  "website",
  "services",
  "faqs",
  "pricing",
  "documents",
  "branding",
  "policies",
  "hours",
  "uploaded_files",
  "generated_audits",
  "implementation_history",
  "future_reports"
] as const;

export function buildPackageWorkflow(packageType: PackageType): GrowthOsPackageWorkflow | null {
  const canonicalId = packageType ? getPackageDefinition(packageType)?.id ?? null : null;
  if (!canonicalId) return null;
  return packageWorkflows[canonicalId];
}

export function buildWorkflowTaskIds(packageType: PackageType): string[] {
  return buildPackageWorkflow(packageType)?.tasks.map((task) => task.id) ?? [];
}

export function canPackageAdvance(fromPackage: PackageType, toPackage: PackageType) {
  return canAccessPackage(fromPackage, toPackage);
}
