import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiPost, SESSION_KEY } from '../api/client'

const AuthContext = createContext(null)

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [authBusy, setAuthBusy] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('odyssey:unauthorized', handler)
    return () => window.removeEventListener('odyssey:unauthorized', handler)
  }, [logout])

  const login = useCallback(async (email, password) => {
    setAuthBusy(true)
    try {
      const result = await apiPost('/auth/admin/login', { email, password })
      const nextSession = {
        token: result.access_token,
        role: result.role,
        actorType: result.actor_type,
        email,
        loginAt: new Date().toISOString(),
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
      setSession(nextSession)
      return nextSession
    } finally {
      setAuthBusy(false)
    }
  }, [])

  const value = useMemo(
    () => ({ session, role: session?.role, isAuthenticated: Boolean(session?.token), authBusy, login, logout }),
    [session, authBusy, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
