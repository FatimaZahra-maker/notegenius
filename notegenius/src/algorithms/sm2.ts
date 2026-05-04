// On définit les notes possibles pour éviter les erreurs
import type { SM2Card, ReviewGrade } from "../types"

// La fonction mathématique principale
export function calculateSM2(card: SM2Card, grade: ReviewGrade): SM2Card {
  // On extrait les valeurs actuelles pour travailler avec
  let { interval, repetition, efactor } = card;

  // 1. Calcul du nouvel efactor
  // La formule mathématique ajustée en fonction de la note (grade)
  efactor = efactor + (0.1 - (2 - grade) * (0.08 + (2 - grade) * 0.02));
  
  // Règle stricte : le facteur d'aisance ne doit jamais être inférieur à 1.3
  if (efactor < 1.3) {
    efactor = 1.3;
  }

  // 2. Calcul de l'intervalle et de la répétition
  if (grade === 0 || grade === 1) {
    // Si l'utilisateur a oublié (0) ou eu du mal (1), on réinitialise le cycle
    repetition = 0;
    interval = 1;
  } else if (grade === 2) {
    // Si c'est facile (2), on avance dans la courbe de mémorisation
    if (repetition === 0) {
      interval = 1; // Première réussite
    } else if (repetition === 1) {
      interval = 6; // Deuxième réussite
    } else {
      // Les fois suivantes, on multiplie l'intervalle précédent par le facteur d'aisance
      // On utilise Math.round pour s'assurer d'avoir des jours entiers
      interval = Math.round(interval * efactor);
    }
    // On incrémente le compteur de répétitions réussies
    repetition += 1;
  }

  // 3. Calcul des nouvelles dates
  const now = Date.now();
  const MS_IN_A_DAY = 86400000; // 24h * 60m * 60s * 1000ms

  // On retourne un nouvel objet contenant la carte mise à jour
  return {
    ...card, // Garde les informations existantes (flashcardId, etc.)
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