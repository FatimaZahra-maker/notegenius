import { describe, it, expect } from "vitest"
import type { SM2Card } from "../types"
import { calculateSM2, createInitialSM2Data } from "./sm2"

describe("Algorithme SM-2", () => {

  // ==========================================
  // Cas 7 : Test de l'initialisation
  // ==========================================
  it("createInitialSM2Data doit retourner efactor = 2.5 et repetition = 0", () => {
    const card = createInitialSM2Data("flashcard_123");
    
    expect(card.efactor).toBe(2.5);
    expect(card.repetition).toBe(0);
    expect(card.interval).toBe(0);
    expect(card.flashcardId).toBe("flashcard_123");
  });

  // ==========================================
  // Cas 1 & 2 : L'utilisateur a oublié ou eu du mal
  // ==========================================
  it("Si grade = 0 → interval doit être 1 et repetition doit être 0", () => {
    // On simule une carte qui était déjà bien avancée (repetition = 5)
    const card: SM2Card = { ...createInitialSM2Data("f1"), repetition: 5, interval: 14 };
    const result = calculateSM2(card, 0);
    
    expect(result.interval).toBe(1);
    expect(result.repetition).toBe(0);
  });

  it("Si grade = 1 → interval doit être 1 et repetition doit être 0", () => {
    const card: SM2Card = { ...createInitialSM2Data("f1"), repetition: 3, interval: 6 };
    const result = calculateSM2(card, 1);
    
    expect(result.interval).toBe(1);
    expect(result.repetition).toBe(0);
  });

  // ==========================================
  // Cas 3, 4 & 5 : L'utilisateur trouve ça facile (progression)
  // ==========================================
  it("Si grade = 2 première fois → interval doit être 1 et repetition doit être 1", () => {
    const card = createInitialSM2Data("f1"); // repetition = 0 par défaut
    const result = calculateSM2(card, 2);
    
    expect(result.interval).toBe(1);
    expect(result.repetition).toBe(1);
  });

  it("Si grade = 2 deuxième fois → interval doit être 6 et repetition doit être 2", () => {
    // On simule une carte qui a déjà été réussie une fois
    const card: SM2Card = { ...createInitialSM2Data("f1"), repetition: 1, interval: 1 };
    const result = calculateSM2(card, 2);
    
    expect(result.interval).toBe(6);
    expect(result.repetition).toBe(2);
  });

  it("Si grade = 2 troisième fois → interval doit être arrondi de interval × efactor", () => {
    // On simule une carte réussie 2 fois. efactor par défaut = 2.5
    const card: SM2Card = { ...createInitialSM2Data("f1"), repetition: 2, interval: 6, efactor: 2.5 };
    const result = calculateSM2(card, 2);
    
    // 6 * 2.5 = 15
    expect(result.interval).toBe(15); 
    expect(result.repetition).toBe(3);
  });

  // ==========================================
  // Cas 6 : La limite stricte du facteur d'aisance
  // ==========================================
  it("efactor ne doit jamais descendre en dessous de 1.3", () => {
    // On crée une carte qui a déjà un efactor très bas
    const card: SM2Card = { ...createInitialSM2Data("f1"), efactor: 1.35 };
    
    // Si on met un grade de 0, la formule mathématique voudrait descendre l'efactor d'environ -0.8
    // Ce qui donnerait 0.55. Mais notre règle dit qu'il doit être bloqué à 1.3.
    const result = calculateSM2(card, 0);
    
    expect(result.efactor).toBe(1.3);
  });

});