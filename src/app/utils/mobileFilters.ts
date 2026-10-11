export type MobileFilterState = {
  search: string;
  region: string;
  type: string;
  priceRange: string;
  availableNow: boolean;
  billsIncluded: boolean;
  people: string;
  moveInBy: string;
};

export const EMPTY_MOBILE_FILTERS: MobileFilterState = Object.freeze({
  search: '',
  region: '',
  type: '',
  priceRange: '',
  availableNow: false,
  billsIncluded: false,
  people: '',
  moveInBy: '',
});

export function cloneMobileFilters(filters: MobileFilterState): MobileFilterState {
  return { ...filters };
}

export function hasActiveFilterValues(filters: MobileFilterState) {
  return Boolean(
    filters.search ||
    filters.region ||
    filters.type ||
    filters.priceRange ||
    filters.availableNow ||
    filters.billsIncluded ||
    filters.people ||
    filters.moveInBy
  );
}

export function areMobileFiltersEqual(
  left: MobileFilterState,
  right: MobileFilterState
) {
  return Object.keys(EMPTY_MOBILE_FILTERS).every((key) =>
    left[key as keyof MobileFilterState] === right[key as keyof MobileFilterState]
  );
}
