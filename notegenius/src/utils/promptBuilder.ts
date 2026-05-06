// src/utils/promptBuilder.ts

// ── Options communes
interface BasePromptOptions {
  language?: "fr" | "en"   // Langue de la réponse (défaut: "fr")
  count?: number            // Nombre d'éléments à générer
}

// ── Builder pour flashcards
interface FlashcardPromptOptions extends BasePromptOptions {
  difficulty?: "easy" | "medium" | "hard"
  focus?: string            // Ex: "définitions", "formules", "dates"
}

export const buildFlashcardPrompt = (
  text: string,
  options: FlashcardPromptOptions = {}
): string => {
  const {
    language = "fr",
    count = 15,
    difficulty = "medium",
    focus
  } = options

  const difficultyInstruction = {
    easy: "Génère des questions simples de mémorisation directe.",
    medium: "Génère un mix de questions factuelles et de compréhension.",
    hard: "Génère des questions approfondies qui testent la compréhension et l'application."
  }[difficulty]

  const focusInstruction = focus
    ? `Concentre-toi particulièrement sur : ${focus}.`
    : ""

  return `Tu es un professeur expert en pédagogie active. À partir du texte ci-dessous, génère exactement ${count} flashcards de qualité.

${difficultyInstruction}
${focusInstruction}
Réponds en ${language === "fr" ? "français" : "anglais"}.

Règles strictes :
- Le "front" doit être une question claire et précise
- Le "back" doit être une réponse concise (1-3 phrases maximum)
- Couvre les concepts les plus importants du texte
- Évite les questions trop triviales ou trop larges
- Tu dois retourner UNIQUEMENT du JSON valide, sans texte avant ou après

Format attendu :
[
  { "front": "Question", "back": "Réponse" }
]

Texte à analyser :
"""
${text}
"""`
}

// ── Builder pour quiz adaptatif
interface QuizPromptOptions extends BasePromptOptions {
  weakPoints?: string[]     // Points faibles détectés (fronts des cartes difficiles)
}

export const buildQuizPrompt = (
  text: string,
  options: QuizPromptOptions = {}
): string => {
  const {
    language = "fr",
    count = 5,
    weakPoints = []
  } = options

  const weakPointsInstruction = weakPoints.length > 0
    ? `Points faibles détectés — insiste particulièrement sur :\n${weakPoints.map(p => `- ${p}`).join("\n")}`
    : ""

  return `Tu es un professeur expert. Crée exactement ${count} questions QCM pour tester les connaissances sur le texte ci-dessous.

${weakPointsInstruction}
Réponds en ${language === "fr" ? "français" : "anglais"}.

Règles strictes :
- Chaque question a exactement 4 options (A, B, C, D)
- Une seule bonne réponse par question
- Les mauvaises réponses doivent être plausibles (pas trop évidentes)
- correctIndex est l'index 0-3 de la bonne réponse
- Tu dois retourner UNIQUEMENT du JSON valide, sans texte avant ou après

Format attendu :
[
  {
    "question": "Question ?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0
  }
]

Texte :
"""
${text}
"""`
}

// ── Builder pour résumé
interface SummaryPromptOptions extends BasePromptOptions {
  style?: "bullets" | "paragraph" | "structured"
}

export const buildSummaryPrompt = (
  text: string,
  options: SummaryPromptOptions = {}
): string => {
  const {
    language = "fr",
    style = "structured"
  } = options

  const styleInstruction = {
    bullets: "Utilise uniquement des tirets courts et percutants.",
    paragraph: "Écris en paragraphes fluides et cohérents.",
    structured: "Structure avec des titres (##) et des sous-tirets pour chaque section."
  }[style]

  return `Tu es un expert en synthèse pédagogique. Résume le texte ci-dessous de façon claire et mémorisable.

${styleInstruction}
Réponds en ${language === "fr" ? "français" : "anglais"}.
Sois concis : le résumé doit faire au maximum 30% de la longueur du texte original.

Texte :
"""
${text}
"""`
}

// ── Builder pour plan de révision
interface ExamPlanPromptOptions {
  noteTitle: string
  totalCards: number
  masteryRate: number
  weakCards: number
  weeksRemaining: number
  examDate: string
}

export const buildExamPlanPrompt = (options: ExamPlanPromptOptions): string => {
  const {
    noteTitle,
    totalCards,
    masteryRate,
    weakCards,
    weeksRemaining,
    examDate
  } = options

  return `Tu es un coach pédagogique expert en révision. Un étudiant prépare son examen de "${noteTitle}".

Profil actuel :
- Flashcards totales : ${totalCards}
- Taux de maîtrise : ${masteryRate}%
- Points faibles (cartes difficiles) : ${weakCards}
- Semaines restantes : ${weeksRemaining}
- Date d'examen : ${examDate}

Génère un planning de révision semaine par semaine adapté à ce profil.

Règles :
- Semaine 1 : démarrage progressif
- Semaines intermédiaires : montée en intensité sur les points faibles
- Dernière semaine : révision globale et simulation d'examen
- Les tâches doivent être concrètes et actionnables
- Adapte le rythme au nombre de semaines disponibles
- Tu dois retourner UNIQUEMENT du JSON valide, sans texte avant ou après

Format attendu :
{
  "weeklyPlans": [
    {
      "week": 1,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "focus": "Thème principal",
      "tasks": ["Tâche 1", "Tâche 2", "Tâche 3"],
      "targetCards": 20
    }
  ],
  "generalAdvice": "Conseil personnalisé selon le profil de l'étudiant"
}`
}