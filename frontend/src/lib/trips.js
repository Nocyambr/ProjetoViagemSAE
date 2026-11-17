export const SESI_CERQUILHO = {
  name: 'SESI Cerquilho - SP',
  unit: 'CE 428',
  label: 'SESI Cerquilho - SP (Rua Antônio Modanez, 111 - Residencial São Francisco)',
  address: 'Rua Antônio Modanez, 111 - Residencial São Francisco, Cerquilho - SP, CEP 18527-372',
  city: 'Cerquilho',
  state: 'SP',
  cep: '18527-372',
  lat: '-23.16345',
  lng: '-47.76580',
};

export const STORAGE_KEY = 'sae:trips:v2';
export const INITIAL_TRIPS = [];

export const BUS_STATUSES = [
  { value: 'planned', label: 'Aguardando início' },
  { value: 'boarding', label: 'Embarcando' },
  { value: 'transit', label: 'Em trajeto' },
  { value: 'arrived', label: 'No destino' },
  { value: 'returning', label: 'Retornando' },
  { value: 'finished', label: 'Finalizada' },
];

export function statusLabel(status) {
  return BUS_STATUSES.find((item) => item.value === status)?.label ?? 'Aguardando início';
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function defaultLocation() {
  return {
    label: SESI_CERQUILHO.label,
    address: SESI_CERQUILHO.address,
    lat: SESI_CERQUILHO.lat,
    lng: SESI_CERQUILHO.lng,
    progress: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeTripFields(trip) {
  const destination = typeof trip.destination === 'string' ? trip.destination.trim() : '';
  const busName = typeof trip.busName === 'string' ? trip.busName.trim() : '';
  const teacherName = typeof trip.teacherName === 'string' ? trip.teacherName.trim() : '';
  const teacherContact = typeof trip.teacherContact === 'string' ? trip.teacherContact.trim() : '';
  const status = BUS_STATUSES.some((s) => s.value === trip.status) ? trip.status : 'planned';
  const startedAt = typeof trip.startedAt === 'string' && trip.startedAt ? trip.startedAt : null;
  const started = Boolean(trip.started || startedAt !== null || status !== 'planned');
  const loc = trip.busLocation && typeof trip.busLocation === 'object' ? trip.busLocation : defaultLocation();
  const progressNum = Number(loc.progress);
  const progress = Number.isFinite(progressNum) ? Math.min(100, Math.max(0, Math.round(progressNum))) : 0;

  return {
    id: trip.id,
    title: trip.title.trim(),
    destination,
    date: trip.date,
    departure: trip.departure,
    arrival: trip.arrival,
    busName: busName || 'Ônibus fretado',
    teacherName: teacherName || 'Professor responsável',
    teacherContact,
    status,
    started,
    startedAt,
    busLocation: {
      label: typeof loc.label === 'string' && loc.label.trim() ? loc.label.trim() : SESI_CERQUILHO.label,
      address: typeof loc.address === 'string' && loc.address.trim() ? loc.address.trim() : SESI_CERQUILHO.address,
      lat: typeof loc.lat === 'string' ? loc.lat.trim() : SESI_CERQUILHO.lat,
      lng: typeof loc.lng === 'string' ? loc.lng.trim() : SESI_CERQUILHO.lng,
      progress,
      updatedAt: typeof loc.updatedAt === 'string' && loc.updatedAt ? loc.updatedAt : new Date().toISOString(),
    },
  };
}

/**
 * Validates required trip fields and schedule order.
 */
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

/**
 * Loads saved trips from storage; starts empty until a teacher creates one.
 */
export function loadTrips(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(STORAGE_KEY);
    if (raw === null) return { trips: [], error: '' };
    const saved = JSON.parse(raw);
    const ids = new Set();
    if (
      !Array.isArray(saved) ||
      !saved.every((trip) => {
        if (validateTrip(trip) || typeof trip.id !== 'string' || !trip.id.trim() || ids.has(trip.id)) return false;
        ids.add(trip.id);
        return true;
      })
    ) {
      throw new Error('Invalid trips');
    }
    return { trips: saved.map(normalizeTripFields), error: '' };
  } catch {
    return {
      trips: [],
      error: 'Não foi possível carregar o cronograma salvo.',
    };
  }
}

/**
 * Persists trips to local storage and notifies listeners in the same tab.
 */
export function saveTrips(trips, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(STORAGE_KEY, JSON.stringify(trips));
    if (!storage && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sae:data-updated'));
    }
    return '';
  } catch {
    return 'Não foi possível salvar no navegador. Verifique o armazenamento disponível e tente novamente.';
  }
}

/**
 * Sorts trips chronologically by date, departure, and title.
 */
export function sortTrips(trips) {
  return [...trips].sort(
    (a, b) => a.date.localeCompare(b.date) || a.departure.localeCompare(b.departure) || a.title.localeCompare(b.title, 'pt-BR'),
  );
}

export const EMPTY_DRAFT = {
  title: '',
  destination: '',
  date: '',
  departure: '07:00',
  arrival: '18:00',
  busName: '',
  teacherName: '',
  teacherContact: '',
};

/**
 * Validates, creates, and persists a new trip.
 */
export function addTrip(trips, draft, storage, createId = () => crypto.randomUUID()) {
  const error = validateTrip(draft);
  if (error) return { trips, draft, error };
  try {
    const created = normalizeTripFields({ ...draft, id: createId() });
    const next = [...trips, created];
    const saveError = saveTrips(next, storage);
    if (saveError) return { trips, draft, error: saveError };
    return { trips: next, draft: { ...EMPTY_DRAFT }, error: '' };
  } catch {
    return { trips, draft, error: 'Não foi possível criar a viagem. Tente novamente em um navegador atualizado.' };
  }
}

/**
 * Marks a trip as started by the teacher and sets the origin to SESI Cerquilho-SP.
 */
export function startTrip(trips, tripId, storage) {
  const index = trips.findIndex((t) => t.id === tripId);
  if (index === -1) return { trips, error: 'Viagem não encontrada.' };
  const now = new Date().toISOString();
  const updated = normalizeTripFields({
    ...trips[index],
    status: 'transit',
    started: true,
    startedAt: trips[index].startedAt ?? now,
    busLocation: {
      ...defaultLocation(),
      updatedAt: now,
    },
  });
  const next = trips.map((t) => (t.id === tripId ? updated : t));
  const saveError = saveTrips(next, storage);
  if (saveError) return { trips, error: saveError };
  return { trips: next, error: '' };
}

/**
 * Updates an existing trip and persists the changes.
 */
export function updateTrip(trips, tripId, updates, storage) {
  const index = trips.findIndex((t) => t.id === tripId);
  if (index === -1) return { trips, error: 'Viagem não encontrada.' };
  const merged = { ...trips[index], ...updates, id: tripId };
  const error = validateTrip(merged);
  if (error) return { trips, error };
  const next = trips.map((t) => (t.id === tripId ? normalizeTripFields(merged) : t));
  const saveError = saveTrips(next, storage);
  if (saveError) return { trips, error: saveError };
  return { trips: next, error: '' };
}

/**
 * Updates bus status and live location metadata for a trip.
 */
export function updateTripLocation(trips, tripId, { status, busName, label, address, lat, lng, progress }, storage) {
  const index = trips.findIndex((t) => t.id === tripId);
  if (index === -1) return { trips, error: 'Viagem não encontrada.' };
  const current = trips[index];
  const nextStatus = BUS_STATUSES.some((s) => s.value === status) ? status : current.status;
  const cleanLabel = typeof label === 'string' ? label.trim() : '';
  if (!cleanLabel) return { trips, error: 'Informe a localização ou ponto de referência do ônibus.' };

  const progressNum = Number(progress);
  const clampedProgress = Number.isFinite(progressNum) ? Math.min(100, Math.max(0, Math.round(progressNum))) : current.busLocation.progress;
  const now = new Date().toISOString();
  const started = current.started || nextStatus !== 'planned';

  const updated = normalizeTripFields({
    ...current,
    status: nextStatus,
    started,
    startedAt: current.startedAt ?? (started ? now : null),
    busName: typeof busName === 'string' && busName.trim() ? busName.trim() : current.busName,
    busLocation: {
      label: cleanLabel,
      address: typeof address === 'string' && address.trim() ? address.trim() : current.busLocation.address,
      lat: typeof lat === 'string' ? lat.trim() : current.busLocation.lat,
      lng: typeof lng === 'string' ? lng.trim() : current.busLocation.lng,
      progress: clampedProgress,
      updatedAt: now,
    },
  });

  const next = trips.map((t) => (t.id === tripId ? updated : t));
  const saveError = saveTrips(next, storage);
  if (saveError) return { trips, error: saveError };
  return { trips: next, error: '' };
}

/**
 * Removes a trip by id and persists the remaining list.
 */
export function removeTrip(trips, tripId, storage) {
  const next = trips.filter((t) => t.id !== tripId);
  const saveError = saveTrips(next, storage);
  if (saveError) return { trips, error: saveError };
  return { trips: next, error: '' };
}

export function localToday(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Filters and sorts trips by accent-insensitive title/destination search and date period.
 */
export function filterTrips(trips, query = '', period = 'all', today = localToday()) {
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const search = normalize(query.trim());
  return sortTrips(trips).filter(
    (trip) =>
      (normalize(trip.title).includes(search) || normalize(trip.destination || '').includes(search)) &&
      (period !== 'upcoming' || trip.date >= today) &&
      (period !== 'past' || trip.date < today),
  );
}
