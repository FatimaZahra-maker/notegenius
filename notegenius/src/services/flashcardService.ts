// src/services/flashcardService.ts
import { saveItem, getAllItems, getItemById, deleteItem } from "./db"
import type { Flashcard } from "../types"

// ── Créer et sauvegarder plusieurs flashcards (depuis Claude)
export const saveFlashcards = async (flashcards: Flashcard[]): Promise<void> => {
  await Promise.all(flashcards.map(card => saveItem("flashcards", card)))
}

// ── Récupérer toutes les flashcards d'une note
export const getFlashcardsByNoteId = async (noteId: string): Promise<Flashcard[]> => {
  const all = await getAllItems("flashcards")
  return all.filter(card => card.noteId === noteId)
}

// ── Récupérer une flashcard par son id
export const getFlashcardById = async (id: string): Promise<Flashcard | undefined> => {
  return getItemById("flashcards", id)
}

// ── Mettre à jour une flashcard (après édition dans FlashcardEditor)
export const updateFlashcard = async (updated: Flashcard): Promise<void> => {
  await saveItem("flashcards", updated)
}

// ── Supprimer une flashcard
export const deleteFlashcard = async (id: string): Promise<void> => {
  await deleteItem("flashcards", id)
}

// ── Supprimer toutes les flashcards d'une note (ex: si on supprime la note)
export const deleteFlashcardsByNoteId = async (noteId: string): Promise<void> => {
  const cards = await getFlashcardsByNoteId(noteId)
  await Promise.all(cards.map(card => deleteItem("flashcards", card.id)))
}