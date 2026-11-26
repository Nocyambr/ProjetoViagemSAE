import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isTeacher } from '../lib/auth.js';
import { filterTrips, statusLabel } from '../lib/trips.js';
import { fetchTripLocationApi, startTripApi } from '../lib/api.js';
import Icon from '../components/Icon.jsx';

function LocationSummary({ location }) {
  const { origin, currentLocation } = location;
  const showCustomLabel = currentLocation.label && currentLocation.label !== origin?.label;

  return (
    <section
      className="rounded-2xl border border-emerald-600/70 bg-[#131d24] p-5 text-slate-100 shadow-sm"
      aria-live="polite"
    >
      <h2 className="text-sm font-bold text-emerald-300">Localização atual</h2>
      <p className="mt-2 text-base font-bold text-white">{origin?.name || 'SESI Cerquilho - SP'}</p>
      <p className="mt-1 text-xs text-slate-300">{currentLocation.address || origin?.address}</p>

      {showCustomLabel && (
        <p className="mt-2 text-sm font-medium text-emerald-200">{currentLocation.label}</p>
      )}
      {currentLocation.lat && currentLocation.lng && (
        <p className="mt-1 text-xs text-slate-400">
          GPS: {currentLocation.lat}, {currentLocation.lng}
        </p>
      )}

      <Link
        to="/locomocoes"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 underline hover:text-rose-300"
      >
        <span>Abrir mapa</span>
        <Icon name="arrow-right" className="h-3.5 w-3.5 shrink-0" />
      </Link>
    </section>
  );
}

export default function Home({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips, tripsError, photos } = portal;
  const hasTrips = trips.length > 0;
  const upcoming = filterTrips(trips, '', 'upcoming');
  const activeTrip = upcoming[0] ?? trips[0] ?? null;
  const latestPhotos = photos.slice(0, 3);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationNotice, setLocationNotice] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  async function handleTripClick(trip) {
    setLoadingLocation(true);
    setLocationNotice('');
    const result = await fetchTripLocationApi(trip);
    setLoadingLocation(false);

    if (!result.started) {
      setSelectedLocation(null);
      setLocationNotice(result.error);
      return;
    }
    setSelectedLocation(result.location);
  }

  async function handleStartTrip(trip) {
    const result = await startTripApi(trips, trip.id);
    if (result.error) {
      setLocationNotice(result.error);
      return;
    }

    const updatedTrip = result.trips.find((t) => t.id === trip.id);
    if (updatedTrip) {
      await handleTripClick(updatedTrip);
    }
  }

  const cards = [
    { to: '/locomocoes', title: 'Localização do Ônibus', image: '/images/sesi-onibus.jpg', locked: !hasTrips },
    { to: '/fotos', title: 'Fotos', image: '/images/sesi-excursao.jpg', locked: !hasTrips },
    {
      to: '/data-horarios',
      title: teacher ? 'Configurar Viagens' : 'Cronograma',
      image: '/images/sesi-escola-patio.jpg',
      locked: !teacher && !hasTrips,
    },
    { to: '/professores', title: 'Professores Responsáveis', image: '/images/sesi-professores.jpg', locked: !hasTrips },
  ];

  return (
    <div className="min-h-full bg-[#0b1116] font-sans text-slate-100">
      <div className="mx-auto mt-4 w-full max-w-6xl px-4">
        <section className="creative-hero" aria-labelledby="aventura-title">
          <div className="creative-hero-art">
            <img
              src="/images/sesi-cerquilho-hero.jpg"
              alt="Fachada da escola SESI Cerquilho"
              width="1408"
              height="768"
              fetchPriority="high"
            />
          </div>

          <div className="creative-hero-copy">
            <h1 id="aventura-title">Viagens SESI Cerquilho</h1>
            <div className="mt-4 flex flex-wrap gap-3">
              {teacher ? (
                <>
                  <Link
                    to="/data-horarios"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f6c45b] px-5 py-3 text-sm font-bold text-emerald-950 shadow-sm hover:bg-[#ffda8d]"
                  >
                    <span>{hasTrips ? 'Gerenciar viagens' : 'Configurar viagem'}</span>
                    <Icon name="arrow-up-right" />
                  </Link>
                  {hasTrips && (
                    <Link
                      to="/locomocoes"
                      className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Atualizar ônibus
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to={hasTrips ? '/locomocoes' : '/home'}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm ${
                      hasTrips
                        ? 'bg-[#f6c45b] text-emerald-950 hover:bg-[#ffda8d]'
                        : 'border border-slate-600 bg-slate-800/90 text-slate-300'
                    }`}
                  >
                    {!hasTrips && <Icon name="lock" />}
                    <span>{hasTrips ? 'Acompanhar ônibus' : 'Aguardando viagem'}</span>
                    {hasTrips && <Icon name="arrow-up-right" />}
                  </Link>
                  {hasTrips && (
                    <Link
                      to="/fotos"
                      className="rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Ver fotos
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-emerald-800/60 bg-[#0a2e25] p-6 text-white shadow-sm">
            <h2 className="text-xl font-bold">
              {activeTrip ? activeTrip.title : 'Nenhuma viagem cadastrada'}
            </h2>

            {activeTrip ? (
              <div className="mt-3 space-y-2 text-sm text-emerald-100">
                {activeTrip.destination && <p>Destino: {activeTrip.destination}</p>}
                <p>
                  {`${activeTrip.date.split('-').reverse().join('/')} · ${activeTrip.departure} - ${activeTrip.arrival}`}
                </p>
                <p className="inline-block rounded-full border border-emerald-700/60 bg-emerald-900/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">
                  {activeTrip.started ? `Iniciada · ${statusLabel(activeTrip.status)}` : 'Aguardando início'}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-emerald-100/90">
                {teacher
                  ? 'Crie e inicie uma viagem para liberar aos alunos e pais.'
                  : 'Disponível após o professor criar uma viagem.'}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {activeTrip && (
                <button
                  type="button"
                  onClick={() => handleTripClick(activeTrip)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-50"
                >
                  <span>{loadingLocation ? 'Carregando...' : 'Ver localização atual'}</span>
                  <Icon name="arrow-right" />
                </button>
              )}

              {teacher && activeTrip && !activeTrip.started && (
                <button
                  type="button"
                  onClick={() => handleStartTrip(activeTrip)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f6c45b] px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-[#ffda8d]"
                >
                  <span>Iniciar viagem</span>
                </button>
              )}

              {teacher && !activeTrip && (
                <Link
                  to="/data-horarios"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-50"
                >
                  <span>Criar viagem</span>
                  <Icon name="arrow-right" />
                </Link>
              )}
            </div>

            {tripsError && <p className="mt-3 text-xs text-amber-200">{tripsError}</p>}
          </section>

          {locationNotice && (
            <p role="status" className="rounded-2xl border border-amber-600/60 bg-amber-950/60 p-4 text-sm text-amber-200">
              {locationNotice}
            </p>
          )}

          {selectedLocation && <LocationSummary location={selectedLocation} />}
        </div>

        <div className="flex flex-col gap-6 md:col-span-2">
          {trips.length > 1 && (
            <section className="rounded-2xl border border-slate-800 bg-[#131d24] p-5">
              <h2 className="mb-3 text-base font-bold text-slate-100">Viagens</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => handleTripClick(trip)}
                    className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#0b1116] px-4 py-3 text-left transition-colors hover:border-emerald-500"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-100">{trip.title}</p>
                      <p className="text-xs text-slate-400">
                        {trip.started ? statusLabel(trip.status) : 'Aguardando início'}
                      </p>
                    </div>
                    <Icon name={trip.started ? 'arrow-right' : 'lock'} className="h-4 w-4 text-emerald-300" />
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <small className="mt-1 flex items-center gap-1.5 text-xs font-normal text-amber-200">
                      <Icon name="lock" className="h-3.5 w-3.5 shrink-0" />
                      <span>Aguardando viagem</span>
                    </small>
                  )}
                </span>
                <Icon name={card.locked ? 'lock' : 'arrow-up-right'} className="ml-3 h-6 w-6 shrink-0" />
              </Link>
            ))}
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
