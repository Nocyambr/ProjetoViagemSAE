export const PHOTOS_STORAGE_KEY = 'sae:photos:v1';

export function loadPhotos(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(PHOTOS_STORAGE_KEY);
    if (!raw) return { photos: [], error: '' };

    const parsed = JSON.parse(raw);
    const valid =
      Array.isArray(parsed) &&
      parsed.every(
        (p) =>
          p &&
          typeof p.id === 'string' &&
          typeof p.tripId === 'string' &&
          typeof p.dataUrl === 'string' &&
          p.dataUrl.startsWith('data:image/'),
      );
    if (!valid) throw new Error('Dados inválidos');

    return { photos: parsed, error: '' };
  } catch {
    return { photos: [], error: 'Não foi possível carregar as imagens salvas.' };
  }
}

export function savePhotos(photos, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    if (!storage && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sae:data-updated'));
    }
    return '';
  } catch {
    return 'Armazenamento cheio ou bloqueado: tente enviar uma imagem menor ou remover fotos antigas.';
  }
}

export function addPhoto(
  photos,
  { tripId, caption, dataUrl, author = 'professor' },
  storage,
  createId = () => crypto.randomUUID(),
) {
  if (!tripId) return { photos, error: 'Selecione uma viagem para vincular a imagem.' };
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return { photos, error: 'Arquivo inválido. Selecione uma imagem.' };
  }

  const entry = {
    id: createId(),
    tripId,
    caption: typeof caption === 'string' ? caption.trim().slice(0, 140) : '',
    dataUrl,
    author,
    createdAt: new Date().toISOString(),
  };

  const next = [entry, ...photos];
  const saveError = savePhotos(next, storage);
  if (saveError) return { photos, error: saveError };

  return { photos: next, error: '' };
}

export function deletePhoto(photos, photoId, storage) {
  const next = photos.filter((p) => p.id !== photoId);
  const saveError = savePhotos(next, storage);
  if (saveError) return { photos, error: saveError };

  return { photos: next, error: '' };
}

export function removePhotosByTrip(photos, tripId, storage) {
  const next = photos.filter((p) => p.tripId !== tripId);
  if (next.length === photos.length) return { photos, error: '' };

  const saveError = savePhotos(next, storage);
  if (saveError) return { photos, error: saveError };

  return { photos: next, error: '' };
}

export function compressImageFile(file, maxDimension = 1000, quality = 0.76) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Selecione um arquivo de imagem válido.'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível ler a imagem selecionada.'));
    };

    img.src = objectUrl;
  });
}
