import { useEffect, useRef, useState } from 'react';
import { isTeacher } from '../lib/auth.js';
import { addPhoto, compressImageFile, deletePhoto } from '../lib/photos.js';
import TripRequiredGate from '../components/TripRequiredGate.jsx';

export default function Photos({ user, portal }) {
  const teacher = isTeacher(user);
  const { trips, photos, photosError } = portal;

  const [tripId, setTripId] = useState(() => trips[0]?.id ?? '');
  const [filterTripId, setFilterTripId] = useState('all');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState(photosError);
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (trips.length && !trips.some((t) => t.id === tripId)) {
      setTripId(trips[0].id);
    }
  }, [trips, tripId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedPhoto) {
      dialog.setAttribute('closedby', 'any');
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [selectedPhoto]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const onClose = () => setSelectedPhoto(null);
    dialog.addEventListener('close', onClose);

    // Fallback for browsers without native closedby="any" support.
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const onClick = (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const inside =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!inside) dialog.close();
      };
      dialog.addEventListener('click', onClick);
      return () => {
        dialog.removeEventListener('close', onClose);
        dialog.removeEventListener('click', onClick);
      };
    }

    return () => dialog.removeEventListener('close', onClose);
  }, []);

  if (!trips.length) {
    return <TripRequiredGate isTeacher={teacher} title="Fotos da Viagem" />;
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!teacher) return;
    const files = Array.from(fileInputRef.current?.files ?? []);
    if (!files.length) {
      setError('Selecione pelo menos uma imagem.');
      return;
    }

    setUploading(true);
    setError('');
    setNotice('');

    let currentPhotos = photos;
    let postedCount = 0;
    try {
      for (const file of files) {
        const dataUrl = await compressImageFile(file);
        const res = addPhoto(currentPhotos, {
          tripId,
          caption,
          dataUrl,
          author: user.username,
        });
        if (res.error) {
          setError(res.error);
          break;
        }
        currentPhotos = res.photos;
        postedCount += 1;
      }
      if (postedCount > 0) {
        setCaption('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setNotice(`${postedCount} ${postedCount === 1 ? 'imagem postada' : 'imagens postadas'}.`);
      }
    } catch (err) {
      setError(err?.message || 'Erro ao processar a imagem.');
    } finally {
      setUploading(false);
    }
  }

  function handleDelete(photo) {
    if (!teacher) return;
    const res = deletePhoto(photos, photo.id);
    if (res.error) {
      setError(res.error);
    } else {
      setNotice('Imagem removida.');
      if (selectedPhoto?.id === photo.id) setSelectedPhoto(null);
    }
  }

  const tripName = (id) => trips.find((t) => t.id === id)?.title ?? 'Viagem';
  const visiblePhotos = filterTripId === 'all' ? photos : photos.filter((p) => p.tripId === filterTripId);

  return (
    <div className="min-h-full bg-[#0b1116] p-4 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-rose-400">Fotos da Viagem</h1>
          {trips.length > 1 && (
            <label className="text-sm font-medium text-slate-300">
              <span className="mr-2">Filtrar:</span>
              <select
                value={filterTripId}
                onChange={(e) => setFilterTripId(e.target.value)}
                className="rounded-xl border border-slate-500 bg-[#131d24] px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
              >
                <option value="all">Todas as viagens</option>
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

        {teacher && (
          <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-bold text-rose-400">Postar novas imagens</h2>
            <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2">
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

              <label className="text-sm font-medium text-slate-200">
                Legenda (opcional)
                <input
                  type="text"
                  maxLength={140}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex.: Chegada ao parque"
                  className="mt-1 block min-h-12 w-full rounded-xl border border-slate-500 bg-[#0b1116] px-3.5 py-2.5 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                />
              </label>

              <label className="text-sm font-medium text-slate-200 sm:col-span-2">
                Selecionar fotos
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-1 block w-full rounded-xl border border-slate-500 bg-[#0b1116] p-2.5 text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-xs file:font-bold file:text-slate-100 hover:file:bg-slate-700"
                />
              </label>

              {error && <p role="alert" className="text-sm text-rose-300 sm:col-span-2">{error}</p>}

              <button
                type="submit"
                disabled={uploading}
                className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500 disabled:opacity-50 sm:col-span-2"
              >
                {uploading ? 'Enviando...' : 'Publicar imagens'}
              </button>
            </form>
          </section>
        )}

        <section className="rounded-3xl border border-slate-800 bg-[#131d24] p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-bold text-slate-100">Galeria ({visiblePhotos.length})</h2>
          {visiblePhotos.length === 0 ? (
            <p className="rounded-xl border border-slate-700 bg-slate-800/70 p-5 text-sm text-slate-300">
              {teacher ? 'Nenhuma imagem postada ainda. Use o formulário acima para publicar fotos.' : 'O professor ainda não postou fotos desta viagem.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {visiblePhotos.map((photo) => (
                <article key={photo.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0b1116]">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative block overflow-hidden text-left"
                    aria-label={`Ampliar ${photo.caption || 'foto da viagem'}`}
                  >
                    <img
                      src={photo.dataUrl}
                      alt={photo.caption || 'Foto postada da viagem'}
                      className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </button>
                  <div className="flex flex-1 flex-col justify-between p-3.5">
                    <div>
                      <span className="inline-block rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-700/60">
                        {tripName(photo.tripId)}
                      </span>
                      {photo.caption && <p className="mt-2 text-sm text-slate-200">{photo.caption}</p>}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{new Date(photo.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      {teacher && (
                        <button
                          type="button"
                          onClick={() => handleDelete(photo)}
                          className="font-semibold text-rose-400 underline hover:text-rose-300"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="photo-dialog-title"
        className="m-auto max-h-[90dvh] w-[min(92vw,760px)] rounded-3xl border border-slate-700 bg-[#131d24] p-4 text-slate-100 shadow-2xl"
      >
        {selectedPhoto && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 id="photo-dialog-title" className="text-base font-bold text-slate-100">
                {selectedPhoto.caption || tripName(selectedPhoto.tripId)}
              </h2>
              <button
                type="button"
                autofocus
                onClick={() => dialogRef.current?.close()}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
            <img
              src={selectedPhoto.dataUrl}
              alt={selectedPhoto.caption || 'Foto ampliada da viagem'}
              className="max-h-[72dvh] w-full rounded-2xl object-contain bg-[#0b1116]"
            />
          </div>
        )}
      </dialog>
    </div>
  );
}
