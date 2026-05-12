import { useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { motion, AnimatePresence } from 'framer-motion'
import { generateFlashcards, generateQuiz } from '../services/ai'
import { createAndSaveSummary } from '../services/summaryService'
import { saveItem } from '../services/db'
import { createInitialSM2Data } from '../algorithms/sm2'
import type { Flashcard, QuizQuestion, Note } from '../types'
import FileUploader from './FileUploader'
import toast from 'react-hot-toast'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

type Mode = 'flashcards' | 'quiz' | 'summary' | null
type Status = 'idle' | 'extracting' | 'generating' | 'done' | 'error'

export default function PDFExtractor() {
  const [extractProgress, setExtractProgress] = useState(0)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [manualText, setManualText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [mode, setMode] = useState<Mode>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const finalText = extractedText || manualText

  // ── Traitement du fichier depuis FileUploader
  const handleFile = useCallback(async (file: File, text: string) => {
    setFileName(file.name)
    setExtractedText(null)
    setManualText('')
    setError(null)
    setFlashcards([])
    setQuizQuestions([])
    setSummary(null)
    setMode(null)

    if (file.name.endsWith('.txt') && text) {
      setExtractedText(text)
      setStatus('idle')
      return
    }

    // Extraction PDF
    setIsExtracting(true)
    setStatus('extracting')
    setExtractProgress(0)

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
        setExtractProgress(Math.round((i / totalPages) * 100))
      }

      setExtractedText(fullText.trim())
      setStatus('idle')
    } catch {
      setError('Erreur lors de la lecture du PDF.')
      setStatus('error')
    } finally {
      setIsExtracting(false)
    }
  }, [])

  // ── Génération IA
  const handleGenerate = useCallback(async (selectedMode: Mode) => {
    if (!finalText.trim()) {
      setError('Veuillez uploader un fichier ou saisir du texte.')
      return
    }
    setMode(selectedMode)
    setError(null)
    setStatus('generating')
    setFlashcards([])
    setQuizQuestions([])
    setSummary(null)

    const toastId = toast.loading(
      selectedMode === 'flashcards' ? '🃏 Génération des flashcards...'
      : selectedMode === 'quiz' ? '📝 Génération du quiz...'
      : '📋 Génération du résumé...'
    )

    try {
      if (selectedMode === 'flashcards') {
        const generated = await generateFlashcards(finalText)
        const noteId = crypto.randomUUID()

        const note: Note = {
          id: noteId,
          title: fileName
            ? fileName.replace(/\.(pdf|txt)$/i, '')
            : 'Note sans titre',
          description: `Importé depuis ${fileName || 'texte saisi'}`,
          color: 'from-violet-500 to-purple-600',
          content: finalText.slice(0, 500),
          createdAt: Date.now(),
          updatedAt: Date.now()
        }

        await saveItem('notes', note)

        const cards: Flashcard[] = generated.map((g: { front: string; back: string }) => ({
          id: crypto.randomUUID(),
          noteId,
          front: g.front,
          back: g.back,
          createdAt: Date.now()
        }))

        await Promise.all(cards.map(c => saveItem('flashcards', c)))
        await Promise.all(cards.map(c => saveItem('sm2cards', createInitialSM2Data(c.id))))
        setFlashcards(cards)
        toast.success(`✅ ${cards.length} flashcards créées et sauvegardées !`, { id: toastId })

      } else if (selectedMode === 'quiz') {
        const generated = await generateQuiz(finalText)
        const questions: QuizQuestion[] = generated.map((q: QuizQuestion) => ({
          ...q,
          id: crypto.randomUUID()
        }))
        setQuizQuestions(questions)
        toast.success(`✅ ${questions.length} questions générées !`, { id: toastId })

      } else if (selectedMode === 'summary') {
        const noteTitle = fileName
          ? fileName.replace(/\.(pdf|txt)$/i, '')
          : 'Résumé sans titre'
        const savedSummary = await createAndSaveSummary(
          crypto.randomUUID(),
          noteTitle,
          finalText
        )
        setSummary(savedSummary.content)
        toast.success('✅ Résumé généré et sauvegardé !', { id: toastId })
      }

      setStatus('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de génération. Réessayez.'
      setError(msg)
      setStatus('error')
      toast.error(msg, { id: toastId })
    }
  }, [finalText, fileName])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Traitement de Notes 📄
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Uploadez un PDF ou saisissez du texte — l'IA génère vos ressources
          </p>
        </div>

        {/* Zone input */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 mb-6 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                📂 Uploader un fichier
              </label>
              <FileUploader
                onFile={handleFile}
                isLoading={isExtracting}
                maxSizeMB={20}
              />

              {/* Barre de progression extraction */}
              <AnimatePresence>
                {isExtracting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                      <span>Extraction PDF...</span>
                      <span>{extractProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <motion.div
                        className="bg-violet-600 h-2 rounded-full"
                        animate={{ width: `${extractProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info texte extrait */}
              {extractedText && !isExtracting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400"
                >
                  <span>✓</span>
                  <span>{extractedText.length.toLocaleString()} caractères extraits</span>
                </motion.div>
              )}
            </div>

            {/* Texte manuel */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                ✏️ Ou collez votre texte
              </label>
              <textarea
                value={manualText}
                onChange={e => {
                  setManualText(e.target.value)
                  setExtractedText(null)
                  setFileName(null)
                }}
                placeholder="Collez votre cours ici..."
                className="w-full h-40 p-4 border-2 border-gray-200 dark:border-slate-700 rounded-xl resize-none
                  focus:outline-none focus:border-violet-500 dark:focus:border-violet-500
                  bg-white dark:bg-slate-800 text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  text-sm transition-colors duration-200"
              />
              {manualText && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {manualText.length.toLocaleString()} caractères
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Erreur globale */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-6"
            >
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">❌ {error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons génération */}
        <AnimatePresence>
          {finalText.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 mb-6 transition-colors duration-300"
            >
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                🤖 Que voulez-vous générer ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'flashcards' as Mode, icon: '🃏', title: 'Flashcards', desc: 'Cartes Q/R sauvegardées dans vos matières', color: 'from-violet-500 to-purple-600' },
                  { key: 'quiz' as Mode, icon: '📝', title: 'Quiz QCM', desc: 'Questions à choix multiples', color: 'from-cyan-500 to-blue-600' },
                  { key: 'summary' as Mode, icon: '📋', title: 'Résumé', desc: 'Synthèse structurée et sauvegardée', color: 'from-emerald-500 to-green-600' }
                ].map(btn => (
                  <motion.button
                    key={btn.key}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerate(btn.key)}
                    disabled={status === 'generating' || isExtracting}
                    className="relative overflow-hidden rounded-2xl p-5 text-left
                      bg-white dark:bg-slate-800
                      border-2 border-gray-100 dark:border-slate-700
                      hover:border-violet-400 dark:hover:border-violet-500
                      shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200"
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${btn.color} mb-3 shadow-sm`}>
                      <span className="text-xl">{btn.icon}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-1">{btn.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{btn.desc}</p>

                    {mode === btn.key && status === 'generating' && (
                      <div className="absolute inset-0 bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                          <p className="text-violet-600 dark:text-violet-400 font-bold text-sm">Génération...</p>
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Succès flashcards */}
        <AnimatePresence>
          {status === 'done' && mode === 'flashcards' && flashcards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center justify-between"
            >
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                ✅ Matière créée avec {flashcards.length} flashcards !
              </p>
              <a href="/subjects"
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
                Voir mes matières →
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Résultats Flashcards */}
        <AnimatePresence>
          {flashcards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 mb-6 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 dark:text-white">🃏 {flashcards.length} Flashcards</h2>
                <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                  ✅ Sauvegardées
                </span>
              </div>
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                {flashcards.map((card, i) => (
                  <div key={card.id} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                    <div className="flex gap-3">
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/20 px-2 py-1 rounded-lg h-fit flex-shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white text-sm mb-1">❓ {card.front}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">💡 {card.back}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Résultats Quiz */}
        <AnimatePresence>
          {quizQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 mb-6 transition-colors duration-300"
            >
              <h2 className="font-bold text-gray-800 dark:text-white mb-4">📝 {quizQuestions.length} Questions</h2>
              <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                {quizQuestions.map((q, i) => (
                  <div key={q.id} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                    <p className="font-medium text-gray-800 dark:text-white text-sm mb-3">{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((option, idx) => (
                        <div key={idx} className={`p-2 rounded-lg text-xs font-medium
                          ${idx === q.correctIndex
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                            : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600'}`}>
                          {idx === q.correctIndex ? '✅ ' : ''}{option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Résumé */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800 dark:text-white">📋 Résumé généré</h2>
                <a href="/summaries"
                  className="text-violet-600 dark:text-violet-400 text-sm font-bold hover:underline">
                  Voir tous mes résumés →
                </a>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border border-gray-100 dark:border-slate-700">
                {summary}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}