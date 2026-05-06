import { useQuiz } from '../hooks/useQuiz'

export default function AdaptiveQuiz() {
  const noteId = 'default-note'
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    quizState,
    error,
    startQuiz,
    submitAnswer,
    resetQuiz
  } = useQuiz(noteId)

  // ── Idle
  if (quizState === 'idle') {
    return (
      <div className="p-8 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-primary">Quiz adaptatif 📝</h1>
        <p className="text-gray-500 text-center max-w-md">
          Claude va générer un quiz basé sur vos points faibles !
        </p>
        {error && <p className="text-red-500">{error}</p>}
        <button
          onClick={startQuiz}
          className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-80"
        >
          🚀 Démarrer le quiz
        </button>
      </div>
    )
  }

  // ── Chargement
  if (quizState === 'loading') {
    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-primary">Quiz 📝</h1>
        <p className="text-gray-500">⏳ Claude génère votre quiz...</p>
      </div>
    )
  }

  // ── Terminé
  if (quizState === 'finished') {
    return (
      <div className="p-8 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-primary">Résultat 🎉</h1>
        <p className="text-5xl font-bold text-primary">
          {score} / {totalQuestions}
        </p>
        <button
          onClick={resetQuiz}
          className="mt-4 bg-primary text-white px-6 py-3 rounded-xl hover:opacity-80"
        >
          🔄 Recommencer
        </button>
      </div>
    )
  }

  // ── En cours
  if (!currentQuestion) return null

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">Quiz 📝</h1>

      <div className="bg-secondary rounded-2xl p-6 mb-6">
        <p className="text-lg font-semibold text-gray-700">
          {currentQuestion.question}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => submitAnswer(index)}
            className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left font-medium hover:border-primary hover:bg-secondary transition-all"
          >
            {option}
          </button>
        ))}
      </div>

      <p className="text-gray-400 mt-6 text-sm text-center">
        Question {currentIndex + 1} / {totalQuestions}
      </p>
    </div>
  )
}