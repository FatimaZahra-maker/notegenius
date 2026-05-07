import { useSearchParams, useNavigate } from 'react-router-dom'
import FlashcardReviewSession from '../components/FlashcardReviewSession'

export default function Review() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const noteId = params.get('noteId') || ''

  if (!noteId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
        <div className="text-5xl">🗓️</div>
        <h2 className="text-2xl font-bold text-gray-700">Sélectionnez une matière</h2>
        <button
          onClick={() => navigate('/subjects')}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90"
        >
          Voir mes matières
        </button>
      </div>
    )
  }

  return <FlashcardReviewSession noteId={noteId} />
}