import  { openDB, type DBSchema } from "idb"
import type { Note,Flashcard,SM2Card,ReviewSession } from "../types"

interface NoteGeniusDB extends DBSchema {
  notes: {
    key: string
    value: Note
  }
  flashcards: {
    key: string
    value: Flashcard
  }
  sm2cards: {
    key: string
    value: SM2Card
  }
  sessions: {
    key: string
    value: ReviewSession
  }
}

const getDB = () => openDB<NoteGeniusDB>("notegenius-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("notes")) {
      db.createObjectStore("notes", { keyPath: "id" })
    }
    if (!db.objectStoreNames.contains("flashcards")) {
      db.createObjectStore("flashcards", { keyPath: "id" })
    }
    if (!db.objectStoreNames.contains("sm2cards")) {
      db.createObjectStore("sm2cards", { keyPath: "flashcardId" })
    }
    if (!db.objectStoreNames.contains("sessions")) {
      db.createObjectStore("sessions", { keyPath: "id" })
    }
  }
})

export const saveItem = async <T extends keyof NoteGeniusDB>(
  storeName: T,
  item: NoteGeniusDB[T]["value"]
) => {
  const db = await getDB()
  await db.put(storeName as any, item)
}

export const getAllItems = async <T extends keyof NoteGeniusDB>(
  storeName: T
): Promise<NoteGeniusDB[T]["value"][]> => {
  const db = await getDB()
  return db.getAll(storeName as any)
}

export const getItemById = async <T extends keyof NoteGeniusDB>(
  storeName: T,
  id: string
): Promise<NoteGeniusDB[T]["value"] | undefined> => {
  const db = await getDB()
  return db.get(storeName as any, id)
}

export const deleteItem = async <T extends keyof NoteGeniusDB>(
  storeName: T,
  id: string
) => {
  const db = await getDB()
  await db.delete(storeName as any, id)
}