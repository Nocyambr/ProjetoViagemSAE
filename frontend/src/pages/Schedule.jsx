import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INITIAL_TRIPS = [
  { id: '1', title: 'Viagem 3ºB', date: '2026-05-10', departure: '07:00', arrival: '18:00' },
  { id: '2', title: 'Viagem 2ºA', date: '2026-08-12', departure: '07:00', arrival: '18:00' },
  { id: '3', title: 'Viagem 9ºA', date: '2025-12-11', departure: '07:00', arrival: '18:00' },
];
const STORAGE_KEY = 'sae:trips:v1';

function loadTrips() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.every((trip) => typeof trip.id === 'string' && typeof trip.title === 'string' && typeof trip.date === 'string')) return saved;
  } catch { /* Ignore invalid local browser data. */ }
  return INITIAL_TRIPS;
}

export default function Schedule() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState(loadTrips);
  const [draft, setDraft] = useState({ title: '', date: '', departure: '07:00', arrival: '18:00' });
  const [error, setError] = useState('');
  const sortedTrips = useMemo(() => [...trips].sort((a, b) => a.date.localeCompare(b.date)), [trips]);

  function persist(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setTrips(next);
      setError('');
    } catch {
      setError('Não foi possível salvar no navegador. Verifique o armazenamento disponível.');
    }
  }

  function addTrip(event) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.date) return setError('Informe o nome e a data da viagem.');
    if (draft.arrival <= draft.departure) return setError('A chegada deve ser posterior à saída no mesmo dia.');
    persist([...trips, { ...draft, title: draft.title.trim(), id: crypto.randomUUID() }]);
    setDraft({ title: '', date: '', departure: '07:00', arrival: '18:00' });
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
                <div>
                  <h3 className="font-bold text-red-700">{trip.title}</h3>
                  <p className="text-sm">{trip.date.split('-').reverse().join('/')}</p>
                  <p className="text-sm text-gray-600">Saída: {trip.departure} · Chegada: {trip.arrival}</p>
                </div>
                <button type="button" aria-label={`Excluir ${trip.title}`} onClick={() => persist(trips.filter((item) => item.id !== trip.id))} className="text-sm text-red-700 underline">Excluir</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
