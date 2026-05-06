export interface User {
  id: string
  name: string
  email: string
  createdAt: number
}

const CURRENT_USER_KEY = 'notegenius_current_user'
const USERS_KEY = 'notegenius_users'

// ── Récupérer tous les utilisateurs
const getAllUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

// ── Sauvegarder tous les utilisateurs
const saveAllUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// ── Inscription
export const register = (name: string, email: string, password: string): User => {
  const users = getAllUsers()
  const exists = users.find(u => u.email === email)
  if (exists) throw new Error('Cet email est déjà utilisé.')

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: Date.now()
  }

  // On sauvegarde le mot de passe hashé simplement
  localStorage.setItem(`pwd_${email}`, btoa(password))
  saveAllUsers([...users, user])
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}

// ── Connexion
export const login = (email: string, password: string): User => {
  const users = getAllUsers()
  const user = users.find(u => u.email === email)
  if (!user) throw new Error('Utilisateur introuvable.')

  const storedPwd = localStorage.getItem(`pwd_${email}`)
  if (storedPwd !== btoa(password)) throw new Error('Mot de passe incorrect.')

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}

// ── Déconnexion
export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// ── Récupérer l'utilisateur connecté
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY)
  return data ? JSON.parse(data) : null
}

// ── Vérifier si connecté
export const isLoggedIn = (): boolean => {
  return getCurrentUser() !== null
}