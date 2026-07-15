const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const typescript = require('typescript');

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  } catch (error) {
    if (!request.startsWith('.') && !request.startsWith('/')) {
      throw error;
    }

    for (const extension of ['.ts', '.tsx']) {
      try {
        return originalResolveFilename.call(this, `${request}${extension}`, parent, isMain, options);
      } catch (extensionError) {
        void extensionError;
      }
    }

    throw error;
  }
};

Module._extensions['.ts'] = function compileTypeScript(module, filename) {
  const source = readFileSync(filename, 'utf8');
  const output = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
      esModuleInterop: true
    },
    fileName: filename
  }).outputText;

  module._compile(output, filename);
};

const contracts = require('../lib/businessSnapshotContracts.ts');
const packages = require('../lib/packages.ts');
const workflowArtifacts = require('../lib/workflowArtifacts.ts');
const growthOsModel = require('../lib/growthOsModel.ts');

const contractsSource = readFileSync(path.join(__dirname, '..', 'lib', 'businessSnapshotContracts.ts'), 'utf8');
const migrationSource = readFileSync(
  path.join(__dirname, '..', '..', 'supabase', 'migrations', '009_business_snapshot_canonicalization.sql'),
  'utf8'
);
const reportPolicySource = readFileSync(
  path.join(__dirname, '..', '..', 'supabase', 'migrations', '011_fix_report_access_policy.sql'),
  'utf8'
);
const growthOsModelSource = readFileSync(path.join(__dirname, '..', '..', 'shared', 'growthOsModel.ts'), 'utf8');

test('business snapshot contracts keep the versioned event envelope stable', () => {
  assert.equal(contracts.BUSINESS_SNAPSHOT_VERSION, 1);

  for (const value of [
    'profiles',
    'audit_requests',
    'customer_reports',
    'reports',
    'business_snapshot.built',
    'business_snapshot.reconciled',
    'business_snapshot.scorecard.computed',
    'business_snapshot.audit_requests.normalized',
    'business_snapshot.reports.normalized',
    'profile_completeness',
    'audit_activity',
    'report_access',
    'package_alignment'
  ]) {
    assert.match(contractsSource, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(contractsSource, /snapshotVersion: BusinessSnapshotVersion/);
  assert.match(contractsSource, /origin: BusinessSnapshotOrigin/);
});

test('package catalog and workflow artifacts stay aligned with canonical ids', () => {
  assert.deepEqual(packages.canonicalPackageIds, ['core', 'elite', 'agent_workflow_24_7']);

  assert.equal(packages.normalizePackageType('Reveal'), 'core');
  assert.equal(packages.normalizePackageType('197'), 'core');
  assert.equal(packages.normalizePackageType('Evolve'), 'elite');
  assert.equal(packages.normalizePackageType('297'), 'elite');
  assert.equal(packages.normalizePackageType('Ascend'), 'agent_workflow_24_7');
  assert.equal(packages.normalizePackageType('397'), 'agent_workflow_24_7');

  assert.equal(packages.canAccessPackage('elite', 'core'), true);
  assert.equal(packages.canAccessPackage('core', 'elite'), false);
  assert.equal(packages.canAccessPackage('agent_workflow_24_7', 'elite'), true);

  assert.equal(workflowArtifacts.reportCatalog.length, 6);
  assert.deepEqual(
    workflowArtifacts.reportCatalog.map((entry) => entry.type),
    [
      'visibility_audit',
      'google_business_profile',
      'local_seo',
      'website_conversion',
      'reputation_review',
      'custom'
    ]
  );
  assert.deepEqual(
    [...new Set(workflowArtifacts.reportCatalog.map((entry) => entry.requiredPackage))],
    ['core', 'elite', 'agent_workflow_24_7']
  );

  assert.equal(workflowArtifacts.packageWorkflowCards.length, 3);
  for (const card of workflowArtifacts.packageWorkflowCards) {
    assert.ok(card.aliases.includes(card.label));
    assert.ok(card.aliases.includes(card.numericLabel));
    for (const alias of card.legacyAliases) {
      assert.ok(card.aliases.includes(alias));
    }
  }

  for (const alias of [
    'core',
    'elite',
    'agent_workflow_24_7',
    'Reveal',
    'Evolve',
    'Ascend',
    '197',
    '297',
    '397'
  ]) {
    assert.ok(migrationSource.includes(`'${alias}'`));
  }
});

test('report access policy preserves canonical package rank ordering', () => {
  assert.match(reportPolicySource, /private\.package_access_rank/);
  for (const alias of ['core', 'elite', 'agent_workflow_24_7', 'Reveal', 'Evolve', 'Ascend', '197', '297', '397']) {
    assert.ok(reportPolicySource.includes(`'${alias}'`));
  }
  assert.ok(reportPolicySource.includes('coalesce(private.package_access_rank(p.package_type), 0) >= coalesce(private.package_access_rank(reports.visibility_package_required), 0)'));
});

test('growth os lifecycle and workflow model stays aligned with package tiers', () => {
  assert.deepEqual(growthOsModel.GROWTH_OS_PHASES, ['Production', 'MVP', 'In Progress', 'Roadmap']);
  assert.deepEqual(growthOsModel.GROWTH_OS_LIFECYCLE_STAGES, [
    'lead',
    'visibility_audit',
    'proposal',
    'payment',
    'customer_provisioning',
    'project_creation',
    'task_expansion',
    'ai_agent_provisioning',
    'implementation',
    'qa',
    'launch',
    'monthly_services',
    'renewal'
  ]);

  assert.deepEqual(growthOsModel.buildWorkflowTaskIds('core'), [
    'activate-customer-workspace',
    'create-implementation-project',
    'seed-business-snapshot',
    'generate-core-workflow'
  ]);

  assert.deepEqual(growthOsModel.buildWorkflowTaskIds('elite'), [
    'activate-customer-workspace',
    'create-implementation-project',
    'seed-business-snapshot',
    'generate-core-workflow',
    'add-elite-workflow',
    'prepare-performance-reports'
  ]);

  assert.deepEqual(growthOsModel.buildWorkflowTaskIds('agent_workflow_24_7'), [
    'activate-customer-workspace',
    'create-implementation-project',
    'seed-business-snapshot',
    'generate-core-workflow',
    'add-elite-workflow',
    'prepare-performance-reports',
    'provision-managed-agents',
    'initialize-agent-memory',
    'install-workflow-library',
    'configure-integrations',
    'qa-and-launch'
  ]);

  assert.equal(growthOsModel.buildPackageWorkflow('core')?.includesManagedAgents, false);
  assert.equal(growthOsModel.buildPackageWorkflow('agent_workflow_24_7')?.includesManagedAgents, true);
  assert.equal(growthOsModel.canPackageAdvance('agent_workflow_24_7', 'elite'), true);
  assert.equal(growthOsModel.canPackageAdvance('core', 'elite'), false);
  assert.match(growthOsModelSource, /customer_provisioning/);
  assert.match(growthOsModelSource, /growthOsLifecycleTransitions/);
});
