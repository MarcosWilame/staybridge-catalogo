/**
 * Returns a human-readable availability label from a property's moveInDate field.
 *
 * Handles CSV misalignment gracefully: if the value does not look like a date
 * or a known keyword, it defaults to "Entrada imediata".
 */
export function getAvailabilityInfo(moveInDate: string): {
  label: string;
  isNow: boolean;
} {
  const normalized = (moveInDate ?? '').trim().toLowerCase();

  if (!normalized || normalized === 'now' || normalized === 'imediata') {
    return { label: 'Entrada imediata', isNow: true };
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    return { label: `Disponível em ${moveInDate.trim()}`, isNow: false };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [y, m, d] = normalized.split('-');
    return { label: `Disponível em ${d}/${m}/${y}`, isNow: false };
  }

  if (/^\d{2}\/\d{2}$/.test(normalized)) {
    return { label: `Disponível em ${moveInDate.trim()}`, isNow: false };
  }

  return { label: 'Entrada imediata', isNow: true };
}
