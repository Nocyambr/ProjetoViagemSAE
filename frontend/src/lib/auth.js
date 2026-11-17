export const AUTH_STORAGE_KEY = 'sae:auth:v2';
export const ACCOUNTS_STORAGE_KEY = 'sae:accounts:v1';

const BUILTIN_ACCOUNTS = [
  { username: 'professor', password: 'senai00', role: 'teacher', name: 'Professor SESI' },
  { username: 'usuario1', password: 'senai00', role: 'student', name: 'Aluno / Responsável' },
];

/**
 * Loads custom registered student/parent accounts from storage.
 */
export function loadRegisteredAccounts(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (acc) =>
        acc &&
        typeof acc.username === 'string' &&
        typeof acc.password === 'string' &&
        typeof acc.name === 'string' &&
        acc.role === 'student',
    );
  } catch {
    return [];
  }
}

/**
 * Registers a new student/parent account when the username is valid and available.
 */
export function registerAccount({ name, username, password }, storage) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanUser = typeof username === 'string' ? username.trim() : '';
  const cleanPass = typeof password === 'string' ? password : '';

  if (!cleanName || cleanName.length < 2) {
    return { account: null, error: 'Informe seu nome completo.' };
  }
  if (!cleanUser || cleanUser.length < 3 || /\s/.test(cleanUser)) {
    return { account: null, error: 'Informe um usuário ou e-mail válido sem espaços.' };
  }
  if (cleanPass.length < 8) {
    return { account: null, error: 'A senha deve ter pelo menos 8 caracteres.' };
  }

  const existing = loadRegisteredAccounts(storage);
  const allAccounts = [...BUILTIN_ACCOUNTS, ...existing];
  const lower = cleanUser.toLowerCase();
  if (allAccounts.some((acc) => acc.username.toLowerCase() === lower)) {
    return { account: null, error: 'Este usuário já está cadastrado.' };
  }

  const nextAccount = {
    username: cleanUser,
    password: cleanPass,
    role: 'student',
    name: cleanName,
  };

  try {
    (storage ?? globalThis.localStorage).setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify([...existing, nextAccount]),
    );
  } catch {
    return { account: null, error: 'Não foi possível salvar a conta no navegador.' };
  }

  return {
    account: { username: nextAccount.username, role: nextAccount.role, name: nextAccount.name },
    error: '',
  };
}

/**
 * Authenticates built-in teacher/student accounts or registered student/parent accounts.
 */
export function authenticate(username, password, storage) {
  const normalized = typeof username === 'string' ? username.trim() : '';
  const pass = typeof password === 'string' ? password : '';
  if (!normalized || !pass) {
    return { user: null, error: 'Informe usuário e senha.' };
  }

  const accounts = [...BUILTIN_ACCOUNTS, ...loadRegisteredAccounts(storage)];
  const matched = accounts.find(
    (acc) => acc.username.toLowerCase() === normalized.toLowerCase() && acc.password === pass,
  );
  if (!matched) {
    return { user: null, error: 'Usuário ou senha inválidos.' };
  }

  return {
    user: { username: matched.username, role: matched.role, name: matched.name },
    error: '',
  };
}

/**
 * Loads the active session object from session storage.
 */
export function loadSession(storage) {
  try {
    const raw = (storage ?? globalThis.sessionStorage).getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.username === 'string' &&
      (parsed.role === 'teacher' || parsed.role === 'student') &&
      typeof parsed.name === 'string'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists the active user session in session storage for the current tab.
 */
export function saveSession(user, storage) {
  try {
    const store = storage ?? globalThis.sessionStorage;
    if (user) {
      store.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      store.removeItem(AUTH_STORAGE_KEY);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears the current tab session.
 */
export function clearSession(storage) {
  return saveSession(null, storage);
}

/**
 * Returns true when the active session belongs to a teacher.
 */
export function isTeacher(user) {
  return user?.role === 'teacher';
}
