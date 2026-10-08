begin;

-- Keep the public catalogue in sync with every row explicitly published by
-- the admin catalogue. This refresh is intentionally separate from the
-- security migration so it can be applied independently in production.
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
      'entryConditions', p.data -> 'entryConditions',
      'sourceText', p.data -> 'sourceText'
    )
  from public.properties p
  where p.data ->> 'listed' = 'true'
  order by p.id;
$$;

revoke all on function public.get_public_properties() from public;
grant execute on function public.get_public_properties() to anon, authenticated;

commit;
