import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterTrips, localToday } from '../src/lib/trips.js';
import { PREPARATION_KEY, loadPreparation, savePreparation } from '../src/lib/preparation.js';

const trips = [
  { id: 'a', title: 'Ciências da natureza', date: '2026-10-16', departure: '07:00' },
  { id: 'b', title: 'Visita 3ºA', date: '2026-10-14', departure: '09:00' },
  { id: 'c', title: 'Visita 2ºA', date: '2026-10-15', departure: '08:00' },
];
test('busca ignora acentos e maiúsculas e combina com o período', () => {
  assert.deepEqual(filterTrips(trips, ' CIENCIAS ', 'upcoming', '2026-10-15').map((trip) => trip.id), ['a']);
  assert.deepEqual(filterTrips(trips, 'Visita', 'past', '2026-10-15').map((trip) => trip.id), ['b']);
});
test('filtro de próximas inclui hoje, mantém a ordem e não modifica a origem', () => {
  assert.deepEqual(filterTrips(trips, '', 'upcoming', '2026-10-15').map((trip) => trip.id), ['c', 'a']);
  assert.equal(trips[0].id, 'a');
  assert.equal(localToday(new Date(2026, 9, 5)), '2026-10-05');
});
test('checklist conserva marcações entre carregamentos e elimina duplicatas', () => {
  let raw = null;
  const storage = { getItem(key) { assert.equal(key, PREPARATION_KEY); return raw; }, setItem(key, value) { assert.equal(key, PREPARATION_KEY); raw = value; } };
  assert.deepEqual(loadPreparation(storage).checked, []);
  assert.equal(savePreparation(['water', 'water', 'shoes'], storage), '');
  assert.deepEqual(loadPreparation(storage).checked, ['water', 'shoes']);
  assert.equal(savePreparation([], storage), '');
  assert.deepEqual(loadPreparation(storage).checked, []);
});
test('checklist lida com dados inválidos e armazenamento bloqueado sem apagar dados', () => {
  for (const raw of ['null', '{}', '{bad', '["unknown"]']) {
    const storage = { getItem() { return raw; }, setItem() { assert.fail('não deve sobrescrever'); } };
    assert.ok(loadPreparation(storage).error);
  }
  assert.ok(loadPreparation({ getItem() { throw new Error('denied'); } }).error);
  assert.match(savePreparation(['water'], { setItem() { throw new Error('quota'); } }), /Não foi possível salvar/);
});
