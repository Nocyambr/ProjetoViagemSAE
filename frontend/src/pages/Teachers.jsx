import { useState } from 'react';
import { isTeacher } from '../lib/auth.js';
import { addTeacher, deleteTeacher } from '../lib/teachers.js';
import TripRequiredGate from '../components/TripRequiredGate.jsx';

export default function Teachers({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips, teachers } = portal;

  const [name, setName] = useState('');
  const [role, setRole] = useState('Professor acompanhante');
  const [contact, setContact] = useState('');
  const [tripId, setTripId] = useState(() => trips[0]?.id ?? '');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (!trips.length) {
    return <TripRequiredGate isTeacher={teacher} title="Professores Responsáveis" />;
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!teacher) return;
    const res = addTeacher(teachers, { name, role, contact, tripId });
    setError(res.error);
    if (!res.error) {
      setName('');
      setContact('');
      setNotice('Responsável adicionado.');
    }
  }

  function handleRemove(id) {
    if (!teacher) return;
    const res = deleteTeacher(teachers, id);
    if (res.error) setError(res.error);
    else setNotice('Responsável removido.');
  }

  const tripName = (id) => trips.find((t) => t.id === id)?.title ?? 'Geral';

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
            <h2 className="mb-4 text-lg font-bold text-rose-400">Adicionar responsável</h2>
            <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-200">
                Nome
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Profa. Ana Paula"
                  className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-medium text-slate-200">
                Função
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-medium text-slate-200">
                Contato
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Telefone ou e-mail"
                  className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-medium text-slate-200">
                Viagem
                <select
                  value={tripId}
                  onChange={(e) => setTripId(e.target.value)}
                  className="mt-1 block min-h-12 w-full rounded-xl border border-slate-500 bg-[#0b1116] px-3.5 py-2.5 text-slate-100 focus:border-emerald-400 focus:outline-none"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </label>

              {error && <p role="alert" className="text-sm text-rose-300 sm:col-span-2">{error}</p>}

              <button type="submit" className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500 sm:col-span-2">
                Adicionar à equipe
              </button>
            </form>
          </section>
        )}

        <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-slate-100">Equipe das viagens</h2>
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={`trip-${trip.id}`} className="rounded-xl border border-slate-700/70 bg-slate-800/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-100">{trip.teacherName}</h3>
                  <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-700/60">
                    {trip.title}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">Responsável principal da viagem</p>
                {trip.teacherContact && <p className="mt-1 text-xs text-slate-400">Contato: {trip.teacherContact}</p>}
              </div>
            ))}

            {teachers.map((member) => (
              <div key={member.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-700/70 bg-slate-800/50 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-100">{member.name}</h3>
                    <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
                      {tripName(member.tripId)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{member.role}</p>
                  {member.contact && <p className="mt-1 text-xs text-slate-400">Contato: {member.contact}</p>}
                </div>
                {teacher && (
                  <button
                    type="button"
                    onClick={() => handleRemove(member.id)}
                    className="text-xs font-semibold text-rose-400 underline hover:text-rose-300"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
