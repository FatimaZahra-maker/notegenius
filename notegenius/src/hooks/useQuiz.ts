// src/hooks/useQuiz.ts
import { useState, useCallback } from "react"
import type { AdaptiveQuizQuestion } from "../services/quizService"
import { generateAdaptiveQuiz } from "../services/quizService"

// ── États possibles du quiz
type QuizState = "idle" | "loading" | "playing" | "finished"

interface QuizResult {
  questionId: string
  selectedIndex: number
  isCorrect: boolean
}

interface UseQuizReturn {
  // Données
  questions: AdaptiveQuizQuestion[]
  currentQuestion: AdaptiveQuizQuestion | null
  currentIndex: number
  totalQuestions: number
  results: QuizResult[]
  score: number
  quizState: QuizState
  error: string | null

  // Actions
  startQuiz: () => Promise<void>
  submitAnswer: (selectedIndex: number) => void
  resetQuiz: () => void
}

export function useQuiz(noteId: string): UseQuizReturn {
  const [questions, setQuestions] = useState<AdaptiveQuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<QuizResult[]>([])
  const [quizState, setQuizState] = useState<QuizState>("idle")
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex] ?? null
  const totalQuestions = questions.length
  const score = results.filter(r => r.isCorrect).length

  // ── Générer et démarrer le quiz adaptatif
  const startQuiz = useCallback(async () => {
    try {
      setQuizState("loading")
      setError(null)
      setResults([])
      setCurrentIndex(0)

      const generated = await generateAdaptiveQuiz(noteId)
      setQuestions(generated)
      setQuizState("playing")
    } catch (err) {
      setError("Erreur lors de la génération du quiz.")
      setQuizState("idle")
      console.error(err)
    }
  }, [noteId])

  // ── Soumettre une réponse
  const submitAnswer = useCallback((selectedIndex: number) => {
    if (!currentQuestion) return

    const isCorrect = selectedIndex === currentQuestion.correctIndex

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedIndex,
      isCorrect
    }

    setResults(prev => [...prev, result])

    // Avancer ou terminer
    const nextIndex = currentIndex + 1
    if (nextIndex >= questions.length) {
      setQuizState("finished")
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentQuestion, currentIndex, questions.length])

  // ── Réinitialiser
  const resetQuiz = useCallback(() => {
    setQuestions([])
    setCurrentIndex(0)
    setResults([])
    setQuizState("idle")
    setError(null)
  }, [])

  return {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    results,
    score,
    quizState,
    error,
    startQuiz,
    submitAnswer,
    resetQuiz
  }
}