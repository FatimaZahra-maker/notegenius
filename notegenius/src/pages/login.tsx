import { useState } from 'react'
import { login, register } from '../services/auth'

interface LoginProps {
  onSuccess: () => void
}

export default function Login({ onSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    try {
      setError(null)
      if (isRegister) {
        if (!name.trim()) {
          setError('Veuillez entrer votre nom.')
          return
        }
        register(name, email, password)
      } else {
        login(email, password)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-purple-950 to-dark flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur rounded-3xl p-10 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">
            Note<span className="text-accent">Genius</span>
          </h1>
          <p className="text-gray-400 mt-2">
            {isRegister ? 'Créez votre compte' : 'Connectez-vous'}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {isRegister && (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Votre nom"
              className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:opacity-80 transition-all"
          >
            {isRegister ? '🚀 Créer mon compte' : '🔑 Se connecter'}
          </button>

          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setError(null)
            }}
            className="text-gray-400 text-sm text-center hover:text-white transition-all"
          >
            {isRegister
              ? 'Déjà un compte ? Se connecter'
              : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}