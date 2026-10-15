export const PREPARATION_KEY = 'sae:preparation:v1';
export const PREPARATION_ITEMS = [
  { id: 'water', label: 'Separar garrafa de água' },
  { id: 'clothes', label: 'Preparar mochila e roupas confortáveis' },
  { id: 'shoes', label: 'Separar calçados adequados para caminhada' },
  { id: 'documents', label: 'Conferir os documentos solicitados pela escola' },
  { id: 'schedule', label: 'Conferir horário e local de saída' },
  { id: 'weather', label: 'Conferir a previsão do tempo antes da saída' },
];
export function loadPreparation(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(PREPARATION_KEY);
    if (raw === null) return { checked: [], error: '' };
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every((id) => PREPARATION_ITEMS.some((item) => item.id === id))) throw new Error('invalid');
    return { checked: [...new Set(data)], error: '' };
  } catch {
    return { checked: [], error: 'Não foi possível recuperar sua lista. As marcações anteriores não foram alteradas.' };
  }
}
export function savePreparation(checked, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(PREPARATION_KEY, JSON.stringify(checked));
    return '';
  } catch {
    return 'Não foi possível salvar a lista. Verifique o armazenamento do navegador e tente novamente.';
  }
}
