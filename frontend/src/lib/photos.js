export const PHOTOS_STORAGE_KEY = 'sae:photos:v1';

/**
 * Loads posted trip photos from local storage.
 */
export function loadPhotos(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(PHOTOS_STORAGE_KEY);
    if (!raw) return { photos: [], error: '' };
    const parsed = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (p) =>
          p &&
          typeof p.id === 'string' &&
          typeof p.tripId === 'string' &&
          typeof p.dataUrl === 'string' &&
          p.dataUrl.startsWith('data:image/'),
      )
    ) {
      throw new Error('Invalid photos');
    }
    return { photos: parsed, error: '' };
  } catch {
    return { photos: [], error: 'Não foi possível carregar as imagens salvas.' };
  }
}

/**
 * Persists trip photos to local storage and dispatches an in-tab sync event.
 */
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

/**
 * Appends a posted photo linked to an existing trip.
 */
export function addPhoto(photos, { tripId, caption, dataUrl, author = 'professor' }, storage, createId = () => crypto.randomUUID()) {
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

/**
 * Deletes a single photo by id.
 */
export function deletePhoto(photos, photoId, storage) {
  const next = photos.filter((p) => p.id !== photoId);
  const saveError = savePhotos(next, storage);
  if (saveError) return { photos, error: saveError };
  return { photos: next, error: '' };
}

/**
 * Removes any photos linked to a deleted trip.
 */
export function removePhotosByTrip(photos, tripId, storage) {
  const next = photos.filter((p) => p.tripId !== tripId);
  if (next.length === photos.length) return { photos, error: '' };
  const saveError = savePhotos(next, storage);
  if (saveError) return { photos, error: saveError };
  return { photos: next, error: '' };
}

/**
 * Resizes and compresses an uploaded browser File to a storage-friendly JPEG data URL.
 */
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
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
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
