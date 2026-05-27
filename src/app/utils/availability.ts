/**
 * Returns a human-readable availability label from a property's moveInDate field.
 *
 * Handles CSV misalignment gracefully — if the value doesn't look like a date
 * or a known keyword, it defaults to "Disponível Agora".
 *
 * Examples:
 *   "now" / "imediata"         → { label: "Disponível Agora", isNow: true }
 *   "30/05/2026"               → { label: "Disponível 30/05/2026", isNow: false }
 *   "02/06/2026"               → { label: "Disponível 02/06/2026", isNow: false }
 *   "1 Regarth Avenue..."      → { label: "Disponível Agora", isNow: true }  ← CSV misalignment
 */
export function getAvailabilityInfo(moveInDate: string): {
  label: string;
  isNow: boolean;
} {
  const normalized = (moveInDate ?? '').trim().toLowerCase();

  if (!normalized || normalized === 'now' || normalized === 'imediata') {
    return { label: 'Disponível Agora', isNow: true };
  }

  // dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    return { label: `Disponível ${moveInDate.trim()}`, isNow: false };
  }

  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [y, m, d] = normalized.split('-');
    return { label: `Disponível ${d}/${m}/${y}`, isNow: false };
  }

  // dd/mm (without year)
  if (/^\d{2}\/\d{2}$/.test(normalized)) {
    return { label: `Disponível ${moveInDate.trim()}`, isNow: false };
  }

  // Anything else (addresses, garbage from CSV misalignment) → treat as now
  return { label: 'Disponível Agora', isNow: true };
}
