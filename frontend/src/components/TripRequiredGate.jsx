import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { BTN_PRIMARY, BTN_SECONDARY, CARD_CLASS } from '../lib/styles.js';

export default function TripRequiredGate({ isTeacher, title }) {
  const message = isTeacher
    ? 'Nenhuma viagem cadastrada ainda. Crie uma viagem para liberar a localização do ônibus, fotos e equipe.'
    : 'Nenhuma viagem disponível no momento. Este conteúdo será liberado após o professor criar uma viagem.';

  return (
    <div className="min-h-full bg-[#0b1116] p-4 text-slate-100 sm:p-8">
      <div className={`mx-auto max-w-2xl text-center ${CARD_CLASS}`}>
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-emerald-300"
          aria-hidden="true"
        >
          <Icon name={isTeacher ? 'bus' : 'lock'} className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-bold text-rose-400">{title}</h1>
        <p className="mt-3 text-sm text-slate-300">{message}</p>

        <div className="mt-6 flex justify-center gap-3">
          {isTeacher ? (
            <Link to="/data-horarios" className={`inline-flex items-center gap-2 text-sm ${BTN_PRIMARY}`}>
              <span>Configurar viagem</span>
              <Icon name="arrow-right" />
            </Link>
          ) : (
            <Link to="/home" className={`px-5 py-3 text-sm ${BTN_SECONDARY}`}>
              Voltar ao início
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
