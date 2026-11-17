export const TEACHERS_STORAGE_KEY = 'sae:teachers:v1';

/**
 * Loads custom responsible teachers/monitors configured by the teacher account.
 */
export function loadTeachers(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(TEACHERS_STORAGE_KEY);
    if (!raw) return { teachers: [], error: '' };
    const parsed = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      !parsed.every((t) => t && typeof t.id === 'string' && typeof t.name === 'string' && t.name.trim())
    ) {
      throw new Error('Invalid teachers');
    }
    return { teachers: parsed, error: '' };
  } catch {
    return { teachers: [], error: 'Não foi possível carregar os professores salvos.' };
  }
}

/**
 * Persists teachers list and notifies active listeners.
 */
export function saveTeachers(teachers, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
    if (!storage && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sae:data-updated'));
    }
    return '';
  } catch {
    return 'Não foi possível salvar a equipe responsável.';
  }
}

/**
 * Adds a responsible teacher or monitor entry.
 */
export function addTeacher(teachers, { name, role, contact, tripId }, storage, createId = () => crypto.randomUUID()) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  if (!cleanName) return { teachers, error: 'Informe o nome do professor ou responsável.' };
  const entry = {
    id: createId(),
    name: cleanName.slice(0, 80),
    role: typeof role === 'string' && role.trim() ? role.trim().slice(0, 60) : 'Professor acompanhante',
    contact: typeof contact === 'string' ? contact.trim().slice(0, 80) : '',
    tripId: typeof tripId === 'string' ? tripId : '',
  };
  const next = [...teachers, entry];
  const saveError = saveTeachers(next, storage);
  if (saveError) return { teachers, error: saveError };
  return { teachers: next, error: '' };
}

/**
 * Deletes a teacher entry by id.
 */
export function deleteTeacher(teachers, teacherId, storage) {
  const next = teachers.filter((t) => t.id !== teacherId);
  const saveError = saveTeachers(next, storage);
  if (saveError) return { teachers, error: saveError };
  return { teachers: next, error: '' };
}
