import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'

interface AuthUser {
  id: string
  username: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(authApi.ACCESS_TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .getMe()
      .then((u) => setUser({ id: u.id, username: u.username, email: u.email }))
      .catch(() => authApi.clearTokens())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await authApi.login(username, password)
    authApi.saveTokens(tokens)
    const me = await authApi.getMe()
    setUser({ id: me.id, username: me.username, email: me.email })
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    await authApi.register(username, email, password)
    await login(username, password)
  }, [login])

  const logout = useCallback(() => {
    authApi.clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
