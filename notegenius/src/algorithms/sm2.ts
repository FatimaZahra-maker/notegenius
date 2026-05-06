// On définit les notes possibles pour éviter les erreurs
import type { SM2Card, ReviewGrade } from "../types"

// La fonction mathématique principale
export function calculateSM2(card: SM2Card, grade: ReviewGrade): SM2Card {
  let { interval, repetition, efactor } = card;

  // 1. Calcul de l'intervalle et de la répétition EN PREMIER
  if (grade === 0 || grade === 1) {
    repetition = 0;
    interval = 1;
  } else if (grade === 2) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      // ✅ Utilise l'ancien efactor (pas encore modifié)
      interval = Math.round(interval * efactor); // 6 * 2.5 = 15 ✅
    }
    repetition += 1;
  }

  // 2. Mise à jour de l'efactor APRÈS le calcul de l'intervalle
  efactor = efactor + (0.1 - (2 - grade) * (0.08 + (2 - grade) * 0.02));
  if (efactor < 1.3) {
    efactor = 1.3;
  }

  const now = Date.now();
  const MS_IN_A_DAY = 86400000;

  return {
    ...card,
    interval,
    repetition,
    efactor,
    lastReview: now,
    nextReview: now + (interval * MS_IN_A_DAY)
  };
}

// Fonction utilitaire pour générer une nouvelle carte SM2 par défaut 
// (utile quand on crée une flashcard pour la première fois)
export function createInitialSM2Data(flashcardId: string): SM2Card {
  return {
    flashcardId,
    interval: 0,
    repetition: 0,
    efactor: 2.5, // Valeur de départ standard de l'algorithme SM-2
    nextReview: Date.now(), // À réviser immédiatement
    lastReview: Date.now()
  };
}