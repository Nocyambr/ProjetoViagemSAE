import { useState } from 'react';
import { loadPreparation, savePreparation, PREPARATION_ITEMS } from '../lib/preparation.js';

export default function PreparationChecklist() {
  const [initial] = useState(() => loadPreparation());
  const [checked, setChecked] = useState(initial.checked);
  const [error, setError] = useState(initial.error);
  function toggle(id) {
    const next = checked.includes(id) ? checked.filter((item) => item !== id) : [...checked, id];
    const saveError = savePreparation(next);
    setError(saveError);
    if (!saveError) setChecked(next);
  }
  return (
    <section className="rounded-2xl bg-white p-6 text-left shadow-sm" aria-label="Lista de preparação">
      <h2 className="text-lg font-bold text-emerald-950">Antes de sair</h2>
      <p className="mt-1 text-sm text-gray-600">Uma lista para organizar sua mochila e sua viagem.</p>
      <p role="status" className="mt-4 text-sm font-semibold text-emerald-800">{checked.length} de {PREPARATION_ITEMS.length} itens prontos</p>
      <progress className="my-3 h-2 w-full accent-emerald-700" aria-label="Progresso da preparação" value={checked.length} max={PREPARATION_ITEMS.length} />
      <ul className="space-y-1">
        {PREPARATION_ITEMS.map((item) => <li key={item.id}><label className="flex cursor-pointer items-start gap-3 rounded-lg py-3 text-sm"><input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggle(item.id)} className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-700" /><span className={checked.includes(item.id) ? 'text-gray-500 line-through' : ''}>{item.label}</span></label></li>)}
      </ul>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <p className="mt-4 text-xs text-gray-500">Marcações salvas somente neste navegador.</p>
    </section>
  );
}
