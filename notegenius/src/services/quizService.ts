import { getAllItems } from './db'
import { generateQuiz } from './ai'
import type { QuizQuestion, Flashcard } from '../types'

export interface AdaptiveQuizQuestion extends QuizQuestion {
  noteId: string
}

const isWeakCard = (efactor: number, repetition: number): boolean => {
  return efactor < 2.0 || repetition < 2
}

export const generateAdaptiveQuiz = async (
  noteId: string
): Promise<AdaptiveQuizQuestion[]> => {
  const [allFlashcards, allSM2Cards] = await Promise.all([
    getAllItems('flashcards'),
    getAllItems('sm2cards')
  ])

  const noteFlashcards = allFlashcards.filter(card => card.noteId === noteId)
  if (noteFlashcards.length === 0) {
    throw new Error('Aucune flashcard trouvée. Uploadez d\'abord un PDF.')
  }

  const sm2Index = new Map(allSM2Cards.map(sm2 => [sm2.flashcardId, sm2]))

  const sorted = [...noteFlashcards].sort((a, b) => {
    const sm2A = sm2Index.get(a.id)
    const sm2B = sm2Index.get(b.id)
    const weakA = sm2A ? isWeakCard(sm2A.efactor, sm2A.repetition) : true
    const weakB = sm2B ? isWeakCard(sm2B.efactor, sm2B.repetition) : true
    if (weakA && !weakB) return -1
    if (!weakA && weakB) return 1
    return (sm2A?.efactor ?? 2.5) - (sm2B?.efactor ?? 2.5)
  })

  const targetCards = sorted.slice(0, 5)
  const quizText = targetCards
    .map(card => `Q: ${card.front}\nR: ${card.back}`)
    .join('\n\n')

  const rawQuestions = await generateQuiz(quizText)

  return rawQuestions.map((q: QuizQuestion, index: number) => ({
    ...q,
    id: crypto.randomUUID(),
    flashcardId: targetCards[index]?.id ?? '',
    noteId
  }))
}