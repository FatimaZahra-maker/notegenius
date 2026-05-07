import { GoogleGenerativeAI } from '@google/generative-ai'

// ── Clé API Gemini gratuite
const API_KEY = 'VOTRE_CLE_GEMINI_ICI'
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

// ── Fonction utilitaire privée
async function callGemini(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt)
  return result.response.text()
}

// ── Générer des flashcards
export async function generateFlashcards(text: string) {
  const prompt = `Tu es un professeur expert. À partir du texte ci-dessous, génère 15 flashcards pertinentes.

Retourne UNIQUEMENT du JSON valide, sans texte avant ou après.
Format :
[
  { "front": "Question", "back": "Réponse concise" }
]

Texte :
"""
${text.slice(0, 8000)}
"""`

  const response = await callGemini(prompt)
  try {
    const clean = response.match(/\[[\s\S]*\]/)?.[0] || response
    return JSON.parse(clean)
  } catch {
    throw new Error('Gemini n\'a pas retourné un format valide.')
  }
}

// ── Générer un quiz
export async function generateQuiz(text: string) {
  const prompt = `Crée 5 questions QCM à partir du texte ci-dessous.

Retourne UNIQUEMENT du JSON valide, sans texte avant ou après.
Format :
[
  {
    "question": "Question ?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0
  }
]
correctIndex est l'index (0-3) de la bonne réponse.

Texte :
"""
${text.slice(0, 8000)}
"""`

  const response = await callGemini(prompt)
  try {
    const clean = response.match(/\[[\s\S]*\]/)?.[0] || response
    return JSON.parse(clean)
  } catch {
    throw new Error('Gemini n\'a pas retourné un format valide.')
  }
}

// ── Générer un résumé
export async function generateSummary(text: string): Promise<string> {
  const prompt = `Fais un résumé clair et structuré avec des titres et des tirets du texte suivant :

"""
${text.slice(0, 8000)}
"""`

  return await callGemini(prompt)
}

// ── Générer un planning d'examen
export async function generateExamPlanText(context: {
  noteTitle: string
  totalCards: number
  masteryRate: number
  weakCards: number
  weeksRemaining: number
  examDate: string
}): Promise<string> {
  const prompt = `Tu es un coach pédagogique. Un étudiant prépare "${context.noteTitle}".

Profil :
- Flashcards : ${context.totalCards}
- Maîtrise : ${context.masteryRate}%
- Points faibles : ${context.weakCards} cartes
- Semaines restantes : ${context.weeksRemaining}
- Date examen : ${context.examDate}

Génère un planning de révision semaine par semaine.
Retourne UNIQUEMENT du JSON valide.
Format :
{
  "weeklyPlans": [
    {
      "week": 1,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "focus": "Thème",
      "tasks": ["Tâche 1", "Tâche 2"],
      "targetCards": 20
    }
  ],
  "generalAdvice": "Conseil personnalisé"
}`

  const response = await callGemini(prompt)
  try {
    const clean = response.match(/\{[\s\S]*\}/)?.[0] || response
    return clean
  } catch {
    throw new Error('Gemini n\'a pas retourné un format valide.')
  }
}