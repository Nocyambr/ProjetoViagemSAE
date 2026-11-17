import {
  addTrip as addLocalTrip,
  normalizeTripFields,
  removeTrip as removeLocalTrip,
  saveTrips,
  SESI_CERQUILHO,
  startTrip as startLocalTrip,
  updateTrip as updateLocalTrip,
  updateTripLocation as updateLocalLocation,
} from './trips.js';

async function requestJson(url, options = {}, fetchImpl = globalThis.fetch) {
  const res = await fetchImpl(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { ok: res.ok, status: res.status, body };
}

/**
 * Fetches all trips from the Laravel API and syncs local cache.
 */
export async function fetchTripsApi(fetchImpl = globalThis.fetch, storage) {
  try {
    const { ok, body } = await requestJson('/api/trips', { method: 'GET' }, fetchImpl);
    if (!ok || !Array.isArray(body?.trips)) {
      return { trips: null, error: body?.message || 'Erro ao consultar viagens na API.' };
    }
    const normalized = body.trips.map(normalizeTripFields);
    saveTrips(normalized, storage);
    return { trips: normalized, error: '' };
  } catch {
    return { trips: null, error: 'API indisponível no momento.' };
  }
}

/**
 * Creates a trip via the Laravel API (or falls back to local storage if offline).
 */
export async function createTripApi(trips, draft, fetchImpl = globalThis.fetch, storage) {
  try {
    const { ok, body } = await requestJson('/api/trips', {
      method: 'POST',
      body: JSON.stringify(draft),
    }, fetchImpl);
    if (ok && body?.trip) {
      const next = [...trips, normalizeTripFields(body.trip)];
      saveTrips(next, storage);
      return { trips: next, error: '' };
    }
    if (body?.message) {
      return { trips, error: body.message };
    }
  } catch {
    // Fallback to local storage when backend server is offline.
  }
  const local = addLocalTrip(trips, draft, storage);
  return { trips: local.trips, error: local.error };
}

/**
 * Updates an existing trip via the Laravel API.
 */
export async function updateTripApi(trips, tripId, draft, fetchImpl = globalThis.fetch, storage) {
  try {
    const { ok, body } = await requestJson(`/api/trips/${encodeURIComponent(tripId)}`, {
      method: 'PATCH',
      body: JSON.stringify(draft),
    }, fetchImpl);
    if (ok && body?.trip) {
      const updated = normalizeTripFields(body.trip);
      const next = trips.map((t) => (t.id === tripId ? updated : t));
      saveTrips(next, storage);
      return { trips: next, error: '' };
    }
    if (body?.message) {
      return { trips, error: body.message };
    }
  } catch {
    // Fallback to local storage when backend server is offline.
  }
  return updateLocalTrip(trips, tripId, draft, storage);
}

/**
 * Marks a trip as started by the teacher and initializes SESI Cerquilho-SP location.
 */
export async function startTripApi(trips, tripId, fetchImpl = globalThis.fetch, storage) {
  try {
    const { ok, body } = await requestJson(`/api/trips/${encodeURIComponent(tripId)}/start`, {
      method: 'POST',
    }, fetchImpl);
    if (ok && body?.trip) {
      const updated = normalizeTripFields(body.trip);
      const next = trips.map((t) => (t.id === tripId ? updated : t));
      saveTrips(next, storage);
      return { trips: next, origin: body.origin ?? SESI_CERQUILHO, error: '' };
    }
    if (body?.message) {
      return { trips, origin: null, error: body.message };
    }
  } catch {
    // Fallback to local storage when backend server is offline.
  }
  const local = startLocalTrip(trips, tripId, storage);
  return { trips: local.trips, origin: SESI_CERQUILHO, error: local.error };
}

/**
 * Fetches live SESI Cerquilho-SP and current bus location when clicking a started trip.
 */
export async function fetchTripLocationApi(trip, fetchImpl = globalThis.fetch) {
  if (!trip) {
    return { started: false, location: null, error: 'Viagem não encontrada.' };
  }
  try {
    const { ok, status, body } = await requestJson(`/api/trips/${encodeURIComponent(trip.id)}/location`, {
      method: 'GET',
    }, fetchImpl);
    if (status === 423) {
      return {
        started: false,
        location: null,
        error: body?.message || 'A viagem ainda não foi iniciada pelo professor.',
      };
    }
    if (ok && body?.started) {
      return {
        started: true,
        location: body,
        error: '',
      };
    }
  } catch {
    // Fallback to local trip state when backend server is offline.
  }

  if (!trip.started && trip.status === 'planned') {
    return {
      started: false,
      location: null,
      error: 'A viagem ainda não foi iniciada pelo professor.',
    };
  }

  return {
    started: true,
    location: {
      started: true,
      tripId: trip.id,
      title: trip.title,
      destination: trip.destination,
      status: trip.status,
      startedAt: trip.startedAt,
      origin: SESI_CERQUILHO,
      currentLocation: trip.busLocation,
    },
    error: '',
  };
}

/**
 * Updates live bus status/location via the Laravel API.
 */
export async function updateTripLocationApi(trips, tripId, payload, fetchImpl = globalThis.fetch, storage) {
  try {
    const { ok, body } = await requestJson(`/api/trips/${encodeURIComponent(tripId)}/location`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, fetchImpl);
    if (ok && body?.trip) {
      const updated = normalizeTripFields(body.trip);
      const next = trips.map((t) => (t.id === tripId ? updated : t));
      saveTrips(next, storage);
      return { trips: next, error: '' };
    }
    if (body?.message) {
      return { trips, error: body.message };
    }
  } catch {
    // Fallback to local storage when backend server is offline.
  }
  return updateLocalLocation(trips, tripId, payload, storage);
}

/**
 * Deletes a trip via the Laravel API.
 */
export async function deleteTripApi(trips, tripId, fetchImpl = globalThis.fetch, storage) {
  try {
    const { ok, body } = await requestJson(`/api/trips/${encodeURIComponent(tripId)}`, {
      method: 'DELETE',
    }, fetchImpl);
    if (ok) {
      const next = trips.filter((t) => t.id !== tripId);
      saveTrips(next, storage);
      return { trips: next, error: '' };
    }
    if (body?.message) {
      return { trips, error: body.message };
    }
  } catch {
    // Fallback to local storage when backend server is offline.
  }
  return removeLocalTrip(trips, tripId, storage);
}
