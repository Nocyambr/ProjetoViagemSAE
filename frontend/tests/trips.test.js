import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTrip, INITIAL_TRIPS, loadTrips, saveTrips, sortTrips, STORAGE_KEY, validateTrip } from '../src/lib/trips.js';

const draft = { title: '  Viagem 3ºA  ', date: '2028-02-29', departure: '07:00', arrival: '18:00' };
function memoryStorage(raw = null) {
  return { getItem: (key) => { assert.equal(key, STORAGE_KEY); return raw; }, setItem: (key, value) => { assert.equal(key, STORAGE_KEY); raw = value; } };
}

test('carrega exemplos somente quando não há cronograma salvo', () => {
  assert.deepEqual(loadTrips(memoryStorage()).trips, INITIAL_TRIPS);
  assert.deepEqual(loadTrips(memoryStorage('[]')), { trips: [], error: '' });
});

test('salvamento e recarga preservam os dados e normalizam o título', () => {
  const storage = memoryStorage();
  const result = addTrip([], draft, storage, () => 'trip-1');
  assert.equal(result.error, '');
  assert.equal(result.draft.title, '');
  assert.equal(result.trips[0].title, 'Viagem 3ºA');
  assert.deepEqual(loadTrips(storage).trips, result.trips);
});

test('falha de escrita preserva o formulário e a lista anterior', () => {
  const trips = [...INITIAL_TRIPS];
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
    assert.deepEqual(result.trips, INITIAL_TRIPS);
    assert.equal(storage.getItem(STORAGE_KEY), raw, 'não sobrescreve conteúdo ao carregar');
  }
});

test('armazenamento bloqueado retorna erro legível', () => {
  assert.ok(loadTrips({ getItem() { throw new Error('denied'); } }).error);
  assert.match(saveTrips([], { setItem() { throw new Error('denied'); } }), /Não foi possível salvar/);
});

test('valida calendário, incluindo anos bissextos', () => {
  assert.equal(validateTrip(draft), '');
  for (const date of ['', '2027-02-29', '2026-04-31', '2026-13-01', '2026-1-01']) {
    assert.match(validateTrip({ ...draft, date }), /data válida/);
  }
});

test('rejeita horários inválidos, iguais ou invertidos', () => {
  for (const departure of ['', '24:00', '12:60', '7:00', null]) assert.ok(validateTrip({ ...draft, departure }));
  assert.match(validateTrip({ ...draft, arrival: '07:00' }), /posterior/);
  assert.match(validateTrip({ ...draft, arrival: '06:00' }), /posterior/);
});

test('rejeita título vazio ou muito longo', () => {
  assert.ok(validateTrip({ ...draft, title: '  ' }));
  assert.ok(validateTrip({ ...draft, title: 'a'.repeat(101) }));
  assert.ok(validateTrip(null));
});

test('viagem inválida não grava nem gera identificador', () => {
  const storage = { setItem() { assert.fail('não deveria salvar'); } };
  const result = addTrip([], { ...draft, title: '' }, storage, () => assert.fail('não deveria gerar ID'));
  assert.ok(result.error);
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

test('exclusão continua vazia após recarregar', () => {
  const storage = memoryStorage();
  assert.equal(saveTrips([], storage), '');
  assert.deepEqual(loadTrips(storage).trips, []);
});

test('falha ao gerar identificador mantém os dados digitados', () => {
  const result = addTrip([], draft, memoryStorage(), () => { throw new Error('unsupported'); });
  assert.equal(result.draft, draft);
  assert.ok(result.error);
});
