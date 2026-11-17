import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterTrips, localToday } from '../src/lib/trips.js';
import { addPhoto, deletePhoto, loadPhotos, PHOTOS_STORAGE_KEY, removePhotosByTrip } from '../src/lib/photos.js';
import { addTeacher, deleteTeacher, loadTeachers, TEACHERS_STORAGE_KEY } from '../src/lib/teachers.js';

function memoryStorage(expectedKey) {
  let raw = null;
  return {
    getItem(key) { assert.equal(key, expectedKey); return raw; },
    setItem(key, value) { assert.equal(key, expectedKey); raw = value; },
  };
}

const trips = [
  { id: 'a', title: 'Ciências da natureza', destination: 'Jardim Botânico', date: '2026-10-16', departure: '07:00' },
  { id: 'b', title: 'Visita 3ºA', destination: 'Museu', date: '2026-10-14', departure: '09:00' },
  { id: 'c', title: 'Visita 2ºA', destination: 'Observatório', date: '2026-10-15', departure: '08:00' },
];

test('busca ignora acentos e maiúsculas, busca destino e combina com período', () => {
  assert.deepEqual(filterTrips(trips, ' CIENCIAS ', 'upcoming', '2026-10-15').map((trip) => trip.id), ['a']);
  assert.deepEqual(filterTrips(trips, 'observatorio', 'upcoming', '2026-10-15').map((trip) => trip.id), ['c']);
  assert.deepEqual(filterTrips(trips, 'Visita', 'past', '2026-10-15').map((trip) => trip.id), ['b']);
});

test('filtro de próximas inclui hoje, mantém a ordem e não modifica a origem', () => {
  assert.deepEqual(filterTrips(trips, '', 'upcoming', '2026-10-15').map((trip) => trip.id), ['c', 'a']);
  assert.equal(trips[0].id, 'a');
  assert.equal(localToday(new Date(2026, 9, 5)), '2026-10-05');
});

test('fotos são vinculadas à viagem, listadas, removidas e limpas ao excluir viagem', () => {
  const store = memoryStorage(PHOTOS_STORAGE_KEY);
  assert.deepEqual(loadPhotos(store).photos, []);

  const invalid = addPhoto([], { tripId: 't1', caption: 'teste', dataUrl: 'http://evil' }, store);
  assert.ok(invalid.error);

  const p1 = addPhoto([], { tripId: 't1', caption: 'Saída', dataUrl: 'data:image/jpeg;base64,AAA' }, store, () => 'p1');
  assert.equal(p1.error, '');
  const p2 = addPhoto(p1.photos, { tripId: 't2', caption: 'Parque', dataUrl: 'data:image/jpeg;base64,BBB' }, store, () => 'p2');
  assert.equal(p2.photos.length, 2);

  const cleaned = removePhotosByTrip(p2.photos, 't1', store);
  assert.equal(cleaned.photos.length, 1);
  assert.equal(cleaned.photos[0].id, 'p2');

  const empty = deletePhoto(cleaned.photos, 'p2', store);
  assert.equal(empty.photos.length, 0);
});

test('equipe de professores é adicionada e removida corretamente', () => {
  const store = memoryStorage(TEACHERS_STORAGE_KEY);
  assert.deepEqual(loadTeachers(store).teachers, []);

  const added = addTeacher([], { name: 'Profa. Carla', role: 'Coordenadora', contact: 'carla@sesi.br', tripId: 't1' }, store, () => 'm1');
  assert.equal(added.error, '');
  assert.equal(loadTeachers(store).teachers.length, 1);

  const removed = deleteTeacher(added.teachers, 'm1', store);
  assert.equal(removed.teachers.length, 0);
});
