import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReviewSession } from '../hooks/useReviewSession'
import type { ReviewGrade } from '../types'

export default function FlashcardReviewSession() {
  const noteId = 'default-note'
  const {
    current,
    currentIndex,
    totalCards,
    correctCount,
    sessionState,
    startSession,
    submitGrade,
    resetSession
  } = useReviewSession(noteId)

  const [isFlipped, setIsFlipped] = useState(false)

  function flipCard() {
    setIsFlipped(prev => !prev)
  }

  async function handleGrade(grade: ReviewGrade) {
    setIsFlipped(false)
    setTimeout(async () => {
      await submitGrade(grade)
    }, 200)
  }

  // ── Chargement
  if (sessionState === 'loading') {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-primary text-xl">⏳ Chargement...</p>
      </div>
    )
  }

  // ── Pas de cartes à réviser
  if (sessionState === 'idle') {
    return (
      <div className="p-8 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-primary">Révision 🗓️</h1>
        {totalCards === 0 ? (
          <div className="bg-secondary rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-lg">
              ✅ Aucune carte à réviser aujourd'hui !
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Revenez demain ou uploadez de nouvelles notes.
            </p>
          </div>
        ) : (
          <button
            onClick={startSession}
            className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-80"
          >
            🚀 Commencer la révision ({totalCards} cartes)
          </button>
        )}
      </div>
    )
  }

  // ── Session terminée
  if (sessionState === 'finished') {
    const rate = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0
    return (
      <div className="p-8 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-primary">Résultat 🎉</h1>
        <div className="bg-secondary rounded-2xl p-8 text-center">
          <p className="text-5xl font-bold text-primary mb-2">
            {correctCount} / {totalCards}
          </p>
          <p className="text-gray-500">Taux de maîtrise : {rate}%</p>
        </div>
        <button
          onClick={resetSession}
          className="bg-primary text-white px-6 py-3 rounded-xl hover:opacity-80"
        >
          🔄 Recommencer
        </button>
      </div>
    )
  }

  // ── Session en cours
  if (!current) return null

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-primary mb-8">Révision 🗓️</h1>

      {/* Progression */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progression</span>
          <span>{currentIndex + 1} / {totalCards}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      {/* Carte flip 3D */}
      <div
        onClick={flipCard}
        className="cursor-pointer w-96 h-56"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
        >
          <div
            className="absolute inset-0 bg-white border-2 border-primary rounded-2xl flex items-center justify-center p-6 text-center text-lg font-semibold text-gray-700"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {current.flashcard.front}
          </div>
          <div
            className="absolute inset-0 bg-primary rounded-2xl flex items-center justify-center p-6 text-center text-lg font-semibold text-white"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {current.flashcard.back}
          </div>
        </motion.div>
      </div>

      <p className="text-gray-400 mt-4 text-sm">⬇️ Retourner | ➡️ Suivant</p>

      {/* Boutons évaluation */}
      {isFlipped && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => handleGrade(2)}
            className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-80"
          >
            😊 Facile
          </button>
          <button
            onClick={() => handleGrade(1)}
            className="bg-orange-400 text-white px-6 py-3 rounded-xl font-bold hover:opacity-80"
          >
            🤔 Difficile
          </button>
          <button
            onClick={() => handleGrade(0)}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-80"
          >
            😰 À revoir
          </button>
        </div>
      )}
    </div>
  )
}