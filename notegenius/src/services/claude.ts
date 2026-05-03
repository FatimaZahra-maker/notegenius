
import { getApiKey } from "./apiKey"

// ==========================================
// Fonction utilitaire (privée) pour ne pas répéter le fetch
// ==========================================
async function callClaudeAPI(prompt: string): Promise<string> {
  const apiKey = getApiKey()
  
  // Sécurité : on vérifie que l'utilisateur a bien entré sa clé
  if (!apiKey) {
    throw new Error("Clé API introuvable. Veuillez configurer votre clé Claude.")
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerously-allow-browser": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", // Le modèle demandé
      max_tokens: 1500, // On augmente un peu pour être sûr d'avoir toute la réponse
      messages: [{ role: "user", content: prompt }]
    })
  })

  // Gestion des erreurs (ex: plus de crédit, erreur de serveur)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Erreur API: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// ==========================================
// 1. Générer des Flashcards (Retourne du JSON)
// ==========================================
export async function generateFlashcards(text: string) {
  const prompt = `Tu es un professeur expert. À partir du texte ci-dessous, génère des flashcards pertinentes pour aider à la mémorisation.
  
Tu dois retourner UNIQUEMENT du JSON valide, sans aucun texte avant ou après. 
Format attendu (un tableau d'objets) :
[
  { "front": "Question 1", "back": "Réponse 1" },
  { "front": "Question 2", "back": "Réponse 2" }
]

Voici le texte :
"""
${text}
"""`

  const responseText = await callClaudeAPI(prompt)

  try {
    // Astuce de pro : Claude aime parfois rajouter des blocs de code markdown (```json ... ```).
    // Cette petite ligne nettoie la réponse pour extraire uniquement le tableau JSON.
    const cleanJson = responseText.match(/\[[\s\S]*\]/)?.[0] || responseText
    
    return JSON.parse(cleanJson)
  } catch (error) {
    console.error("Erreur de parsing JSON pour les flashcards:", error)
    throw new Error("Claude n'a pas retourné un format valide.")
  }
}

// ==========================================
// 2. Générer un Résumé (Retourne du texte)
// ==========================================
export async function generateSummary(text: string): Promise<string> {
  const prompt = `Fais un résumé clair, structuré avec des tirets, et facile à lire du texte suivant :

"""
${text}
"""`

  return await callClaudeAPI(prompt)
}

// ==========================================
// 3. Générer un Quiz (Retourne du JSON)
// ==========================================
export async function generateQuiz(text: string) {
  const prompt = `Crée un quiz à choix multiples pour tester les connaissances sur le texte ci-dessous.

Tu dois retourner UNIQUEMENT du JSON valide, sans aucun texte avant ou après.
Format attendu :
[
  { 
    "question": "Ta question ici ?", 
    "options": ["A", "B", "C", "D"], 
    "correctIndex": 0
  }
]
correctIndex est l'index (0,1,2,3) de la bonne réponse dans le tableau options.

Voici le texte :
"""
${text}
"""`

  const responseText = await callClaudeAPI(prompt)

  try {
    // Même astuce de nettoyage pour le JSON du quiz
    const cleanJson = responseText.match(/\[[\s\S]*\]/)?.[0] || responseText
    return JSON.parse(cleanJson)
  } catch (error) {
    console.error("Erreur de parsing JSON pour le quiz:", error)
    throw new Error("Claude n'a pas retourné un format valide pour le quiz.")
  }
}
