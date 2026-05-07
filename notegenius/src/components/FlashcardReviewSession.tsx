import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useReviewSession } from '../hooks/useReviewSession'
import type { ReviewGrade } from '../types'

interface Props {
  noteId: string
}

export default function FlashcardReviewSession({ noteId }: Props) {
  const navigate = useNavigate()
  const {
    current,
    currentIndex,
    totalCards,
    correctCount,
    sessionState,
    startSession,
    submitGrade,
    resetSession
  } = useReviewSession(noteId)

  const [isFlipped, setIsFlipped] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)

  // ── Raccourcis clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (sessionState !== 'reviewing') return
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      setIsFlipped(prev => !prev)
    }
    if (!isFlipped) return
    if (e.key === '1') handleGrade(0)
    if (e.key === '2') handleGrade(1)
    if (e.key === '3') handleGrade(2)
  }, [sessionState, isFlipped])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  async function handleGrade(grade: ReviewGrade) {
    setIsFlipped(false)
    await new Promise(r => setTimeout(r, 300))
    await submitGrade(grade)
  }

  const progress = totalCards > 0 ? Math.round((currentIndex / totalCards) * 100) : 0
  const rate = totalCards > 0 ? Math.round((correctCount / Math.max(currentIndex, 1)) * 100) : 0

  // ── Loading
  if (sessionState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Idle (pas de cartes)
  if (sessionState === 'idle') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-6xl">
          {totalCards === 0 ? '📭' : '🎯'}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {totalCards === 0 ? 'Aucune flashcard' : `${totalCards} cartes à réviser`}
          </h2>
          <p className="text-gray-500">
            {totalCards === 0
              ? 'Uploadez un PDF dans vos matières pour commencer'
              : 'Prêt à réviser ?'}
          </p>
        </div>
        {totalCards > 0 ? (
          <button onClick={startSession}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg">
            🚀 Commencer ({totalCards} cartes)
          </button>
        ) : (
          <button onClick={() => navigate('/subjects')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90">
            📚 Mes matières
          </button>
        )}
      </div>
    )
  }

  // ── Terminé
  if (sessionState === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-950 flex flex-col items-center justify-center gap-8 p-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-8xl mb-4 text-center">
            {rate >= 80 ? '🏆' : rate >= 60 ? '⭐' : '💪'}
          </div>
        </motion.div>
        <div className="text-center text-white">
          <h2 className="text-3xl font-black mb-2">Session terminée !</h2>
          <p className="text-gray-400 text-lg">Excellent travail</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Cartes', value: totalCards },
            { label: 'Correctes', value: correctCount },
            { label: 'Taux', value: `${rate}%` },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <button onClick={resetSession}
            className="bg-white/10 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/20 border border-white/20">
            🔄 Recommencer
          </button>
          <button onClick={() => navigate('/subjects')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90">
            📚 Mes matières
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null

  // ── Session en cours
  return (
    <div className={`min-h-screen transition-all ${isFocusMode ? 'bg-slate-900' : 'bg-gray-50'} flex flex-col`}>

      {/* Header */}
      {!isFocusMode && (
        <div className="bg-white border-b border-gray-100 px-8 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/subjects')}
                className="text-gray-400 hover:text-gray-600 font-medium text-sm">
                ← Retour
              </button>
              <div className="text-sm font-medium text-gray-600">
                {currentIndex + 1} / {totalCards}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-500 font-bold">{correctCount} ✓</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{rate}% taux</span>
              </div>
              <button
                onClick={() => setIsFocusMode(true)}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200"
              >
                🎯 Focus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 h-1.5">
        <motion.div
          className="bg-gradient-to-r from-violet-600 to-purple-600 h-1.5"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Contenu */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">

        {isFocusMode && (
          <button onClick={() => setIsFocusMode(false)}
            className="absolute top-6 right-6 text-gray-500 hover:text-white text-sm bg-white/10 px-3 py-1.5 rounded-lg">
            ✕ Quitter focus
          </button>
        )}

        {/* Carte flip 3D */}
        <div
          onClick={() => !isFlipped && setIsFlipped(true)}
          className="cursor-pointer w-full max-w-2xl"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d', position: 'relative', height: '280px' }}
          >
            {/* Recto */}
            <div
              className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-10 text-center shadow-xl
                ${isFocusMode ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-100'}`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className={`text-xs font-bold uppercase tracking-widest mb-6 ${isFocusMode ? 'text-gray-400' : 'text-primary/60'}`}>
                Question
              </div>
              <p className={`text-2xl font-bold leading-relaxed ${isFocusMode ? 'text-white' : 'text-gray-800'}`}>
                {current.flashcard.front}
              </p>
              <p className={`mt-6 text-sm ${isFocusMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Cliquez ou ⬇️ pour révéler
              </p>
            </div>

            {/* Verso */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl flex flex-col items-center justify-center p-10 text-center shadow-xl"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-6">
                Réponse
              </div>
              <p className="text-2xl font-bold text-white leading-relaxed">
                {current.flashcard.back}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Boutons d'évaluation */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex gap-4 w-full max-w-2xl"
            >
              {[
                { grade: 0 as ReviewGrade, label: 'À revoir', emoji: '😰', key: '1', color: 'bg-red-500 hover:bg-red-600', desc: 'Je ne savais pas' },
                { grade: 1 as ReviewGrade, label: 'Difficile', emoji: '🤔', key: '2', color: 'bg-amber-500 hover:bg-amber-600', desc: 'Approximatif' },
                { grade: 2 as ReviewGrade, label: 'Facile', emoji: '😊', key: '3', color: 'bg-emerald-500 hover:bg-emerald-600', desc: 'Je savais !' },
              ].map(btn => (
                <button
                  key={btn.grade}
                  onClick={() => handleGrade(btn.grade)}
                  className={`flex-1 ${btn.color} text-white py-4 rounded-2xl font-bold transition-all hover:-translate-y-1 shadow-lg`}
                >
                  <div className="text-2xl mb-1">{btn.emoji}</div>
                  <div className="text-sm">{btn.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">[{btn.key}]</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Raccourcis */}
        {!isFocusMode && (
          <p className="text-xs text-gray-400">
            ⬇️ Retourner · 1 = À revoir · 2 = Difficile · 3 = Facile
          </p>
        )}
      </div>
    </div>
  )
}