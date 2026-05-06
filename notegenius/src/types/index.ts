<<<<<<< HEAD
// ─── UNE NOTE ───
=======
>>>>>>> bf22c629c90dc2395a069169ac2f59f405bcb3e6
export interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}
<<<<<<< HEAD

// ─── UNE FLASHCARD ───
=======
>>>>>>> bf22c629c90dc2395a069169ac2f59f405bcb3e6
export interface Flashcard {
  id: string
  noteId: string
  front: string
  back: string
  createdAt: number
}
<<<<<<< HEAD

// ─── DONNÉES SM-2 ───
=======
>>>>>>> bf22c629c90dc2395a069169ac2f59f405bcb3e6
export interface SM2Card {
  flashcardId: string
  interval: number
  repetition: number
  efactor: number
  nextReview: number
  lastReview: number
}
<<<<<<< HEAD

// ─── ÉVALUATION ───
export type ReviewGrade = 0 | 1 | 2
// 0 = À revoir | 1 = Difficile | 2 = Facile

// ─── QUESTION DE QUIZ ───
=======
export type ReviewGrade = 0 | 1 | 2
>>>>>>> bf22c629c90dc2395a069169ac2f59f405bcb3e6
export interface QuizQuestion {
  id: string
  flashcardId: string
  question: string
  options: string[]
  correctIndex: number
}
<<<<<<< HEAD

// ─── SESSION DE RÉVISION ───
=======
>>>>>>> bf22c629c90dc2395a069169ac2f59f405bcb3e6
export interface ReviewSession {
  id: string
  date: number
  cardsReviewed: number
  correctCount: number
  noteId: string
}