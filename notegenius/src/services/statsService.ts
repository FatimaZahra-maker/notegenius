import { getAllItems } from './db'

export interface SubjectStats {
  noteId: string
  totalCards: number
  masteredCards: number
  weakCards: number
  masteryRate: number
}

export interface HeatmapEntry {
  date: string
  count: number
}

export interface MemorizationPoint {
  date: string
  masteryRate: number
}

export interface GlobalStats {
  totalSessions: number
  totalCardsReviewed: number
  averageCorrectRate: number
  currentStreak: number
}

function toDateKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

// ── Taux de maîtrise par note
export const getSubjectStats = async (noteId: string): Promise<SubjectStats> => {
  const [allFlashcards, allSM2Cards] = await Promise.all([
    getAllItems('flashcards'),
    getAllItems('sm2cards')
  ])

  const noteCards = allFlashcards.filter(card => card.noteId === noteId)
  const sm2Index = new Map(allSM2Cards.map(sm2 => [sm2.flashcardId, sm2]))

  let masteredCards = 0
  let weakCards = 0

  for (const card of noteCards) {
    const sm2 = sm2Index.get(card.id)
    if (!sm2) continue
    // Maîtrisée = efactor >= 2.5 ET au moins 3 révisions réussies
    if (sm2.efactor >= 2.5 && sm2.repetition >= 3) masteredCards++
    // Faible = efactor < 2.0 (difficile à mémoriser)
    if (sm2.efactor < 2.0) weakCards++
  }

  const totalCards = noteCards.length
  const masteryRate = totalCards === 0
    ? 0
    : Math.round((masteredCards / totalCards) * 100)

  return { noteId, totalCards, masteredCards, weakCards, masteryRate }
}

// ── Heatmap des 90 derniers jours
export const getHeatmapData = async (): Promise<HeatmapEntry[]> => {
  const sessions = await getAllItems('sessions')
  const now = Date.now()
  const MS_90_DAYS = 90 * 86400000
  const cutoff = now - MS_90_DAYS

  const recent = sessions.filter(s => s.date >= cutoff)
  const countByDay = new Map<string, number>()

  for (const session of recent) {
    const dateKey = toDateKey(session.date)
    countByDay.set(dateKey, (countByDay.get(dateKey) ?? 0) + session.cardsReviewed)
  }

  return Array.from(countByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// ── Courbe de mémorisation
export const getMemorizationCurve = async (noteId: string): Promise<MemorizationPoint[]> => {
  const [sessions, allSM2Cards, allFlashcards] = await Promise.all([
    getAllItems('sessions'),
    getAllItems('sm2cards'),
    getAllItems('flashcards')
  ])

  const noteCards = allFlashcards.filter(card => card.noteId === noteId)
  const totalCards = noteCards.length

  if (totalCards === 0) return []

  const noteSessions = sessions
    .filter(s => s.noteId === noteId)
    .sort((a, b) => a.date - b.date)

  if (noteSessions.length === 0) return []

  // Calculer le taux de maîtrise cumulatif par session
  let cumulativeCorrect = 0
  return noteSessions.map(session => {
    cumulativeCorrect += session.correctCount
    const masteryRate = Math.min(
      Math.round((cumulativeCorrect / (totalCards * 3)) * 100),
      100
    )
    return { date: toDateKey(session.date), masteryRate }
  })
}

// ── Stats globales
export const getGlobalStats = async (): Promise<GlobalStats> => {
  const sessions = await getAllItems('sessions')

  if (sessions.length === 0) {
    return { totalSessions: 0, totalCardsReviewed: 0, averageCorrectRate: 0, currentStreak: 0 }
  }

  const totalCardsReviewed = sessions.reduce((sum, s) => sum + s.cardsReviewed, 0)
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0)
  const averageCorrectRate = totalCardsReviewed === 0
    ? 0
    : Math.round((totalCorrect / totalCardsReviewed) * 100)

  const currentStreak = calculateStreak(sessions.map(s => s.date))

  return { totalSessions: sessions.length, totalCardsReviewed, averageCorrectRate, currentStreak }
}

function calculateStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0
  const uniqueDays = [...new Set(timestamps.map(toDateKey))].sort().reverse()
  const todayKey = toDateKey(Date.now())
  const yesterdayKey = toDateKey(Date.now() - 86400000)

  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) return 0

  let streak = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1])
    const curr = new Date(uniqueDays[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diffDays === 1) streak++
    else break
  }
  return streak
}