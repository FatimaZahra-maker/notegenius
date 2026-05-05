import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Flashcard } from '../types/index'

const sampleCards: Flashcard[] = [
  { id: '1', noteId: '1', front: 'C\'est quoi React?', back: 'Une bibliothèque JavaScript pour créer des interfaces', createdAt: 0 },
  { id: '2', noteId: '1', front: 'C\'est quoi TypeScript?', back: 'JavaScript avec des types statiques', createdAt: 0 },
  { id: '3', noteId: '1', front: 'C\'est quoi Tailwind?', back: 'Un framework CSS utility-first', createdAt: 0 },
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
    }, 200)
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') flipCard()
      if (e.key === 'ArrowRight') nextCard()
      if (e.key === '1') nextCard()
      if (e.key === '2') nextCard()
      if (e.key === '3') nextCard()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlipped, currentIndex])

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-primary mb-8">Révision 🗓️</h1>

      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progression</span>
          <span>{currentIndex + 1} / {sampleCards.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / sampleCards.length) * 100}%` }}
          />
        </div>
      </div>

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
            {card.front}
          </div>
          <div
            className="absolute inset-0 bg-primary rounded-2xl flex items-center justify-center p-6 text-center text-lg font-semibold text-white"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {card.back}
          </div>
        </motion.div>
      </div>

      <p className="text-gray-400 mt-4 text-sm">⬇️ Retourner | ➡️ Suivant | 1/2/3 Évaluer</p>

      {isFlipped && (
        <div className="flex gap-4 mt-8">
          <button onClick={nextCard} className="bg-easy text-white px-6 py-3 rounded-xl font-bold hover:opacity-80">
            😊 Facile
          </button>
          <button onClick={nextCard} className="bg-review text-white px-6 py-3 rounded-xl font-bold hover:opacity-80">
            🤔 À revoir
          </button>
          <button onClick={nextCard} className="bg-hard text-white px-6 py-3 rounded-xl font-bold hover:opacity-80">
            😰 Difficile
          </button>
        </div>
      )}

      <div className="mt-6 text-gray-500">
        Carte {currentIndex + 1} / {sampleCards.length}
      </div>
    </div>
  )
}