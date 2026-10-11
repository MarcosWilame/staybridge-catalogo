import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ChevronRight, LoaderCircle, MapPin, MessageCircle, Send, X } from 'lucide-react';
import type { Property } from '../data/properties';
import { useProperties } from '../data/sheetProperties';
import { getAvailabilityInfo } from '../utils/availability';
import { getOptimizedImageUrl } from '../utils/cloudinary';
import { trackEvent } from '../utils/analytics';
import {
  buildPropertySearchAnswer,
  filterAndSortProperties,
  getPropertyPriceValue,
  parsePropertySearchQuery,
} from '../utils/propertySearch';

type ChatMessage = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  properties?: Property[];
};

const QUICK_PROMPTS = ['Studios disponíveis', 'Até £250 por semana', 'Com bills inclusas'];

function getPrice(property: Property) {
  return getPropertyPriceValue(property);
}

function formatPrice(property: Property) {
  const price = getPrice(property);
  return price ? `£${price}/sem.` : property.price || 'Consultar valor';
}

function PropertyResult({ property }: { property: Property }) {
  const availability = getAvailabilityInfo(
    property.moveInDate,
    property.available,
    new Date(),
    property.availabilityStatus
  );
  const image = property.images?.[0] || property.image;

  return (
    <Link
      to={`/property/${property.id}`}
      className="group flex gap-3 rounded-2xl border border-[var(--green-dark)]/10 bg-white p-2.5 transition hover:border-[var(--yellow-dark)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)]"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f7f4df]">
        {image ? (
          <img src={getOptimizedImageUrl(image, 'thumb')} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
        ) : <div className="flex h-full items-center justify-center"><MapPin className="h-5 w-5 text-[var(--green-medium)]/50" /></div>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-[var(--green-dark)]">{property.title || property.type}</p>
        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-gray-500"><MapPin className="h-3 w-3 shrink-0" />{property.localArea || property.region}</p>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] font-bold">
          <span className="text-[var(--green-dark)]">{formatPrice(property)}</span>
          <span className={availability.isNow ? 'text-[#21864b]' : 'text-gray-500'}>{availability.isNow ? 'Agora' : availability.label}</span>
        </div>
      </div>
      <ChevronRight className="mt-6 h-4 w-4 shrink-0 text-[var(--green-medium)] transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export function PropertySearchChat() {
  const { properties, isLoading } = useProperties();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messageId, setMessageId] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Olá! Posso buscar no catálogo por tipo, região, preço, disponibilidade ou bills inclusas.',
    },
  ]);
  const messagesRef = useRef<HTMLDivElement>(null);

  const catalogSummary = useMemo(() => {
    if (isLoading) return 'Carregando o catálogo…';
    return `${properties.length} imóveis no catálogo`;
  }, [isLoading, properties.length]);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, isOpen]);

  const sendMessage = (value = input) => {
    const query = value.trim();
    if (!query || isLoading) return;

    const { filters, sortBy } = parsePropertySearchQuery(properties, query);
    const matches = filterAndSortProperties(properties, filters, sortBy);
    const visibleResults = matches.slice(0, 3);
    const nextId = messageId + 1;
    setMessageId(nextId + 1);
    setMessages((current) => [
      ...current,
      { id: nextId, role: 'user', text: query },
      { id: nextId + 1, role: 'assistant', text: buildPropertySearchAnswer(matches.length, visibleResults.length), properties: visibleResults },
    ]);
    setInput('');
    trackEvent('property_chat_search', {
      query,
      results_count: matches.length,
      source: 'chat',
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="fixed bottom-24 right-4 z-[60] md:bottom-6 md:right-6">
      {isOpen && (
        <section aria-label="Busca de imóveis" className="absolute bottom-16 right-0 flex h-[min(680px,calc(100vh-8rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.35rem] border border-[var(--green-dark)]/15 bg-[#f7f4df] shadow-[0_24px_70px_rgba(26,77,46,.25)]">
          <header className="flex items-center justify-between bg-[var(--green-dark)] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--yellow)] text-[var(--green-dark)]"><Bot className="h-5 w-5" /></span>
              <div><h2 className="text-sm font-black">Busca Staybridge</h2><p className="text-[11px] text-white/65">{catalogSummary}</p></div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Fechar busca" className="rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)]"><X className="h-5 w-5" /></button>
          </header>

          <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={message.role === 'user' ? 'max-w-[85%] rounded-2xl rounded-br-md bg-[var(--green-dark)] px-3.5 py-2.5 text-sm text-white' : 'max-w-[94%] space-y-2'}>
                  <p className={message.role === 'assistant' ? 'rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-700 shadow-sm' : ''}>{message.text}</p>
                  {message.properties?.map((property) => <PropertyResult key={property.id} property={property} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--green-dark)]/10 bg-white px-3 pb-3 pt-2">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {QUICK_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => sendMessage(prompt)} className="shrink-0 rounded-full border border-[var(--green-dark)]/15 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[var(--green-dark)] transition hover:border-[var(--yellow-dark)] hover:bg-[var(--yellow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)]">{prompt}</button>)}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-[var(--green-dark)]/15 bg-white p-1.5 focus-within:border-[var(--yellow-dark)] focus-within:ring-2 focus-within:ring-[var(--yellow)]/40">
              <label className="sr-only" htmlFor="property-chat-input">Pesquisar imóvel</label>
              <input id="property-chat-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ex.: studio até £250 em Harrow" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400" disabled={isLoading} />
              <button type="submit" disabled={!input.trim() || isLoading} aria-label="Enviar busca" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--yellow)] text-[var(--green-dark)] transition hover:bg-[var(--yellow-dark)] disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
            </form>
            <p className="mt-2 text-center text-[10px] text-gray-500">Consulta apenas dados reais do catálogo.</p>
          </div>
        </section>
      )}
      <button type="button" onClick={() => { setIsOpen((current) => !current); trackEvent('property_chat_toggle', { open: !isOpen }); }} aria-label={isOpen ? 'Fechar busca de imóveis' : 'Abrir busca de imóveis'} aria-expanded={isOpen} className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-[var(--green-dark)] text-white shadow-[0_16px_40px_rgba(0,0,0,.25)] transition hover:-translate-y-1 hover:bg-[var(--green-medium)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-2">
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6 transition group-hover:scale-110" />}
        {!isOpen && <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white shadow-lg md:block">Buscar um imóvel</span>}
      </button>
    </div>
  );
}
