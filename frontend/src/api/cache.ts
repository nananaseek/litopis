/**
 * API cache in IndexedDB (persistent, not in-memory).
 * TTL-based expiry; stale-while-revalidate via cachedFetch.
 */

const DB_NAME = 'litopis-api-cache'
const STORE_NAME = 'entries'
const DB_VERSION = 1

export const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
  })
  return dbPromise
}

export interface CacheEntry<T = unknown> {
  key: string
  data: T
  expiresAt: number
}

export async function get<T>(key: string): Promise<{ data: T } | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(key)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => {
      const row = req.result as CacheEntry<T> | undefined
      if (!row) {
        resolve(null)
        return
      }
      if (row.expiresAt <= Date.now()) {
        store.delete(key)
        resolve(null)
        return
      }
      resolve({ data: row.data })
    }
  })
}

export async function set(key: string, data: unknown, ttlMs: number): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const entry: CacheEntry = {
      key,
      data,
      expiresAt: Date.now() + ttlMs,
    }
    const req = store.put(entry)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve()
  })
}

export async function remove(key: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.delete(key)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve()
  })
}

// --- Cache key builders ---

export function myToolsCacheKey(
  skip: number,
  limit: number,
  params?: { category?: string; search?: string; sort?: string }
): string {
  const c = params?.category ?? ''
  const s = params?.search ?? ''
  const o = params?.sort ?? ''
  return `my-tools:${skip}:${limit}:${c}:${s}:${o}`
}

export function libraryCacheKey(params: {
  skip?: number
  limit?: number
  category?: string
  search?: string
  min_rating?: number
  sort?: string
}): string {
  const skip = params.skip ?? 0
  const limit = params.limit ?? 50
  const c = params.category ?? ''
  const s = params.search ?? ''
  const r = params.min_rating ?? ''
  const o = params.sort ?? ''
  return `library:${skip}:${limit}:${c}:${s}:${r}:${o}`
}

export function libraryStatsCacheKey(): string {
  return 'library-stats'
}

export function toolDetailCacheKey(id: string): string {
  return `tool-detail:${id}`
}

export function favoritesCacheKey(skip: number, limit: number): string {
  return `favorites:${skip}:${limit}`
}

// --- Stale-while-revalidate ---

function dataEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** In-flight запити за ключем (дедуплікація при Strict Mode / подвійному mount) */
const inFlight = new Map<string, Promise<unknown>>()

export interface CachedFetchOptions<T> {
  onCached?: (data: T) => void
}

/**
 * Load from cache first (if valid), call onCached, then fetch from API.
 * If fresh data differs from cached, updates cache. Resolves with fresh data.
 * Один і той самий ключ не викликає fetcher двічі — повторні виклики чекають на вже виконаний запит.
 */
export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  options?: CachedFetchOptions<T>
): Promise<T> {
  const existing = inFlight.get(key)
  if (existing) {
    const cached = await get<T>(key)
    if (cached) options?.onCached?.(cached.data)
    return existing as Promise<T>
  }

  const promise = (async (): Promise<T> => {
    const cached = await get<T>(key)
    if (cached) options?.onCached?.(cached.data)
    const fresh = await fetcher()
    if (!cached || !dataEqual(cached.data, fresh)) {
      await set(key, fresh, ttlMs)
    }
    return fresh
  })()

  inFlight.set(key, promise)
  try {
    return await promise
  } finally {
    inFlight.delete(key)
  }
}
