import { useStats } from '../hooks/useStats'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MemorizationDashboard() {
  const noteId = 'default-note'
  const { subjectStats, heatmapData, memorizationCurve, globalStats, isLoading } = useStats(noteId)

  if (isLoading) {
    return <div className="p-8 text-primary">⏳ Chargement des stats...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-8">Dashboard 📊</h1>

      {/* KPIs globaux */}
      {globalStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Sessions', value: globalStats.totalSessions },
            { label: 'Cartes révisées', value: globalStats.totalCardsReviewed },
            { label: 'Taux correct', value: `${globalStats.averageCorrectRate}%` },
            { label: 'Streak 🔥', value: `${globalStats.currentStreak} jours` },
          ].map(kpi => (
            <div key={kpi.label} className="bg-secondary rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{kpi.value}</p>
              <p className="text-gray-500 text-sm">{kpi.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Courbe mémorisation */}
      <div className="bg-secondary rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Courbe de mémorisation</h2>
        {memorizationCurve.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memorizationCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip formatter={(value) => [`${value}%`, 'Taux de maîtrise']} />
              <Line type="monotone" dataKey="masteryRate" stroke="#6C63FF" strokeWidth={3} dot={{ fill: '#6C63FF' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">
            Pas encore de données — commencez à réviser !
          </p>
        )}
      </div>

      {/* Heatmap */}
      <div className="bg-secondary rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Sessions des 90 derniers jours
        </h2>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 90 }).map((_, i) => {
            const dateKey = new Date(Date.now() - (89 - i) * 86400000)
              .toISOString().slice(0, 10)
            const entry = heatmapData.find(h => h.date === dateKey)
            const intensity = entry
              ? Math.min(Math.round((entry.count / 10) * 4), 4)
              : 0
            const colors = ['bg-gray-100', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary']
            return (
              <div
                key={i}
                title={entry ? `${dateKey} — ${entry.count} cartes` : 'Pas de session'}
                className={`w-3 h-3 rounded-sm ${colors[intensity]}`}
              />
            )
          })}
        </div>
      </div>

      {/* Taux de maîtrise */}
      {subjectStats && (
        <div className="bg-secondary rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            Taux de maîtrise
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">Total cartes</span>
              <span className="font-bold text-primary">{subjectStats.totalCards}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">Maîtrisées</span>
              <span className="font-bold text-green-500">{subjectStats.masteredCards}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${subjectStats.masteryRate}%` }}
              />
            </div>
            <p className="text-right text-primary font-bold">{subjectStats.masteryRate}%</p>
          </div>
        </div>
      )}
    </div>
  )
}