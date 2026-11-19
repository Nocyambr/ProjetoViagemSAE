export const TEACHERS_STORAGE_KEY = 'sae:teachers:v1';

export const TEACHER_DIRECTORY = [
  {
    id: 'prof-ricardo',
    name: 'Ricardo',
    role: 'Professor',
    contact: '',
    photo: '/images/teachers/prof-ricardo.jpg',
  },
  {
    id: 'prof-andre',
    name: 'André',
    role: 'Professor',
    contact: '',
    photo: '/images/teachers/prof-andre.jpg',
  },
];

/**
 * Resolves a teacher's portrait photo URL from an explicit value or the directory.
 */
export function resolveTeacherPhoto(name, explicitPhoto = '') {
  if (typeof explicitPhoto === 'string' && explicitPhoto.trim()) return explicitPhoto.trim();
  const clean = typeof name === 'string' ? name.trim().toLowerCase() : '';
  const match = TEACHER_DIRECTORY.find(
    (item) => clean === item.name.toLowerCase() || clean.includes(item.name.toLowerCase()),
  );
  return match?.photo ?? TEACHER_DIRECTORY[0].photo;
}

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
    return {
      teachers: parsed.map((t) => ({
        ...t,
        photo: resolveTeacherPhoto(t.name, t.photo),
      })),
      error: '',
    };
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
export function addTeacher(teachers, { name, role, contact, photo, tripId }, storage, createId = () => crypto.randomUUID()) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  if (!cleanName) return { teachers, error: 'Selecione um professor responsável.' };
  const entry = {
    id: createId(),
    name: cleanName.slice(0, 80),
    role: typeof role === 'string' && role.trim() ? role.trim().slice(0, 60) : 'Professor',
    contact: typeof contact === 'string' ? contact.trim().slice(0, 80) : '',
    photo: resolveTeacherPhoto(cleanName, photo),
    tripId: typeof tripId === 'string' ? tripId : '',
  };
  const next = [...teachers, entry];
  const saveError = saveTeachers(next, storage);
  if (saveError) return { teachers, error: saveError };
  return { teachers: next, error: '' };
}

/**
 * Toggles a directory teacher on or off for a specific trip.
 */
export function toggleTripTeacher(teachers, profile, tripId, storage, createId = () => crypto.randomUUID()) {
  if (!profile?.name || !tripId) {
    return { teachers, added: false, error: 'Selecione uma viagem e um professor.' };
  }
  const existing = teachers.find(
    (t) => t.tripId === tripId && t.name.toLowerCase() === profile.name.toLowerCase(),
  );
  if (existing) {
    const res = deleteTeacher(teachers, existing.id, storage);
    return { teachers: res.teachers, added: false, error: res.error };
  }
  const res = addTeacher(
    teachers,
    {
      name: profile.name,
      role: profile.role,
      contact: profile.contact,
      photo: profile.photo,
      tripId,
    },
    storage,
    createId,
  );
  return { teachers: res.teachers, added: !res.error, error: res.error };
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
