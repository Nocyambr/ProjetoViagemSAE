import { useMemo, useState } from 'react';
import { isTeacher } from '../lib/auth.js';
import {
  buildAutoFillTripDraft,
  EMPTY_DRAFT,
  filterTrips,
  localToday,
  statusLabel,
  validateTrip,
} from '../lib/trips.js';
import {
  createTripApi,
  deleteTripApi,
  fetchTripLocationApi,
  startTripApi,
  updateTripApi,
} from '../lib/api.js';
import {
  formatTeacherNames,
  parseTeacherNames,
  resolveTeacherPhoto,
  resolveTripTeachers,
  TEACHER_DIRECTORY,
} from '../lib/teachers.js';
import { removePhotosByTrip } from '../lib/photos.js';
import {
  BTN_EMERALD,
  BTN_PRIMARY,
  CARD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_CLASS,
} from '../lib/styles.js';
import TripRequiredGate from '../components/TripRequiredGate.jsx';
import Icon from '../components/Icon.jsx';

function TripForm({
  draft,
  setDraft,
  editingId,
  error,
  selectedTeachers,
  onSubmit,
  onAutoFill,
  onCancelEdit,
  onToggleTeacher,
  onSelectAllTeachers,
}) {
  return (
    <section className={`${CARD_CLASS} mb-6`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-rose-400">
          {editingId ? 'Editar viagem' : 'Criar nova viagem'}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onAutoFill} className={BTN_EMERALD}>
            Preencher automaticamente
          </button>
          {editingId && (
            <button type="button" onClick={onCancelEdit} className="text-xs font-semibold text-slate-300 underline hover:text-white">
              Cancelar edição
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className={LABEL_CLASS}>
          Turma ou nome da viagem
          <input
            className={INPUT_CLASS}
            required
            maxLength={100}
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Ex.: Excursão 3ºA"
          />
        </label>

        <label className={LABEL_CLASS}>
          Destino
          <input
            className={INPUT_CLASS}
            maxLength={100}
            value={draft.destination}
            onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
            placeholder="Ex.: Parque Ecológico / Museu"
          />
        </label>

        <label className={LABEL_CLASS}>
          Data
          <input
            type="date"
            required
            className={INPUT_CLASS}
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className={LABEL_CLASS}>
            Saída
            <input
              type="time"
              required
              className={INPUT_CLASS}
              value={draft.departure}
              onChange={(e) => setDraft({ ...draft, departure: e.target.value })}
            />
          </label>
          <label className={LABEL_CLASS}>
            Chegada
            <input
              type="time"
              required
              className={INPUT_CLASS}
              value={draft.arrival}
              onChange={(e) => setDraft({ ...draft, arrival: e.target.value })}
            />
          </label>
        </div>

        <label className={`${LABEL_CLASS} sm:col-span-2`}>
          Ônibus / Transporte
          <input
            className={INPUT_CLASS}
            maxLength={80}
            value={draft.busName}
            onChange={(e) => setDraft({ ...draft, busName: e.target.value })}
            placeholder="Ex.: Ônibus 01 · Placa ABC-1D23"
          />
        </label>

        <div className="sm:col-span-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className={LABEL_CLASS}>
              Professores responsáveis{' '}
              <span className="text-xs font-normal text-slate-400">
                ({selectedTeachers.length} de {TEACHER_DIRECTORY.length} selecionados)
              </span>
            </p>
            {selectedTeachers.length < TEACHER_DIRECTORY.length && (
              <button
                type="button"
                onClick={onSelectAllTeachers}
                className="text-xs font-bold text-emerald-300 underline hover:text-emerald-200"
              >
                Selecionar os dois
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            {TEACHER_DIRECTORY.map((profile) => {
              const selected = selectedTeachers.includes(profile.name);
              return (
                <button
                  key={profile.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggleTeacher(profile)}
                  className={`flex flex-col items-center rounded-2xl border p-3 text-center transition-colors ${
                    selected
                      ? 'border-emerald-400 bg-emerald-950/60 text-white'
                      : 'border-slate-700 bg-[#0b1116] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="h-20 w-20 rounded-full border border-slate-600 object-cover object-top"
                  />
                  <span className="mt-2 text-sm font-bold leading-tight">{profile.name}</span>
                  <span
                    className={`mt-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      selected ? 'bg-emerald-700/70 text-emerald-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selected ? 'Selecionado' : 'Selecionar'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p role="alert" className="text-rose-300 sm:col-span-2">{error}</p>}

        <button type="submit" className={`${BTN_PRIMARY} sm:col-span-2`}>
          {editingId ? 'Salvar alterações' : 'Criar viagem'}
        </button>
      </form>
    </section>
  );
}

function TripItem({ trip, teacher, inspected, onInspect, onStart, onEdit, onDelete }) {
  const tripTeachers = resolveTripTeachers(trip);

  return (
    <li className="border-b border-slate-800 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 break-words">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onInspect(trip)}
              className="text-left font-bold text-rose-400 underline-offset-4 hover:underline"
            >
              {trip.title}
            </button>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                trip.started
                  ? 'border-emerald-700/60 bg-emerald-950/70 text-emerald-300'
                  : 'border-slate-600 bg-slate-800 text-slate-300'
              }`}
            >
              {trip.started ? `Iniciada · ${statusLabel(trip.status)}` : 'Aguardando início'}
            </span>
          </div>

          {trip.destination && <p className="mt-1 text-sm text-slate-200">Destino: {trip.destination}</p>}
          <p className="mt-1 text-sm text-slate-300">
            {trip.date.split('-').reverse().join('/')} · Saída: {trip.departure} · Chegada: {trip.arrival}
          </p>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
            <div className="flex -space-x-1.5">
              {tripTeachers.map((prof) => (
                <img
                  key={prof.id}
                  src={prof.photo}
                  alt={prof.name}
                  className="h-6 w-6 rounded-full border border-slate-600 object-cover object-top"
                />
              ))}
            </div>
            <span>
              {formatTeacherNames(tripTeachers.map((prof) => prof.name))} · {trip.busName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onInspect(trip)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
          >
            {!trip.started && <Icon name="lock" className="h-3.5 w-3.5" />}
            <span>Localização</span>
          </button>

          {teacher && !trip.started && (
            <button
              type="button"
              onClick={() => onStart(trip)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              Iniciar viagem
            </button>
          )}

          {teacher && (
            <>
              <button
                type="button"
                onClick={() => onEdit(trip)}
                className="text-sm text-emerald-300 underline hover:text-emerald-200"
              >
                Editar
              </button>
              <button
                type="button"
                aria-label={`Excluir ${trip.title}`}
                onClick={() => onDelete(trip)}
                className="text-sm text-rose-400 underline hover:text-rose-300"
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {inspected && (
        <div className="mt-3 rounded-2xl border border-slate-700/80 bg-[#0b1116] p-4 text-sm">
          {inspected.error ? (
            <p className="text-amber-300">{inspected.error}</p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-300">Localização atual</p>
              <p className="font-bold text-slate-100">{inspected.origin?.name || 'SESI Cerquilho - SP'}</p>
              <p className="text-xs text-slate-300">
                {inspected.currentLocation.address || inspected.origin?.address}
              </p>
              {inspected.currentLocation.label && inspected.currentLocation.label !== inspected.origin?.label && (
                <p className="text-sm text-emerald-200">{inspected.currentLocation.label}</p>
              )}
              <p className="text-xs text-slate-400">
                GPS: {inspected.currentLocation.lat}, {inspected.currentLocation.lng}
              </p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function Schedule({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips, tripsError, photos } = portal;

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [presetIndex, setPresetIndex] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(tripsError);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('all');
  const [inspectedLocations, setInspectedLocations] = useState({});

  const sortedTrips = useMemo(() => filterTrips(trips, query, period), [trips, query, period]);
  const selectedTeachers = parseTeacherNames(draft.teacherNames ?? draft.teacherName);

  if (!teacher && trips.length === 0) {
    return <TripRequiredGate isTeacher={false} title="Cronograma" />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!teacher) return;

    const validationError = validateTrip(draft);
    if (validationError) {
      setError(validationError);
      setNotice('');
      return;
    }

    if (editingId) {
      const result = await updateTripApi(trips, editingId, draft);
      setError(result.error);
      if (result.error) {
        setNotice('');
        return;
      }
      setNotice('Viagem atualizada com sucesso.');
      setEditingId(null);
      setDraft(EMPTY_DRAFT);
      return;
    }

    const result = await createTripApi(trips, draft);
    setError(result.error);
    if (result.error) {
      setNotice('');
      return;
    }
    setNotice('Viagem criada! Clique em "Iniciar viagem" quando sair do SESI Cerquilho - SP.');
    setDraft(EMPTY_DRAFT);
  }

  async function handleStart(trip) {
    if (!teacher) return;

    const result = await startTripApi(trips, trip.id);
    setError(result.error);
    if (result.error) return;

    setNotice(`Viagem "${trip.title}" iniciada com localização atual em SESI Cerquilho - SP.`);
    const locRes = await fetchTripLocationApi({ ...trip, started: true, status: 'transit' });
    if (locRes.started) {
      setInspectedLocations((prev) => ({ ...prev, [trip.id]: locRes.location }));
    }
  }

  async function handleInspectLocation(trip) {
    const res = await fetchTripLocationApi(trip);
    setInspectedLocations((prev) => ({
      ...prev,
      [trip.id]: res.started ? res.location : { error: res.error },
    }));
  }

  function startEdit(trip) {
    const names = parseTeacherNames(trip.teacherNames ?? trip.teacherName);
    setEditingId(trip.id);
    setDraft({
      title: trip.title,
      destination: trip.destination || '',
      date: trip.date,
      departure: trip.departure,
      arrival: trip.arrival,
      busName: trip.busName || '',
      teacherNames: names,
      teacherName: formatTeacherNames(names),
      teacherContact: trip.teacherContact || TEACHER_DIRECTORY[0].contact,
      teacherPhoto: resolveTeacherPhoto(names[0], trip.teacherPhoto),
    });
    setError('');
    setNotice('');
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError('');
  }

  function handleAutoFill() {
    setDraft(buildAutoFillTripDraft(presetIndex));
    setPresetIndex((prev) => prev + 1);
    setError('');
    setNotice('Informações preenchidas automaticamente com os dois professores selecionados.');
  }

  function updateDraftTeachers(names) {
    const primary = TEACHER_DIRECTORY.find((t) => t.name === names[0]) ?? TEACHER_DIRECTORY[0];
    setDraft({
      ...draft,
      teacherNames: names,
      teacherName: formatTeacherNames(names),
      teacherContact: primary.contact,
      teacherPhoto: primary.photo,
    });
  }

  function toggleDraftTeacher(profile) {
    const exists = selectedTeachers.includes(profile.name);
    if (exists) {
      if (selectedTeachers.length <= 1) {
        setNotice('Pelo menos um professor responsável deve permanecer selecionado.');
        return;
      }
      updateDraftTeachers(selectedTeachers.filter((name) => name !== profile.name));
      return;
    }

    const nextNames = TEACHER_DIRECTORY.map((t) => t.name).filter(
      (name) => selectedTeachers.includes(name) || name === profile.name,
    );
    updateDraftTeachers(nextNames);
  }

  function selectAllTeachers() {
    updateDraftTeachers(TEACHER_DIRECTORY.map((t) => t.name));
  }

  async function handleDelete(trip) {
    if (!teacher) return;
    if (!window.confirm(`Excluir a viagem "${trip.title}"?`)) return;

    const res = await deleteTripApi(trips, trip.id);
    if (!res.error) {
      removePhotosByTrip(photos, trip.id);
      if (editingId === trip.id) cancelEdit();
      setNotice('Viagem removida.');
    }
    setError(res.error);
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

  return (
    <div className="min-h-full bg-[#0b1116] text-slate-100">
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        <h1 className="mb-6 text-3xl font-bold text-rose-400">
          {teacher ? 'Configurar viagens' : 'Cronograma de viagens'}
        </h1>

        {notice && (
          <p role="status" className="mb-4 rounded-xl border border-emerald-700 bg-emerald-950/70 p-3 text-sm text-emerald-200">
            {notice}
          </p>
        )}

        {teacher && (
          <TripForm
            draft={draft}
            setDraft={setDraft}
            editingId={editingId}
            error={error}
            selectedTeachers={selectedTeachers}
            onSubmit={handleSubmit}
            onAutoFill={handleAutoFill}
            onCancelEdit={cancelEdit}
            onToggleTeacher={toggleDraftTeacher}
            onSelectAllTeachers={selectAllTeachers}
          />
        )}

        <section className={CARD_CLASS}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-rose-400">Viagens cadastradas</h2>
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
            <label className={LABEL_CLASS}>
              Buscar viagem
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Turma, nome ou destino"
                className={INPUT_CLASS}
              />
            </label>
            <label className={LABEL_CLASS}>
              Período
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className={SELECT_CLASS}
              >
                <option value="all">Todas as viagens</option>
                <option value="upcoming">A partir de hoje</option>
                <option value="past">Datas passadas</option>
              </select>
            </label>
          </div>

          <p role="status" className="mb-5 text-sm text-slate-400">
            {sortedTrips.length} de {trips.length} viagens
          </p>

          {sortedTrips.length === 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-5 text-slate-200">
              <p>{trips.length ? 'Nenhuma viagem corresponde aos filtros.' : 'Nenhuma viagem cadastrada.'}</p>
              {trips.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setPeriod('all');
                  }}
                  className="mt-3 font-semibold text-rose-400 underline hover:text-rose-300"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          <ul className="space-y-4">
            {sortedTrips.map((trip) => (
              <TripItem
                key={trip.id}
                trip={trip}
                teacher={teacher}
                inspected={inspectedLocations[trip.id]}
                onInspect={handleInspectLocation}
                onStart={handleStart}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
