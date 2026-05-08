const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

if (!GROQ_API_KEY) {
  console.error('⚠️ VITE_GROQ_API_KEY manquante dans .env')
}

async function callGroq(prompt: string, maxTokens = 2000): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Clé API Groq manquante. Vérifiez votre fichier .env')
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant pédagogique expert. Tu réponds TOUJOURS en JSON valide strict quand demandé, sans markdown, sans backticks, sans texte avant ou après.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Erreur Groq API: ${error?.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// ── Nettoyer la réponse JSON (enlever backticks markdown)
function cleanJSON(text: string): string {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
}

export async function generateFlashcards(text: string) {
  const prompt = `Génère exactement 15 flashcards pédagogiques à partir du texte.
Retourne UNIQUEMENT un tableau JSON valide. Aucun texte avant ou après.
Format : [{"front": "Question claire", "back": "Réponse concise"}]
Texte : """${text.slice(0, 6000)}"""`

  const response = await callGroq(prompt, 3000)
  try {
    const clean = cleanJSON(response)
    const arr = clean.match(/\[[\s\S]*\]/)?.[0] || clean
    return JSON.parse(arr)
  } catch {
    throw new Error('Format invalide retourné par l\'IA. Réessayez.')
  }
}

export async function generateQuiz(text: string) {
  const prompt = `Crée exactement 5 questions QCM pédagogiques à partir du texte.
Retourne UNIQUEMENT un tableau JSON valide. Aucun texte avant ou après.
Format exact : [{"question": "Question?", "options": ["A", "B", "C", "D"], "correctIndex": 0}]
Règles: exactement 4 options, correctIndex entre 0 et 3, mauvaises réponses plausibles.
Texte : """${text.slice(0, 6000)}"""`

  const response = await callGroq(prompt, 2000)
  try {
    const clean = cleanJSON(response)
    const arr = clean.match(/\[[\s\S]*\]/)?.[0] || clean
    return JSON.parse(arr)
  } catch {
    throw new Error('Format invalide retourné par l\'IA. Réessayez.')
  }
}

export async function generateSummary(text: string): Promise<string> {
  const prompt = `Tu es un expert en pédagogie. Crée un résumé structuré du texte suivant.

Le résumé doit contenir :
1. Un titre principal
2. Les concepts clés (liste avec puces)
3. Les points importants par section
4. Une synthèse finale
5. Les mots/formules à retenir

Utilise des émojis pour chaque section pour faciliter la lecture.
Texte : """${text.slice(0, 6000)}"""`

  return await callGroq(prompt, 2000)
}

export async function generateExamPlanText(ctx: {
  noteTitle: string
  totalCards: number
  masteryRate: number
  weakCards: number
  weeksRemaining: number
  examDate: string
}): Promise<string> {
  const today = new Date()
  const prompt = `Tu es un coach pédagogique. Génère un planning de révision.
Matière: "${ctx.noteTitle}"
Données: ${ctx.totalCards} flashcards, ${ctx.masteryRate}% maîtrise, ${ctx.weakCards} points faibles, ${ctx.weeksRemaining} semaines, examen le ${ctx.examDate}.
Date de début: ${today.toISOString().slice(0, 10)}

Retourne UNIQUEMENT ce JSON valide:
{"weeklyPlans":[{"week":1,"startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","focus":"Thème","tasks":["Tâche 1","Tâche 2","Tâche 3"],"targetCards":20}],"generalAdvice":"Conseil personnalisé"}

Règles:
- Génère exactement ${ctx.weeksRemaining} semaines
- Calcule les vraies dates à partir du ${today.toISOString().slice(0, 10)}
- Progression croissante d'intensité
- Dernière semaine = révision globale`

  const response = await callGroq(prompt, 2000)
  const clean = cleanJSON(response)
  const obj = clean.match(/\{[\s\S]*\}/)?.[0] || clean
  return obj
}