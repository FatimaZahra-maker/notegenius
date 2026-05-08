import { useState, useCallback } from 'react'
import type { AdaptiveQuizQuestion } from '../services/quizService'
import { generateAdaptiveQuiz } from '../services/quizService'

type QuizState = 'idle' | 'loading' | 'playing' | 'finished'

export interface QuizResult {
  questionId: string
  selectedIndex: number
  isCorrect: boolean
}

interface UseQuizReturn {
  questions: AdaptiveQuizQuestion[]
  currentQuestion: AdaptiveQuizQuestion | null
  currentIndex: number
  totalQuestions: number
  results: QuizResult[]
  score: number
  quizState: QuizState
  error: string | null
  startQuiz: (noteId: string) => Promise<void>
  submitAnswer: (selectedIndex: number) => void
  resetQuiz: () => void
}

export function useQuiz(): UseQuizReturn {
  const [questions, setQuestions] = useState<AdaptiveQuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<QuizResult[]>([])
  const [quizState, setQuizState] = useState<QuizState>('idle')
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex] ?? null
  const totalQuestions = questions.length
  const score = results.filter(r => r.isCorrect).length

  // ── Démarrer le quiz avec un noteId spécifique
  const startQuiz = useCallback(async (noteId: string) => {
    if (!noteId) {
      setError('Aucune matière sélectionnée.')
      return
    }
    try {
      setQuizState('loading')
      setError(null)
      setResults([])
      setCurrentIndex(0)
      const generated = await generateAdaptiveQuiz(noteId)
      setQuestions(generated)
      setQuizState('playing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du quiz.')
      setQuizState('idle')
    }
  }, [])

  const submitAnswer = useCallback((selectedIndex: number) => {
    if (!currentQuestion) return
    const isCorrect = selectedIndex === currentQuestion.correctIndex
    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedIndex,
      isCorrect
    }
    setResults(prev => [...prev, result])
    const nextIndex = currentIndex + 1
    if (nextIndex >= questions.length) {
      setQuizState('finished')
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentQuestion, currentIndex, questions.length])

  const resetQuiz = useCallback(() => {
    setQuestions([])
    setCurrentIndex(0)
    setResults([])
    setQuizState('idle')
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