import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllItems, saveItem, deleteItem } from '../services/db'
import { generateFlashcards } from '../services/gemini'
import { createInitialSM2Data } from '../algorithms/sm2'
import type { Note, Flashcard } from '../types'
import toast from 'react-hot-toast'

const COLORS = [
  { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50', text: 'text-violet-600' },
  { bg: 'from-cyan-500 to-blue-600', light: 'bg-cyan-50', text: 'text-cyan-600' },
  { bg: 'from-emerald-500 to-green-600', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50', text: 'text-rose-600' },
  { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'from-indigo-500 to-blue-700', light: 'bg-indigo-50', text: 'text-indigo-600' },
]

interface SubjectWithStats extends Note {
  flashcardsCount: number
  masteryRate: number
  dueCount: number
}

export default function Subjects() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editSubject, setEditSubject] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formColor, setFormColor] = useState(0)

  useEffect(() => { loadSubjects() }, [])

  async function loadSubjects() {
    try {
      setIsLoading(true)
      const [notes, flashcards, sm2cards] = await Promise.all([
        getAllItems('notes'),
        getAllItems('flashcards'),
        getAllItems('sm2cards')
      ])

      const now = Date.now()
      const built: SubjectWithStats[] = notes.map((note, idx) => {
        const noteCards = flashcards.filter(f => f.noteId === note.id)
        const noteSM2 = sm2cards.filter(s =>
          noteCards.some(c => c.id === s.flashcardId)
        )
        const mastered = noteSM2.filter(s => s.efactor >= 2.5 && s.repetition >= 3).length
        const due = noteSM2.filter(s => s.nextReview <= now).length
        const masteryRate = noteCards.length > 0
          ? Math.round((mastered / noteCards.length) * 100) : 0

        return {
          ...note,
          color: note.color || COLORS[idx % COLORS.length].bg,
          flashcardsCount: noteCards.length,
          masteryRate,
          dueCount: due
        }
      })

      setSubjects(built)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    if (!formName.trim()) return toast.error('Nom requis')
    const colorStr = COLORS[formColor].bg

    if (editSubject) {
      const updated: Note = {
        ...editSubject,
        title: formName,
        description: formDesc,
        color: colorStr,
        updatedAt: Date.now()
      }
      await saveItem('notes', updated)
      toast.success('Matière mise à jour !')
    } else {
      const note: Note = {
        id: crypto.randomUUID(),
        title: formName,
        description: formDesc,
        color: colorStr,
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      await saveItem('notes', note)
      toast.success('Matière créée !')
    }

    resetForm()
    await loadSubjects()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette matière et toutes ses flashcards ?')) return
    const flashcards = await getAllItems('flashcards')
    const toDelete = flashcards.filter(f => f.noteId === id)
    await Promise.all(toDelete.map(f => deleteItem('flashcards', f.id)))
    await deleteItem('notes', id)
    toast.success('Matière supprimée')
    await loadSubjects()
  }

  async function handleUpload(noteId: string, file: File) {
    setUploadingId(noteId)
    const toastId = toast.loading('Génération des flashcards...')
    try {
      const text = await file.text()
      const generated = await generateFlashcards(text)
      const cards: Flashcard[] = generated.map((g: { front: string; back: string }) => ({
        id: crypto.randomUUID(),
        noteId,
        front: g.front,
        back: g.back,
        createdAt: Date.now()
      }))
      await Promise.all(cards.map(c => saveItem('flashcards', c)))
      await Promise.all(cards.map(c => saveItem('sm2cards', createInitialSM2Data(c.id))))
      toast.success(`${cards.length} flashcards générées !`, { id: toastId })
      await loadSubjects()
    } catch {
      toast.error('Erreur lors de la génération', { id: toastId })
    } finally {
      setUploadingId(null)
    }
  }

  function openEdit(subject: Note) {
    setEditSubject(subject)
    setFormName(subject.title)
    setFormDesc(subject.description || '')
    const colorIdx = COLORS.findIndex(c => c.bg === subject.color)
    setFormColor(colorIdx >= 0 ? colorIdx : 0)
    setShowAdd(true)
  }

  function resetForm() {
    setFormName('')
    setFormDesc('')
    setFormColor(0)
    setEditSubject(null)
    setShowAdd(false)
  }

  const filtered = subjects.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Mes Matières 📚</h1>
            <p className="text-gray-500 mt-1">{subjects.length} matières · {subjects.reduce((a, s) => a + s.flashcardsCount, 0)} flashcards</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAdd(true) }}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-200"
          >
            + Nouvelle matière
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une matière..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                {editSubject ? '✏️ Modifier' : '✨ Nouvelle matière'}
              </h2>

              <div className="flex flex-col gap-4">
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Nom de la matière *"
                  autoFocus
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary font-medium"
                />
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Description (optionnel)"
                  rows={2}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary resize-none"
                />

                {/* Couleurs */}
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-3">Couleur</p>
                  <div className="flex gap-3">
                    {COLORS.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setFormColor(i)}
                        className={`w-8 h-8 rounded-xl bg-gradient-to-r ${c.bg} transition-all
                          ${formColor === i ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className={`bg-gradient-to-r ${COLORS[formColor].bg} rounded-2xl p-4 text-white`}>
                  <p className="font-bold">{formName || 'Nom de la matière'}</p>
                  <p className="text-white/70 text-sm">{formDesc || 'Description'}</p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-2xl font-bold hover:opacity-90">
                    {editSubject ? 'Modifier' : 'Créer'}
                  </button>
                  <button onClick={resetForm}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {search ? 'Aucune matière trouvée' : 'Aucune matière pour l\'instant'}
            </h3>
            <p className="text-gray-400 mb-8">
              {search ? 'Essayez un autre terme' : 'Créez votre première matière pour commencer'}
            </p>
            {!search && (
              <button
                onClick={() => { resetForm(); setShowAdd(true) }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90"
              >
                + Créer ma première matière
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(subject => {
            const colorIdx = COLORS.findIndex(c => c.bg === subject.color)
            const color = COLORS[colorIdx >= 0 ? colorIdx : 0]

            return (
              <div key={subject.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group">

                {/* Header */}
                <div className={`bg-gradient-to-r ${subject.color} p-6 relative`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-xl font-black text-white">{subject.title}</h2>
                      {subject.description && (
                        <p className="text-white/70 text-sm mt-1">{subject.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(subject)}
                        className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 text-sm">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(subject.id)}
                        className="bg-white/20 text-white p-2 rounded-xl hover:bg-red-500/50 text-sm">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {subject.flashcardsCount} cartes
                    </span>
                    {subject.dueCount > 0 && (
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                        {subject.dueCount} à réviser
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Mastery */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">Maîtrise</span>
                      <span className={`font-bold ${subject.masteryRate > 80 ? 'text-emerald-500' : subject.masteryRate > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {subject.masteryRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-1000
                          ${subject.masteryRate > 80 ? 'bg-emerald-500' : subject.masteryRate > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${subject.masteryRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/review?noteId=${subject.id}`)}
                        disabled={subject.flashcardsCount === 0}
                        className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        🗓️ Réviser {subject.dueCount > 0 ? `(${subject.dueCount})` : ''}
                      </button>
                      <button
                        onClick={() => navigate(`/quiz?noteId=${subject.id}`)}
                        disabled={subject.flashcardsCount === 0}
                        className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        📝 Quiz
                      </button>
                    </div>

                    {/* Upload */}
                    <label className="cursor-pointer">
                      <div className={`border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-center text-sm font-medium transition-all
                        ${uploadingId === subject.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5'}`}>
                        {uploadingId === subject.id ? '⏳ Génération...' : '📄 Upload PDF'}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        className="hidden"
                        disabled={uploadingId !== null}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleUpload(subject.id, file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}