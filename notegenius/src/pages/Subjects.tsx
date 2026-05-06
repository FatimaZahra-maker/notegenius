import { useState } from 'react'

interface Subject {
  id: string
  name: string
  color: string
  flashcardsCount: number
  masteryRate: number
}

const sampleSubjects: Subject[] = [
  { id: '1', name: 'Réseaux', color: 'from-violet-500 to-purple-600', flashcardsCount: 24, masteryRate: 75 },
  { id: '2', name: 'Algorithmique', color: 'from-cyan-500 to-blue-600', flashcardsCount: 18, masteryRate: 60 },
  { id: '3', name: 'Base de données', color: 'from-emerald-500 to-green-600', flashcardsCount: 32, masteryRate: 85 },
]

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>(sampleSubjects)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  function addSubject() {
    if (!newName.trim()) return
    const colors = [
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-indigo-500 to-blue-600',
    ]
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: newName,
      color: colors[Math.floor(Math.random() * colors.length)],
      flashcardsCount: 0,
      masteryRate: 0,
    }
    setSubjects([...subjects, newSubject])
    setNewName('')
    setShowAdd(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-dark">Mes Matières 📚</h1>
            <p className="text-gray-500 mt-1">{subjects.length} matières • Révisez intelligemment</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-primary hover:bg-violet-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/30"
          >
            + Nouvelle matière
          </button>
        </div>

        {/* Add modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl">
              <h2 className="text-xl font-bold text-dark mb-4">Nouvelle matière</h2>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubject()}
                placeholder="Ex: Réseaux, Maths..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={addSubject}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:opacity-80">
                  Créer
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:opacity-80">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subjects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border border-gray-100">

              {/* Color header */}
              <div className={`bg-gradient-to-r ${subject.color} p-6`}>
                <h2 className="text-xl font-extrabold text-white">{subject.name}</h2>
                <p className="text-white/70 text-sm mt-1">{subject.flashcardsCount} flashcards</p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Mastery */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Taux de maîtrise</span>
                    <span className={`font-bold ${subject.masteryRate > 80 ? 'text-emerald-500' : subject.masteryRate > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                      {subject.masteryRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${subject.masteryRate > 80 ? 'bg-emerald-500' : subject.masteryRate > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${subject.masteryRate}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-primary/10 text-primary py-2 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all">
                    📄 Upload PDF
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
                    🗓️ Réviser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}