import { saveItem, getAllItems, deleteItem } from './db'
import { generateSummary } from './ai'
import type { Summary } from '../types'

// ── Générer et sauvegarder un résumé
export const createAndSaveSummary = async (
  noteId: string,
  noteTitle: string,
  text: string
): Promise<Summary> => {
  const content = await generateSummary(text)

  const summary: Summary = {
    id: crypto.randomUUID(),
    noteId,
    noteTitle,
    content,
    createdAt: Date.now()
  }

  await saveItem('summaries', summary)
  return summary
}

// ── Récupérer tous les résumés
export const getAllSummaries = async (): Promise<Summary[]> => {
  return getAllItems('summaries')
}

// ── Récupérer les résumés d'une note
export const getSummariesByNoteId = async (noteId: string): Promise<Summary[]> => {
  const all = await getAllItems('summaries')
  return all.filter(s => s.noteId === noteId)
}

// ── Supprimer un résumé
export const deleteSummary = async (id: string): Promise<void> => {
  await deleteItem('summaries', id)
}