import { useEffect, useState } from 'react';
import { isTeacher } from '../lib/auth.js';
import { BUS_STATUSES, SESI_CERQUILHO, statusLabel } from '../lib/trips.js';
import { fetchTripLocationApi, startTripApi, updateTripLocationApi } from '../lib/api.js';
import {
  BTN_EMERALD,
  BTN_PRIMARY,
  BTN_SECONDARY,
  CARD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  SELECT_CLASS,
} from '../lib/styles.js';
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

function buildGoogleMapsUrl(location) {
  if (location.lat && location.lng) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${location.lat},${location.lng}`)}`;
  }
  if (location.label) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.label)}`;
  }
  return '';
}

function LocationForm({
  fields,
  onChange,
  onSubmit,
  onAutoFill,
  onApplySesi,
  onCaptureGps,
  gpsLoading,
  error,
}) {
  return (
    <section className={CARD_CLASS}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-rose-400">Atualizar localização do ônibus</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onAutoFill} className={BTN_EMERALD}>
            Preencher automaticamente
          </button>
          <button type="button" onClick={onApplySesi} className={BTN_SECONDARY}>
            Definir SESI Cerquilho - SP
          </button>
          <button
            type="button"
            onClick={onCaptureGps}
            disabled={gpsLoading}
            className={`${BTN_EMERALD} disabled:opacity-50`}
          >
            {gpsLoading ? 'Obtendo GPS...' : 'Usar GPS atual'}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className={LABEL_CLASS}>
          Status da viagem
          <select
            value={fields.status}
            onChange={(e) => onChange('status', e.target.value)}
            className={SELECT_CLASS}
          >
            {BUS_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className={LABEL_CLASS}>
          Ônibus / Placa
          <input
            type="text"
            value={fields.busName}
            onChange={(e) => onChange('busName', e.target.value)}
            className={INPUT_CLASS}
          />
        </label>

        <label className={`${LABEL_CLASS} sm:col-span-2`}>
          Localização / Ponto de referência
          <input
            type="text"
            required
            value={fields.label}
            onChange={(e) => onChange('label', e.target.value)}
            placeholder="Ex.: SESI Cerquilho - SP (Rua Antônio Modanez, 111)"
            className={INPUT_CLASS}
          />
        </label>

        <label className={LABEL_CLASS}>
          Latitude
          <input
            type="text"
            value={fields.lat}
            onChange={(e) => onChange('lat', e.target.value)}
            placeholder="-23.16345"
            className={INPUT_CLASS}
          />
        </label>

        <label className={LABEL_CLASS}>
          Longitude
          <input
            type="text"
            value={fields.lng}
            onChange={(e) => onChange('lng', e.target.value)}
            placeholder="-47.76580"
            className={INPUT_CLASS}
          />
        </label>

        {error && <p role="alert" className="text-sm text-rose-300 sm:col-span-2">{error}</p>}

        <button type="submit" className={`${BTN_PRIMARY} sm:col-span-2`}>
          Salvar localização
        </button>
      </form>
    </section>
  );
}

export default function Transports({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips } = portal;

  const [selectedId, setSelectedId] = useState(() => trips[0]?.id ?? '');
  const activeTrip = trips.find((t) => t.id === selectedId) ?? trips[0] ?? null;

  const [fields, setFields] = useState({
    status: activeTrip?.status ?? 'planned',
    busName: activeTrip?.busName ?? '',
    label: activeTrip?.busLocation?.label ?? SESI_CERQUILHO.label,
    address: activeTrip?.busLocation?.address ?? SESI_CERQUILHO.address,
    lat: activeTrip?.busLocation?.lat ?? SESI_CERQUILHO.lat,
    lng: activeTrip?.busLocation?.lng ?? SESI_CERQUILHO.lng,
    progress: activeTrip?.busLocation?.progress ?? 0,
  });
  const [apiLocation, setApiLocation] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (!activeTrip) return;

    setSelectedId(activeTrip.id);
    setFields({
      status: activeTrip.status,
      busName: activeTrip.busName,
      label: activeTrip.busLocation.label,
      address: activeTrip.busLocation.address || SESI_CERQUILHO.address,
      lat: activeTrip.busLocation.lat,
      lng: activeTrip.busLocation.lng,
      progress: activeTrip.busLocation.progress,
    });

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
        <div className={`mx-auto max-w-2xl text-center ${CARD_CLASS}`}>
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-amber-300"
            aria-hidden="true"
          >
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

  function updateField(name, value) {
    setFields((prev) => ({ ...prev, [name]: value }));
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
    const res = await updateTripLocationApi(trips, activeTrip.id, fields);
    setError(res.error);
    setNotice(res.error ? '' : 'Localização do ônibus atualizada via API.');
  }

  function applySesiCerquilho() {
    setFields((prev) => ({
      ...prev,
      label: SESI_CERQUILHO.label,
      address: SESI_CERQUILHO.address,
      lat: SESI_CERQUILHO.lat,
      lng: SESI_CERQUILHO.lng,
    }));
    setNotice('Coordenadas de SESI Cerquilho - SP aplicadas. Clique em salvar.');
  }

  function handleAutoFillLocation() {
    setFields({
      status: 'transit',
      busName: activeTrip?.busName || 'Ônibus 01 · Fretado SESI',
      label: 'Rodovia Castello Branco (SP-280) · Km 78 - Itu/SP',
      address: 'Rodovia Presidente Castello Branco, Km 78 - Itu - SP',
      lat: '-23.26410',
      lng: '-47.29920',
      progress: 50,
    });
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
        setFields((prev) => ({
          ...prev,
          lat: nextLat,
          lng: nextLng,
          label: `GPS capturado (${nextLat}, ${nextLng})`,
        }));
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
  const mapUrl = buildGoogleMapsUrl(currentLoc);

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

        <section className={CARD_CLASS}>
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
          <LocationForm
            fields={fields}
            onChange={updateField}
            onSubmit={handleSave}
            onAutoFill={handleAutoFillLocation}
            onApplySesi={applySesiCerquilho}
            onCaptureGps={captureGps}
            gpsLoading={gpsLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
