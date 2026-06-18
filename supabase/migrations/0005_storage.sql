-- 0005_storage.sql
-- Private Storage bucket for job photos & attachments (used from Phase 4).
--
-- Object path convention: org/{org_id}/jobs/{job_id}/{file_id}-{filename}
-- Access is granted only to members of the org named in the first two path
-- segments, so files are isolated per organization.

insert into storage.buckets (id, name, public)
values ('job-attachments', 'job-attachments', false)
on conflict (id) do nothing;

-- Helper: extract the org_id (2nd path segment) from a storage object name.
create or replace function public.storage_object_org_id(object_name text)
returns uuid
language sql
immutable
as $$
  select nullif((string_to_array(object_name, '/'))[2], '')::uuid;
$$;

create policy "job_attachments_select_member" on storage.objects
  for select using (
    bucket_id = 'job-attachments'
    and public.is_org_member(public.storage_object_org_id(name))
  );

create policy "job_attachments_insert_member" on storage.objects
  for insert with check (
    bucket_id = 'job-attachments'
    and public.is_org_member(public.storage_object_org_id(name))
  );

create policy "job_attachments_update_member" on storage.objects
  for update using (
    bucket_id = 'job-attachments'
    and public.is_org_member(public.storage_object_org_id(name))
  );

create policy "job_attachments_delete_member" on storage.objects
  for delete using (
    bucket_id = 'job-attachments'
    and public.is_org_member(public.storage_object_org_id(name))
  );
