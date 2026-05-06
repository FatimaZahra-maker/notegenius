import { useState } from 'react'

export default function ExamPlanner() {
  const [examDate, setExamDate] = useState('')
  const [planning, setPlanning] = useState<{ week: number; task: string }[]>([])
  const [isOpen, setIsOpen] = useState(false)

  function generatePlanning() {
    if (!examDate) return
    const today = new Date()
    const exam = new Date(examDate)
    const diffDays = Math.ceil((exam.getTime() - today.getTime()) / 86400000)
    const weeks = Math.ceil(diffDays / 7)

    const tasks = [
      'Réviser les flashcards de base',
      'Faire les quiz adaptatifs',
      'Révision intensive + points faibles',
      'Simulation examen blanc',
    ]

    const generated = Array.from({ length: Math.min(weeks, 4) }).map((_, i) => ({
      week: i + 1,
      task: tasks[i] || 'Révision finale'
    }))

    setPlanning(generated)
    setIsOpen(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Planning Examen 📅</h1>

      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary text-white px-6 py-3 rounded-xl hover:opacity-80"
      >
        + Définir ma date d'examen
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96">
            <h2 className="text-xl font-bold text-primary mb-4">Date d'examen</h2>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-primary"
            />
            <div className="flex gap-3">
              <button
                onClick={generatePlanning}
                className="flex-1 bg-primary text-white py-3 rounded-xl hover:opacity-80"
              >
                Générer planning
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl hover:opacity-80"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Planning */}
      {planning.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {planning.map(p => (
            <div key={p.week} className="bg-secondary rounded-xl p-4">
              <span className="font-bold text-primary">Semaine {p.week}</span>
              <p className="text-gray-600 mt-1">{p.task}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}