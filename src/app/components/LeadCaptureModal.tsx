import { useEffect, useId, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, MessageCircle, PlayCircle, X } from 'lucide-react';
import type { Property } from '../data/properties';
import { openWhatsApp } from '../config/contact';
import { trackEvent } from '../utils/analytics';
import {
  buildLeadMessage,
  leadIntentLabels,
  type LeadDetails,
  type LeadIntent,
} from '../utils/leadCapture';

interface LeadCaptureModalProps {
  isOpen: boolean;
  intent: LeadIntent;
  source: string;
  property?: Property;
  onClose: () => void;
  onIntentChange?: (intent: LeadIntent) => void;
}

const intentIcons = {
  visit: CalendarDays,
  video: PlayCircle,
  whatsapp: MessageCircle,
};

const EMPTY_DETAILS: LeadDetails = { name: '', moveInDate: '', people: '', note: '' };
const STORAGE_KEY = 'staybridge-lead-draft-v1';

export function LeadCaptureModal({
  isOpen,
  intent,
  source,
  property,
  onClose,
  onIntentChange,
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

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--green-medium)]">
              Resposta rápida pelo WhatsApp
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-extrabold text-gray-900">
              {property ? property.title : 'Como podemos ajudar?'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-gray-100 p-2" aria-label="Fechar formulário">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-gray-800">O que você precisa?</legend>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(leadIntentLabels) as LeadIntent[]).map((item) => {
                const Icon = intentIcons[item];
                const selected = item === intent;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onIntentChange?.(item)}
                    aria-pressed={selected}
                    className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-center text-xs font-bold transition ${
                      selected
                        ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[var(--green-dark)]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item === 'visit' ? 'Agendar visita' : item === 'video' ? 'Pedir vídeo' : 'Falar agora'}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-gray-800">Seu nome *</span>
            <input
              autoFocus
              required
              autoComplete="name"
              value={details.name}
              onChange={(event) => updateDetail('name', event.target.value)}
              placeholder="Como podemos chamar você?"
              className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-base outline-none transition focus:border-[var(--green-dark)] focus:ring-2 focus:ring-[var(--green-dark)]/20"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-gray-800">Quando pretende mudar?</span>
              <input
                type="date"
                value={details.moveInDate}
                onChange={(event) => updateDetail('moveInDate', event.target.value)}
                className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-base outline-none focus:border-[var(--green-dark)]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-gray-800">Quantas pessoas?</span>
              <select
                value={details.people}
                onChange={(event) => updateDetail('people', event.target.value)}
                className="min-h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base outline-none focus:border-[var(--green-dark)]"
              >
                <option value="">Selecionar</option>
                <option value="1">1 pessoa</option>
                <option value="2">2 pessoas</option>
                <option value="3">3 pessoas</option>
                <option value="4+">4 ou mais</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-gray-800">Mensagem opcional</span>
            <textarea
              rows={2}
              value={details.note}
              onChange={(event) => updateDetail('note', event.target.value)}
              placeholder="Alguma preferência ou dúvida?"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-[var(--green-dark)]"
            />
          </label>

          <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--green-dark)] px-5 py-3.5 font-extrabold text-white shadow-lg transition hover:bg-[var(--green-medium)]">
            <MessageCircle className="h-5 w-5" />
            Continuar no WhatsApp
          </button>
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Sua mensagem será aberta para revisão. Nada é enviado automaticamente.
          </p>
        </form>
      </section>
    </div>,
    document.body
  );
}
