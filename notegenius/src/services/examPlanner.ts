// src/services/examPlanner.ts
import { getApiKey } from "./apiKey"
import { getSubjectStats } from "./statsService"
import { getAllItems } from "./db"

// ── Types
export interface WeekPlan {
  week: number           // Numéro de semaine (1, 2, 3...)
  startDate: string      // "YYYY-MM-DD"
  endDate: string        // "YYYY-MM-DD"
  focus: string          // Thème principal de la semaine
  tasks: string[]        // Liste des tâches recommandées
  targetCards: number    // Nombre de flashcards à réviser cette semaine
}

export interface ExamPlan {
  noteId: string
  examDate: string       // "YYYY-MM-DD"
  totalWeeks: number
  weeklyPlans: WeekPlan[]
  generalAdvice: string
}

// ── Générer un plan de révision via Claude
export const generateExamPlan = async (
  noteId: string,
  examDate: string       // format "YYYY-MM-DD"
): Promise<ExamPlan> => {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error("Clé API introuvable. Veuillez configurer votre clé Claude.")
  }

  // 1. Récupérer le contexte : stats + note
  const [stats, allNotes] = await Promise.all([
    getSubjectStats(noteId),
    getAllItems("notes")
  ])

  const note = allNotes.find(n => n.id === noteId)
  if (!note) throw new Error("Note introuvable.")

  // 2. Calculer le nombre de semaines restantes
  const today = new Date()
  const exam = new Date(examDate)
  const msRemaining = exam.getTime() - today.getTime()
  const weeksRemaining = Math.max(1, Math.ceil(msRemaining / (7 * 86400000)))

  // 3. Construire le prompt contextuel
  const prompt = buildExamPlannerPrompt({
    noteTitle: note.title,
    totalCards: stats.totalCards,
    masteryRate: stats.masteryRate,
    weakCards: stats.weakCards,
    weeksRemaining,
    examDate
  })

  // 4. Appel Claude
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerously-allow-browser": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Erreur API: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const rawText: string = data.content[0].text

  // 5. Parser la réponse JSON
  const cleanJson = rawText.match(/\{[\s\S]*\}/)?.[0] || rawText
  const parsed = JSON.parse(cleanJson)

  return {
    noteId,
    examDate,
    totalWeeks: weeksRemaining,
    weeklyPlans: parsed.weeklyPlans,
    generalAdvice: parsed.generalAdvice
  }
}

// ── Construit le prompt pour Claude
function buildExamPlannerPrompt(ctx: {
  noteTitle: string
  totalCards: number
  masteryRate: number
  weakCards: number
  weeksRemaining: number
  examDate: string
}): string {
  return `Tu es un coach pédagogique expert en révision. Un étudiant prépare son examen de "${ctx.noteTitle}".

Voici son profil actuel :
- Nombre de flashcards : ${ctx.totalCards}
- Taux de maîtrise actuel : ${ctx.masteryRate}%
- Flashcards difficiles (points faibles) : ${ctx.weakCards}
- Semaines avant l'examen : ${ctx.weeksRemaining}
- Date d'examen : ${ctx.examDate}

Génère un planning de révision semaine par semaine.

Tu dois retourner UNIQUEMENT du JSON valide, sans texte avant ou après.
Format attendu :
{
  "weeklyPlans": [
    {
      "week": 1,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "focus": "Thème principal de la semaine",
      "tasks": ["Tâche 1", "Tâche 2", "Tâche 3"],
      "targetCards": 20
    }
  ],
  "generalAdvice": "Conseil général pour cet étudiant en particulier"
}

Règles :
- Commence doucement (semaine 1) et augmente progressivement l'intensité
- Les dernières semaines avant l'examen doivent être consacrées aux points faibles et aux révisions globales
- Les tâches doivent être concrètes et actionnables (ex: "Réviser 15 flashcards du chapitre X", pas "Travailler")
- Adapte le rythme au nombre de semaines disponibles
- Le generalAdvice doit être personnalisé selon le taux de maîtrise actuel`
}