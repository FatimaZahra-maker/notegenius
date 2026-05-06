// src/services/statsService.ts
import { getAllItems } from "./db"

// ── Types de retour du service
export interface SubjectStats {
  noteId: string
  totalCards: number
  masteredCards: number  // efactor >= 2.5 ET repetition >= 3
  weakCards: number      // efactor < 2.0
  masteryRate: number    // pourcentage 0-100
}

export interface HeatmapEntry {
  date: string   // format "YYYY-MM-DD"
  count: number  // nombre de cartes révisées ce jour
}

export interface MemorizationPoint {
  date: string
  masteryRate: number
}

export interface GlobalStats {
  totalSessions: number
  totalCardsReviewed: number
  averageCorrectRate: number
  currentStreak: number  // jours consécutifs avec au moins 1 session
}

// ── Taux de maîtrise par note
export const getSubjectStats = async (noteId: string): Promise<SubjectStats> => {
  const [allFlashcards, allSM2Cards] = await Promise.all([
    getAllItems("flashcards"),
    getAllItems("sm2cards")
  ])

  const noteCards = allFlashcards.filter(card => card.noteId === noteId)
  const sm2Index = new Map(allSM2Cards.map(sm2 => [sm2.flashcardId, sm2]))

  let masteredCards = 0
  let weakCards = 0

  for (const card of noteCards) {
    const sm2 = sm2Index.get(card.id)
    if (!sm2) continue

    if (sm2.efactor >= 2.5 && sm2.repetition >= 3) masteredCards++
    if (sm2.efactor < 2.0) weakCards++
  }

  const totalCards = noteCards.length
  const masteryRate = totalCards === 0
    ? 0
    : Math.round((masteredCards / totalCards) * 100)

  return { noteId, totalCards, masteredCards, weakCards, masteryRate }
}

// ── Données heatmap : sessions groupées par jour (90 derniers jours)
export const getHeatmapData = async (): Promise<HeatmapEntry[]> => {
  const sessions = await getAllItems("sessions")

  const now = Date.now()
  const MS_90_DAYS = 90 * 86400000
  const cutoff = now - MS_90_DAYS

  // On filtre les 90 derniers jours
  const recent = sessions.filter(s => s.date >= cutoff)

  // On groupe par date "YYYY-MM-DD"
  const countByDay = new Map<string, number>()

  for (const session of recent) {
    const dateKey = toDateKey(session.date)
    countByDay.set(dateKey, (countByDay.get(dateKey) ?? 0) + session.cardsReviewed)
  }

  // On retourne trié par date croissante
  return Array.from(countByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// ── Courbe de mémorisation : évolution du taux de maîtrise dans le temps
export const getMemorizationCurve = async (noteId: string): Promise<MemorizationPoint[]> => {
  const sessions = await getAllItems("sessions")
  const allSM2Cards = await getAllItems("sm2cards")
  const allFlashcards = await getAllItems("flashcards")

  const noteCards = allFlashcards.filter(card => card.noteId === noteId)
  const totalCards = noteCards.length

  if (totalCards === 0) return []

  const noteSessions = sessions
    .filter(s => s.noteId === noteId)
    .sort((a, b) => a.date - b.date)

  // Pour chaque session : on calcule le taux de maîtrise approximatif
  // basé sur le correctCount cumulé
  let cumulativeCorrect = 0

  return noteSessions.map(session => {
    cumulativeCorrect += session.correctCount
    const masteryRate = Math.min(
      Math.round((cumulativeCorrect / (totalCards * 3)) * 100),
      100
    )
    return {
      date: toDateKey(session.date),
      masteryRate
    }
  })
}

// ── Statistiques globales (toutes notes confondues)
export const getGlobalStats = async (): Promise<GlobalStats> => {
  const sessions = await getAllItems("sessions")

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalCardsReviewed: 0,
      averageCorrectRate: 0,
      currentStreak: 0
    }
  }

  const totalCardsReviewed = sessions.reduce((sum, s) => sum + s.cardsReviewed, 0)
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0)
  const averageCorrectRate = totalCardsReviewed === 0
    ? 0
    : Math.round((totalCorrect / totalCardsReviewed) * 100)

  const currentStreak = calculateStreak(sessions.map(s => s.date))

  return {
    totalSessions: sessions.length,
    totalCardsReviewed,
    averageCorrectRate,
    currentStreak
  }
}

// ── Calcule le streak de jours consécutifs jusqu'à aujourd'hui
function calculateStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0

  // Dates uniques triées décroissantes
  const uniqueDays = [...new Set(timestamps.map(toDateKey))].sort().reverse()

  const todayKey = toDateKey(Date.now())
  const yesterdayKey = toDateKey(Date.now() - 86400000)

  // Si pas de session aujourd'hui ni hier → streak cassé
  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) return 0

  let streak = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1])
    const curr = new Date(uniqueDays[i])
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / 86400000
    )
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// ── Utilitaire : timestamp → "YYYY-MM-DD"
function toDateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}