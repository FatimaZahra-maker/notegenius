import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useState, lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { getCurrentUser, logout } from './services/auth'
import type { User } from './services/auth'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import Guide from './pages/Guide'
import Login from './pages/login'
import Dashboard from './pages/Dashboard'
import Review from './pages/Review'
import Settings from './pages/Settings'

const PDFExtractor = lazy(() => import('./components/PDFExtractor'))
const FlashcardEditor = lazy(() => import('./components/FlashcardEditor'))
const AdaptiveQuiz = lazy(() => import('./components/AdaptiveQuiz'))
const ExamPlanner = lazy(() => import('./components/ExamPlanner'))

function Navbar({ onLogout, userName }: { onLogout: () => void; userName: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: '🏠', full: 'Accueil' },
    { to: '/subjects', label: '📚', full: 'Matières' },
    { to: '/review', label: '🗓️', full: 'Révision' },
    { to: '/dashboard', label: '📊', full: 'Dashboard' },
    { to: '/pdf', label: '📄', full: 'PDF' },
    { to: '/flashcards', label: '✏️', full: 'Flashcards' },
    { to: '/quiz', label: '📝', full: 'Quiz' },
    { to: '/planner', label: '📅', full: 'Planner' },
    { to: '/guide', label: '📖', full: 'Guide' },
  ]

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-xl border-b border-white/10 sticky top-0 z-40">
      <Link to="/" className="text-xl font-black tracking-tight">
        Note<span className="text-violet-400">Genius</span>
      </Link>

      <div className="hidden md:flex gap-1 items-center">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5
              ${location.pathname === l.to
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
            <span>{l.label}</span>
            <span className="hidden lg:inline">{l.full}</span>
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link to="/settings"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all
            ${location.pathname === '/settings' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
          <div className="w-7 h-7 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-black">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden lg:inline">{userName}</span>
        </Link>
        <button onClick={onLogout}
          className="text-gray-400 hover:text-red-400 px-3 py-2 rounded-xl text-sm hover:bg-red-500/10 transition-all">
          ↪ Exit
        </button>
      </div>

      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-slate-900 border-t border-white/10 flex flex-col p-4 z-50 shadow-2xl">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3
                ${location.pathname === l.to ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
              {l.label} {l.full}
            </Link>
          ))}
          <Link to="/settings" onClick={() => setMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-3">
            ⚙️ Paramètres
          </Link>
          <button onClick={onLogout}
            className="px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 text-left flex items-center gap-3">
            ↪ Déconnexion
          </button>
        </div>
      )}
    </nav>
  )
}

function AppContent() {
  const [user, setUser] = useState<User | null>(getCurrentUser)

  function handleLogout() {
    logout()
    setUser(null)
  }

  function handleLoginSuccess() {
    setUser(getCurrentUser())
  }

  if (!user) {
    return <Login onSuccess={handleLoginSuccess} />
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '16px', fontWeight: '600' }
      }} />
      <Navbar onLogout={handleLogout} userName={user.name} />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/review" element={<Review />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pdf" element={<PDFExtractor />} />
          <Route path="/flashcards" element={<FlashcardEditor />} />
          <Route path="/quiz" element={<AdaptiveQuiz />} />
          <Route path="/planner" element={<ExamPlanner />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App