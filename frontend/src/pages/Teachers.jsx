import { useEffect, useState } from 'react';
import { isTeacher } from '../lib/auth.js';
import {
  deleteTeacher,
  resolveTeacherPhoto,
  TEACHER_DIRECTORY,
  toggleTripTeacher,
} from '../lib/teachers.js';
import TripRequiredGate from '../components/TripRequiredGate.jsx';

export default function Teachers({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips, teachers } = portal;

  const [tripId, setTripId] = useState(() => trips[0]?.id ?? '');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (trips.length && !trips.some((t) => t.id === tripId)) {
      setTripId(trips[0].id);
    }
  }, [trips, tripId]);

  if (!trips.length) {
    return <TripRequiredGate isTeacher={teacher} title="Professores Responsáveis" />;
  }

  function handleSelectTeacher(profile) {
    if (!teacher || !tripId) return;
    const res = toggleTripTeacher(teachers, profile, tripId);
    setError(res.error);
    if (!res.error) {
      setNotice(
        res.added
          ? `${profile.name} adicionado à viagem.`
          : `${profile.name} removido da equipe extra.`,
      );
    }
  }

  function handleRemove(id) {
    if (!teacher) return;
    const res = deleteTeacher(teachers, id);
    if (res.error) setError(res.error);
    else setNotice('Responsável removido.');
  }

  const tripName = (id) => trips.find((t) => t.id === id)?.title ?? 'Geral';
  const activeTrip = trips.find((t) => t.id === tripId) ?? trips[0];

  return (
    <div className="min-h-full bg-[#0b1116] p-4 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-rose-400">Professores Responsáveis</h1>

        {notice && (
          <p role="status" className="rounded-xl border border-emerald-700 bg-emerald-950/70 p-3 text-sm text-emerald-200">
            {notice}
          </p>
        )}

        {teacher && (
          <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-rose-400">Selecionar professores pela foto</h2>
              {trips.length > 1 && (
                <label className="text-sm font-medium text-slate-300">
                  <span className="mr-2">Viagem:</span>
                  <select
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    className="rounded-xl border border-slate-500 bg-[#0b1116] px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:max-w-lg">
              {TEACHER_DIRECTORY.map((profile) => {
                const isMain = activeTrip?.teacherName?.toLowerCase() === profile.name.toLowerCase();
                const isExtra = teachers.some(
                  (m) => m.tripId === tripId && m.name.toLowerCase() === profile.name.toLowerCase(),
                );
                const selected = isMain || isExtra;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    aria-pressed={selected}
                    disabled={isMain}
                    onClick={() => handleSelectTeacher(profile)}
                    className={`group flex flex-col items-center rounded-2xl border p-4 text-center transition-colors ${
                      selected
                        ? 'border-emerald-400 bg-emerald-950/60 text-white'
                        : 'border-slate-700 bg-[#0b1116] text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className="h-24 w-24 rounded-2xl border border-slate-600 object-cover object-top transition-transform group-hover:scale-105"
                    />
                    <span className="mt-3 text-sm font-bold leading-snug">{profile.name}</span>
                    <span className="mt-1 text-xs text-slate-400">{profile.role}</span>
                    <span
                      className={`mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        selected
                          ? 'bg-emerald-700/70 text-emerald-100'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isMain ? 'Principal da viagem' : isExtra ? 'Na equipe' : 'Selecionar'}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
          </section>
        )}

        <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-slate-100">Equipe das viagens</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {trips.map((trip) => {
              const photo = resolveTeacherPhoto(trip.teacherName, trip.teacherPhoto);
              return (
                <article
                  key={`trip-${trip.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-700/70 bg-slate-800/70 p-4"
                >
                  <img
                    src={photo}
                    alt={trip.teacherName}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-slate-600 object-cover object-top"
                  />
                  <div className="min-w-0">
                    <span className="inline-block rounded-full border border-emerald-700/60 bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                      {trip.title}
                    </span>
                    <h3 className="mt-1 truncate font-bold text-slate-100">{trip.teacherName}</h3>
                    <p className="text-xs text-slate-300">Responsável principal</p>
                    {trip.teacherContact && <p className="mt-0.5 truncate text-xs text-slate-400">{trip.teacherContact}</p>}
                  </div>
                </article>
              );
            })}

            {teachers.map((member) => (
              <article
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700/70 bg-slate-800/50 p-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    src={resolveTeacherPhoto(member.name, member.photo)}
                    alt={member.name}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-slate-600 object-cover object-top"
                  />
                  <div className="min-w-0">
                    <span className="inline-block rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                      {tripName(member.tripId)}
                    </span>
                    <h3 className="mt-1 truncate font-bold text-slate-100">{member.name}</h3>
                    <p className="truncate text-xs text-slate-300">{member.role}</p>
                    {member.contact && <p className="mt-0.5 truncate text-xs text-slate-400">{member.contact}</p>}
                  </div>
                </div>
                {teacher && (
                  <button
                    type="button"
                    onClick={() => handleRemove(member.id)}
                    className="shrink-0 text-xs font-semibold text-rose-400 underline hover:text-rose-300"
                  >
                    Remover
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
