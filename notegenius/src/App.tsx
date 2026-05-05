import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import Review from './pages/Review'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      {/* Navbar */}
      <nav className="bg-primary text-white p-4 flex gap-6">
        <Link to="/">Accueil</Link>
        <Link to="/subjects">Mes Matières</Link>
        <Link to="/review">Révision</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/pdf">PDF</Link>
      </nav>

      {/* Pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/review" element={<Review />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
import PDFExtractor from './components/PDFExtractor'
// ...
<Route path="/pdf" element={<PDFExtractor />} />
export default App