/**
 * Returns a human-readable availability label from a property's moveInDate field.
 *
 * Dates should still be shown even when a property is not currently available.
 * Only date-less unavailable properties use the generic "Indisponível" label.
 */
export function getAvailabilityInfo(
  moveInDate: string,
  available = true
): {
  label: string;
  isNow: boolean;
} {
  const rawValue = (moveInDate ?? '').trim();
  const normalized = rawValue.toLowerCase();

  if (
    !normalized ||
    normalized === 'now' ||
    normalized === 'imediata' ||
    normalized === 'disponivel agora' ||
    normalized === 'disponível agora'
  ) {
    return available
      ? { label: 'Disponível agora', isNow: true }
      : { label: 'Indisponível', isNow: false };
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    return { label: `Disponível em ${rawValue}`, isNow: false };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split('-');
    return { label: `Disponível em ${day}/${month}/${year}`, isNow: false };
  }

  if (/^\d{2}\/\d{2}$/.test(normalized)) {
    return { label: `Disponível em ${rawValue}`, isNow: false };
  }

  return available
    ? { label: 'Disponível agora', isNow: true }
    : { label: 'Indisponível', isNow: false };
}

export function getMoveInTimestamp(
  moveInDate: string,
  available = true,
  today = new Date()
) {
  const info = getAvailabilityInfo(moveInDate, available);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (info.isNow) return startOfToday;

  const normalized = (moveInDate || '').trim();
  let year: number;
  let month: number;
  let day: number;

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    [year, month, day] = normalized.split('-').map(Number);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    [day, month, year] = normalized.split('/').map(Number);
  } else if (/^\d{2}\/\d{2}$/.test(normalized)) {
    [day, month] = normalized.split('/').map(Number);
    year = today.getFullYear();
    const candidate = new Date(year, month - 1, day).getTime();
    if (candidate < startOfToday) year += 1;
  } else {
    return available ? startOfToday : Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(year, month - 1, day).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
}
