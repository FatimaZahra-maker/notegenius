import { useState, useEffect } from 'react'
import { getCurrentUser } from '../services/auth'
import { getAllItems, clearStore } from '../services/db'
import { countAllDueFlashcards } from '../services/reviewQueue'
import { getGlobalStats } from '../services/statsService'
import { useDarkMode } from '../hooks/useDarkMode'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { GlobalStats } from '../services/statsService'

export default function Settings() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const { isDark, toggle } = useDarkMode()
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [totalCards, setTotalCards] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    Promise.all([getGlobalStats(), countAllDueFlashcards(), getAllItems('flashcards')])
      .then(([g, due, cards]) => { setStats(g); setDueCount(due); setTotalCards(cards.length) })
  }, [])

  async function handleExport() {
    const [notes, flashcards, sessions] = await Promise.all([
      getAllItems('notes'), getAllItems('flashcards'), getAllItems('sessions')
    ])
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), notes, flashcards, sessions }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notegenius-${new Date().toLocaleDateString('fr')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Données exportées !')
  }

  async function handleDeleteAll() {
    await Promise.all([clearStore('notes'), clearStore('flashcards'), clearStore('sm2cards'), clearStore('sessions'), clearStore('summaries')])
    setShowDeleteConfirm(false)
    toast.success('Toutes les données supprimées')
    setStats(null); setDueCount(0); setTotalCards(0)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 p-8">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Paramètres ⚙️</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez votre compte et vos préférences</p>
        </div>

        {/* Profil */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm mb-6">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-6">👤 Profil</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Membre depuis {user ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Avancement */}
        {stats && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm mb-6">
            <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-6">📊 Mon avancement</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Flashcards totales', value: totalCards, icon: '🃏' },
                { label: 'Sessions de révision', value: stats.totalSessions, icon: '🗓️' },
                { label: 'Taux de réussite', value: `${stats.averageCorrectRate}%`, icon: '✅' },
                { label: 'Streak actuel', value: `${stats.currentStreak} jours`, icon: '🔥' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4">
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{s.value}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
            {dueCount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-400">⏰ {dueCount} cartes à réviser</p>
                  <p className="text-amber-600 dark:text-amber-500 text-sm">N'oubliez pas votre révision !</p>
                </div>
                <button onClick={() => navigate('/subjects')}
                  className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-600 text-sm transition-colors">
                  Réviser →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Apparence */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm mb-6">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-6">🎨 Apparence</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Mode sombre</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Interface sombre pour les yeux</p>
            </div>
            <button
              onClick={toggle}
              className={`w-12 h-6 rounded-full transition-all relative ${isDark ? 'bg-violet-600' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow
                ${isDark ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Données */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-6">💾 Gestion des données</h2>
          <div className="flex flex-col gap-3">
            <button onClick={handleExport}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📥</span>
                <div className="text-left">
                  <p className="font-medium text-gray-800 dark:text-white">Exporter mes données</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Télécharger en JSON</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl transition-colors border border-red-100 dark:border-red-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗑️</span>
                  <div className="text-left">
                    <p className="font-medium text-red-700 dark:text-red-400">Supprimer toutes les données</p>
                    <p className="text-red-500 dark:text-red-500 text-sm">Action irréversible</p>
                  </div>
                </div>
                <span className="text-red-400">→</span>
              </button>
            ) : (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4">
                <p className="font-bold text-red-700 dark:text-red-400 mb-3">⚠️ Êtes-vous sûr ?</p>
                <p className="text-red-600 dark:text-red-400 text-sm mb-4">Toutes vos matières, flashcards et sessions seront supprimées.</p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteAll}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors">
                    Oui, tout supprimer
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}