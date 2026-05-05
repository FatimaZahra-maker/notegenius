export interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}
export interface Flashcard {
  id: string
  noteId: string
  front: string
  back: string
  createdAt: number
}
export interface SM2Card {
  flashcardId: string
  interval: number
  repetition: number
  efactor: number
  nextReview: number
  lastReview: number
}
export type ReviewGrade = 0 | 1 | 2
export interface QuizQuestion {
  id: string
  flashcardId: string
  question: string
  options: string[]
  correctIndex: number
}
export interface ReviewSession {
  id: string
  date: number
  cardsReviewed: number
  correctCount: number
  noteId: string
}