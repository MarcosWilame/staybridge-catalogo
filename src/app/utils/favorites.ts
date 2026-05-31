const FAVORITES_KEY = 'bedminster_favorite_property_ids';

function readFavoriteIds() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === 'number')
      : [];
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: number[]) {
  const uniqueIds = Array.from(new Set(ids));
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(uniqueIds));
  window.dispatchEvent(new Event('bedminster:favorites-changed'));
  return uniqueIds;
}

export function getFavoritePropertyIds() {
  return readFavoriteIds();
}

export function isFavoriteProperty(id: number) {
  return readFavoriteIds().includes(id);
}

export function toggleFavoriteProperty(id: number) {
  const ids = readFavoriteIds();
  const isFavorite = ids.includes(id);
  const nextIds = isFavorite
    ? ids.filter((favoriteId) => favoriteId !== id)
    : [...ids, id];

  writeFavoriteIds(nextIds);
  return !isFavorite;
}
