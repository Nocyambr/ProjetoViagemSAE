import { useEffect, useState } from 'react';
import { isTeacher } from '../lib/auth.js';
import { BUS_STATUSES, SESI_CERQUILHO, statusLabel } from '../lib/trips.js';
import { fetchTripLocationApi, startTripApi, updateTripLocationApi } from '../lib/api.js';
import TripRequiredGate from '../components/TripRequiredGate.jsx';
import Icon from '../components/Icon.jsx';

function formatTime(iso) {
  if (!iso) return 'Agora';
  try {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function Transports({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips } = portal;

  const [selectedId, setSelectedId] = useState(() => trips[0]?.id ?? '');
  const activeTrip = trips.find((t) => t.id === selectedId) ?? trips[0] ?? null;

  const [status, setStatus] = useState(activeTrip?.status ?? 'planned');
  const [busName, setBusName] = useState(activeTrip?.busName ?? '');
  const [label, setLabel] = useState(activeTrip?.busLocation?.label ?? SESI_CERQUILHO.label);
  const [address, setAddress] = useState(activeTrip?.busLocation?.address ?? SESI_CERQUILHO.address);
  const [lat, setLat] = useState(activeTrip?.busLocation?.lat ?? SESI_CERQUILHO.lat);
  const [lng, setLng] = useState(activeTrip?.busLocation?.lng ?? SESI_CERQUILHO.lng);
  const [progress, setProgress] = useState(activeTrip?.busLocation?.progress ?? 0);
  const [apiLocation, setApiLocation] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (!activeTrip) return;
    setSelectedId(activeTrip.id);
    setStatus(activeTrip.status);
    setBusName(activeTrip.busName);
    setLabel(activeTrip.busLocation.label);
    setAddress(activeTrip.busLocation.address || SESI_CERQUILHO.address);
    setLat(activeTrip.busLocation.lat);
    setLng(activeTrip.busLocation.lng);
    setProgress(activeTrip.busLocation.progress);

    if (activeTrip.started) {
      fetchTripLocationApi(activeTrip).then((res) => {
        if (res.started) setApiLocation(res.location);
      });
    } else {
      setApiLocation(null);
    }
  }, [activeTrip?.id, activeTrip?.started, activeTrip?.busLocation?.updatedAt]);

  if (!trips.length) {
    return <TripRequiredGate isTeacher={teacher} title="Localização do Ônibus" />;
  }

  if (!teacher && activeTrip && !activeTrip.started) {
    return (
      <div className="min-h-full bg-[#0b1116] p-4 text-slate-100 sm:p-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-[#131d24] p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-amber-300" aria-hidden="true">
            <Icon name="lock" className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-rose-400">Localização do Ônibus</h1>
          <p className="mt-3 text-sm text-slate-300">
            A viagem "{activeTrip.title}" ainda não foi iniciada pelo professor. A localização atual (SESI Cerquilho - SP) aparecerá assim que for iniciada.
          </p>
        </div>
      </div>
    );
  }

  async function handleStartNow() {
    if (!teacher || !activeTrip) return;
    const res = await startTripApi(trips, activeTrip.id);
    setError(res.error);
    if (!res.error) {
      setNotice('Viagem iniciada! Localização atual definida em SESI Cerquilho - SP.');
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!teacher || !activeTrip) return;
    const res = await updateTripLocationApi(trips, activeTrip.id, { status, busName, label, address, lat, lng, progress });
    setError(res.error);
    setNotice(res.error ? '' : 'Localização do ônibus atualizada via API.');
  }

  function applySesiCerquilho() {
    setLabel(SESI_CERQUILHO.label);
    setAddress(SESI_CERQUILHO.address);
    setLat(SESI_CERQUILHO.lat);
    setLng(SESI_CERQUILHO.lng);
    setNotice('Coordenadas de SESI Cerquilho - SP aplicadas. Clique em salvar.');
  }

  function handleAutoFillLocation() {
    setStatus('transit');
    setBusName(activeTrip?.busName || 'Ônibus 01 · Fretado SESI');
    setLabel('Rodovia Castello Branco (SP-280) · Km 78 - Itu/SP');
    setAddress('Rodovia Presidente Castello Branco, Km 78 - Itu - SP');
    setLat('-23.26410');
    setLng('-47.29920');
    setProgress(50);
    setError('');
    setNotice('Informações de localização preenchidas automaticamente. Clique em salvar.');
  }

  function captureGps() {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste navegador.');
      return;
    }
    setGpsLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextLat = pos.coords.latitude.toFixed(6);
        const nextLng = pos.coords.longitude.toFixed(6);
        setLat(nextLat);
        setLng(nextLng);
        setLabel(`GPS capturado (${nextLat}, ${nextLng})`);
        setGpsLoading(false);
        setNotice('Coordenadas GPS capturadas. Clique em salvar para publicar.');
      },
      () => {
        setGpsLoading(false);
        setError('Não foi possível obter o GPS do dispositivo. Você pode usar SESI Cerquilho - SP ou preencher manualmente.');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const currentLoc = apiLocation?.currentLocation ?? activeTrip.busLocation;
  const hasCoords = Boolean(currentLoc.lat && currentLoc.lng);
  const mapUrl = hasCoords
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${currentLoc.lat},${currentLoc.lng}`)}`
    : currentLoc.label
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLoc.label)}`
      : '';

  return (
    <div className="min-h-full bg-[#0b1116] p-4 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-rose-400">Localização do Ônibus</h1>
          {trips.length > 1 && (
            <label className="text-sm font-medium text-slate-300">
              <span className="mr-2">Viagem:</span>
              <select
                value={activeTrip.id}
                onChange={(e) => setSelectedId(e.target.value)}
                className="rounded-xl border border-slate-500 bg-[#131d24] px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {notice && (
          <p role="status" className="rounded-xl border border-emerald-700 bg-emerald-950/70 p-3 text-sm text-emerald-200">
            {notice}
          </p>
        )}

        <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full border border-emerald-600/60 bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-300">
                {activeTrip.started ? statusLabel(activeTrip.status) : 'Aguardando início'}
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-100">{activeTrip.title}</h2>
              <p className="text-sm text-slate-400">{activeTrip.busName}</p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right text-xs text-slate-400">
              {teacher && !activeTrip.started && (
                <button
                  type="button"
                  onClick={handleStartNow}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Iniciar viagem agora
                </button>
              )}
              <div>
                <p>Atualizado em</p>
                <p className="font-semibold text-slate-200">{formatTime(currentLoc.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-800/50 p-4">
              <p className="text-xs font-semibold text-slate-400">Localização atual</p>
              <p className="mt-1 text-base font-bold text-slate-100">{currentLoc.label}</p>
              <p className="mt-1 text-xs text-slate-300">{currentLoc.address || SESI_CERQUILHO.address}</p>
              {hasCoords && (
                <p className="mt-1 text-xs text-slate-400">
                  Coordenadas: {currentLoc.lat}, {currentLoc.lng}
                </p>
              )}
            </div>
            <div className="flex flex-col justify-between rounded-2xl border border-slate-700/70 bg-slate-800/50 p-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">Origem e destino</p>
                <p className="mt-1 text-sm font-bold text-slate-100">Saída: SESI Cerquilho - SP</p>
                {activeTrip.destination && (
                  <p className="mt-1 text-xs text-slate-300">Destino: {activeTrip.destination}</p>
                )}
              </div>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-400 underline hover:text-rose-300"
                >
                  <span>Abrir no Google Maps</span>
                  <Icon name="arrow-up-right" className="h-3.5 w-3.5 shrink-0" />
                </a>
              )}
            </div>
          </div>
        </section>

        {teacher && (
          <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-rose-400">Atualizar localização do ônibus</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillLocation}
                  className="rounded-xl border border-emerald-500/60 bg-emerald-950/60 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60"
                >
                  Preencher automaticamente
                </button>
                <button
                  type="button"
                  onClick={applySesiCerquilho}
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-100 hover:bg-slate-700"
                >
                  Definir SESI Cerquilho - SP
                </button>
                <button
                  type="button"
                  onClick={captureGps}
                  disabled={gpsLoading}
                  className="rounded-xl border border-emerald-500/60 bg-emerald-950/60 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 disabled:opacity-50"
                >
                  {gpsLoading ? 'Obtendo GPS...' : 'Usar GPS atual'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-200">
                Status da viagem
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block min-h-12 w-full rounded-xl border border-slate-500 bg-[#0b1116] px-3.5 py-2.5 text-slate-100 focus:border-emerald-400 focus:outline-none"
                >
                  {BUS_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-200">
                Ônibus / Placa
                <input
                  type="text"
                  value={busName}
                  onChange={(e) => setBusName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-medium text-slate-200 sm:col-span-2">
                Localização / Ponto de referência
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex.: SESI Cerquilho - SP (Rua Antônio Modanez, 111)"
                  className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-medium text-slate-200">
                Latitude
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="-23.16345"
                  className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-medium text-slate-200">
                Longitude
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="-47.76580"
                  className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-3 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </label>

              {error && <p role="alert" className="text-sm text-rose-300 sm:col-span-2">{error}</p>}

              <button type="submit" className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500 sm:col-span-2">
                Salvar localização
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
