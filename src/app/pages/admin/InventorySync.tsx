import { Check, FileSpreadsheet, Eye, EyeOff, AlertTriangle, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import type { Property } from '../../data/properties';
import { compareInventoryCsv, type InventorySyncResult } from './csvInventorySync';

type Props = {
  properties: Property[];
  onApply: (result: InventorySyncResult) => Promise<void>;
};

export function InventorySync({ properties, onApply }: Props) {
  const [result, setResult] = useState<InventorySyncResult | null>(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setFileName(file.name);
    try {
      setResult(compareInventoryCsv(await file.text(), properties));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Não foi possível ler o CSV.');
    }
  };

  const apply = async () => {
    if (!result) return;
    setIsApplying(true);
    setError('');
    try {
      await onApply(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível aplicar a sincronização.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--surface-border)] bg-white p-5 shadow-[var(--surface-shadow)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--green-dark)]">Sincronizar disponibilidade</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">Envie o CSV atual. Os imóveis encontrados ficam visíveis; os cadastrados que não aparecerem ficam ocultos. Nada novo é criado automaticamente.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-4 py-3 font-bold text-white hover:bg-[var(--green-medium)]">
            <UploadCloud className="h-5 w-5" />
            Escolher CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
          </label>
        </div>
        <div className="mt-5 rounded-lg border border-dashed border-[var(--surface-border)] bg-[var(--gray-light)] p-4 text-sm text-gray-700">
          <strong>Identificação:</strong> prefira uma coluna <code className="rounded bg-white px-1">id</code>. Também aceitamos a combinação de <code className="rounded bg-white px-1">address</code> + <code className="rounded bg-white px-1">postcode</code> ou <code className="rounded bg-white px-1">title</code>.
          {fileName && <span className="ml-2 font-bold text-[var(--green-dark)]">{fileName}</span>}
        </div>
      </section>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      {result && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Summary icon={FileSpreadsheet} label="Linhas no CSV" value={result.rows.length} />
            <Summary icon={Check} label="Já cadastrados" value={result.matched.length} tone="green" />
            <Summary icon={Eye} label="Serão exibidos" value={result.toShow.length} tone="green" />
            <Summary icon={EyeOff} label="Serão ocultados" value={result.toHide.length} tone="amber" />
          </section>
          <section className="rounded-lg border border-[var(--surface-border)] bg-white p-5 shadow-[var(--surface-shadow)] md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Revisão da sincronização</h2>
                <p className="text-sm text-gray-600">Confira os resultados antes de alterar a vitrine pública.</p>
              </div>
              <button type="button" onClick={() => void apply()} disabled={isApplying} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-4 py-3 font-bold text-gray-900 disabled:opacity-60">
                <Check className="h-5 w-5" /> {isApplying ? 'Aplicando...' : 'Aplicar sincronização'}
              </button>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <ResultList title="Novos no CSV — cadastrar" items={result.newRows.map((row) => `Linha ${row.line}: ${row.title || row.address || row.postcode}`)} tone="amber" empty="Nenhum imóvel novo encontrado." />
              <ResultList title="Cadastrados que ficarão ocultos" items={result.toHide.map((property) => `#${property.id} · ${property.title}`)} tone="red" empty="Nenhum imóvel será ocultado." />
            </div>
            {result.duplicateRows.length > 0 && <p className="mt-5 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /> {result.duplicateRows.length} linha(s) duplicada(s) foram ignoradas na comparação.</p>}
          </section>
        </>
      )}
    </div>
  );
}

function Summary({ icon: Icon, label, value, tone = 'gray' }: { icon: typeof Check; label: string; value: number; tone?: 'gray' | 'green' | 'amber' }) {
  const colors = { gray: 'text-gray-700', green: 'text-[var(--green-dark)]', amber: 'text-amber-700' };
  return <div className="rounded-lg border border-[var(--surface-border)] bg-white p-4 shadow-sm"><Icon className={`mb-3 h-5 w-5 ${colors[tone]}`} /><div className="text-2xl font-black text-gray-900">{value}</div><div className="text-sm font-semibold text-gray-600">{label}</div></div>;
}

function ResultList({ title, items, tone, empty }: { title: string; items: string[]; tone: 'amber' | 'red'; empty: string }) {
  return <div><h3 className="mb-2 text-sm font-extrabold text-gray-900">{title} <span className="font-normal text-gray-500">({items.length})</span></h3><div className="max-h-64 overflow-auto rounded-lg border border-gray-200 bg-gray-50">{items.length ? <ul className="divide-y divide-gray-200 text-sm">{items.map((item) => <li key={item} className="px-3 py-2.5 font-semibold text-gray-700">{item}</li>)}</ul> : <p className={`p-4 text-sm font-semibold ${tone === 'amber' ? 'text-amber-700' : 'text-gray-600'}`}>{empty}</p>}</div></div>;
}
