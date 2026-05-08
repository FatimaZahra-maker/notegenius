import { useState, useEffect } from 'react'
import { generateExamPlan } from '../services/examPlanner'
import type { ExamPlan } from '../services/examPlanner'
import { getAllItems } from '../services/db'
import type { Note } from '../types'
import toast from 'react-hot-toast'

export default function ExamPlanner() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState('')
  const [examDate, setExamDate] = useState('')
  const [plan, setPlan] = useState<ExamPlan | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllItems('notes').then(n => {
      setNotes(n)
      if (n.length > 0) setSelectedNoteId(n[0].id)
    })
  }, [])

  // Date minimum = demain
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 7)
  const minDateStr = minDate.toISOString().slice(0, 10)

  async function handleGenerate() {
    if (!examDate || !selectedNoteId) {
      setError('Sélectionnez une matière et une date.')
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      const generated = await generateExamPlan(selectedNoteId, examDate)
      setPlan(generated)
      setIsOpen(false)
      toast.success('Planning généré !')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la génération.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Planning Examen 📅</h1>
          <p className="text-gray-500 mt-1">
            L'IA génère un planning de révision adapté à votre niveau
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg mb-8"
        >
          📅 Définir ma date d'examen
        </button>

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-black text-gray-900 mb-6">📅 Configurer le planning</h2>

              <div className="flex flex-col gap-4">
                {/* Sélection matière */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Matière
                  </label>
                  {notes.length === 0 ? (
                    <p className="text-gray-400 text-sm p-3 bg-gray-50 rounded-xl">
                      Aucune matière — créez d'abord des flashcards
                    </p>
                  ) : (
                    <select
                      value={selectedNoteId}
                      onChange={e => setSelectedNoteId(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-violet-500 font-medium"
                    >
                      {notes.map(n => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Date examen */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Date de l'examen
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    min={minDateStr}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-violet-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">❌ {error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !examDate || !selectedNoteId}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Génération...
                      </div>
                    ) : '✨ Générer le planning'}
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); setError(null) }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Planning affiché */}
        {plan && (
          <div className="flex flex-col gap-6">

            {/* Conseil général */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-3xl p-6">
              <h3 className="font-bold text-violet-800 mb-2">💡 Conseil personnalisé</h3>
              <p className="text-violet-700">{plan.generalAdvice}</p>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="flex flex-col gap-4">
                {plan.weeklyPlans.map((week, i) => (
                  <div key={week.week} className="relative flex gap-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 z-10 shadow-lg">
                      S{week.week}
                    </div>
                    <div className="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900">{week.focus}</h3>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">
                            {new Date(week.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            {' → '}
                            {new Date(week.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                          <div className="mt-1">
                            <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">
                              {week.targetCards} cartes
                            </span>
                          </div>
                        </div>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {week.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-violet-400 mt-0.5">▸</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {!plan && !isOpen && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun planning actif</h3>
            <p className="text-gray-400">Définissez votre date d'examen pour commencer</p>
          </div>
        )}

      </div>
    </div>
  )
}