/**
 * Returns a human-readable availability label from a property's moveInDate field.
 *
 * Examples:
 *   "now" / "imediata"         → { label: "Disponível Agora", isNow: true }
 *   "30/05/2026"               → { label: "Disponível 30/05/2026", isNow: false }
 *   "02/06/2026"               → { label: "Disponível 02/06/2026", isNow: false }
 */
export function getAvailabilityInfo(moveInDate: string): {
  label: string;
  isNow: boolean;
} {
  const normalized = (moveInDate ?? '').trim().toLowerCase();

  if (!normalized || normalized === 'now' || normalized === 'imediata') {
    return { label: 'Disponível Agora', isNow: true };
  }

  // dd/mm/yyyy → display as-is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    return { label: `Disponível ${moveInDate.trim()}`, isNow: false };
  }

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [y, m, d] = normalized.split('-');
    return { label: `Disponível ${d}/${m}/${y}`, isNow: false };
  }

  // Fallback — just show what we have
  return { label: `Disponível ${moveInDate.trim()}`, isNow: false };
}
