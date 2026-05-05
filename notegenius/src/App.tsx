import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import PDFExtractor from './components/PDFExtractor'
import FlashcardEditor from './components/FlashcardEditor'
import FlashcardReviewSession from './components/FlashcardReviewSession'
import AdaptiveQuiz from './components/AdaptiveQuiz'
import MemorizationDashboard from './components/MemorizationDashboard'
import ExamPlanner from './components/ExamPlanner'
function App() {
  return (
    <BrowserRouter>
      <nav className="bg-primary text-white p-4 flex gap-6">
        <Link to="/">Accueil</Link>
        <Link to="/subjects">Mes Matières</Link>
        <Link to="/review">Révision</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/pdf">PDF</Link>
        <Link to="/flashcards">Flashcards</Link>
        <Link to="/quiz">Quiz</Link>
        <Link to="/planner">Planner</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/review" element={<FlashcardReviewSession />} />
        <Route path="/dashboard" element={<MemorizationDashboard />} />
        <Route path="/pdf" element={<PDFExtractor />} />
        <Route path="/flashcards" element={<FlashcardEditor />} />
        <Route path="/quiz" element={<AdaptiveQuiz />} />
        <Route path="/planner" element={<ExamPlanner />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App