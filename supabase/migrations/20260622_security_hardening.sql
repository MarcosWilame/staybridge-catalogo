begin;

alter table public.properties enable row level security;

do $$
declare policy_record record;
begin
  for policy_record in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'properties'
  loop
    execute format('drop policy if exists %I on public.properties', policy_record.policyname);
  end loop;
end $$;

create policy "properties_admin_select"
on public.properties for select to authenticated
using (public.is_properties_admin());

create policy "properties_admin_insert"
on public.properties for insert to authenticated
with check (public.is_properties_admin());

create policy "properties_admin_update"
on public.properties for update to authenticated
using (public.is_properties_admin())
with check (public.is_properties_admin());

create policy "properties_admin_delete"
on public.properties for delete to authenticated
using (public.is_properties_admin());

revoke all on public.properties from anon;
grant select, insert, update, delete on public.properties to authenticated;

create or replace function public.get_public_properties()
returns table (id bigint, data jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id::bigint,
    jsonb_build_object(
      'id', p.id,
      'image', p.data -> 'image',
      'images', p.data -> 'images',
      'video', p.data -> 'video',
      'type', p.data -> 'type',
      'title', p.data -> 'title',
      'region', p.data -> 'region',
      'localArea', p.data -> 'localArea',
      'price', p.data -> 'price',
      'description', p.data -> 'description',
      'longDescription', p.data -> 'longDescription',
      'available', p.data -> 'available',
      'listed', true,
      'billsIncluded', p.data -> 'billsIncluded',
      'bedrooms', p.data -> 'bedrooms',
      'bathrooms', p.data -> 'bathrooms',
      'category', p.data -> 'category',
      'amenities', p.data -> 'amenities',
      'deposit', p.data -> 'deposit',
      'nearbyStations', p.data -> 'nearbyStations',
      'furnishing', p.data -> 'furnishing',
      'moveInDate', p.data -> 'moveInDate',
      'postcode', p.data -> 'postcode',
      'people', p.data -> 'people'
    )
  from public.properties p
  where p.data ->> 'listed' = 'true'
  order by p.id;
$$;

create or replace function public.get_public_property(property_id bigint)
returns table (id bigint, data jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select public_properties.id, public_properties.data
  from public.get_public_properties() public_properties
  where public_properties.id = property_id
  limit 1;
$$;

revoke all on function public.get_public_properties() from public;
revoke all on function public.get_public_property(bigint) from public;
grant execute on function public.get_public_properties() to anon, authenticated;
grant execute on function public.get_public_property(bigint) to anon, authenticated;

create table if not exists public.property_audit_log (
  audit_id bigint generated always as identity primary key,
  property_id bigint,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid,
  actor_email text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.property_audit_log enable row level security;

drop policy if exists "property_audit_admin_select" on public.property_audit_log;
create policy "property_audit_admin_select"
on public.property_audit_log for select to authenticated
using (public.is_properties_admin());

revoke all on public.property_audit_log from anon;
grant select on public.property_audit_log to authenticated;

create or replace function public.audit_property_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.property_audit_log (
    property_id,
    action,
    actor_id,
    actor_email,
    old_data,
    new_data
  ) values (
    coalesce(new.id, old.id),
    tg_op,
    auth.uid(),
    auth.jwt() ->> 'email',
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists properties_audit_trigger on public.properties;
create trigger properties_audit_trigger
after insert or update or delete on public.properties
for each row execute function public.audit_property_changes();

update storage.buckets
set
  public = false,
  file_size_limit = 209715200,
  allowed_mime_types = array[
    'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
where id = 'property-images';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('backups', 'backups', false, 52428800, array['application/json'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
declare policy_record record;
begin
  for policy_record in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
  loop
    if policy_record.policyname like 'staybridge_property_images_%' then
      execute format('drop policy if exists %I on storage.objects', policy_record.policyname);
    end if;
  end loop;
end $$;

create policy "staybridge_property_images_admin_select"
on storage.objects for select to authenticated
using (bucket_id = 'property-images' and public.is_properties_admin());

create policy "staybridge_property_images_admin_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'property-images' and public.is_properties_admin());

create policy "staybridge_property_images_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'property-images' and public.is_properties_admin())
with check (bucket_id = 'property-images' and public.is_properties_admin());

create policy "staybridge_property_images_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'property-images' and public.is_properties_admin());

commit;
