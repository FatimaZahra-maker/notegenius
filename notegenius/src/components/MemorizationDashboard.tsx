import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ReviewSession } from '../types'

const sampleSessions: ReviewSession[] = [
  { id: '1', date: Date.now() - 6 * 86400000, cardsReviewed: 10, correctCount: 6, noteId: '1' },
  { id: '2', date: Date.now() - 5 * 86400000, cardsReviewed: 10, correctCount: 7, noteId: '1' },
  { id: '3', date: Date.now() - 4 * 86400000, cardsReviewed: 10, correctCount: 5, noteId: '1' },
  { id: '4', date: Date.now() - 3 * 86400000, cardsReviewed: 10, correctCount: 8, noteId: '1' },
  { id: '5', date: Date.now() - 2 * 86400000, cardsReviewed: 10, correctCount: 9, noteId: '1' },
  { id: '6', date: Date.now() - 1 * 86400000, cardsReviewed: 10, correctCount: 10, noteId: '1' },
]

export default function MemorizationDashboard() {
  const data = sampleSessions.map(s => ({
    date: new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    taux: Math.round((s.correctCount / s.cardsReviewed) * 100)
  }))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-8">Dashboard 📊</h1>

      <div className="bg-secondary rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Courbe de mémorisation</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip formatter={(value) => [`${value}%`, 'Taux de maîtrise']} />
            <Line type="monotone" dataKey="taux" stroke="#6C63FF" strokeWidth={3} dot={{ fill: '#6C63FF' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Heatmap */}
<div className="bg-secondary rounded-2xl p-6">
  <h2 className="text-lg font-bold text-gray-700 mb-4">Sessions des 90 derniers jours</h2>
  <div className="flex flex-wrap gap-1">
    {Array.from({ length: 90 }).map((_, i) => {
      const day = sampleSessions.find(s =>
        new Date(s.date).toDateString() === new Date(Date.now() - (89 - i) * 86400000).toDateString()
      )
      const intensity = day ? Math.round((day.correctCount / day.cardsReviewed) * 4) : 0
      const colors = ['bg-gray-100', 'bg-primary/25', 'bg-primary/50', 'bg-primary/75', 'bg-primary']
      return (
        <div
          key={i}
          title={day ? `${new Date(day.date).toLocaleDateString()} — ${Math.round((day.correctCount / day.cardsReviewed) * 100)}%` : 'Pas de session'}
          className={`w-3 h-3 rounded-sm ${colors[intensity]}`}
        />
      )
    })}
  </div>
</div>
{/* Taux de maîtrise par matière */}
<div className="bg-secondary rounded-2xl p-6 mt-6">
  <h2 className="text-lg font-bold text-gray-700 mb-4">Taux de maîtrise par matière</h2>
  <div className="flex flex-col gap-4">
    {[
      { subject: 'React', taux: 85 },
      { subject: 'TypeScript', taux: 60 },
      { subject: 'Tailwind', taux: 40 },
    ].map(item => (
      <div key={item.subject}>
        <div className="flex justify-between mb-1">
          <span className="font-medium text-gray-700">{item.subject}</span>
          <span className={`font-bold ${item.taux > 80 ? 'text-easy' : item.taux > 50 ? 'text-review' : 'text-hard'}`}>
            {item.taux}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${item.taux > 80 ? 'bg-easy' : item.taux > 50 ? 'bg-review' : 'bg-hard'}`}
            style={{ width: `${item.taux}%` }}
          />
        </div>
      </div>
    ))}
  </div>
</div>
    </div>
  )
}