export const canonicalPackageIds = ["core", "elite", "agent_workflow_24_7"] as const;

export type CanonicalPackageId = (typeof canonicalPackageIds)[number];
export type PackageType = string | null;

type PackageRank = 1 | 2 | 3;

export type PackageDefinition = {
  id: CanonicalPackageId;
  label: string;
  numericLabel: string;
  legacyAliases: string[];
  rank: PackageRank;
  description: string;
};

export const packageDefinitions: Record<CanonicalPackageId, PackageDefinition> = {
  core: {
    id: "core",
    label: "Core",
    numericLabel: "$197 Visibility",
    legacyAliases: ["Reveal", "197"],
    rank: 1,
    description: "Foundational visibility, audit access, and the core client dashboard surface."
  },
  elite: {
    id: "elite",
    label: "Elite",
    numericLabel: "$297 Growth",
    legacyAliases: ["Evolve", "297"],
    rank: 2,
    description: "Expanded reporting, growth workflows, and the premium client experience."
  },
  agent_workflow_24_7: {
    id: "agent_workflow_24_7",
    label: "Agent Workflow 24/7",
    numericLabel: "$397 Agent Workflow",
    legacyAliases: ["Ascend", "397"],
    rank: 3,
    description: "Highest access tier for internal workflow automation and operational handoff."
  }
};

const packageAliasEntries: Array<readonly [string, CanonicalPackageId]> = Object.entries(packageDefinitions).flatMap(
  ([canonicalId, definition]) => {
    const aliases = [canonicalId, definition.label, definition.numericLabel, ...definition.legacyAliases];
    return aliases.map((alias) => [normalizePackageKey(alias), canonicalId as CanonicalPackageId] as const);
  }
);

const packageAliasLookup = new Map<string, CanonicalPackageId>(packageAliasEntries);

function normalizePackageKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizePackageType(value: PackageType): CanonicalPackageId | null {
  if (!value) return null;
  return packageAliasLookup.get(normalizePackageKey(value)) ?? null;
}

export function getPackageDefinition(packageType: PackageType) {
  const canonicalId = normalizePackageType(packageType);
  return canonicalId ? packageDefinitions[canonicalId] : null;
}

export function packageLabel(packageType: PackageType) {
  return getPackageDefinition(packageType)?.label ?? "Pending Assignment";
}

export function packagePriceLabel(packageType: PackageType) {
  return getPackageDefinition(packageType)?.numericLabel ?? "Pending Assignment";
}

export function canAccessPackage(profilePackage: PackageType, requiredPackage: PackageType) {
  const profileDefinition = getPackageDefinition(profilePackage);
  const requiredDefinition = getPackageDefinition(requiredPackage);

  if (!profileDefinition || !requiredDefinition) return false;
  return profileDefinition.rank >= requiredDefinition.rank;
}
