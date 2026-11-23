import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addTrip,
  buildAutoFillTripDraft,
  EMPTY_DRAFT,
  INITIAL_TRIPS,
  loadTrips,
  removeTrip,
  saveTrips,
  SESI_CERQUILHO,
  sortTrips,
  startTrip,
  STORAGE_KEY,
  updateTrip,
  updateTripLocation,
  validateTrip,
} from '../src/lib/trips.js';

const draft = { ...EMPTY_DRAFT, title: '  Viagem 3ºA  ', destination: 'Museu Catavento', date: '2028-02-29', departure: '07:00', arrival: '18:00' };
function memoryStorage(raw = null) {
  return { getItem: (key) => { assert.equal(key, STORAGE_KEY); return raw; }, setItem: (key, value) => { assert.equal(key, STORAGE_KEY); raw = value; } };
}

test('inicia vazio quando nenhuma viagem foi criada pelo professor', () => {
  assert.deepEqual(INITIAL_TRIPS, []);
  assert.deepEqual(loadTrips(memoryStorage()).trips, []);
  assert.deepEqual(loadTrips(memoryStorage('[]')), { trips: [], error: '' });
});

test('salvamento, edição, localização do ônibus e exclusão funcionam em ciclo completo', () => {
  const storage = memoryStorage();
  const created = addTrip([], draft, storage, () => 'trip-1');
  assert.equal(created.error, '');
  assert.equal(created.draft.title, '');
  assert.equal(created.trips[0].title, 'Viagem 3ºA');
  assert.equal(created.trips[0].destination, 'Museu Catavento');

  const edited = updateTrip(created.trips, 'trip-1', { title: 'Viagem 3ºA Atualizada' }, storage);
  assert.equal(edited.error, '');
  assert.equal(edited.trips[0].title, 'Viagem 3ºA Atualizada');
  assert.equal(edited.trips[0].started, false);

  const started = startTrip(edited.trips, 'trip-1', storage);
  assert.equal(started.error, '');
  assert.equal(started.trips[0].started, true);
  assert.equal(started.trips[0].status, 'transit');
  assert.equal(started.trips[0].busLocation.label, SESI_CERQUILHO.label);
  assert.equal(started.trips[0].busLocation.lat, '-23.16345');

  const located = updateTripLocation(
    started.trips,
    'trip-1',
    { status: 'transit', busName: 'Ônibus 02', label: 'Marginal Tietê, km 12', lat: '-23.52', lng: '-46.66', progress: 45 },
    storage,
  );
  assert.equal(located.error, '');
  assert.equal(located.trips[0].status, 'transit');
  assert.equal(located.trips[0].busLocation.progress, 45);
  assert.equal(located.trips[0].busLocation.label, 'Marginal Tietê, km 12');

  const loaded = loadTrips(storage);
  assert.equal(loaded.trips[0].busLocation.label, 'Marginal Tietê, km 12');

  const removed = removeTrip(loaded.trips, 'trip-1', storage);
  assert.equal(removed.error, '');
  assert.deepEqual(loadTrips(storage).trips, []);
});

test('falha de escrita preserva o formulário e a lista anterior', () => {
  const trips = [];
  const result = addTrip(trips, draft, { setItem() { throw new Error('quota'); } }, () => 'new');
  assert.equal(result.trips, trips);
  assert.equal(result.draft, draft);
  assert.match(result.error, /Não foi possível salvar/);
});

test('JSON inválido, null, itens nulos, IDs duplicados e horários ausentes não quebram a tela', () => {
  const good = { ...draft, id: 'same' };
  for (const raw of ['{broken', 'null', '[null]', '{}', JSON.stringify([good, good]), JSON.stringify([{ ...good, departure: undefined }])]) {
    const storage = memoryStorage(raw);
    const result = loadTrips(storage);
    assert.ok(result.error);
    assert.deepEqual(result.trips, []);
    assert.equal(storage.getItem(STORAGE_KEY), raw, 'não sobrescreve conteúdo ao carregar');
  }
});

test('armazenamento bloqueado retorna erro legível', () => {
  assert.ok(loadTrips({ getItem() { throw new Error('denied'); } }).error);
  assert.match(saveTrips([], { setItem() { throw new Error('denied'); } }), /Não foi possível salvar/);
});

test('valida calendário, horários e título', () => {
  assert.equal(validateTrip(draft), '');
  for (const date of ['', '2027-02-29', '2026-04-31', '2026-13-01', '2026-1-01']) {
    assert.match(validateTrip({ ...draft, date }), /data válida/);
  }
  for (const departure of ['', '24:00', '12:60', '7:00', null]) assert.ok(validateTrip({ ...draft, departure }));
  assert.match(validateTrip({ ...draft, arrival: '07:00' }), /posterior/);
  assert.match(validateTrip({ ...draft, arrival: '06:00' }), /posterior/);
  assert.ok(validateTrip({ ...draft, title: '  ' }));
  assert.ok(validateTrip({ ...draft, title: 'a'.repeat(101) }));
  assert.ok(validateTrip(null));
});

test('ordena por data e saída sem alterar a lista original', () => {
  const trips = [
    { ...draft, id: 'a', date: '2028-03-01' },
    { ...draft, id: 'b', departure: '09:00' },
    { ...draft, id: 'c' },
  ];
  assert.deepEqual(sortTrips(trips).map((trip) => trip.id), ['c', 'b', 'a']);
  assert.deepEqual(trips.map((trip) => trip.id), ['a', 'b', 'c']);
});

test('buildAutoFillTripDraft preenche rascunhos válidos com os dois professores selecionados', () => {
  const first = buildAutoFillTripDraft(0, '2026-11-25');
  const second = buildAutoFillTripDraft(1, '2026-11-25');
  assert.equal(validateTrip(first), '');
  assert.equal(validateTrip(second), '');
  assert.equal(first.date, '2026-11-25');
  assert.deepEqual(first.teacherNames, ['Ricardo', 'André']);
  assert.equal(first.teacherName, 'Ricardo e André');
  assert.deepEqual(second.teacherNames, ['Ricardo', 'André']);
  assert.equal(second.teacherName, 'Ricardo e André');
});
