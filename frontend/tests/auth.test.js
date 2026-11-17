import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACCOUNTS_STORAGE_KEY,
  AUTH_STORAGE_KEY,
  authenticate,
  clearSession,
  isTeacher,
  loadSession,
  registerAccount,
  saveSession,
} from '../src/lib/auth.js';

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, next) { map.set(key, next); },
    removeItem(key) { map.delete(key); },
  };
}

test('autentica professor e usuario1 com papéis distintos', () => {
  const store = memoryStorage();
  const prof = authenticate('professor', 'senai00', store);
  assert.equal(prof.error, '');
  assert.equal(prof.user.username, 'professor');
  assert.equal(prof.user.role, 'teacher');
  assert.equal(isTeacher(prof.user), true);

  const student = authenticate('  usuario1  ', 'senai00', store);
  assert.equal(student.error, '');
  assert.equal(student.user.username, 'usuario1');
  assert.equal(student.user.role, 'student');
  assert.equal(isTeacher(student.user), false);
});

test('cadastra novo aluno/pai e permite login em seguida', () => {
  const store = memoryStorage();
  const created = registerAccount({ name: 'Maria Silva', username: 'maria.silva', password: 'segredo123' }, store);
  assert.equal(created.error, '');
  assert.equal(created.account.role, 'student');

  const dup = registerAccount({ name: 'Outra', username: 'PROFESSOR', password: 'segredo123' }, store);
  assert.equal(dup.account, null);
  assert.ok(dup.error);

  const login = authenticate('maria.silva', 'segredo123', store);
  assert.equal(login.error, '');
  assert.equal(login.user.name, 'Maria Silva');
  assert.equal(login.user.role, 'student');
  assert.ok(store.getItem(ACCOUNTS_STORAGE_KEY));
});

test('rejeita credenciais vazias ou incorretas', () => {
  const store = memoryStorage();
  for (const [user, pass] of [['', 'senai00'], ['usuario1', ''], ['usuario2', 'senai00'], ['professor', 'SENAI00'], [null, null]]) {
    const result = authenticate(user, pass, store);
    assert.equal(result.user, null);
    assert.ok(result.error);
  }
});

test('sessão inicia vazia e persiste objeto de usuário válido', () => {
  const storage = memoryStorage();
  assert.equal(loadSession(storage), null);
  const user = { username: 'professor', role: 'teacher', name: 'Professor SESI' };
  assert.equal(saveSession(user, storage), true);
  assert.deepEqual(loadSession(storage), user);
  assert.equal(clearSession(storage), true);
  assert.equal(loadSession(storage), null);
  assert.equal(loadSession(memoryStorage({ [AUTH_STORAGE_KEY]: '{"username":"x","role":"admin"}' })), null);
});

test('falha de storage não lança exceção', () => {
  const broken = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); },
  };
  assert.equal(loadSession(broken), null);
  assert.equal(saveSession({ username: 'usuario1', role: 'student', name: 'Aluno' }, broken), false);
  assert.equal(clearSession(broken), false);
  assert.equal(registerAccount({ name: 'Ana', username: 'ana1', password: 'password123' }, broken).account, null);
});
