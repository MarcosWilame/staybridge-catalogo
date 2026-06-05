import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { adminLabelClass } from './adminConfig';

export function AdminFieldLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <label className={adminLabelClass}>
      <Icon className="h-4 w-4 text-[var(--green-dark)]" />
      {children}
    </label>
  );
}

export function AdminSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition ${
        checked
          ? 'border-[var(--green-dark)] bg-[var(--green-light)] text-[var(--green-dark)]'
          : 'border-gray-200 bg-white text-gray-700 hover:border-[var(--green-dark)]'
      }`}
      aria-pressed={checked}
    >
      <span>{label}</span>
      <span
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
          checked ? 'bg-[var(--green-dark)]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}
