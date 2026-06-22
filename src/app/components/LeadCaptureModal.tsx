import { useEffect, useId, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, MapPin, MessageCircle, ShieldCheck, Users, X } from 'lucide-react';
import type { Property } from '../data/properties';
import { openWhatsApp } from '../config/contact';
import { trackEvent } from '../utils/analytics';
import {
  buildLeadMessage,
  type LeadDetails,
  type LeadIntent,
} from '../utils/leadCapture';

interface LeadCaptureModalProps {
  isOpen: boolean;
  intent: LeadIntent;
  source: string;
  property?: Property;
  onClose: () => void;
}

const EMPTY_DETAILS: LeadDetails = { name: '', moveInDate: '', people: '' };
const STORAGE_KEY = 'staybridge-lead-inquiry-v2';

const moveInOptions = [
  'Immediately',
  'This Month',
  'Next Month',
  'In 2-3 Months',
  'Just Researching',
];

const occupantOptions = ['1 Person', '2 People', '3+ People'];

export function LeadCaptureModal({
  isOpen,
  intent,
  source,
  property,
  onClose,
}: LeadCaptureModalProps) {
  const titleId = useId();
  const [details, setDetails] = useState<LeadDetails>(EMPTY_DETAILS);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const appRoot = document.getElementById('root');
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setDetails({ ...EMPTY_DETAILS, ...JSON.parse(saved) });
    } catch {
      // Session storage is optional; the form remains fully functional without it.
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    appRoot?.setAttribute('inert', '');
    window.addEventListener('keydown', handleEscape);
    trackEvent('lead_form_open', {
      source,
      intent,
      property_id: property?.id,
    });

    return () => {
      document.body.style.overflow = '';
      appRoot?.removeAttribute('inert');
      window.removeEventListener('keydown', handleEscape);
      previousFocus?.focus();
    };
  }, [intent, isOpen, onClose, property?.id, source]);

  if (!isOpen) return null;

  const updateDetail = (key: keyof LeadDetails, value: string) => {
    const next = { ...details, [key]: value };
    setDetails(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failures in private browsing modes.
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!details.name.trim()) return;

    trackEvent('lead_form_submit', {
      source,
      intent,
      property_id: property?.id,
      has_move_in_date: Boolean(details.moveInDate),
      people: details.people || undefined,
    });
    openWhatsApp(buildLeadMessage(intent, details, property));
    onClose();
  };

  const propertyLocation = property
    ? [property.localArea, property.postcode, property.region].filter(Boolean).join(' · ')
    : 'London';

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[80] flex items-end justify-center bg-[#071f16]/70 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-card max-h-[94svh] w-full overflow-y-auto rounded-t-[28px] bg-[#fffdf7] shadow-[0_28px_80px_rgba(0,0,0,.3)] sm:max-w-lg sm:rounded-[28px]"
      >
        <div className="sticky top-0 z-10 border-b border-[#dfe7e1] bg-[#fffdf7]/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-xl font-black tracking-[-.02em] text-gray-950 sm:text-2xl">
                {property ? property.title : 'Find your home in London'}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-600">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--green-medium)]" />
                <span className="truncate">{propertyLocation}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
              aria-label="Close inquiry"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
            Receive availability and more information via WhatsApp.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5 sm:px-7 sm:py-5">
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-gray-900">
              Full Name <span className="text-[var(--green-medium)]">*</span>
            </span>
            <input
              autoFocus
              required
              autoComplete="name"
              value={details.name}
              onChange={(event) => updateDetail('name', event.target.value)}
              placeholder="How should we call you?"
              className="min-h-[52px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-base text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--green-dark)] focus:ring-4 focus:ring-[var(--green-dark)]/10"
            />
          </label>

          <fieldset>
            <legend className="mb-2.5 flex w-full items-center justify-between gap-3 text-sm font-extrabold text-gray-900">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-[18px] w-[18px] text-[var(--green-medium)]" />
                Expected Move-In
              </span>
              <span className="text-xs font-semibold text-gray-400">Optional</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {moveInOptions.map((option, index) => {
                const selected = details.moveInDate === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateDetail('moveInDate', selected ? '' : option)}
                    aria-pressed={selected}
                    className={`relative min-h-11 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                      index === moveInOptions.length - 1 ? 'col-span-2' : ''
                    } ${
                      selected
                        ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[var(--green-dark)]/50 hover:bg-[var(--green-dark)]/[.03]'
                    }`}
                  >
                    {selected && <Check className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />}
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-gray-900">
              <Users className="h-[18px] w-[18px] text-[var(--green-medium)]" />
              Number of Occupants
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {occupantOptions.map((option) => {
                const selected = details.people === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateDetail('people', selected ? '' : option)}
                    aria-pressed={selected}
                    className={`min-h-11 rounded-xl border px-2 py-2.5 text-sm font-bold transition ${
                      selected
                        ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[var(--green-dark)]/50 hover:bg-[var(--green-dark)]/[.03]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-dark)] px-5 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(10,61,41,.24)] transition hover:-translate-y-0.5 hover:bg-[var(--green-medium)] hover:shadow-[0_14px_30px_rgba(10,61,41,.3)] active:translate-y-0"
          >
            <MessageCircle className="h-5 w-5" />
            Check Availability on WhatsApp
          </button>

          <p className="flex items-start justify-center gap-2 px-2 text-center text-xs leading-relaxed text-gray-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green-medium)]" />
            Your message opens in WhatsApp for review. Nothing is sent automatically.
          </p>
        </form>
      </section>
    </div>,
    document.body
  );
}
