import { Link } from 'react-router-dom';

/**
 * Blocks student/parent access to trip details until a teacher creates a trip,
 * or guides a teacher to create the first trip.
 */
export default function TripRequiredGate({ isTeacher, title }) {
  return (
    <div className="min-h-full bg-[#0b1116] p-4 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-[#131d24] p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-2xl" aria-hidden="true">
          {isTeacher ? '🚌' : '🔒'}
        </div>
        <h1 className="text-2xl font-bold text-rose-400">{title}</h1>
        <p className="mt-3 text-sm text-slate-300">
          {isTeacher
            ? 'Nenhuma viagem cadastrada ainda. Crie uma viagem para liberar a localização do ônibus, fotos e equipe.'
            : 'Nenhuma viagem disponível no momento. Este conteúdo será liberado após o professor criar uma viagem.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {isTeacher ? (
            <Link to="/data-horarios" className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-500">
              Configurar viagem →
            </Link>
          ) : (
            <Link to="/home" className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:bg-slate-700">
              Voltar ao início
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
