// ── Service IA utilisant Groq API
// Groq offre des inférences ultra-rapides avec des modèles open-source

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ── Modèle recommandé : llama-3.3-70b-versatile (gratuit, très performant)
const MODEL = 'llama-3.3-70b-versatile'

if (!GROQ_API_KEY) {
  console.error('⚠️ VITE_GROQ_API_KEY manquante dans .env')
}

// ── Fonction utilitaire principale
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
          content: 'Tu es un assistant pédagogique expert. Tu réponds toujours en JSON valide quand demandé.'
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

// ── Générer des flashcards
export async function generateFlashcards(text: string) {
  const prompt = `Tu es un professeur expert. Génère exactement 15 flashcards pertinentes à partir du texte suivant.

IMPORTANT : Retourne UNIQUEMENT du JSON valide, sans texte avant ou après, sans backticks.
Format requis :
[
  { "front": "Question claire et précise", "back": "Réponse concise (1-2 phrases)" }
]

Texte à analyser :
"""
${text.slice(0, 6000)}
"""`

  const response = await callGroq(prompt, 3000)

  try {
    const clean = response.match(/\[[\s\S]*\]/)?.[0] || response
    return JSON.parse(clean)
  } catch {
    throw new Error('Format invalide retourné par l\'IA. Réessayez.')
  }
}

// ── Générer un quiz QCM
export async function generateQuiz(text: string) {
  const prompt = `Tu es un professeur expert. Crée exactement 5 questions QCM à partir du texte suivant.

IMPORTANT : Retourne UNIQUEMENT du JSON valide, sans texte avant ou après, sans backticks.
Format requis :
[
  {
    "question": "Question claire ?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Règles :
- Exactement 4 options par question
- correctIndex est l'index (0, 1, 2 ou 3) de la bonne réponse
- Les mauvaises réponses doivent être plausibles

Texte :
"""
${text.slice(0, 6000)}
"""`

  const response = await callGroq(prompt, 2000)

  try {
    const clean = response.match(/\[[\s\S]*\]/)?.[0] || response
    return JSON.parse(clean)
  } catch {
    throw new Error('Format invalide retourné par l\'IA. Réessayez.')
  }
}

// ── Générer un résumé
export async function generateSummary(text: string): Promise<string> {
  const prompt = `Tu es un expert en synthèse pédagogique. Résume le texte suivant de façon claire et structurée.

Format :
- Utilise des titres avec ##
- Utilise des tirets pour les points clés
- Maximum 30% de la longueur originale
- Mets en avant les concepts les plus importants

Texte :
"""
${text.slice(0, 6000)}
"""`

  return await callGroq(prompt, 1500)
}

// ── Générer un planning d'examen
export async function generateExamPlanText(ctx: {
  noteTitle: string
  totalCards: number
  masteryRate: number
  weakCards: number
  weeksRemaining: number
  examDate: string
}): Promise<string> {
  const prompt = `Tu es un coach pédagogique expert. Un étudiant prépare son examen de "${ctx.noteTitle}".

Profil de l'étudiant :
- Flashcards totales : ${ctx.totalCards}
- Taux de maîtrise actuel : ${ctx.masteryRate}%
- Points faibles : ${ctx.weakCards} cartes difficiles
- Semaines avant l'examen : ${ctx.weeksRemaining}
- Date d'examen : ${ctx.examDate}

Génère un planning de révision semaine par semaine adapté à ce profil.

IMPORTANT : Retourne UNIQUEMENT du JSON valide, sans texte avant ou après, sans backticks.
Format requis :
{
  "weeklyPlans": [
    {
      "week": 1,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "focus": "Thème principal de la semaine",
      "tasks": ["Tâche concrète 1", "Tâche concrète 2", "Tâche concrète 3"],
      "targetCards": 20
    }
  ],
  "generalAdvice": "Conseil personnalisé selon le profil de l'étudiant"
}

Règles :
- Commence progressivement la semaine 1
- Intensifie sur les points faibles aux semaines intermédiaires
- Dernière semaine : révision globale et simulation
- Les tâches doivent être concrètes et actionnables`

  const response = await callGroq(prompt, 2000)
  const clean = response.match(/\{[\s\S]*\}/)?.[0] || response
  return clean
}