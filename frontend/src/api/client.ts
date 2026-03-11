import axios from 'axios'

// Завжди використовуємо шлях /api/v1 (nginx проксує лише /api/ на бекенд)
const raw = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const API_BASE = raw && raw.endsWith('/api/v1') ? raw : raw ? `${raw}/api/v1` : '/api/v1'

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// На рівні запиту гарантуємо шлях /api/v1 (на випадок застарілого бандла або неправильного baseURL)
const API_PREFIX = '/api/v1'
client.interceptors.request.use((config) => {
  const url = config.url ?? ''
  const path = url.startsWith('/') ? url : `/${url}`
  if (!path.startsWith(API_PREFIX)) {
    config.url = API_PREFIX + path
    config.baseURL = '' // щоб не подвоїти шлях
  }
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return client(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
