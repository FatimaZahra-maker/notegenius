import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, lazy, Suspense } from 'react'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import Guide from './pages/Guide'

const PDFExtractor = lazy(() => import('./components/PDFExtractor'))
const FlashcardEditor = lazy(() => import('./components/FlashcardEditor'))
const FlashcardReviewSession = lazy(() => import('./components/FlashcardReviewSession'))
const AdaptiveQuiz = lazy(() => import('./components/AdaptiveQuiz'))
const MemorizationDashboard = lazy(() => import('./components/MemorizationDashboard'))
const ExamPlanner = lazy(() => import('./components/ExamPlanner'))

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/subjects', label: 'Matières' },
    { to: '/review', label: 'Révision' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/pdf', label: 'PDF' },
    { to: '/flashcards', label: 'Flashcards' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/planner', label: 'Planner' },
    { to: '/guide', label: 'Guide' }
  ]

  return (
    <nav className="bg-primary text-white p-4">
      <div className="hidden md:flex gap-6">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`hover:opacity-75 ${location.pathname === l.to ? 'font-bold underline' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="md:hidden flex justify-between items-center">
        <span className="font-bold text-lg">NoteGenius</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-3 mt-3">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={`hover:opacity-75 py-1 ${location.pathname === l.to ? 'font-bold underline' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App