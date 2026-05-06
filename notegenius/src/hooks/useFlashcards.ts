// src/hooks/useFlashcards.ts
import { useState, useEffect, useCallback } from "react"
import type { Flashcard } from "../types"
import {
  getFlashcardsByNoteId,
  saveFlashcards,
  updateFlashcard,
  deleteFlashcard,
  deleteFlashcardsByNoteId
} from "../services/flashcardService"
import { createInitialSM2Data } from "../algorithms/sm2"
import { saveItem } from "../services/db"

interface UseFlashcardsReturn {
  flashcards: Flashcard[]
  isLoading: boolean
  error: string | null
  addFlashcards: (cards: Flashcard[]) => Promise<void>
  editFlashcard: (updated: Flashcard) => Promise<void>
  removeFlashcard: (id: string) => Promise<void>
  removeAllByNote: (noteId: string) => Promise<void>
  reload: () => Promise<void>
}

export function useFlashcards(noteId: string): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Charger les flashcards de la note depuis IndexedDB
  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const cards = await getFlashcardsByNoteId(noteId)
      setFlashcards(cards)
    } catch (err) {
      setError("Erreur lors du chargement des flashcards.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [noteId])

  useEffect(() => {
    load()
  }, [load])

  // ── Ajouter plusieurs flashcards (depuis Claude) + initialiser leur SM2
  const addFlashcards = useCallback(async (cards: Flashcard[]) => {
    try {
      await saveFlashcards(cards)
      // On initialise les données SM-2 pour chaque nouvelle carte
      await Promise.all(
        cards.map(card => saveItem("sm2cards", createInitialSM2Data(card.id)))
      )
      setFlashcards(prev => [...prev, ...cards])
    } catch (err) {
      setError("Erreur lors de la sauvegarde des flashcards.")
      console.error(err)
    }
  }, [])

  // ── Modifier une flashcard (FlashcardEditor)
  const editFlashcard = useCallback(async (updated: Flashcard) => {
    try {
      await updateFlashcard(updated)
      setFlashcards(prev =>
        prev.map(card => card.id === updated.id ? updated : card)
      )
    } catch (err) {
      setError("Erreur lors de la mise à jour.")
      console.error(err)
    }
  }, [])

  // ── Supprimer une flashcard
  const removeFlashcard = useCallback(async (id: string) => {
    try {
      await deleteFlashcard(id)
      setFlashcards(prev => prev.filter(card => card.id !== id))
    } catch (err) {
      setError("Erreur lors de la suppression.")
      console.error(err)
    }
  }, [])

  // ── Supprimer toutes les flashcards d'une note
  const removeAllByNote = useCallback(async (noteId: string) => {
    try {
      await deleteFlashcardsByNoteId(noteId)
      setFlashcards([])
    } catch (err) {
      setError("Erreur lors de la suppression groupée.")
      console.error(err)
    }
  }, [])

  return {
    flashcards,
    isLoading,
    error,
    addFlashcards,
    editFlashcard,
    removeFlashcard,
    removeAllByNote,
    reload: load
  }
}