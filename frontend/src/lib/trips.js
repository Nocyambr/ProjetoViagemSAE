export const STORAGE_KEY = 'sae:trips:v1';
export const INITIAL_TRIPS = [
  { id: '1', title: 'Viagem 3ºB', date: '2026-05-10', departure: '07:00', arrival: '18:00' },
  { id: '2', title: 'Viagem 2ºA', date: '2026-08-12', departure: '07:00', arrival: '18:00' },
  { id: '3', title: 'Viagem 9ºA', date: '2025-12-11', departure: '07:00', arrival: '18:00' },
];

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function validateTrip(trip) {
  if (!trip || typeof trip !== 'object' || typeof trip.title !== 'string' || !trip.title.trim()) {
    return 'Informe o nome da viagem.';
  }
  if (trip.title.trim().length > 100) return 'O nome deve ter até 100 caracteres.';
  if (!validDate(trip.date)) return 'Informe uma data válida.';
  if (!validTime(trip.departure) || !validTime(trip.arrival)) return 'Informe horários válidos.';
  if (trip.arrival <= trip.departure) return 'A chegada deve ser posterior à saída no mesmo dia.';
  return '';
}

export function loadTrips(storage) {
  try {
    // Access inside try: browsers may deny even reading localStorage.
    const raw = (storage ?? globalThis.localStorage).getItem(STORAGE_KEY);
    if (raw === null) return { trips: structuredClone(INITIAL_TRIPS), error: '' };
    const saved = JSON.parse(raw);
    const ids = new Set();
    if (!Array.isArray(saved) || !saved.every((trip) => {
      if (validateTrip(trip) || typeof trip.id !== 'string' || !trip.id.trim() || ids.has(trip.id)) return false;
      ids.add(trip.id);
      return true;
    })) throw new Error('Invalid trips');
    return { trips: saved, error: '' };
  } catch {
    return {
      trips: structuredClone(INITIAL_TRIPS),
      error: 'Não foi possível carregar o cronograma salvo. Exibindo exemplos; o conteúdo anterior só será substituído ao salvar uma alteração.',
    };
  }
}

export function saveTrips(trips, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify(trips));
    return '';
  } catch {
    return 'Não foi possível salvar no navegador. Seus dados foram mantidos na tela; verifique o armazenamento disponível e tente novamente.';
  }
}

export function sortTrips(trips) {
  return [...trips].sort((a, b) => a.date.localeCompare(b.date) || a.departure.localeCompare(b.departure) || a.title.localeCompare(b.title, 'pt-BR'));
}

// Draft clearing is part of the transaction: only clear after saving succeeds.
export function addTrip(trips, draft, storage, createId = () => crypto.randomUUID()) {
  const error = validateTrip(draft);
  if (error) return { trips, draft, error };
  try {
    const next = [...trips, { ...draft, title: draft.title.trim(), id: createId() }];
    const saveError = saveTrips(next, storage);
    if (saveError) return { trips, draft, error: saveError };
    return { trips: next, draft: { title: '', date: '', departure: '07:00', arrival: '18:00' }, error: '' };
  } catch {
    return { trips, draft, error: 'Não foi possível criar a viagem. Tente novamente em um navegador atualizado.' };
  }
}

export function localToday(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function filterTrips(trips, query = '', period = 'all', today = localToday()) {
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const search = normalize(query.trim());
  return sortTrips(trips).filter((trip) => normalize(trip.title).includes(search)
    && (period !== 'upcoming' || trip.date >= today)
    && (period !== 'past' || trip.date < today));
}
