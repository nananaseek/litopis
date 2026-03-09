import client from './client'

export interface UserResponse {
  id: string
  username: string
  email: string
  is_active: boolean
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export async function register(username: string, email: string, password: string): Promise<UserResponse> {
  const { data } = await client.post<UserResponse>('/auth/register', { username, email, password })
  return data
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  const { data } = await client.post<TokenPair>('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await client.get<UserResponse>('/auth/me')
  return data
}
