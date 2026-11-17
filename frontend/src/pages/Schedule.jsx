import { useMemo, useState } from 'react';
import { isTeacher } from '../lib/auth.js';
import {
  EMPTY_DRAFT,
  addTrip as createTrip,
  filterTrips,
  localToday,
  removeTrip,
  statusLabel,
  updateTrip,
} from '../lib/trips.js';
import { removePhotosByTrip } from '../lib/photos.js';
import TripRequiredGate from '../components/TripRequiredGate.jsx';

export default function Schedule({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips, tripsError, photos } = portal;

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(tripsError);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('all');

  const sortedTrips = useMemo(() => filterTrips(trips, query, period), [trips, query, period]);

  if (!teacher && trips.length === 0) {
    return <TripRequiredGate isTeacher={false} title="Cronograma" />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!teacher) return;

    if (editingId) {
      const result = updateTrip(trips, editingId, draft);
      setError(result.error);
      if (!result.error) {
        setNotice('Viagem atualizada com sucesso.');
        setEditingId(null);
        setDraft(EMPTY_DRAFT);
      } else {
        setNotice('');
      }
      return;
    }

    const result = createTrip(trips, draft);
    setError(result.error);
    setNotice(result.error ? '' : 'Viagem criada e liberada para alunos e pais.');
    setDraft(result.draft);
  }

  function startEdit(trip) {
    setEditingId(trip.id);
    setDraft({
      title: trip.title,
      destination: trip.destination || '',
      date: trip.date,
      departure: trip.departure,
      arrival: trip.arrival,
      busName: trip.busName || '',
      teacherName: trip.teacherName || '',
      teacherContact: trip.teacherContact || '',
    });
    setError('');
    setNotice('');
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError('');
  }

  function handleDelete(trip) {
    if (!teacher) return;
    if (window.confirm(`Excluir a viagem "${trip.title}"?`)) {
      const res = removeTrip(trips, trip.id);
      if (!res.error) {
        removePhotosByTrip(photos, trip.id);
        if (editingId === trip.id) cancelEdit();
        setNotice('Viagem removida.');
      }
      setError(res.error);
    }
  }

  function exportTrips() {
    const blob = new Blob([JSON.stringify({ version: 2, trips }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cronograma-sae-${localToday()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Cópia do cronograma baixada.');
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-slate-500 bg-[#0b1116] p-2.5 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none';

  return (
    <div className="min-h-full bg-[#0b1116] text-slate-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-rose-400 mb-6">
          {teacher ? 'Configurar viagens' : 'Cronograma de viagens'}
        </h1>

        {notice && (
          <p role="status" className="mb-4 rounded-xl border border-emerald-700 bg-emerald-950/70 p-3 text-sm text-emerald-200">
            {notice}
          </p>
        )}

        {teacher && (
          <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-5 sm:p-8 shadow-sm mb-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-rose-400 font-bold">
                {editingId ? 'Editar viagem' : 'Criar nova viagem'}
              </h2>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="text-xs font-semibold text-slate-300 underline hover:text-white">
                  Cancelar edição
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-200">
                Turma ou nome da viagem
                <input
                  className={inputClass}
                  required
                  maxLength={100}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Ex.: Excursão 3ºA"
                />
              </label>

              <label className="text-sm font-medium text-slate-200">
                Destino
                <input
                  className={inputClass}
                  maxLength={100}
                  value={draft.destination}
                  onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
                  placeholder="Ex.: Parque Ecológico / Museu"
                />
              </label>

              <label className="text-sm font-medium text-slate-200">
                Data
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium text-slate-200">
                  Saída
                  <input
                    type="time"
                    required
                    className={inputClass}
                    value={draft.departure}
                    onChange={(e) => setDraft({ ...draft, departure: e.target.value })}
                  />
                </label>
                <label className="text-sm font-medium text-slate-200">
                  Chegada
                  <input
                    type="time"
                    required
                    className={inputClass}
                    value={draft.arrival}
                    onChange={(e) => setDraft({ ...draft, arrival: e.target.value })}
                  />
                </label>
              </div>

              <label className="text-sm font-medium text-slate-200">
                Ônibus / Transporte
                <input
                  className={inputClass}
                  maxLength={80}
                  value={draft.busName}
                  onChange={(e) => setDraft({ ...draft, busName: e.target.value })}
                  placeholder="Ex.: Ônibus 01 · Placa ABC-1D23"
                />
              </label>

              <label className="text-sm font-medium text-slate-200">
                Professor responsável
                <input
                  className={inputClass}
                  maxLength={80}
                  value={draft.teacherName}
                  onChange={(e) => setDraft({ ...draft, teacherName: e.target.value })}
                  placeholder="Ex.: Prof. Carlos"
                />
              </label>

              <label className="text-sm font-medium text-slate-200 sm:col-span-2">
                Contato do responsável
                <input
                  className={inputClass}
                  maxLength={80}
                  value={draft.teacherContact}
                  onChange={(e) => setDraft({ ...draft, teacherContact: e.target.value })}
                  placeholder="Ex.: (11) 99999-0000 ou e-mail"
                />
              </label>

              {error && <p role="alert" className="text-rose-300 sm:col-span-2">{error}</p>}

              <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-lg sm:col-span-2">
                {editingId ? 'Salvar alterações' : 'Criar viagem'}
              </button>
            </form>
          </section>
        )}

        <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-5 sm:p-8 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-rose-400 font-bold">Viagens cadastradas</h2>
            <button
              type="button"
              onClick={exportTrips}
              disabled={!trips.length}
              className="rounded-xl border border-emerald-500/60 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-950/60 disabled:opacity-40"
            >
              Baixar cópia do cronograma
            </button>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-200">
              Buscar viagem
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Turma, nome ou destino"
                className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-200">
              Período
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 focus:border-emerald-400 focus:outline-none"
              >
                <option value="all">Todas as viagens</option>
                <option value="upcoming">A partir de hoje</option>
                <option value="past">Datas passadas</option>
              </select>
            </label>
          </div>

          <p role="status" className="mb-5 text-sm text-slate-400">{sortedTrips.length} de {trips.length} viagens</p>

          {sortedTrips.length === 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-5 text-slate-200">
              <p>{trips.length ? 'Nenhuma viagem corresponde aos filtros.' : 'Nenhuma viagem cadastrada.'}</p>
              {trips.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setPeriod('all'); }}
                  className="mt-3 font-semibold text-rose-400 underline hover:text-rose-300"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          <ul className="space-y-4">
            {sortedTrips.map((trip) => (
              <li key={trip.id} className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="min-w-0 break-words">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-rose-400">{trip.title}</h3>
                    <span className="rounded-full border border-emerald-700/60 bg-emerald-950/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      {statusLabel(trip.status)}
                    </span>
                  </div>
                  {trip.destination && <p className="mt-1 text-sm text-slate-200">Destino: {trip.destination}</p>}
                  <p className="mt-1 text-sm text-slate-300">
                    {trip.date.split('-').reverse().join('/')} · Saída: {trip.departure} · Chegada: {trip.arrival}
                  </p>
                  <p className="text-xs text-slate-400">
                    {trip.busName} · {trip.teacherName}
                  </p>
                </div>

                {teacher && (
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => startEdit(trip)} className="text-sm text-emerald-300 underline hover:text-emerald-200">
                      Editar
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir ${trip.title}`}
                      onClick={() => handleDelete(trip)}
                      className="text-sm text-rose-400 underline hover:text-rose-300"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
