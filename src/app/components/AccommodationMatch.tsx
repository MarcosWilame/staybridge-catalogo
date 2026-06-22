import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, MapPin, Sparkles, WalletCards } from 'lucide-react';
import { useProperties } from '../data/sheetProperties';
import { getPriceValue } from '../utils/price';
import { getMoveInTimestamp } from '../utils/availability';
import { trackEvent } from '../utils/analytics';

const budgetOptions = [
  { label: 'Até £200', value: '200', min: 0, max: 200 },
  { label: '£200–£300', value: '200-300', min: 200, max: 300 },
  { label: '£300+', value: '300+', min: 300, max: Number.POSITIVE_INFINITY },
  { label: 'Flexível', value: '', min: 0, max: Number.POSITIVE_INFINITY },
];

const regionOptions = [
  { label: 'Toda Londres', value: '' },
  { label: 'North London', value: 'north' },
  { label: 'South London', value: 'south' },
  { label: 'East London', value: 'east' },
  { label: 'West London', value: 'west' },
];

function getTodayValue() {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}

export function AccommodationMatch() {
  const navigate = useNavigate();
  const { properties, isLoading } = useProperties();
  const [budget, setBudget] = useState('');
  const [budgetChosen, setBudgetChosen] = useState(false);
  const [region, setRegion] = useState('');
  const [regionChosen, setRegionChosen] = useState(false);
  const [moveInBy, setMoveInBy] = useState('');
  const todayValue = useMemo(getTodayValue, []);

  const selectedBudget = budgetOptions.find((option) => option.value === budget) || budgetOptions[3];
  const isComplete = budgetChosen && regionChosen && Boolean(moveInBy);

  const matchCount = useMemo(() => {
    if (!isComplete) return 0;
    const [year, month, day] = moveInBy.split('-').map(Number);
    const cutoff = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();

    return properties.filter((property) => {
      if (!property.available) return false;
      const price = getPriceValue(property.price);
      const matchesBudget = price >= selectedBudget.min && price <= selectedBudget.max;
      const matchesRegion = !region || property.region.toLowerCase().includes(region);
      const matchesDate = getMoveInTimestamp(property.moveInDate, property.available) <= cutoff;
      return matchesBudget && matchesRegion && matchesDate;
    }).length;
  }, [isComplete, moveInBy, properties, region, selectedBudget.max, selectedBudget.min]);

  const viewMatches = () => {
    if (!isComplete) return;
    const params = new URLSearchParams();
    if (budget) params.set('price', budget);
    if (region) params.set('region', region);
    params.set('moveInBy', moveInBy);
    trackEvent('accommodation_match_submit', {
      budget: budget || 'flexible',
      region: region || 'all',
      move_in_by: moveInBy,
      results_count: matchCount,
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="reveal-section bg-white py-14 md:py-20" aria-labelledby="match-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[var(--green-dark)]/10 bg-[#f7f5e8] shadow-[0_22px_65px_rgba(26,77,46,.12)]">
          <div className="grid lg:grid-cols-[.72fr_1.28fr]">
            <div className="relative overflow-hidden bg-[var(--green-dark)] p-7 text-white md:p-10">
              <div aria-hidden="true" className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full border-[55px] border-[var(--yellow)]/10" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.14em] text-[var(--yellow)]"><Sparkles className="h-4 w-4" /> Match de acomodação</div>
                <h2 id="match-title" className="mt-5 text-3xl font-black leading-tight tracking-[-.035em] md:text-4xl">Conte o que procura.</h2>
                <p className="mt-3 max-w-md leading-relaxed text-white/65">Escolha três preferências e veja quantos imóveis combinam com você.</p>

                <div className={`mt-8 rounded-2xl border p-5 transition ${isComplete ? 'border-[var(--yellow)]/40 bg-[var(--yellow)] text-[#113424]' : 'border-white/10 bg-white/5 text-white'}`} aria-live="polite">
                  {isComplete ? (
                    <><span className="text-xs font-black uppercase tracking-[.14em] opacity-65">Seu resultado</span><strong className="mt-1 block text-3xl font-black">{isLoading ? 'Calculando…' : matchCount > 0 ? `Encontramos ${matchCount} ${matchCount === 1 ? 'opção' : 'opções'} para você.` : 'Nenhum match com esses filtros.'}</strong></>
                  ) : (
                    <><span className="text-xs font-black uppercase tracking-[.14em] text-[var(--yellow)]">3 escolhas rápidas</span><strong className="mt-2 block text-lg">Seu resultado aparece aqui</strong></>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10">
              <div className="space-y-7">
                <fieldset>
                  <legend className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--green-dark)]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--green-dark)] text-xs text-white">1</span><WalletCards className="h-4 w-4" /> Qual é o orçamento semanal?</legend>
                  <div className="flex flex-wrap gap-2">
                    {budgetOptions.map((option) => {
                      const selected = budgetChosen && budget === option.value;
                      return <button key={option.label} type="button" onClick={() => { setBudget(option.value); setBudgetChosen(true); }} aria-pressed={selected} className={`min-h-11 rounded-xl border px-4 text-sm font-black transition ${selected ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white' : 'border-[var(--green-dark)]/12 bg-white text-[var(--green-dark)] hover:border-[var(--green-dark)]/35'}`}>{selected && <Check className="mr-1.5 inline h-4 w-4" />}{option.label}</button>;
                    })}
                  </div>
                </fieldset>

                <label className="block">
                  <span className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--green-dark)]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--green-dark)] text-xs text-white">2</span><MapPin className="h-4 w-4" /> Em qual região?</span>
                  <select value={regionChosen ? region : '__unset'} onChange={(event) => { setRegion(event.target.value); setRegionChosen(true); }} className="min-h-12 w-full rounded-xl border border-[var(--green-dark)]/15 bg-white px-4 font-bold text-[var(--green-dark)] outline-none focus:border-[var(--green-dark)]">
                    <option value="__unset" disabled>Selecione uma região</option>
                    {regionOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-3 flex items-center gap-2 text-sm font-black text-[var(--green-dark)]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--green-dark)] text-xs text-white">3</span><CalendarDays className="h-4 w-4" /> Até quando pretende mudar?</span>
                  <input type="date" min={todayValue} value={moveInBy} onChange={(event) => setMoveInBy(event.target.value)} className="min-h-12 w-full rounded-xl border border-[var(--green-dark)]/15 bg-white px-4 font-bold text-[var(--green-dark)] outline-none focus:border-[var(--green-dark)]" />
                </label>
              </div>

              <button type="button" onClick={viewMatches} disabled={!isComplete || isLoading || matchCount === 0} className="group mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-6 font-black text-[#113424] shadow-[0_12px_28px_rgba(244,208,63,.25)] transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)] hover:text-white disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">{isComplete && !isLoading && matchCount === 0 ? 'Ajuste as preferências' : 'Ver imóveis compatíveis'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
