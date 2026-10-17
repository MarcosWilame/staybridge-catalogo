begin;

-- Public catalogue access must go through the restricted RPC. The underlying
-- JSON document contains operational fields that are never meant for visitors.
alter table public.properties enable row level security;
revoke all on table public.properties from public, anon;

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
      'coverMedia', p.data -> 'coverMedia',
      'type', p.data -> 'type',
      'title', p.data -> 'title',
      'region', p.data -> 'region',
      'localArea', p.data -> 'localArea',
      'price', p.data -> 'price',
      'monthlyPrice', p.data -> 'monthlyPrice',
      'entryRent', p.data -> 'entryRent',
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
      'people', p.data -> 'people',
      'availabilityStatus', p.data -> 'availabilityStatus',
      'priceOptions', p.data -> 'priceOptions',
      'entryConditions', jsonb_strip_nulls(jsonb_build_object(
        'depositWeeks', p.data #> '{entryConditions,depositWeeks}',
        'rentWeeks', p.data #> '{entryConditions,rentWeeks}',
        'rentMonths', p.data #> '{entryConditions,rentMonths}'
      ))
    )
  from public.properties p
  where p.data ->> 'listed' = 'true'
  order by p.id;
$$;

revoke all on function public.get_public_properties() from public;
grant execute on function public.get_public_properties() to anon, authenticated;

commit;
