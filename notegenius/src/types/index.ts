// ── Note / Matière
export interface Note {
  id: string
  title: string
  description?: string
  color: string
  content: string
  createdAt: number
  updatedAt: number
}

// ── Flashcard
export interface Flashcard {
  id: string
  noteId: string
  front: string
  back: string
  createdAt: number
}

// ── SM-2
export interface SM2Card {
  flashcardId: string
  interval: number
  repetition: number
  efactor: number
  nextReview: number
  lastReview: number
}

// ── Évaluation SM-2
export type ReviewGrade = 0 | 1 | 2

// ── Question de quiz
export interface QuizQuestion {
  id: string
  flashcardId: string
  question: string
  options: string[]
  correctIndex: number
}

// ── Session de révision
export interface ReviewSession {
  id: string
  date: number
  cardsReviewed: number
  correctCount: number
  noteId: string
}

// ── Résumé sauvegardé
export interface Summary {
  id: string
  noteId: string
  noteTitle: string
  content: string
  createdAt: number
}

// ── Utilisateur
export interface User {
  id: string
  name: string
  email: string
  bio?: string
  createdAt: number
}

// ── Préférences
export interface UserPreferences {
  theme: 'light' | 'dark'
  dailyGoal: number
  animations: boolean
}