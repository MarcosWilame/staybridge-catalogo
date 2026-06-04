import type { Property } from '../data/properties';

export const RECOVERY_DAYS = 21;

export function getRecoveryDeadline(property: Property) {
  if (!property.deletedAt) return null;

  const deletedAt = new Date(property.deletedAt);
  if (Number.isNaN(deletedAt.getTime())) return null;

  const deadline = new Date(deletedAt);
  deadline.setDate(deadline.getDate() + RECOVERY_DAYS);
  return deadline;
}

export function isInRecovery(property: Property) {
  const deadline = getRecoveryDeadline(property);
  return Boolean(deadline && deadline.getTime() > Date.now());
}

export function isRecoveryExpired(property: Property) {
  const deadline = getRecoveryDeadline(property);
  return Boolean(deadline && deadline.getTime() <= Date.now());
}

export function getRecoveryDaysLeft(property: Property) {
  const deadline = getRecoveryDeadline(property);
  if (!deadline) return 0;

  const diff = deadline.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
