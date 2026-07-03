with demo_packages as (
  select
    (select id from public.packages where level = 'starter') as starter_package_id,
    (select id from public.packages where level = 'growth') as growth_package_id
  from public.packages
  limit 1
),
demo_clients as (
  insert into public.clients (
    id,
    business_name,
    website_url,
    service_area,
    industry,
    visibility_score,
    booking_url,
    billing_portal_url
  )
  values
    (
      '10000000-0000-4000-8000-000000000101',
      'Oak Street Bakery',
      'https://oakstreetbakery.example',
      'Springfield, IL',
      'Bakery',
      62,
      'https://calendly.com/main-street-media/demo-starter',
      'https://billing.stripe.com/demo-starter'
    ),
    (
      '10000000-0000-4000-8000-000000000102',
      'River City Dental',
      'https://rivercitydental.example',
      'Peoria, IL',
      'Dental',
      84,
      'https://calendly.com/main-street-media/demo-growth',
      'https://billing.stripe.com/demo-growth'
    )
  on conflict (id) do update set
    business_name = excluded.business_name,
    website_url = excluded.website_url,
    service_area = excluded.service_area,
    industry = excluded.industry,
    visibility_score = excluded.visibility_score,
    booking_url = excluded.booking_url,
    billing_portal_url = excluded.billing_portal_url
  returning id
)
insert into public.client_package_access (client_id, package_id)
select '10000000-0000-4000-8000-000000000101', starter_package_id
from demo_packages
where starter_package_id is not null
on conflict (client_id) do update set
  package_id = excluded.package_id,
  assigned_at = now();

with demo_packages as (
  select id as growth_package_id
  from public.packages
  where level = 'growth'
  limit 1
)
insert into public.client_package_access (client_id, package_id)
select '10000000-0000-4000-8000-000000000102', growth_package_id
from demo_packages
where growth_package_id is not null
on conflict (client_id) do update set
  package_id = excluded.package_id,
  assigned_at = now();

insert into public.prospects (
  id,
  business_name,
  website_url,
  service_area,
  industry
)
values (
  '10000000-0000-4000-8000-000000000201',
  'Maple HVAC',
  'https://maplehvac.example',
  'Bloomington, IL',
  'Home services'
)
on conflict (id) do update set
  business_name = excluded.business_name,
  website_url = excluded.website_url,
  service_area = excluded.service_area,
  industry = excluded.industry;

insert into public.audit_requests (
  id,
  business_name,
  website_url,
  service_area,
  industry,
  phone,
  email,
  status,
  notes
)
values (
  '10000000-0000-4000-8000-000000000301',
  'Maple HVAC',
  'https://maplehvac.example',
  'Bloomington, IL',
  'Home services',
  '+15550101010',
  'owner@maplehvac.example',
  'submitted',
  'Demo prospect requesting a local visibility audit.'
)
on conflict (id) do update set
  business_name = excluded.business_name,
  website_url = excluded.website_url,
  service_area = excluded.service_area,
  industry = excluded.industry,
  phone = excluded.phone,
  email = excluded.email,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = now();

insert into public.reports (
  id,
  client_id,
  category_id,
  title,
  summary,
  storage_path,
  required_access,
  report_month
)
select
  gen_random_uuid(),
  client_id,
  category_id,
  client_label || ' - ' || category_name || ' Demo Report',
  'Demo report metadata for ' || category_name || '. Upload the matching file to the reports bucket path shown in storage_path.',
  'demo/' || client_slug || '/' || category_slug || '.pdf',
  required_access,
  date '2026-07-01'
from (
  values
    (
      '10000000-0000-4000-8000-000000000101'::uuid,
      'starter',
      'oak-street-bakery',
      'Oak Street Bakery'
    ),
    (
      '10000000-0000-4000-8000-000000000102'::uuid,
      'growth',
      'river-city-dental',
      'River City Dental'
    )
) as clients(client_id, client_package, client_slug, client_label)
join (
  select
    id as category_id,
    name as category_name,
    required_access,
    lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) as category_slug
  from public.report_categories
) categories on true
where not exists (
  select 1
  from public.reports r
  where r.client_id = clients.client_id
    and r.category_id = categories.category_id
    and r.report_month = date '2026-07-01'
);
