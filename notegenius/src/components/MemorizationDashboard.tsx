import { useStats } from '../hooks/useStats'
import { getAllItems } from '../services/db'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

export default function MemorizationDashboard() {
  const navigate = useNavigate()
  const [noteId, setNoteId] = useState('default')
  const [notes, setNotes] = useState<{ id: string; title: string }[]>([])
  const { subjectStats, heatmapData, memorizationCurve, globalStats, isLoading } = useStats(noteId)

  useEffect(() => {
    getAllItems('notes').then(n => {
      setNotes(n)
      if (n.length > 0) setNoteId(n[0].id)
    })
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Dashboard 📊</h1>
            <p className="text-gray-500 mt-1">Votre progression en un coup d'œil</p>
          </div>
          {notes.length > 1 && (
            <select
              value={noteId}
              onChange={e => setNoteId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {notes.map(n => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* KPIs */}
        {globalStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Sessions totales', value: globalStats.totalSessions, icon: '🗓️', color: 'from-violet-500 to-purple-600' },
              { label: 'Cartes révisées', value: globalStats.totalCardsReviewed, icon: '🃏', color: 'from-cyan-500 to-blue-600' },
              { label: 'Taux correct', value: `${globalStats.averageCorrectRate}%`, icon: '✅', color: 'from-emerald-500 to-green-600' },
              { label: 'Streak 🔥', value: `${globalStats.currentStreak}j`, icon: '🔥', color: 'from-amber-500 to-orange-600' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className={`w-10 h-10 bg-gradient-to-r ${kpi.color} rounded-xl flex items-center justify-center text-lg mb-3`}>
                  {kpi.icon}
                </div>
                <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
                <p className="text-gray-500 text-sm mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Courbe mémorisation */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">📈 Courbe de mémorisation</h2>
            {memorizationCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={memorizationCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Maîtrise']} />
                  <Line
                    type="monotone" dataKey="masteryRate"
                    stroke="#7C3AED" strokeWidth={3}
                    dot={{ fill: '#7C3AED', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-3xl mb-2">📈</p>
                  <p className="text-sm">Commencez à réviser pour voir vos stats</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats matière */}
          {subjectStats && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-6">🎯 Maîtrise de la matière</h2>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Total cartes', value: subjectStats.totalCards, color: 'bg-gray-200', fill: subjectStats.totalCards > 0 ? 100 : 0 },
                  { label: 'Maîtrisées', value: subjectStats.masteredCards, color: 'bg-emerald-200', fill: subjectStats.totalCards > 0 ? (subjectStats.masteredCards / subjectStats.totalCards) * 100 : 0 },
                  { label: 'Points faibles', value: subjectStats.weakCards, color: 'bg-red-200', fill: subjectStats.totalCards > 0 ? (subjectStats.weakCards / subjectStats.totalCards) * 100 : 0 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="font-bold text-gray-800">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${item.label === 'Maîtrisées' ? 'bg-emerald-500' : item.label === 'Points faibles' ? 'bg-red-500' : 'bg-gray-400'}`}
                        style={{ width: `${item.fill}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-violet-700">Taux global</span>
                    <span className="text-3xl font-black text-violet-600">{subjectStats.masteryRate}%</span>
                  </div>
                  <div className="w-full bg-violet-200 rounded-full h-3 mt-3">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-purple-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${subjectStats.masteryRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <h2 className="font-bold text-gray-800 mb-4">🗓️ Activité des 90 derniers jours</h2>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 90 }).map((_, i) => {
              const dateKey = new Date(Date.now() - (89 - i) * 86400000).toISOString().slice(0, 10)
              const entry = heatmapData.find(h => h.date === dateKey)
              const intensity = entry ? Math.min(Math.round((entry.count / 10) * 4), 4) : 0
              const colors = ['bg-gray-100', 'bg-violet-200', 'bg-violet-400', 'bg-violet-600', 'bg-violet-800']
              return (
                <div
                  key={i}
                  title={entry ? `${dateKey} · ${entry.count} cartes` : dateKey}
                  className={`w-3 h-3 rounded-sm ${colors[intensity]} transition-all hover:scale-125 cursor-default`}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">Moins</span>
            {['bg-gray-100', 'bg-violet-200', 'bg-violet-400', 'bg-violet-600', 'bg-violet-800'].map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span className="text-xs text-gray-400">Plus</span>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-8 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Prêt à continuer ?</h3>
            <p className="text-white/70">Vos cartes vous attendent !</p>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="bg-white text-violet-700 px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all hover:-translate-y-0.5"
          >
            Réviser maintenant →
          </button>
        </div>

      </div>
    </div>
  )
}