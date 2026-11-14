import type { Round } from './round.ts';

function replayStore(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest) {
  return new Promise<unknown>((resolve, reject) => {
    const open = indexedDB.open('the-great-escape', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('replays');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction('replays', mode);
      const request = action(transaction.objectStore('replays'));
      transaction.oncomplete = () => {
        db.close();
        resolve(request.result);
      };
      transaction.onabort = () => {
        db.close();
        reject(transaction.error);
      };
    };
  });
}

export async function loadReplay(): Promise<Round[] | null> {
  const frames = await replayStore('readonly', store => store.get('latest-v1'));
  return Array.isArray(frames) && frames.length ? frames : null;
}

export async function saveReplay(frames: readonly Round[]) {
  await replayStore('readwrite', store => store.put(frames, 'latest-v1'));
}

export const defaultSettings = { size: 'mini', duration: 30, zoom: false, largeTimer: false };
export function loadSettings(): typeof defaultSettings {
  try {
    const saved = JSON.parse(localStorage.getItem('escape-settings') ?? '{}') ?? {};
    return {
      size: ['mini', 'compact', 'standard', 'large'].includes(saved.size) ? saved.size : 'mini',
      duration: [30, 60, 90, 120, 180].includes(saved.duration) ? saved.duration : 30,
      zoom: saved.zoom === true,
      largeTimer: saved.largeTimer === true,
    };
  } catch {
    return defaultSettings;
  }
}
