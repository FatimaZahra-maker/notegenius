// src/services/reviewQueue.ts
import { getAllItems } from "./db"
import type { Flashcard, SM2Card } from "../types"

// ── Une flashcard enrichie avec ses données SM-2 (utile pour la session)
export interface FlashcardWithSM2 {
  flashcard: Flashcard
  sm2: SM2Card
}

// ── Retourne toutes les flashcards dues aujourd'hui pour une note donnée
export const getDueFlashcards = async (noteId: string): Promise<FlashcardWithSM2[]> => {
  const [allFlashcards, allSM2Cards] = await Promise.all([
    getAllItems("flashcards"),
    getAllItems("sm2cards")
  ])

  const now = Date.now()

  // On filtre les flashcards de la note
  const noteFlashcards = allFlashcards.filter(card => card.noteId === noteId)

  // On construit un index sm2 par flashcardId pour éviter une boucle imbriquée
  const sm2Index = new Map<string, SM2Card>(
    allSM2Cards.map(sm2 => [sm2.flashcardId, sm2])
  )

  const result: FlashcardWithSM2[] = []

  for (const flashcard of noteFlashcards) {
    const sm2 = sm2Index.get(flashcard.id)

    // Si pas encore de données SM-2 → jamais révisée → due immédiatement
    if (!sm2) continue

    if (sm2.nextReview <= now) {
      result.push({ flashcard, sm2 })
    }
  }

  return result
}

// ── Compte combien de flashcards sont dues aujourd'hui (toutes notes confondues)
export const countAllDueFlashcards = async (): Promise<number> => {
  const [allSM2Cards] = await Promise.all([getAllItems("sm2cards")])
  const now = Date.now()
  return allSM2Cards.filter(sm2 => sm2.nextReview <= now).length
}