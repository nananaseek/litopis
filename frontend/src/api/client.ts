import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import * as tokenStorage from './tokenStorage'

// Завжди використовуємо шлях /api/v1 (nginx проксує лише /api/ на бекенд)
const raw = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const API_BASE = raw && raw.endsWith('/api/v1') ? raw : raw ? `${raw}/api/v1` : '/api/v1'

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// На рівні запиту гарантуємо шлях /api/v1 (на випадок застарілого бандла або неправильного baseURL)
const API_PREFIX = '/api/v1'
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = config.url ?? ''
  const path = url.startsWith('/') ? url : `/${url}`
  if (!path.startsWith(API_PREFIX)) {
    config.url = API_PREFIX + path
    config.baseURL = '' // щоб не подвоїти шлях
  }
  const token = localStorage.getItem(tokenStorage.ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// При 401: спроба оновити access через refresh; при невдачі — вихід і редірект на логін. Токени в localStorage.
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    if (original && error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const tokens = await tokenStorage.refreshTokens()
        tokenStorage.saveTokens(tokens)
        original.headers.Authorization = `Bearer ${tokens.access_token}`
        return client(original)
      } catch {
        tokenStorage.clearTokens()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
