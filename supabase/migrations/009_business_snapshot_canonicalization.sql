alter table public.profiles
  drop constraint if exists profiles_package_type_check;

alter table public.profiles
  add constraint profiles_package_type_check
  check (
    package_type in (
      'core',
      'elite',
      'agent_workflow_24_7',
      'Reveal',
      'Evolve',
      'Ascend',
      '197',
      '297',
      '397'
    )
  );

alter table public.reports
  drop constraint if exists reports_visibility_package_required_check;

alter table public.reports
  add constraint reports_visibility_package_required_check
  check (
    visibility_package_required in (
      'core',
      'elite',
      'agent_workflow_24_7',
      'Reveal',
      'Evolve',
      'Ascend',
      '197',
      '297',
      '397'
    )
  );
