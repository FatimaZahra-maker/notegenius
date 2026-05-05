import { useState } from 'react'
import type { QuizQuestion } from '../types'

const sampleQuestions: QuizQuestion[] = [
  {
    id: '1',
    flashcardId: '1',
    question: 'C\'est quoi React?',
    options: ['Un framework CSS', 'Une bibliothèque JavaScript', 'Un langage de programmation', 'Un serveur web'],
    correctIndex: 1
  },
  {
    id: '2',
    flashcardId: '2',
    question: 'C\'est quoi TypeScript?',
    options: ['Un framework React', 'Un langage de style', 'JavaScript avec des types', 'Une base de données'],
    correctIndex: 2
  },
  {
    id: '3',
    flashcardId: '3',
    question: 'C\'est quoi Tailwind?',
    options: ['Un framework CSS utility-first', 'Une bibliothèque JavaScript', 'Un outil de test', 'Un serveur'],
    correctIndex: 0
  },
]

export default function AdaptiveQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = sampleQuestions[currentIndex]

  function handleAnswer(index: number) {
    if (selected !== null) return
    setSelected(index)
    if (index === question.correctIndex) setScore(score + 1)
    setTimeout(() => {
      if (currentIndex + 1 >= sampleQuestions.length) {
        setFinished(true)
      } else {
        setCurrentIndex(currentIndex + 1)
        setSelected(null)
      }
    }, 1000)
  }

  if (finished) {
    return (
      <div className="p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Résultat 🎉</h1>
        <p className="text-4xl font-bold text-primary">{score} / {sampleQuestions.length}</p>
        <button
          onClick={() => { setCurrentIndex(0); setScore(0); setSelected(null); setFinished(false) }}
          className="mt-8 bg-primary text-white px-6 py-3 rounded-xl hover:opacity-80"
        >
          Recommencer
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">Quiz 📝</h1>

      <div className="bg-secondary rounded-2xl p-6 mb-6">
        <p className="text-lg font-semibold text-gray-700">{question.question}</p>
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((option, index) => {
          let style = 'bg-white border-2 border-gray-200'
          if (selected !== null) {
            if (index === question.correctIndex) style = 'bg-easy text-white border-easy'
            else if (index === selected) style = 'bg-hard text-white border-hard'
          }
          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`${style} rounded-xl p-4 text-left font-medium transition-all hover:opacity-80`}
            >
              {option}
            </button>
          )
        })}
      </div>

      <p className="text-gray-400 mt-6 text-sm text-center">
        Question {currentIndex + 1} / {sampleQuestions.length}
      </p>
    </div>
  )
}