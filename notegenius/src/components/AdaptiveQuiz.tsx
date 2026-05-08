import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuiz } from '../hooks/useQuiz'
import { getAllItems } from '../services/db'
import type { Note } from '../types'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function AdaptiveQuiz() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const noteIdFromUrl = searchParams.get('noteId')

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    results,
    score,
    quizState,
    error,
    startQuiz,
    submitAnswer,
    resetQuiz
  } = useQuiz()

  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string>(noteIdFromUrl || '')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Charger les matières disponibles
  useEffect(() => {
    getAllItems('notes').then(n => {
      setNotes(n)
      if (noteIdFromUrl) {
        setSelectedNoteId(noteIdFromUrl)
      } else if (n.length > 0 && !selectedNoteId) {
        setSelectedNoteId(n[0].id)
      }
    })
  }, [noteIdFromUrl])

  // Auto-start si noteId dans l'URL
  useEffect(() => {
    if (noteIdFromUrl && quizState === 'idle') {
      startQuiz(noteIdFromUrl)
    }
  }, [noteIdFromUrl])

  function handleAnswer(index: number) {
    if (selectedAnswer !== null || !currentQuestion) return
    setSelectedAnswer(index)
    setShowResult(true)

    // Si bonne réponse → passer automatiquement après 1.5s
    if (index === currentQuestion.correctIndex) {
      setTimeout(() => {
        submitAnswer(index)
        setSelectedAnswer(null)
        setShowResult(false)
      }, 1200)
    }
    // Si mauvaise réponse → l'utilisateur doit cliquer sur la bonne
  }

  function handleCorrectAfterWrong() {
    if (!currentQuestion) return
    submitAnswer(currentQuestion.correctIndex)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const progress = totalQuestions > 0
    ? Math.round(((currentIndex) / totalQuestions) * 100)
    : 0

  // ── IDLE : Sélection de matière
  if (quizState === 'idle') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📝</div>
            <h1 className="text-2xl font-black text-gray-900">Quiz Adaptatif</h1>
            <p className="text-gray-500 mt-2">
              L'IA génère des questions basées sur vos points faibles
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-600 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          {notes.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-500 mb-4">Aucune matière avec des flashcards.</p>
              <button
                onClick={() => navigate('/subjects')}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90"
              >
                📚 Créer une matière
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Choisir une matière
                </label>
                <select
                  value={selectedNoteId}
                  onChange={e => setSelectedNoteId(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-violet-500 font-medium"
                >
                  {notes.map(n => (
                    <option key={n.id} value={n.id}>{n.title}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => startQuiz(selectedNoteId)}
                disabled={!selectedNoteId}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-all hover:-translate-y-0.5"
              >
                🚀 Démarrer le quiz
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── LOADING
  if (quizState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">L'IA génère votre quiz...</p>
        <p className="text-gray-400 text-sm">Basé sur vos points faibles</p>
      </div>
    )
  }

  // ── FINISHED
  if (quizState === 'finished') {
    const rate = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
    const emoji = rate >= 80 ? '🏆' : rate >= 60 ? '⭐' : '💪'
    const message = rate >= 80 ? 'Excellent !' : rate >= 60 ? 'Bon travail !' : 'Continuez !'

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 w-full max-w-md text-center"
        >
          <div className="text-7xl mb-4">{emoji}</div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">{message}</h2>
          <p className="text-gray-500 mb-8">Quiz terminé</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Score', value: `${score}/${totalQuestions}` },
              { label: 'Taux', value: `${rate}%` },
              { label: 'Correctes', value: score },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-4">
                <p className="text-2xl font-black text-violet-600">{s.value}</p>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Détail des réponses */}
          <div className="flex flex-col gap-2 mb-8 text-left">
            {results.map((r, i) => (
              <div key={r.questionId} className={`flex items-center gap-3 p-3 rounded-xl text-sm
                ${r.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <span>{r.isCorrect ? '✅' : '❌'}</span>
                <span className="font-medium">Question {i + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetQuiz}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200"
            >
              🔄 Recommencer
            </button>
            <button
              onClick={() => navigate('/subjects')}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-2xl font-bold hover:opacity-90"
            >
              📚 Matières
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── PLAYING
  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header avec progression */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-600">
              Question {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-sm font-bold text-violet-600">
              {score} ✓ correct{score > 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-gradient-to-r from-violet-600 to-purple-600 h-2.5 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 mt-4"
          >
            <div className="text-xs font-black text-violet-400 uppercase tracking-widest mb-4">
              Question {currentIndex + 1}
            </div>
            <p className="text-xl font-bold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option, idx) => {
            let style = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-400 hover:bg-violet-50'

            if (showResult) {
              if (idx === currentQuestion.correctIndex) {
                style = 'bg-green-500 border-2 border-green-500 text-white'
              } else if (idx === selectedAnswer && idx !== currentQuestion.correctIndex) {
                style = 'bg-red-500 border-2 border-red-500 text-white'
              } else {
                style = 'bg-white border-2 border-gray-100 text-gray-400 opacity-60'
              }
            }

            const isDisabled = showResult && idx !== currentQuestion.correctIndex
            const isCorrectAfterWrong = showResult
              && selectedAnswer !== null
              && selectedAnswer !== currentQuestion.correctIndex
              && idx === currentQuestion.correctIndex

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => {
                  if (!showResult) {
                    handleAnswer(idx)
                  } else if (isCorrectAfterWrong) {
                    handleCorrectAfterWrong()
                  }
                }}
                disabled={isDisabled && !isCorrectAfterWrong}
                className={`${style} rounded-2xl p-4 text-left font-medium transition-all
                  ${isCorrectAfterWrong ? 'animate-pulse cursor-pointer' : ''}
                  ${!showResult ? 'hover:-translate-y-0.5 hover:shadow-md' : ''}
                  disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0
                    ${showResult && idx === currentQuestion.correctIndex ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                  {showResult && idx === currentQuestion.correctIndex && (
                    <span className="ml-auto">✓</span>
                  )}
                  {showResult && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                    <span className="ml-auto">✗</span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Message si mauvaise réponse */}
        <AnimatePresence>
          {showResult && selectedAnswer !== null && selectedAnswer !== currentQuestion.correctIndex && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center"
            >
              <p className="text-amber-700 font-bold text-sm">
                ❌ Mauvaise réponse — Cliquez sur la bonne réponse pour continuer
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}