import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Flashcard } from '../types/index'

const sampleCards: Flashcard[] = [
  { id: '1', noteId: '1', front: "C'est quoi React?", back: 'Une bibliothèque JavaScript pour créer des interfaces', createdAt: 0 },
  { id: '2', noteId: '1', front: "C'est quoi TypeScript?", back: 'JavaScript avec des types statiques', createdAt: 0 },
  { id: '3', noteId: '1', front: "C'est quoi Tailwind?", back: 'Un framework CSS utility-first', createdAt: 0 },
]

export default function FlashcardReviewSession() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const card = sampleCards[currentIndex]

  function flipCard() {
    setIsFlipped(prev => !prev)
  }

  function nextCard() {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % sampleCards.length)
    }, 300)
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') flipCard()
      if (e.key === 'ArrowRight') nextCard()
      if (e.key === '1' || e.key === '2' || e.key === '3') nextCard()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentIndex])

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-primary mb-8">Révision 🗓️</h1>

      {/* Barre de progression */}
      <div className="w-full max-w-md mb-10">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progression</span>
          <span>{currentIndex + 1} / {sampleCards.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / sampleCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Carte 3D */}
      <div
        onClick={flipCard}
        className="cursor-pointer w-96 h-60"
        style={{ perspective: '1200px' }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          {/* RECTO — Question */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="absolute inset-0 bg-white border-2 border-primary rounded-2xl shadow-xl
                       flex flex-col items-center justify-center p-8 text-center"
          >
            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">
              Question
            </p>
            <p className="text-lg font-semibold text-gray-800 leading-relaxed">
              {card.front}
            </p>
            <p className="text-xs text-gray-300 mt-6">
              🖱️ Cliquez pour retourner
            </p>
          </div>

          {/* VERSO — Réponse */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 bg-gradient-to-br from-primary to-violet-700 rounded-2xl shadow-xl
                       flex flex-col items-center justify-center p-8 text-center"
          >
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
              Réponse
            </p>
            <p className="text-lg font-semibold text-white leading-relaxed">
              {card.back}
            </p>
          </div>
        </motion.div>
      </div>

      <p className="text-gray-400 mt-6 text-sm">
        ⬇️ Retourner &nbsp;|&nbsp; ➡️ Suivant &nbsp;|&nbsp; 1/2/3 Évaluer
      </p>

      {/* Boutons d'évaluation — visibles uniquement après flip */}
      {isFlipped && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={nextCard}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-md"
          >
            😊 Facile
          </button>
          <button
            onClick={nextCard}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-md"
          >
            🤔 À revoir
          </button>
          <button
            onClick={nextCard}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-md"
          >
            😰 Difficile
          </button>
        </div>
      )}

      <div className="mt-6 text-gray-400 text-sm">
        Carte {currentIndex + 1} / {sampleCards.length}
      </div>
    </div>
  )
}