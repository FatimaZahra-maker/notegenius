import CryptoJS from "crypto-js"

// La constante secrète pour chiffrer/déchiffrer
const SECRET = "notegenius-secret-2026"
// Le nom sous lequel la clé sera sauvegardée dans le navigateur
const STORAGE_KEY = "claude_api_key"

// ==========================================
// 1. Sauvegarder et chiffrer la clé
// ==========================================
export const saveApiKey = (apiKey: string): void => {
  // AES (Advanced Encryption Standard) est un algorithme de chiffrement très robuste
  const encrypted = CryptoJS.AES.encrypt(apiKey, SECRET).toString()
  localStorage.setItem(STORAGE_KEY, encrypted)
}

// ==========================================
// 2. Récupérer et déchiffrer la clé
// ==========================================
export const getApiKey = (): string | null => {
  const encrypted = localStorage.getItem(STORAGE_KEY)
  
  // Si rien n'est sauvegardé, on retourne null
  if (!encrypted) return null

  try {
    // On tente de déchiffrer
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET)
    const decryptedKey = bytes.toString(CryptoJS.enc.Utf8)
    
    // Si la clé déchiffrée est vide, c'est qu'il y a eu un problème (ex: le SECRET a changé)
    if (!decryptedKey) return null
    
    return decryptedKey
  } catch (error) {
    // Le bloc try/catch empêche l'application de planter si les données sont corrompues
    console.error("Erreur lors du déchiffrement de la clé API")
    return null
  }
}

// ==========================================
// 3. Supprimer la clé
// ==========================================
export const deleteApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

// ==========================================
// 4. Tester la clé avec un petit appel à Claude
// ==========================================
export const testApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // On fait un appel très basique à l'API d'Anthropic (Claude)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // Entête nécessaire car on appelle l'API directement depuis un navigateur (Front-end)
        "anthropic-dangerously-allow-browser": "true" 
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", // On utilise Haiku car c'est le modèle le plus rapide et le moins cher
        max_tokens: 10,
        messages: [{ role: "user", content: "Réponds juste 'OK' pour tester la connexion." }]
      })
    })

    // Si le statut HTTP est 200 (OK), la clé est valide
    return response.ok
  } catch (error) {
    console.error("Erreur de connexion à l'API Claude:", error)
    return false
  }

}
// ==========================================
// 5. Vérifier si une clé existe déjà
// ==========================================
export const hasApiKey = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null
}