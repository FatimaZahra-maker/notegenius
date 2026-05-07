// src/services/claude.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateFlashcards, generateQuiz, generateSummary } from "./gemini"

// ── Mock du module apiKey
vi.mock("./apiKey", () => ({
  getApiKey: vi.fn(() => "test-api-key-mock")
}))

// ── Réponses mock valides
const MOCK_FLASHCARDS_RESPONSE = JSON.stringify([
  { front: "Qu'est-ce que la photosynthèse ?", back: "Processus de conversion de la lumière en énergie." },
  { front: "Où se déroule la photosynthèse ?", back: "Dans les chloroplastes des cellules végétales." }
])

const MOCK_QUIZ_RESPONSE = JSON.stringify([
  {
    question: "Où se déroule la photosynthèse ?",
    options: ["Mitochondrie", "Chloroplaste", "Noyau", "Ribosome"],
    correctIndex: 1
  }
])

const MOCK_SUMMARY_RESPONSE = "## Photosynthèse\n- Conversion lumière → énergie\n- Lieu : chloroplastes"

// ── Helper : mock fetch global
const mockFetch = (responseText: string, ok = true) => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue({
      content: [{ text: responseText }],
      error: ok ? undefined : { message: "Erreur mock" }
    })
  })
}

// ══════════════════════════════════════════
// Tests generateFlashcards
// ══════════════════════════════════════════
describe("generateFlashcards", () => {
  beforeEach(() => vi.clearAllMocks())

  it("retourne un tableau de flashcards valide", async () => {
    mockFetch(MOCK_FLASHCARDS_RESPONSE)
    const result = await generateFlashcards("La photosynthèse est un processus...")
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty("front")
    expect(result[0]).toHaveProperty("back")
  })

  it("parse correctement le JSON même avec des backticks markdown", async () => {
    const withMarkdown = "```json\n" + MOCK_FLASHCARDS_RESPONSE + "\n```"
    mockFetch(withMarkdown)
    const result = await generateFlashcards("texte test")
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
  })

  it("lève une erreur si la réponse API est invalide (ok: false)", async () => {
    mockFetch("", false)
    await expect(generateFlashcards("texte")).rejects.toThrow("Erreur API")
  })

  it("lève une erreur si le JSON est malformé", async () => {
    mockFetch("ceci n'est pas du JSON valide")
    await expect(generateFlashcards("texte")).rejects.toThrow("Claude n'a pas retourné un format valide")
  })

  it("envoie la clé API dans les headers", async () => {
    mockFetch(MOCK_FLASHCARDS_RESPONSE)
    await generateFlashcards("texte test")
    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const headers = fetchCall[1].headers
    expect(headers["x-api-key"]).toBe("test-api-key-mock")
  })
})

// ══════════════════════════════════════════
// Tests generateQuiz
// ══════════════════════════════════════════
describe("generateQuiz", () => {
  beforeEach(() => vi.clearAllMocks())

  it("retourne un tableau de questions valide", async () => {
    mockFetch(MOCK_QUIZ_RESPONSE)
    const result = await generateQuiz("La photosynthèse...")
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toHaveProperty("question")
    expect(result[0]).toHaveProperty("options")
    expect(result[0]).toHaveProperty("correctIndex")
  })

  it("chaque question a exactement 4 options", async () => {
    mockFetch(MOCK_QUIZ_RESPONSE)
    const result = await generateQuiz("texte test")
    expect(result[0].options).toHaveLength(4)
  })

  it("correctIndex est un nombre entre 0 et 3", async () => {
    mockFetch(MOCK_QUIZ_RESPONSE)
    const result = await generateQuiz("texte test")
    expect(result[0].correctIndex).toBeGreaterThanOrEqual(0)
    expect(result[0].correctIndex).toBeLessThanOrEqual(3)
  })

  it("lève une erreur si JSON malformé", async () => {
    mockFetch("réponse invalide sans JSON")
    await expect(generateQuiz("texte")).rejects.toThrow("Claude n'a pas retourné un format valide pour le quiz")
  })
})

// ══════════════════════════════════════════
// Tests generateSummary
// ══════════════════════════════════════════
describe("generateSummary", () => {
  beforeEach(() => vi.clearAllMocks())

  it("retourne une chaîne de caractères non vide", async () => {
    mockFetch(MOCK_SUMMARY_RESPONSE)
    const result = await generateSummary("La photosynthèse...")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  it("retourne exactement le texte de la réponse Claude", async () => {
    mockFetch(MOCK_SUMMARY_RESPONSE)
    const result = await generateSummary("texte test")
    expect(result).toBe(MOCK_SUMMARY_RESPONSE)
  })

  it("lève une erreur si la clé API est absente", async () => {
    const { getApiKey } = await import("./apiKey")
    vi.mocked(getApiKey).mockReturnValueOnce(null)
    await expect(generateSummary("texte")).rejects.toThrow("Clé API introuvable")
  })
})