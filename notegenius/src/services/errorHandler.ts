// src/services/errorHandler.ts

// ── Types d'erreurs Claude API
export type ClaudeErrorType =
  | "AUTH_ERROR"        // Clé API invalide
  | "RATE_LIMIT"        // Trop de requêtes
  | "TIMEOUT"           // Délai dépassé
  | "INVALID_JSON"      // Réponse mal formée
  | "NETWORK_ERROR"     // Pas de connexion
  | "UNKNOWN"           // Erreur inconnue

export interface ClaudeError {
  type: ClaudeErrorType
  message: string       // Message lisible pour l'utilisateur
  retryable: boolean    // Peut-on réessayer automatiquement ?
  originalError?: unknown
}

// ── Messages utilisateur par type d'erreur
const ERROR_MESSAGES: Record<ClaudeErrorType, string> = {
  AUTH_ERROR: "Clé API invalide. Vérifiez votre clé dans les paramètres.",
  RATE_LIMIT: "Trop de requêtes. Patientez quelques secondes avant de réessayer.",
  TIMEOUT: "La requête a pris trop de temps. Vérifiez votre connexion.",
  INVALID_JSON: "La réponse de Claude était malformée. Réessayez.",
  NETWORK_ERROR: "Impossible de contacter Claude. Vérifiez votre connexion internet.",
  UNKNOWN: "Une erreur inattendue s'est produite. Réessayez."
}

// ── Classifier une erreur brute en ClaudeError
export const classifyError = (error: unknown): ClaudeError => {
  // Erreur réseau (fetch échoué)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      type: "NETWORK_ERROR",
      message: ERROR_MESSAGES.NETWORK_ERROR,
      retryable: true,
      originalError: error
    }
  }

  // Erreur avec message texte
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()

    if (msg.includes("401") || msg.includes("invalid api key") || msg.includes("authentication")) {
      return {
        type: "AUTH_ERROR",
        message: ERROR_MESSAGES.AUTH_ERROR,
        retryable: false,
        originalError: error
      }
    }

    if (msg.includes("429") || msg.includes("rate limit")) {
      return {
        type: "RATE_LIMIT",
        message: ERROR_MESSAGES.RATE_LIMIT,
        retryable: true,
        originalError: error
      }
    }

    if (msg.includes("timeout") || msg.includes("aborted")) {
      return {
        type: "TIMEOUT",
        message: ERROR_MESSAGES.TIMEOUT,
        retryable: true,
        originalError: error
      }
    }

    if (msg.includes("json") || msg.includes("parse") || msg.includes("valide")) {
      return {
        type: "INVALID_JSON",
        message: ERROR_MESSAGES.INVALID_JSON,
        retryable: true,
        originalError: error
      }
    }
  }

  return {
    type: "UNKNOWN",
    message: ERROR_MESSAGES.UNKNOWN,
    retryable: true,
    originalError: error
  }
}

// ── Wrapper avec retry automatique pour les erreurs retryable
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1500
): Promise<T> => {
  let lastError: ClaudeError = {
    type: "UNKNOWN",
    message: ERROR_MESSAGES.UNKNOWN,
    retryable: false
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = classifyError(error)

      // Si l'erreur n'est pas retryable (ex: clé invalide) → on arrête immédiatement
      if (!lastError.retryable) break

      // Si c'est le dernier essai → on arrête
      if (attempt === maxRetries) break

      // Attendre avant de réessayer (délai exponentiel)
      await sleep(delayMs * (attempt + 1))
    }
  }

  throw lastError
}

// ── Wrapper avec timeout configurable
export const withTimeout = <T>(
  fn: () => Promise<T>,
  timeoutMs: number = 15000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    fn()
      .then(result => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch(error => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

// ── Utilitaire sleep
const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))