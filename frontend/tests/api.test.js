import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTripApi,
  deleteTripApi,
  fetchTripLocationApi,
  fetchTripsApi,
  startTripApi,
  updateTripLocationApi,
} from '../src/lib/api.js';
import { SESI_CERQUILHO, STORAGE_KEY } from '../src/lib/trips.js';

function memoryStorage() {
  let raw = null;
  return {
    getItem(key) { assert.equal(key, STORAGE_KEY); return raw; },
    setItem(key, value) { assert.equal(key, STORAGE_KEY); raw = value; },
  };
}

test('fetchTripsApi carrega viagens da API e atualiza cache local', async () => {
  const store = memoryStorage();
  const mockFetch = async (url) => {
    assert.equal(url, '/api/trips');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        trips: [
          {
            id: 't-1',
            title: 'Viagem 3ºB',
            destination: 'Museu',
            date: '2026-11-28',
            departure: '08:00',
            arrival: '17:00',
            status: 'planned',
            started: false,
          },
        ],
      }),
    };
  };

  const res = await fetchTripsApi(mockFetch, store);
  assert.equal(res.error, '');
  assert.equal(res.trips.length, 1);
  assert.equal(res.trips[0].started, false);
  assert.ok(store.getItem(STORAGE_KEY));
});

test('startTripApi e fetchTripLocationApi integram SESI Cerquilho-SP somente após início', async () => {
  const store = memoryStorage();
  const baseTrip = {
    id: 't-1',
    title: 'Viagem 3ºB',
    destination: 'Museu',
    date: '2026-11-28',
    departure: '08:00',
    arrival: '17:00',
    status: 'planned',
    started: false,
  };

  // Bloqueado antes do professor iniciar a viagem
  const locked = await fetchTripLocationApi(baseTrip, async () => ({
    ok: false,
    status: 423,
    json: async () => ({ started: false, message: 'A viagem ainda não foi iniciada pelo professor.' }),
  }));
  assert.equal(locked.started, false);
  assert.match(locked.error, /não foi iniciada/);

  // Professor inicia a viagem e API retorna origem SESI Cerquilho - SP
  const startedRes = await startTripApi([baseTrip], 't-1', async (url, opts) => {
    assert.equal(url, '/api/trips/t-1/start');
    assert.equal(opts.method, 'POST');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        trip: {
          ...baseTrip,
          status: 'transit',
          started: true,
          startedAt: '2026-11-17T15:00:00Z',
          busLocation: { ...SESI_CERQUILHO, progress: 0 },
        },
        origin: SESI_CERQUILHO,
      }),
    };
  }, store);
  assert.equal(startedRes.error, '');
  assert.equal(startedRes.trips[0].started, true);
  assert.equal(startedRes.origin.name, 'SESI Cerquilho - SP');

  // Consulta da viagem iniciada retorna localização pela API
  const locationRes = await fetchTripLocationApi(startedRes.trips[0], async (url) => {
    assert.equal(url, '/api/trips/t-1/location');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        started: true,
        tripId: 't-1',
        origin: SESI_CERQUILHO,
        currentLocation: { ...SESI_CERQUILHO, progress: 0 },
      }),
    };
  });
  assert.equal(locationRes.started, true);
  assert.equal(locationRes.location.origin.name, 'SESI Cerquilho - SP');
  assert.equal(locationRes.location.currentLocation.lat, '-23.16345');
  assert.equal(locationRes.location.currentLocation.lng, '-47.76580');
});

test('create, updateLocation e delete fazem fallback local se servidor estiver indisponível', async () => {
  const store = memoryStorage();
  const offlineFetch = async () => { throw new Error('network down'); };

  const created = await createTripApi([], {
    title: 'Viagem Offline',
    destination: 'Parque',
    date: '2028-02-29',
    departure: '07:00',
    arrival: '18:00',
  }, offlineFetch, store);
  assert.equal(created.error, '');
  assert.equal(created.trips.length, 1);

  const id = created.trips[0].id;
  const updated = await updateTripLocationApi(created.trips, id, {
    status: 'transit',
    label: 'SESI Cerquilho - SP',
    progress: 25,
  }, offlineFetch, store);
  assert.equal(updated.error, '');
  assert.equal(updated.trips[0].busLocation.progress, 25);

  const deleted = await deleteTripApi(updated.trips, id, offlineFetch, store);
  assert.equal(deleted.error, '');
  assert.equal(deleted.trips.length, 0);
});
