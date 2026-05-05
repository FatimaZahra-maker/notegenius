import { useState } from 'react'
import type { Flashcard } from '../types/index'

export default function FlashcardEditor() {
  const [cards, setCards] = useState<Flashcard[]>([
    { id: '1', noteId: '1', front: 'Question 1', back: 'Réponse 1', createdAt: 0 },
    { id: '2', noteId: '1', front: 'Question 2', back: 'Réponse 2', createdAt: 0 },
  ])

  function updateCard(id: string, field: 'front' | 'back', value: string) {
    setCards(cards.map(card =>
      card.id === id ? { ...card, [field]: value } : card
    ))
  }

  function deleteCard(id: string) {
    setCards(cards.filter(card => card.id !== id))
  }

  function addCard() {
    const newCard: Flashcard = { id: Date.now().toString(), noteId: '1', front: '', back: '', createdAt: 0 }
    setCards([...cards, newCard])
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Mes Flashcards ✏️</h1>

      <div className="flex flex-col gap-4">
        {cards.map(card => (
          <div key={card.id} className="bg-secondary rounded-xl p-4 flex gap-4 items-center">
            <input
              value={card.front}
              onChange={e => updateCard(card.id, 'front', e.target.value)}
              placeholder="Question..."
              className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
            />
            <input
              value={card.back}
              onChange={e => updateCard(card.id, 'back', e.target.value)}
              placeholder="Réponse..."
              className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => deleteCard(card.id)}
              className="bg-hard text-white px-3 py-2 rounded-lg hover:opacity-80"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addCard}
        className="mt-6 bg-primary text-white px-6 py-3 rounded-xl hover:opacity-80"
      >
        + Ajouter une carte
      </button>
    </div>
  )
}