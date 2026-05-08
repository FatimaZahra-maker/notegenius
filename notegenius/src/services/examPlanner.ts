import { generateExamPlanText } from './ai'
import { getSubjectStats } from './statsService'
import { getAllItems } from './db'

export interface WeekPlan {
  week: number
  startDate: string
  endDate: string
  focus: string
  tasks: string[]
  targetCards: number
}

export interface ExamPlan {
  noteId: string
  examDate: string
  totalWeeks: number
  weeklyPlans: WeekPlan[]
  generalAdvice: string
}

export const generateExamPlan = async (
  noteId: string,
  examDate: string
): Promise<ExamPlan> => {
  const [stats, allNotes] = await Promise.all([
    getSubjectStats(noteId),
    getAllItems('notes')
  ])

  const note = allNotes.find(n => n.id === noteId)
  if (!note) throw new Error('Note introuvable.')

  const today = new Date()
  const exam = new Date(examDate)
  const weeksRemaining = Math.max(1, Math.ceil(
    (exam.getTime() - today.getTime()) / (7 * 86400000)
  ))

  const rawJson = await generateExamPlanText({
    noteTitle: note.title,
    totalCards: stats.totalCards,
    masteryRate: stats.masteryRate,
    weakCards: stats.weakCards,
    weeksRemaining,
    examDate
  })

  const parsed = JSON.parse(rawJson)

  return {
    noteId,
    examDate,
    totalWeeks: weeksRemaining,
    weeklyPlans: parsed.weeklyPlans,
    generalAdvice: parsed.generalAdvice
  }
}