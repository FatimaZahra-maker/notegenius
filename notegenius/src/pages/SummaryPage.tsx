import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Mes Résumés 📋</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{summaries.length} résumés sauvegardés</p>
          </div>
          <button onClick={() => navigate('/pdf')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90">
            + Nouveau résumé
          </button>
        </div>

        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un résumé..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />
        </div>

        {summaries.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun résumé</h3>
            <p className="text-gray-400 dark:text-gray-500 mb-8">Uploadez un PDF et générez votre premier résumé</p>
            <button onClick={() => navigate('/pdf')}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90">
              📄 Uploader un PDF
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Liste */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              {filtered.map(summary => (
                <motion.button
                  key={summary.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelected(summary)}
                  className={`text-left bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 transition-all hover:shadow-md
                    ${selected?.id === summary.id
                      ? 'border-violet-500 dark:border-violet-500'
                      : 'border-gray-100 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700'}`}
                >
                  <p className="font-bold text-gray-800 dark:text-white truncate">{summary.noteTitle}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {new Date(summary.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 line-clamp-2">
                    {summary.content.slice(0, 80)}...
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Détail */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm sticky top-8"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{selected.noteTitle}</h2>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                          {new Date(selected.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(selected.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 p-2 rounded-xl transition-all">
                        🗑️
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 max-h-[60vh] overflow-y-auto text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap border border-gray-100 dark:border-slate-700">
                      {selected.content}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-64"
                  >
                    <div className="text-center text-gray-400 dark:text-gray-600">
                      <div className="text-4xl mb-3">👈</div>
                      <p>Sélectionnez un résumé</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}