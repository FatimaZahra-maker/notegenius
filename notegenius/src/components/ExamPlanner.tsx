import { useState } from 'react'
import { generateExamPlan } from '../services/examPlanner'
import type { ExamPlan } from '../services/examPlanner'

export default function ExamPlanner() {
  const noteId = 'default-note'
  const [examDate, setExamDate] = useState('')
  const [plan, setPlan] = useState<ExamPlan | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!examDate) return
    try {
      setIsLoading(true)
      setError(null)
      const generated = await generateExamPlan(noteId, examDate)
      setPlan(generated)
      setIsOpen(false)
    } catch (err) {
      setError('❌ Erreur lors de la génération du planning.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-1 bg-primary text-white py-3 rounded-xl hover:opacity-80 disabled:opacity-50"
              >
                {isLoading ? '⏳ Génération...' : 'Générer planning'}
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

      {/* Planning généré */}
      {plan && (
        <div className="mt-8 flex flex-col gap-4">
          <p className="text-gray-500 italic">{plan.generalAdvice}</p>
          {plan.weeklyPlans.map(week => (
            <div key={week.week} className="bg-secondary rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-primary">Semaine {week.week}</span>
                <span className="text-sm text-gray-400">
                  {week.startDate} → {week.endDate}
                </span>
              </div>
              <p className="text-gray-600 font-medium mb-2">{week.focus}</p>
              <ul className="flex flex-col gap-1">
                {week.tasks.map((task, i) => (
                  <li key={i} className="text-sm text-gray-500">• {task}</li>
                ))}
              </ul>
              <p className="text-xs text-primary mt-2">
                🎯 Objectif : {week.targetCards} cartes
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}