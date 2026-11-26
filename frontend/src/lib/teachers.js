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

export function resolveTeacherPhoto(name, explicitPhoto = '') {
  const clean = typeof name === 'string' ? name.trim().toLowerCase() : '';
  const match =
    TEACHER_DIRECTORY.find(
      (item) => clean === item.name.toLowerCase() || clean.startsWith(item.name.toLowerCase()),
    ) ?? TEACHER_DIRECTORY.find((item) => clean.includes(item.name.toLowerCase()));

  if (match) return match.photo;
  if (typeof explicitPhoto === 'string' && explicitPhoto.trim()) return explicitPhoto.trim();
  return TEACHER_DIRECTORY[0].photo;
}

export function parseTeacherNames(value) {
  if (Array.isArray(value)) {
    const rawList = value
      .map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : ''))
      .filter(Boolean);
    const matched = TEACHER_DIRECTORY.filter((item) =>
      rawList.some((raw) => raw === item.name.toLowerCase() || raw.includes(item.name.toLowerCase())),
    ).map((item) => item.name);

    if (matched.length > 0) return matched;
  }

  if (typeof value === 'string' && value.trim()) {
    const lower = value.trim().toLowerCase();
    const matched = TEACHER_DIRECTORY.filter((item) => lower.includes(item.name.toLowerCase())).map(
      (item) => item.name,
    );

    if (matched.length > 0) return matched;
    return [value.trim()];
  }

  return TEACHER_DIRECTORY.map((item) => item.name);
}

export function formatTeacherNames(value) {
  const names = parseTeacherNames(value);
  if (names.length <= 1) return names[0] ?? TEACHER_DIRECTORY[0].name;
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

export function resolveTripTeachers(tripOrValue) {
  const raw =
    tripOrValue && typeof tripOrValue === 'object' && !Array.isArray(tripOrValue)
      ? (tripOrValue.teacherNames ?? tripOrValue.teacherName)
      : tripOrValue;

  return parseTeacherNames(raw).map((name) => {
    const found = TEACHER_DIRECTORY.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return (
      found ?? {
        id: `prof-${name.toLowerCase()}`,
        name,
        role: 'Professor',
        contact: '',
        photo: resolveTeacherPhoto(name),
      }
    );
  });
}

export function loadTeachers(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(TEACHERS_STORAGE_KEY);
    if (!raw) return { teachers: [], error: '' };

    const parsed = JSON.parse(raw);
    const valid =
      Array.isArray(parsed) &&
      parsed.every((t) => t && typeof t.id === 'string' && typeof t.name === 'string' && t.name.trim());
    if (!valid) throw new Error('Dados inválidos');

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

export function addTeacher(
  teachers,
  { name, role, contact, photo, tripId },
  storage,
  createId = () => crypto.randomUUID(),
) {
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

export function toggleTripTeacher(
  teachers,
  profile,
  tripId,
  storage,
  createId = () => crypto.randomUUID(),
) {
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

export function deleteTeacher(teachers, teacherId, storage) {
  const next = teachers.filter((t) => t.id !== teacherId);
  const saveError = saveTeachers(next, storage);
  if (saveError) return { teachers, error: saveError };

  return { teachers: next, error: '' };
}
