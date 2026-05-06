// src/services/quizService.ts
import { getAllItems } from "./db"
import { generateQuiz } from "./claude"
import type { QuizQuestion, Flashcard } from "../types"

// ── Une question enrichie avec l'id de la flashcard source
export interface AdaptiveQuizQuestion extends QuizQuestion {
  noteId: string
}

// ── Critère : flashcard "faible" si efactor < 2.0 ou répétition < 2
const isWeakCard = (efactor: number, repetition: number): boolean => {
  return efactor < 2.0 || repetition < 2
}

// ── Générer un quiz adaptatif depuis les points faibles d'une note
export const generateAdaptiveQuiz = async (
  noteId: string
): Promise<AdaptiveQuizQuestion[]> => {
  const [allFlashcards, allSM2Cards] = await Promise.all([
    getAllItems("flashcards"),
    getAllItems("sm2cards")
  ])

  // Flashcards de la note uniquement
  const noteFlashcards = allFlashcards.filter(card => card.noteId === noteId)

  if (noteFlashcards.length === 0) {
    throw new Error("Aucune flashcard trouvée pour cette note.")
  }

  // Index SM2 par flashcardId
  const sm2Index = new Map(allSM2Cards.map(sm2 => [sm2.flashcardId, sm2]))

  // On trie : les cartes faibles d'abord, puis les autres
  const sorted = [...noteFlashcards].sort((a, b) => {
    const sm2A = sm2Index.get(a.id)
    const sm2B = sm2Index.get(b.id)

    const weakA = sm2A ? isWeakCard(sm2A.efactor, sm2A.repetition) : true
    const weakB = sm2B ? isWeakCard(sm2B.efactor, sm2B.repetition) : true

    // Les cartes faibles remontent en premier
    if (weakA && !weakB) return -1
    if (!weakA && weakB) return 1

    // À égalité : on trie par efactor croissant (les plus faibles en premier)
    const efA = sm2A?.efactor ?? 2.5
    const efB = sm2B?.efactor ?? 2.5
    return efA - efB
  })

  // On prend les 5 cartes les plus faibles pour construire le texte du quiz
  const targetCards = sorted.slice(0, 5)
  const quizText = buildQuizText(targetCards)

  // Appel Claude pour générer les questions QCM
  const rawQuestions = await generateQuiz(quizText)

  // On enrichit avec noteId et flashcardId
  return rawQuestions.map((q: QuizQuestion, index: number) => ({
    ...q,
    id: crypto.randomUUID(),
    flashcardId: targetCards[index]?.id ?? "",
    noteId
  }))
}

// ── Construit un texte résumé depuis les flashcards cibles (pour le prompt)
function buildQuizText(cards: Flashcard[]): string {
  return cards
    .map(card => `Q: ${card.front}\nR: ${card.back}`)
    .join("\n\n")
}