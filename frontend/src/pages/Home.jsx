import { Link } from 'react-router-dom';
import { isTeacher } from '../lib/auth.js';
import { filterTrips, statusLabel } from '../lib/trips.js';

export default function Home({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips, tripsError, photos } = portal;
  const hasTrips = trips.length > 0;
  const upcoming = filterTrips(trips, '', 'upcoming');
  const activeTrip = upcoming[0] ?? trips[0] ?? null;
  const latestPhotos = photos.slice(0, 3);

  const cards = [
    {
      to: '/locomocoes',
      title: 'Localização do Ônibus',
      image: '/images/laboratorio-de-curiosidades.webp',
      locked: !hasTrips,
    },
    {
      to: '/fotos',
      title: 'Fotos',
      image: '/images/aventura-floresta.webp',
      locked: !hasTrips,
    },
    {
      to: '/data-horarios',
      title: teacher ? 'Configurar Viagens' : 'Cronograma',
      image: '/images/mundo-de-descobertas.webp',
      locked: !teacher && !hasTrips,
    },
    {
      to: '/professores',
      title: 'Professores Responsáveis',
      image: '/images/exploracao-educativa.webp',
      locked: !hasTrips,
    },
  ];

  return (
    <div className="min-h-full bg-[#0b1116] text-slate-100 font-sans">
      <div className="w-full max-w-6xl mx-auto mt-4 px-4">
        <section className="creative-hero" aria-labelledby="aventura-title">
          <div className="creative-hero-art">
            <img
              src="/images/mundo-de-descobertas.webp"
              alt="Ilustração de um mundo de aventuras que nasce de um caderno, com floresta, ônibus e observatório"
              width="2048"
              height="1024"
              fetchPriority="high"
            />
          </div>
          <div className="creative-hero-copy">
            <span className="expedition-label">{teacher ? 'Painel do Professor · SESI' : 'Portal da Viagem · SESI'}</span>
            <h1 id="aventura-title">O mundo é nossa<br /><em>sala de aula.</em></h1>
            <div className="mt-6 flex flex-wrap gap-3">
              {teacher ? (
                <>
                  <Link to="/data-horarios" className="rounded-xl bg-[#f6c45b] px-5 py-3 text-sm font-bold text-emerald-950 shadow-sm hover:bg-[#ffda8d]">
                    {hasTrips ? 'Gerenciar viagens ↗' : 'Configurar viagem ↗'}
                  </Link>
                  {hasTrips && (
                    <Link to="/locomocoes" className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                      Atualizar ônibus
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to={hasTrips ? '/locomocoes' : '/home'}
                    className={`rounded-xl px-5 py-3 text-sm font-bold shadow-sm ${
                      hasTrips ? 'bg-[#f6c45b] text-emerald-950 hover:bg-[#ffda8d]' : 'bg-slate-800/90 text-slate-300 border border-slate-600'
                    }`}
                  >
                    {hasTrips ? 'Acompanhar ônibus ↗' : '🔒 Aguardando viagem'}
                  </Link>
                  {hasTrips && (
                    <Link to="/fotos" className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                      Ver fotos
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-emerald-800/60 bg-[#0a2e25] p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              {activeTrip ? 'Viagem ativa' : 'Status das viagens'}
            </p>
            <h2 className="mt-3 text-xl font-bold">
              {activeTrip ? activeTrip.title : 'Nenhuma viagem criada'}
            </h2>

            {activeTrip ? (
              <div className="mt-3 space-y-1.5 text-sm text-emerald-100">
                {activeTrip.destination && <p>Destino: {activeTrip.destination}</p>}
                <p>{`${activeTrip.date.split('-').reverse().join('/')} · ${activeTrip.departure} – ${activeTrip.arrival}`}</p>
                <p className="inline-block rounded-full bg-emerald-900/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 border border-emerald-700/60">
                  {statusLabel(activeTrip.status)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-emerald-100/90">
                {teacher
                  ? 'Crie uma viagem para liberar o acompanhamento aos alunos e pais.'
                  : 'Localização do ônibus e fotos serão liberadas após o professor criar uma viagem.'}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {teacher ? (
                <Link to="/data-horarios" className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-50">
                  {hasTrips ? 'Abrir painel →' : 'Criar viagem →'}
                </Link>
              ) : hasTrips ? (
                <Link to="/locomocoes" className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-50">
                  Ver ônibus →
                </Link>
              ) : null}
            </div>

            {tripsError && <p className="mt-3 text-xs text-amber-200">{tripsError}</p>}
          </section>

          {activeTrip && (
            <section className="rounded-2xl border border-slate-800 bg-[#131d24] p-5 text-slate-100 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400">Localização atual</h2>
                <span className="text-xs text-slate-400">{activeTrip.busLocation.progress}%</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-100">{activeTrip.busLocation.label}</p>
              <p className="mt-1 text-xs text-slate-400">{activeTrip.busName}</p>
              <Link to="/locomocoes" className="mt-3 inline-block text-xs font-semibold text-emerald-300 underline hover:text-emerald-200">
                {teacher ? 'Atualizar localização →' : 'Abrir mapa da rota →'}
              </Link>
            </section>
          )}
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Acesso rápido</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card) => (
                <Link
                  key={card.to}
                  to={card.to}
                  className={`image-section-card${card.locked ? ' opacity-70' : ''}`}
                  style={{ '--card-image': `url(${card.image})` }}
                >
                  <span>
                    {card.title}
                    {card.locked && (
                      <small className="mt-1 block text-xs font-normal text-amber-200">
                        🔒 Aguardando viagem
                      </small>
                    )}
                  </span>
                  <span aria-hidden="true" className="ml-3 text-2xl">{card.locked ? '🔒' : '↗'}</span>
                </Link>
              ))}
            </div>
          </div>

          {hasTrips && latestPhotos.length > 0 && (
            <section className="rounded-2xl border border-slate-800 bg-[#131d24] p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100">Fotos recentes</h2>
                <Link to="/fotos" className="text-xs font-semibold text-rose-400 underline hover:text-rose-300">
                  Ver todas ({photos.length})
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {latestPhotos.map((photo) => (
                  <Link key={photo.id} to="/fotos" className="overflow-hidden rounded-xl border border-slate-700">
                    <img
                      src={photo.dataUrl}
                      alt={photo.caption || 'Foto da viagem'}
                      className="h-24 w-full object-cover transition-transform hover:scale-105"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
