-- MAIN STREET MEDIA BILLING ENGINE
-- No PAN, CVC, PIN, magnetic-stripe data, hosted-field payloads, or raw processor
-- payloads are stored in this schema. Those stay with the approved processor.

-- Earlier checkout code retained complete webhook payloads in this convenience
-- column. Redact it before new billing writes are accepted.
update public.billing_events set payload = '{}'::jsonb where payload <> '{}'::jsonb;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('customer', 'staff', 'billing_manager', 'admin'));

create or replace function private.is_billing_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role in ('staff', 'billing_manager', 'admin')
  );
$$;

revoke all on function private.is_billing_staff() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_billing_staff() to authenticated;

create table public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  invoice_number text not null unique,
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'void', 'uncollectible', 'refunded')),
  currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  due_at timestamptz,
  paid_at timestamptz,
  provider text,
  provider_invoice_id text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.billing_invoices(id) on delete cascade,
  package_id text not null,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount_cents integer not null check (unit_amount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  invoice_id uuid references public.billing_invoices(id) on delete set null,
  provider text not null,
  provider_payment_id text unique,
  idempotency_key text not null unique,
  purchase_type text not null check (purchase_type in ('one_time', 'deposit', 'subscription', 'payment_plan')),
  payment_method_type text check (payment_method_type in ('card', 'us_bank_account')),
  outcome text not null check (outcome in ('AUTHORIZED', 'DECLINED', 'REQUIRES_AUTHENTICATION', 'INSUFFICIENT_FUNDS', 'INCORRECT_CVC', 'EXPIRED_CARD', 'PROCESSING_ERROR')),
  status text not null check (status in ('pending', 'authorized', 'paid', 'failed', 'refunded')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  authorization_at timestamptz,
  captured_at timestamptz,
  public_message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Internal-only details are separated so customers can never read processor codes
-- or reconciliation data through the public Data API.
create table public.billing_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.billing_payments(id) on delete cascade,
  provider_event_id text unique,
  processor_code text,
  processor_request_id text,
  internal_message text not null,
  reconciliation_status text not null default 'not_required' check (reconciliation_status in ('not_required', 'pending', 'confirmed', 'manual_review')),
  retry_after timestamptz,
  created_at timestamptz not null default now()
);

create table public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null,
  provider_subscription_id text not null unique,
  package_id text not null,
  status text not null check (status in ('active', 'past_due', 'paused', 'canceled', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_payment_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  invoice_id uuid references public.billing_invoices(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'completed', 'defaulted', 'canceled')),
  installment_count integer not null check (installment_count > 1),
  installment_amount_cents integer not null check (installment_amount_cents > 0),
  next_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_receipts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  payment_id uuid not null unique references public.billing_payments(id) on delete restrict,
  receipt_number text not null unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.billing_refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.billing_payments(id) on delete restrict,
  provider text not null,
  provider_refund_id text unique,
  amount_cents integer not null check (amount_cents > 0),
  reason text,
  status text not null check (status in ('pending', 'succeeded', 'failed', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_fulfillments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  payment_id uuid not null unique references public.billing_payments(id) on delete restrict,
  package_id text not null,
  crm_status text not null default 'queued' check (crm_status in ('queued', 'activated', 'failed')),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index billing_invoices_profile_id_idx on public.billing_invoices(profile_id, created_at desc);
create index billing_payments_profile_id_idx on public.billing_payments(profile_id, created_at desc);
create index billing_payments_invoice_id_idx on public.billing_payments(invoice_id);
create index billing_attempts_payment_id_idx on public.billing_payment_attempts(payment_id, created_at desc);
create index billing_subscriptions_profile_id_idx on public.billing_subscriptions(profile_id, created_at desc);
create index billing_audit_logs_profile_id_idx on public.billing_audit_logs(profile_id, created_at desc);

create trigger billing_invoices_set_updated_at before update on public.billing_invoices for each row execute function public.set_updated_at();
create trigger billing_payments_set_updated_at before update on public.billing_payments for each row execute function public.set_updated_at();
create trigger billing_subscriptions_set_updated_at before update on public.billing_subscriptions for each row execute function public.set_updated_at();
create trigger billing_payment_plans_set_updated_at before update on public.billing_payment_plans for each row execute function public.set_updated_at();
create trigger billing_refunds_set_updated_at before update on public.billing_refunds for each row execute function public.set_updated_at();
create trigger billing_fulfillments_set_updated_at before update on public.billing_fulfillments for each row execute function public.set_updated_at();

alter table public.billing_invoices enable row level security;
alter table public.billing_invoice_lines enable row level security;
alter table public.billing_payments enable row level security;
alter table public.billing_payment_attempts enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_payment_plans enable row level security;
alter table public.billing_receipts enable row level security;
alter table public.billing_refunds enable row level security;
alter table public.billing_fulfillments enable row level security;
alter table public.billing_audit_logs enable row level security;

create policy "customers read own invoices or billing staff" on public.billing_invoices for select to authenticated using (profile_id = (select auth.uid()) or private.is_billing_staff());
create policy "customers read own invoice lines or billing staff" on public.billing_invoice_lines for select to authenticated using (exists (select 1 from public.billing_invoices i where i.id = invoice_id and (i.profile_id = (select auth.uid()) or private.is_billing_staff())));
create policy "customers read own safe payments or billing staff" on public.billing_payments for select to authenticated using (profile_id = (select auth.uid()) or private.is_billing_staff());
create policy "billing staff read payment attempts" on public.billing_payment_attempts for select to authenticated using (private.is_billing_staff());
create policy "customers read own subscriptions or billing staff" on public.billing_subscriptions for select to authenticated using (profile_id = (select auth.uid()) or private.is_billing_staff());
create policy "customers read own plans or billing staff" on public.billing_payment_plans for select to authenticated using (profile_id = (select auth.uid()) or private.is_billing_staff());
create policy "customers read own receipts or billing staff" on public.billing_receipts for select to authenticated using (profile_id = (select auth.uid()) or private.is_billing_staff());
create policy "customers read own refunds or billing staff" on public.billing_refunds for select to authenticated using (exists (select 1 from public.billing_payments p where p.id = payment_id and (p.profile_id = (select auth.uid()) or private.is_billing_staff())));
create policy "billing staff read fulfillments" on public.billing_fulfillments for select to authenticated using (private.is_billing_staff());
create policy "billing staff read audit logs" on public.billing_audit_logs for select to authenticated using (private.is_billing_staff());

grant select on
  public.billing_invoices,
  public.billing_invoice_lines,
  public.billing_payments,
  public.billing_payment_attempts,
  public.billing_subscriptions,
  public.billing_payment_plans,
  public.billing_receipts,
  public.billing_refunds,
  public.billing_fulfillments,
  public.billing_audit_logs
to authenticated;

grant all on
  public.billing_invoices,
  public.billing_invoice_lines,
  public.billing_payments,
  public.billing_payment_attempts,
  public.billing_subscriptions,
  public.billing_payment_plans,
  public.billing_receipts,
  public.billing_refunds,
  public.billing_fulfillments,
  public.billing_audit_logs
to service_role;

-- All billing writes occur only in server routes using the service role after
-- authentication, processor signature verification, and idempotency checks.
