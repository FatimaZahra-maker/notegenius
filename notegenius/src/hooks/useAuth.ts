import { useState, useCallback } from 'react'
import { login, register, logout, getCurrentUser } from '../services/auth'
import type { User } from '../services/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(getCurrentUser)
  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      const loggedIn = login(email, password)
      setUser(loggedIn)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    }
  }, [])

  const handleRegister = useCallback(async (name: string, email: string, password: string) => {
    try {
      setError(null)
      const registered = register(name, email, password)
      setUser(registered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inscription')
    }
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
  }, [])

  return {
    user,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  }
}