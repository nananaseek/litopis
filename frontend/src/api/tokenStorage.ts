import axios from 'axios'

/** Ключі для збереження токенів у localStorage */
export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

function getApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  return raw && raw.endsWith('/api/v1') ? raw : raw ? `${raw}/api/v1` : '/api/v1'
}

/**
 * Оновлює пару токенів через refresh token (запит без API-клієнта, щоб не потрапити в 401-інтерцептор).
 * @throws при відсутності refresh, невалідному токені або помилці мережі
 */
export async function refreshTokens(): Promise<TokenPair> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) throw new Error('No refresh token')
  const base = getApiBase()
  const { data } = await axios.post<TokenPair>(`${base}/auth/refresh`, {
    refresh_token: refreshToken,
  })
  return data
}

export function saveTokens(tokens: TokenPair): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
