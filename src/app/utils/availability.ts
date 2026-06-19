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
