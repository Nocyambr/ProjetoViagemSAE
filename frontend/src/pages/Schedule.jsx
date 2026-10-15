import { useMemo, useState } from 'react';

import { addTrip as createTrip, loadTrips, saveTrips, filterTrips, localToday } from '../lib/trips.js';

export default function Schedule() {
  const [initial] = useState(() => loadTrips());
  const [trips, setTrips] = useState(initial.trips);
  const [draft, setDraft] = useState({ title: '', date: '', departure: '07:00', arrival: '18:00' });
  const [error, setError] = useState(initial.error);
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('all');
  const [notice, setNotice] = useState('');
  const sortedTrips = useMemo(() => filterTrips(trips, query, period), [trips, query, period]);

  function persist(next) {
    const saveError = saveTrips(next);
    setError(saveError);
    setNotice(saveError ? '' : 'Alteração salva neste navegador.');
    if (!saveError) setTrips(next);
  }

  function addTrip(event) {
    event.preventDefault();
    const result = createTrip(trips, draft);
    setError(result.error);
    setNotice(result.error ? '' : 'Viagem adicionada e salva neste navegador.');
    setTrips(result.trips);
    setDraft(result.draft);
  }

  function exportTrips() {
    const blob = new Blob([JSON.stringify({ version: 1, trips }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cronograma-sae-${localToday()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Cópia do cronograma preparada para download.');
  }

  function deleteTrip(trip) {
    if (window.confirm(`Excluir a viagem "${trip.title}"?`)) {
      persist(trips.filter((item) => item.id !== trip.id));
    }
  }

  return (
    <div className="min-h-full bg-[#F8E9EB]">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-red-600">Cronograma de viagens</h1>
        <p className="text-sm text-red-700 mb-2">Cronograma de atividades</p>
        <p className="text-sm text-gray-700 mb-6">Modo demonstração: os dados são salvos somente neste navegador, não no servidor nem para outros usuários.</p>
        {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-900">{notice}</p>}
        <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <h2 className="text-red-700 font-bold mb-4">Adicionar viagem</h2>
          <form onSubmit={addTrip} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Turma ou nome da viagem
              <input className="mt-1 block w-full border rounded-lg p-2" required maxLength={100} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex.: Viagem 3ºA" />
            </label>
            <label className="text-sm font-medium">Data
              <input type="date" required className="mt-1 block w-full border rounded-lg p-2" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </label>
            <label className="text-sm font-medium">Saída
              <input type="time" required className="mt-1 block w-full border rounded-lg p-2" value={draft.departure} onChange={(e) => setDraft({ ...draft, departure: e.target.value })} />
            </label>
            <label className="text-sm font-medium">Chegada
              <input type="time" required className="mt-1 block w-full border rounded-lg p-2" value={draft.arrival} onChange={(e) => setDraft({ ...draft, arrival: e.target.value })} />
            </label>
            {error && <p role="alert" className="text-red-700 sm:col-span-2">{error}</p>}
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg sm:col-span-2">Adicionar</button>
          </form>
        </section>
        <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-red-700 font-bold">Viagens cadastradas</h2>
            <button type="button" onClick={exportTrips} disabled={!trips.length} className="rounded-xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 disabled:opacity-40">Baixar cópia do cronograma</button>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Buscar viagem<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Turma ou nome da viagem" className="mt-1 block w-full rounded-xl border border-gray-300 p-3" /></label>
            <label className="text-sm font-medium">Período<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-3"><option value="all">Todas as viagens</option><option value="upcoming">A partir de hoje</option><option value="past">Datas passadas</option></select></label>
          </div>
          <p role="status" className="mb-5 text-sm text-gray-600">{sortedTrips.length} de {trips.length} viagens</p>
          {sortedTrips.length === 0 && <div className="rounded-xl bg-rose-50 p-5"><p>{trips.length ? 'Nenhuma viagem corresponde aos filtros.' : 'Nenhuma viagem cadastrada. Use o formulário acima para começar.'}</p>{trips.length > 0 && <button type="button" onClick={() => { setQuery(''); setPeriod('all'); }} className="mt-3 font-semibold text-red-700 underline">Limpar filtros</button>}</div>}
          <ul className="space-y-4">
            {sortedTrips.map((trip) => (
              <li key={trip.id} className="flex items-start justify-between gap-4 border-b pb-4">
                <div className="min-w-0 break-words">
                  <h3 className="font-bold text-red-700">{trip.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-emerald-800">{trip.date < localToday() ? 'Data passada' : 'A partir de hoje'}</p>
                  <p className="text-sm">{trip.date.split('-').reverse().join('/')}</p>
                  <p className="text-sm text-gray-600">Saída: {trip.departure} · Chegada: {trip.arrival}</p>
                </div>
                <button type="button" aria-label={`Excluir ${trip.title}`} onClick={() => deleteTrip(trip)} className="text-sm text-red-700 underline">Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
