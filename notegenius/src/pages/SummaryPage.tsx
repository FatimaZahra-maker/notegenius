import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllSummaries, deleteSummary } from '../services/summaryService'
import type { Summary } from '../types'
import toast from 'react-hot-toast'

export default function SummaryPage() {
  const navigate = useNavigate()
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [selected, setSelected] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadSummaries() }, [])

  async function loadSummaries() {
    setIsLoading(true)
    const all = await getAllSummaries()
    setSummaries(all.sort((a, b) => b.createdAt - a.createdAt))
    setIsLoading(false)
  }

  async function handleDelete(id: string) {
    await deleteSummary(id)
    toast.success('Résumé supprimé')
    setSummaries(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const filtered = summaries.filter(s =>
    s.noteTitle.toLowerCase().includes(search.toLowerCase()) ||
    s.content.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Mes Résumés 📋</h1>
            <p className="text-gray-500 mt-1">{summaries.length} résumés sauvegardés</p>
          </div>
          <button
            onClick={() => navigate('/pdf')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90"
          >
            + Nouveau résumé
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un résumé..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        {summaries.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun résumé</h3>
            <p className="text-gray-400 mb-8">Uploadez un PDF et générez votre premier résumé</p>
            <button
              onClick={() => navigate('/pdf')}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90"
            >
              📄 Uploader un PDF
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Liste */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              {filtered.map(summary => (
                <button
                  key={summary.id}
                  onClick={() => setSelected(summary)}
                  className={`text-left bg-white rounded-2xl p-4 border-2 transition-all hover:shadow-md
                    ${selected?.id === summary.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-100 hover:border-violet-300'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{summary.noteTitle}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(summary.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-400 text-xs mt-2 line-clamp-2">
                        {summary.content.slice(0, 80)}...
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Détail */}
            <div className="lg:col-span-2">
              {selected ? (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">{selected.noteTitle}</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(selected.createdAt).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 rounded-2xl p-6 max-h-[60vh] overflow-y-auto text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selected.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center justify-center min-h-64">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-3">👈</div>
                    <p>Sélectionnez un résumé</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}