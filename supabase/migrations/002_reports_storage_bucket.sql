insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reports',
  'reports',
  false,
  52428800,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "report files readable by owner or admin" on storage.objects
  for select using (
    bucket_id = 'reports'
    and (
      public.is_platform_admin()
      or exists (
        select 1
        from public.reports r
        join public.clients c on c.id = r.client_id
        where r.storage_path = storage.objects.name
          and c.profile_id = auth.uid()
      )
    )
  );

create policy "report files admin insert" on storage.objects
  for insert with check (
    bucket_id = 'reports'
    and public.is_platform_admin()
  );

create policy "report files admin update" on storage.objects
  for update using (
    bucket_id = 'reports'
    and public.is_platform_admin()
  ) with check (
    bucket_id = 'reports'
    and public.is_platform_admin()
  );

create policy "report files admin delete" on storage.objects
  for delete using (
    bucket_id = 'reports'
    and public.is_platform_admin()
  );
