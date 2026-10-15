import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addTrip as createTrip, loadTrips, saveTrips, sortTrips } from '../lib/trips.js';

export default function Schedule() {
  const navigate = useNavigate();
  const [initial] = useState(() => loadTrips());
  const [trips, setTrips] = useState(initial.trips);
  const [draft, setDraft] = useState({ title: '', date: '', departure: '07:00', arrival: '18:00' });
  const [error, setError] = useState(initial.error);
  const sortedTrips = useMemo(() => sortTrips(trips), [trips]);

  function persist(next) {
    const saveError = saveTrips(next);
    setError(saveError);
    if (!saveError) setTrips(next);
  }

  function addTrip(event) {
    event.preventDefault();
    const result = createTrip(trips, draft);
    setError(result.error);
    setTrips(result.trips);
    setDraft(result.draft);
  }

  function deleteTrip(trip) {
    if (window.confirm(`Excluir a viagem "${trip.title}"?`)) {
      persist(trips.filter((item) => item.id !== trip.id));
    }
  }

  return (
    <main className="min-h-screen bg-[#F8E9EB]">
      <header className="bg-[#2A2A2A] text-white flex justify-between items-center px-4 py-3">
        <span className="font-bold italic bg-red-600 px-2 py-1">SESI SENAI</span>
        <button onClick={() => navigate('/home')} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold">VOLTAR</button>
      </header>
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-red-600">Data e Horários</h1>
        <p className="text-sm text-red-700 mb-2">Cronograma de atividades</p>
        <p className="text-sm text-gray-700 mb-6">Modo demonstração: os dados são salvos somente neste navegador, não no servidor nem para outros usuários.</p>
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
          <h2 className="text-red-700 font-bold mb-6">Viagens cadastradas</h2>
          {sortedTrips.length === 0 && <p>Nenhuma viagem cadastrada.</p>}
          <ul className="space-y-4">
            {sortedTrips.map((trip) => (
              <li key={trip.id} className="flex items-start justify-between gap-4 border-b pb-4">
                <div className="min-w-0 break-words">
                  <h3 className="font-bold text-red-700">{trip.title}</h3>
                  <p className="text-sm">{trip.date.split('-').reverse().join('/')}</p>
                  <p className="text-sm text-gray-600">Saída: {trip.departure} · Chegada: {trip.arrival}</p>
                </div>
                <button type="button" aria-label={`Excluir ${trip.title}`} onClick={() => deleteTrip(trip)} className="text-sm text-red-700 underline">Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
