'use client'

import { useState } from 'react'

interface Exercise {
  question: string
  correctAnswer: string
  options: string[]
  hint: string | null
  explanation: string | null
}

interface TypingProps {
  exercise: Exercise
  onAnswer: (isCorrect: boolean) => void
}

export default function Typing({ exercise, onAnswer }: TypingProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (showFeedback) return

    const correct = userAnswer.trim().toLowerCase() === exercise.correctAnswer.toLowerCase()
    setIsCorrect(correct)
    setShowFeedback(true)

    setTimeout(() => {
      onAnswer(correct)
      setShowFeedback(false)
      setUserAnswer('')
      setShowHint(false)
    }, 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        {exercise.question}
      </h3>

      {exercise.hint && (
        <div className="mb-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showHint ? '− Hide hint' : '💡 Show hint'}
          </button>
          {showHint && (
            <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">
              {exercise.hint}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showFeedback}
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg transition-all
              ${showFeedback
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }
            `}
            placeholder="Type your answer..."
            autoFocus
          />
        </div>

        {showFeedback && (
          <div className={`mb-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? '✓ Correct!' : `✗ Not quite. The answer is: ${exercise.correctAnswer}`}
            </p>
            {exercise.explanation && (
              <p className="mt-2 text-sm text-gray-700">
                {exercise.explanation}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!userAnswer.trim() || showFeedback}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Answer
        </button>
      </form>
    </div>
  )
}
