// src/utils/exportAnki.ts
import type { Flashcard } from "../types"

// ── Options d'export
interface ExportOptions {
  deckName?: string      // Nom du deck Anki (défaut: "NoteGenius Export")
  separator?: string     // Séparateur CSV (défaut: ";")
}

// ── Exporter les flashcards en CSV compatible Anki
export const exportToAnkiCSV = (
  flashcards: Flashcard[],
  options: ExportOptions = {}
): void => {
  const {
    deckName = "NoteGenius Export",
    separator = ";"
  } = options

  if (flashcards.length === 0) {
    throw new Error("Aucune flashcard à exporter.")
  }

  // En-tête Anki : #deck indique le nom du deck à Anki
  const header = `#separator:${separator}\n#html:false\n#deck:${deckName}\n#notetype:Basic\n`

  // Chaque ligne : recto;verso
  const rows = flashcards.map(card => {
    const front = escapeCsvField(card.front, separator)
    const back = escapeCsvField(card.back, separator)
    return `${front}${separator}${back}`
  })

  const csvContent = header + rows.join("\n")

  // Téléchargement côté client
  downloadFile(csvContent, `${deckName}.csv`, "text/csv;charset=utf-8;")
}

// ── Exporter en JSON (format NoteGenius — pour import/backup)
export const exportToJSON = (flashcards: Flashcard[], noteTitle: string): void => {
  if (flashcards.length === 0) {
    throw new Error("Aucune flashcard à exporter.")
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    noteTitle,
    totalCards: flashcards.length,
    flashcards: flashcards.map(card => ({
      front: card.front,
      back: card.back,
      createdAt: card.createdAt
    }))
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  downloadFile(jsonContent, `${noteTitle}-flashcards.json`, "application/json")
}

// ── Échapper les champs CSV (guillemets si le champ contient le séparateur)
function escapeCsvField(value: string, separator: string): string {
  if (value.includes(separator) || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// ── Déclencher le téléchargement côté client
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Nettoyage
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}