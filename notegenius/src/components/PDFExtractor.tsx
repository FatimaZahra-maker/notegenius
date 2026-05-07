import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { generateFlashcards, generateQuiz, generateSummary } from '../services/gemini'
import { saveItem } from '../services/db'
import { createInitialSM2Data } from '../algorithms/sm2'
import type { Flashcard, QuizQuestion } from '../types'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

type Mode = 'flashcards' | 'quiz' | 'summary' | null
type Status = 'idle' | 'extracting' | 'generating' | 'done' | 'error'

export default function PDFExtractor() {
  const [progress, setProgress] = useState(0)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [manualText, setManualText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [mode, setMode] = useState<Mode>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [summary, setSummary] = useState<string | null>(null)

  const finalText = extractedText || manualText

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setExtractedText(null)
    setError(null)
    setStatus('extracting')
    setProgress(0)
    setFlashcards([])
    setQuizQuestions([])
    setSummary(null)
    setMode(null)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const totalPages = pdf.numPages
      let fullText = ''
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
        fullText += pageText + '\n'
        setProgress(Math.round((i / totalPages) * 100))
      }
      setExtractedText(fullText.trim())
      setStatus('idle')
    } catch {
      setError('❌ Erreur lors de la lecture du PDF.')
      setStatus('error')
    }
  }

  async function handleGenerate(selectedMode: Mode) {
    if (!finalText.trim()) {
      setError('❌ Veuillez uploader un PDF ou saisir du texte.')
      return
    }
    setMode(selectedMode)
    setError(null)
    setStatus('generating')
    setFlashcards([])
    setQuizQuestions([])
    setSummary(null)
    try {
      if (selectedMode === 'flashcards') {
        const generated = await generateFlashcards(finalText)
        const noteId = crypto.randomUUID()
        const cards: Flashcard[] = generated.map((g: { front: string; back: string }) => ({
          id: crypto.randomUUID(),
          noteId,
          front: g.front,
          back: g.back,
          createdAt: Date.now()
        }))
        await Promise.all(cards.map(card => saveItem('flashcards', card)))
        await Promise.all(cards.map(card =>
          saveItem('sm2cards', createInitialSM2Data(card.id))
        ))
        setFlashcards(cards)
      } else if (selectedMode === 'quiz') {
        const generated = await generateQuiz(finalText)
        const questions: QuizQuestion[] = generated.map((q: QuizQuestion) => ({
          ...q,
          id: crypto.randomUUID()
        }))
        setQuizQuestions(questions)
      } else if (selectedMode === 'summary') {
        const result = await generateSummary(finalText)
        setSummary(result)
      }
      setStatus('done')
    } catch {
      setError('❌ Erreur de génération. Réessayez.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-dark">
            Traitement de Notes
            <span className="ml-2 text-2xl">📄</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Uploadez un PDF ou saisissez du texte — l'IA génère vos ressources
          </p>
        </div>

        {/* Zone input */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📂 Uploader un PDF
              </label>
              <label className="cursor-pointer block">
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
                  ${fileName
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}>
                  {status === 'extracting' ? (
                    <div>
                      <p className="text-primary font-medium mb-3">
                        ⏳ Extraction... {progress}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : fileName ? (
                    <div>
                      <p className="text-2xl mb-2">✅</p>
                      <p className="text-primary font-bold text-sm">{fileName}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {extractedText?.length.toLocaleString()} caractères
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl mb-2">📂</p>
                      <p className="text-gray-500 text-sm">Cliquez ou glissez</p>
                      <p className="text-gray-400 text-xs mt-1">PDF uniquement</p>
                    </div>
                  )}
                </div>
                <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
              </label>
            </div>

            {/* Texte manuel */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                ✏️ Ou saisissez votre texte
              </label>
              <textarea
                value={manualText}
                onChange={e => {
                  setManualText(e.target.value)
                  setExtractedText(null)
                  setFileName(null)
                }}
                placeholder="Collez votre cours ici..."
                className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-primary text-sm"
              />
              {manualText && (
                <p className="text-xs text-gray-400 mt-1">
                  {manualText.length.toLocaleString()} caractères
                </p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Boutons génération */}
        {finalText.trim() && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-sm font-bold text-gray-700 mb-4">
              🤖 Que voulez-vous générer ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: 'flashcards' as Mode,
                  icon: '🃏',
                  title: 'Flashcards',
                  desc: 'Cartes question/réponse',
                  color: 'from-violet-500 to-purple-600'
                },
                {
                  key: 'quiz' as Mode,
                  icon: '📝',
                  title: 'Quiz QCM',
                  desc: 'Questions à choix multiples',
                  color: 'from-cyan-500 to-blue-600'
                },
                {
                  key: 'summary' as Mode,
                  icon: '📋',
                  title: 'Résumé',
                  desc: 'Synthèse structurée',
                  color: 'from-emerald-500 to-green-600'
                }
              ].map(btn => (
                <button
                  key={btn.key}
                  onClick={() => handleGenerate(btn.key)}
                  disabled={status === 'generating' || status === 'extracting'}
                  className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all
                    hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    bg-white border-2 border-gray-100 hover:border-primary/30`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${btn.color} mb-3`}>
                    <span className="text-xl">{btn.icon}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{btn.title}</h3>
                  <p className="text-xs text-gray-500">{btn.desc}</p>
                  {mode === btn.key && status === 'generating' && (
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center rounded-2xl">
                      <p className="text-primary font-bold text-sm">⏳ Génération...</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Résultats Flashcards */}
        {flashcards.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">
                🃏 {flashcards.length} Flashcards générées
              </h2>
              <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full">
                ✅ Sauvegardées
              </span>
            </div>
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {flashcards.map((card, i) => (
                <div key={card.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex gap-3">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg h-fit">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm mb-1">❓ {card.front}</p>
                      <p className="text-gray-500 text-sm">💡 {card.back}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résultats Quiz */}
        {quizQuestions.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">
              📝 {quizQuestions.length} Questions générées
            </h2>
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
              {quizQuestions.map((q, i) => (
                <div key={q.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-medium text-gray-800 text-sm mb-3">
                    {i + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs font-medium
                          ${idx === q.correctIndex
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-white text-gray-600 border border-gray-200'}`}
                      >
                        {idx === q.correctIndex ? '✅ ' : ''}{option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résumé */}
        {summary && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4">📋 Résumé généré</h2>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {summary}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}