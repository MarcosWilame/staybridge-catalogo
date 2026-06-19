import { Check, Search, Wand2 } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { CATEGORY_OPTIONS, adminInputClass } from './adminConfig';
import type { CadastroAssistantForm, CadastroAssistantResult } from './cadastroAssistantUtils';

type CadastroAssistantProps = {
  form: CadastroAssistantForm;
  result: CadastroAssistantResult | null;
  isLoading: boolean;
  onChange: React.Dispatch<React.SetStateAction<CadastroAssistantForm>>;
  onSearchMedia: () => void;
  onApply: () => void;
};

export function CadastroAssistant({
  form,
  result,
  isLoading,
  onChange,
  onSearchMedia,
  onApply,
}: CadastroAssistantProps) {
  const update = (field: keyof CadastroAssistantForm, value: string) => {
    onChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="border-b border-[var(--surface-border)] bg-[var(--gray-light)] px-5 py-5 md:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-[var(--green-dark)]">
            <Wand2 className="h-4 w-4" />
            Assistente de cadastro
          </div>
          <p className="text-sm font-semibold text-gray-700">
            Preencha o mínimo, busque mídia na biblioteca e aplique ao cadastro para revisar antes de salvar.
          </p>
        </div>
        <button
          type="button"
          onClick={onApply}
          disabled={!result}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--green-medium)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          Aplicar ao cadastro
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <AssistantField label="Tipo">
          <select
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
            className={adminInputClass}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </AssistantField>

        <AssistantField label="Room/Flat">
          <input
            type="text"
            value={form.unit}
            onChange={(event) => update('unit', event.target.value)}
            className={adminInputClass}
            placeholder="Ex: 5, A, 4B"
          />
        </AssistantField>

        <AssistantField label="Quartos">
          <input
            type="number"
            min="1"
            value={form.bedrooms}
            onChange={(event) => update('bedrooms', event.target.value)}
            className={adminInputClass}
            disabled={form.category !== 'flat'}
          />
        </AssistantField>

        <AssistantField label="Região">
          <select
            value={form.region}
            onChange={(event) => update('region', event.target.value)}
            className={adminInputClass}
          >
            <option value="south">South</option>
            <option value="north">North</option>
          </select>
        </AssistantField>

        <AssistantField label="Endereço completo para buscar pasta" className="md:col-span-2">
          <input
            type="text"
            value={form.address}
            onChange={(event) => update('address', event.target.value)}
            className={adminInputClass}
            placeholder="Ex: 681 London Road CR7 6AZ"
          />
        </AssistantField>

        <AssistantField label="Área">
          <input
            type="text"
            value={form.localArea}
            onChange={(event) => update('localArea', event.target.value)}
            className={adminInputClass}
            placeholder="Ex: Croydon"
          />
        </AssistantField>

        <AssistantField label="Postcode">
          <input
            type="text"
            value={form.postcode}
            onChange={(event) => update('postcode', event.target.value.toUpperCase())}
            className={adminInputClass}
            placeholder="CR7 6AZ"
          />
        </AssistantField>

        <AssistantField label="Preço">
          <input
            type="text"
            value={form.price}
            onChange={(event) => update('price', event.target.value)}
            className={adminInputClass}
            placeholder="600"
          />
        </AssistantField>

        <AssistantField label="Pessoas">
          <input
            type="number"
            min="1"
            value={form.people}
            onChange={(event) => update('people', event.target.value)}
            className={adminInputClass}
          />
        </AssistantField>

        <AssistantField label="Disponibilidade" className="md:col-span-2">
          <input
            type="text"
            value={form.moveInDate}
            onChange={(event) => update('moveInDate', event.target.value)}
            className={adminInputClass}
            placeholder="Disponível agora ou 29/07/2026"
          />
        </AssistantField>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onSearchMedia}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Search className="h-4 w-4" />
          {isLoading ? 'Buscando mídia...' : 'Buscar mídia no Supabase'}
        </button>
        {result && (
          <span className="text-sm font-bold text-[var(--green-dark)]">
            {result.totalImages} imagens encontradas, {result.images.length} serão usadas.
            {result.totalVideos ? ` ${result.totalVideos} vídeo(s) encontrados.` : ''}
          </span>
        )}
      </div>

      {result && (
        <div className="mt-4 rounded-lg border border-[var(--surface-border)] bg-white p-3">
          <p className="mb-3 truncate text-xs font-bold text-gray-600">Pasta: {result.path}</p>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-8">
            {result.images.slice(0, 8).map((item) => (
              <ImageWithFallback
                key={item.path}
                src={item.url}
                className="h-20 w-full rounded-md object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssistantField({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`grid gap-1 text-xs font-bold uppercase tracking-wide text-gray-500 ${className}`}>
      {label}
      {children}
    </label>
  );
}
