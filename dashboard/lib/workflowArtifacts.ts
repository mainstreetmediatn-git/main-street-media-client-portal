import { canonicalPackageIds, packageDefinitions, type CanonicalPackageId } from "./packages";

export const reportCatalog: Array<{
  type: string;
  label: string;
  requiredPackage: CanonicalPackageId;
  description: string;
}> = [
  {
    type: "visibility_audit",
    label: "Visibility Audit",
    requiredPackage: "core",
    description: "Your snapshot of local visibility gaps and near-term wins."
  },
  {
    type: "google_business_profile",
    label: "Google Business Profile Report",
    requiredPackage: "core",
    description: "How your GBP presence is helping or holding back local discovery."
  },
  {
    type: "local_seo",
    label: "Local SEO Report",
    requiredPackage: "elite",
    description: "Local rankings, location signals, citations, and search opportunity."
  },
  {
    type: "website_conversion",
    label: "Website / Conversion Report",
    requiredPackage: "elite",
    description: "Website clarity, trust, lead capture, and conversion recommendations."
  },
  {
    type: "reputation_review",
    label: "Reputation / Review Report",
    requiredPackage: "elite",
    description: "Review growth, response quality, rating signals, and reputation risk."
  },
  {
    type: "custom",
    label: "Additional Assigned Reports",
    requiredPackage: "agent_workflow_24_7",
    description: "Special reports and workflow artifacts assigned by Main Street Media Co."
  }
];

export const packageWorkflowCards = canonicalPackageIds.map((id) => {
  const definition = packageDefinitions[id];

  return {
    ...definition,
    aliases: [definition.label, definition.numericLabel, ...definition.legacyAliases]
  };
});

export const callSheetSections = [
  {
    title: "Package mapping",
    items: packageWorkflowCards.map(
      (pkg) => `${pkg.label} maps to canonical id ${pkg.id}. Legacy aliases remain compatibility only: ${pkg.aliases.join(", ")}.`
    )
  },
  {
    title: "Access model",
    items: [
      "Core unlocks the foundational dashboard and visibility artifacts.",
      "Elite inherits Core access and opens the growth report set.",
      "Agent Workflow 24/7 inherits every client artifact and is reserved for internal operations."
    ]
  },
  {
    title: "Protected surfaces",
    items: [
      "The internal call sheet is rendered only after server-side authentication.",
      "Anonymous visitors are redirected before the content is streamed.",
      "The HTML source stays in the dashboard app tree, not the public folder."
    ]
  },
  {
    title: "Operational notes",
    items: [
      "Keep package assignment in Supabase tied to canonical ids going forward.",
      "Existing numeric records and Reveal / Evolve / Ascend aliases still normalize correctly for reads.",
      "Use the dashboard shell for web customer-facing pages, the Flutter companion app for mobile access, and this call sheet for operator handoff."
    ]
  }
];
