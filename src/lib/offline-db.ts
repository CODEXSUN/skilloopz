const DB_NAME = "neot-offline";
const DB_VERSION = 1;

export interface OfflineLesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  cachedAt: number;
}

export interface OfflineSyncItem {
  id: string;
  type: "progress" | "quiz" | "note" | "bookmark";
  payload: Record<string, unknown>;
  createdAt: number;
  synced: boolean;
}

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("lessons")) {
          const lessonStore = db.createObjectStore("lessons", { keyPath: "id" });
          lessonStore.createIndex("courseId", "courseId", { unique: false });
          lessonStore.createIndex("cachedAt", "cachedAt", { unique: false });
        }

        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" });
          syncStore.createIndex("synced", "synced", { unique: false });
          syncStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "lessonId" });
        }
      };
    });
  }

  async cacheLesson(lesson: OfflineLesson): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("lessons", "readwrite");
      const store = tx.objectStore("lessons");
      store.put(lesson);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getLesson(id: string): Promise<OfflineLesson | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("lessons", "readonly");
      const store = tx.objectStore("lessons");
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLessonsByCourse(courseId: string): Promise<OfflineLesson[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("lessons", "readonly");
      const store = tx.objectStore("lessons");
      const index = store.index("courseId");
      const request = index.getAll(courseId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteLesson(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("lessons", "readwrite");
      const store = tx.objectStore("lessons");
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearOldLessons(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const db = await this.init();
    const cutoff = Date.now() - maxAgeMs;

    return new Promise((resolve, reject) => {
      const tx = db.transaction("lessons", "readwrite");
      const store = tx.objectStore("lessons");
      const index = store.index("cachedAt");
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async addToSyncQueue(item: Omit<OfflineSyncItem, "id" | "createdAt" | "synced">): Promise<void> {
    const db = await this.init();
    const syncItem: OfflineSyncItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction("syncQueue", "readwrite");
      const store = tx.objectStore("syncQueue");
      store.put(syncItem);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getUnsyncedItems(): Promise<OfflineSyncItem[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("syncQueue", "readonly");
      const store = tx.objectStore("syncQueue");
      const request = store.openCursor();
      const items: OfflineSyncItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          if (!cursor.value.synced) {
            items.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async markSynced(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("syncQueue", "readwrite");
      const store = tx.objectStore("syncQueue");
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.synced = true;
          store.put(item);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearSyncedItems(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("syncQueue", "readwrite");
      const store = tx.objectStore("syncQueue");
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          if (cursor.value.synced) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async saveProgress(lessonId: string, data: Record<string, unknown>): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("progress", "readwrite");
      const store = tx.objectStore("progress");
      store.put({ lessonId, ...data, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getProgress(lessonId: string): Promise<Record<string, unknown> | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("progress", "readonly");
      const store = tx.objectStore("progress");
      const request = store.get(lessonId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineDB = new OfflineDB();
