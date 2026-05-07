import { GoogleGenerativeAI } from '@google/generative-ai'

// ── Clé API depuis .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  console.error('⚠️ VITE_GEMINI_API_KEY manquante dans .env')
}

const genAI = new GoogleGenerativeAI(API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

async function callGemini(prompt: string): Promise<string> {
  if (!API_KEY) throw new Error('Clé API Gemini manquante.')
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function generateFlashcards(text: string) {
  const prompt = `Tu es un professeur expert. Génère 15 flashcards à partir du texte.
Retourne UNIQUEMENT du JSON valide.
Format : [{ "front": "Question", "back": "Réponse concise" }]
Texte : """${text.slice(0, 8000)}"""`

  const response = await callGemini(prompt)
  try {
    const clean = response.match(/\[[\s\S]*\]/)?.[0] || response
    return JSON.parse(clean)
  } catch {
    throw new Error('Format invalide retourné par Gemini.')
  }
}

export async function generateQuiz(text: string) {
  const prompt = `Crée 5 questions QCM à partir du texte.
Retourne UNIQUEMENT du JSON valide.
Format : [{ "question": "?", "options": ["A","B","C","D"], "correctIndex": 0 }]
Texte : """${text.slice(0, 8000)}"""`

  const response = await callGemini(prompt)
  try {
    const clean = response.match(/\[[\s\S]*\]/)?.[0] || response
    return JSON.parse(clean)
  } catch {
    throw new Error('Format invalide retourné par Gemini.')
  }
}

export async function generateSummary(text: string): Promise<string> {
  const prompt = `Résume clairement avec titres et tirets :
"""${text.slice(0, 8000)}"""`
  return await callGemini(prompt)
}

export async function generateExamPlanText(ctx: {
  noteTitle: string
  totalCards: number
  masteryRate: number
  weakCards: number
  weeksRemaining: number
  examDate: string
}): Promise<string> {
  const prompt = `Coach pédagogique. Planifie la révision de "${ctx.noteTitle}".
Profil: ${ctx.totalCards} cartes, ${ctx.masteryRate}% maîtrise, ${ctx.weakCards} points faibles, ${ctx.weeksRemaining} semaines, examen le ${ctx.examDate}.
Retourne UNIQUEMENT du JSON valide.
Format: { "weeklyPlans": [{ "week": 1, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "focus": "Thème", "tasks": ["Tâche"], "targetCards": 20 }], "generalAdvice": "Conseil" }`

  const response = await callGemini(prompt)
  const clean = response.match(/\{[\s\S]*\}/)?.[0] || response
  return clean
}