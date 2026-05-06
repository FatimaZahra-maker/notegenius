// ─── UNE NOTE ───
export interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

// ─── UNE FLASHCARD ───
export interface Flashcard {
  id: string
  noteId: string
  front: string
  back: string
  createdAt: number
}

// ─── DONNÉES SM-2 ───
export interface SM2Card {
  flashcardId: string
  interval: number
  repetition: number
  efactor: number
  nextReview: number
  lastReview: number
}

// ─── ÉVALUATION ───
export type ReviewGrade = 0 | 1 | 2
// 0 = À revoir | 1 = Difficile | 2 = Facile

// ─── QUESTION DE QUIZ ───
export interface QuizQuestion {
  id: string
  flashcardId: string
  question: string
  options: string[]
  correctIndex: number
}

// ─── SESSION DE RÉVISION ───
export interface ReviewSession {
  id: string
  date: number
  cardsReviewed: number
  correctCount: number
  noteId: string
}