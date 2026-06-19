export function toPublicProperty(row) {
  const data = row?.data && typeof row.data === 'object' ? row.data : {};
  if (data.listed === false) return null;

  const id = Number(data.id || row?.id);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    image: data.image,
    images: data.images,
    video: data.video,
    type: data.type,
    title: data.title,
    region: data.region,
    localArea: data.localArea,
    price: data.price,
    description: data.description,
    longDescription: data.longDescription,
    available: data.available,
    listed: true,
    billsIncluded: data.billsIncluded,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    category: data.category,
    amenities: data.amenities,
    deposit: data.deposit,
    nearbyStations: data.nearbyStations,
    coordinates: data.coordinates,
    furnishing: data.furnishing,
    moveInDate: data.moveInDate,
    postcode: data.postcode,
    address: data.address,
    people: data.people,
  };
}
