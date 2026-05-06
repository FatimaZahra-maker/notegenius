// src/hooks/useReviewSession.ts
import { useState, useEffect, useCallback } from "react"
import type { ReviewGrade, ReviewSession } from "../types"
import type { FlashcardWithSM2 } from "../services/reviewQueue"
import { getDueFlashcards } from "../services/reviewQueue"
import { calculateSM2 } from "../algorithms/sm2"
import { saveItem } from "../services/db"

// ── États possibles de la session
type SessionState = "loading" | "idle" | "reviewing" | "finished"

interface UseReviewSessionReturn {
  // Données
  queue: FlashcardWithSM2[]
  current: FlashcardWithSM2 | null
  currentIndex: number
  totalCards: number
  correctCount: number
  sessionState: SessionState

  // Actions
  startSession: () => void
  submitGrade: (grade: ReviewGrade) => Promise<void>
  resetSession: () => void
}

export function useReviewSession(noteId: string): UseReviewSessionReturn {
  const [queue, setQueue] = useState<FlashcardWithSM2[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionState, setSessionState] = useState<SessionState>("loading")
  const [sessionId] = useState(() => crypto.randomUUID())
  const [sessionStart] = useState(() => Date.now())

  // ── Charger les flashcards dues au montage
  useEffect(() => {
    const loadQueue = async () => {
      const due = await getDueFlashcards(noteId)
      setQueue(due)
      setSessionState(due.length === 0 ? "idle" : "idle")
    }
    loadQueue()
  }, [noteId])

  const current = queue[currentIndex] ?? null
  const totalCards = queue.length

  // ── Démarrer la session
  const startSession = useCallback(() => {
    if (queue.length === 0) return
    setCurrentIndex(0)
    setCorrectCount(0)
    setSessionState("reviewing")
  }, [queue.length])

  // ── Soumettre une note pour la carte courante
  const submitGrade = useCallback(async (grade: ReviewGrade) => {
    if (!current) return

    // 1. Calculer les nouvelles données SM-2
    const updatedSM2 = calculateSM2(current.sm2, grade)

    // 2. Sauvegarder dans IndexedDB
    await saveItem("sm2cards", updatedSM2)

    // 3. Mettre à jour le compteur de bonnes réponses
    if (grade === 2) {
      setCorrectCount(prev => prev + 1)
    }

    // 4. Avancer dans la queue
    const nextIndex = currentIndex + 1

    if (nextIndex >= queue.length) {
      // ── Session terminée : sauvegarder le bilan
      const session: ReviewSession = {
        id: sessionId,
        date: sessionStart,
        cardsReviewed: queue.length,
        correctCount: grade === 2 ? correctCount + 1 : correctCount,
        noteId
      }
      await saveItem("sessions", session)
      setSessionState("finished")
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [current, currentIndex, queue.length, correctCount, sessionId, sessionStart, noteId])

  // ── Réinitialiser pour une nouvelle session
  const resetSession = useCallback(() => {
    setCurrentIndex(0)
    setCorrectCount(0)
    setSessionState("idle")
  }, [])

  return {
    queue,
    current,
    currentIndex,
    totalCards,
    correctCount,
    sessionState,
    startSession,
    submitGrade,
    resetSession
  }
}