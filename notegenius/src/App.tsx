import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useState, lazy, Suspense } from 'react'
import { getCurrentUser, logout } from './services/auth'
import type { User } from './services/auth'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import Guide from './pages/Guide'
import Login from './pages/Login'
import APIKeySettings from './pages/APIKeySettings'

const PDFExtractor = lazy(() => import('./components/PDFExtractor'))
const FlashcardEditor = lazy(() => import('./components/FlashcardEditor'))
const FlashcardReviewSession = lazy(() => import('./components/FlashcardReviewSession'))
const AdaptiveQuiz = lazy(() => import('./components/AdaptiveQuiz'))
const MemorizationDashboard = lazy(() => import('./components/MemorizationDashboard'))
const ExamPlanner = lazy(() => import('./components/ExamPlanner'))

function Navbar({ onLogout, userName }: { onLogout: () => void; userName: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: '🏠 Accueil' },
    { to: '/subjects', label: '📚 Matières' },
    { to: '/review', label: '🗓️ Révision' },
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/pdf', label: '📄 PDF' },
    { to: '/flashcards', label: '✏️ Flashcards' },
    { to: '/quiz', label: '📝 Quiz' },
    { to: '/planner', label: '📅 Planner' },
    { to: '/guide', label: '📖 Guide' },
    { to: '/settings', label: '⚙️ Paramètres' },
  ]

  return (
    <nav className="bg-dark text-white px-8 py-4 flex items-center justify-between shadow-lg">
      <span className="text-xl font-extrabold tracking-tight text-white">
        Note<span className="text-accent">Genius</span>
      </span>
      <div className="hidden md:flex gap-1 items-center">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${location.pathname === l.to
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-white/10'}`}>
            {l.label}
          </Link>
        ))}
        <div className="ml-4 flex items-center gap-3 border-l border-white/20 pl-4">
          <span className="text-gray-400 text-sm">👤 {userName}</span>
          <button
            onClick={onLogout}
            className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-all"
          >
            Déconnexion
          </button>
        </div>
      </div>
      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">
        {menuOpen ? '✕' : '☰'}
      </button>
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-dark flex flex-col gap-1 p-4 z-50 shadow-xl">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${location.pathname === l.to
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-white/10'}`}>
              {l.label}
            </Link>
          ))}
          <button
            onClick={onLogout}
            className="text-red-400 px-4 py-3 text-left text-sm"
          >
            🚪 Déconnexion ({userName})
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
    const current = getCurrentUser()
    setUser(current)
  }

  if (!user) {
    return <Login onSuccess={handleLoginSuccess} />
  }

  return (
    <>
      <Navbar onLogout={handleLogout} userName={user.name} />
      <Suspense fallback={<div className="p-8 text-primary">Chargement...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/review" element={<FlashcardReviewSession />} />
          <Route path="/dashboard" element={<MemorizationDashboard />} />
          <Route path="/pdf" element={<PDFExtractor />} />
          <Route path="/flashcards" element={<FlashcardEditor />} />
          <Route path="/quiz" element={<AdaptiveQuiz />} />
          <Route path="/planner" element={<ExamPlanner />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/settings" element={<APIKeySettings />} />
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