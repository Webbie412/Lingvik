'use client'

import { useState } from 'react'

interface Exercise {
  question: string
  correctAnswer: string
  options: string[]
  hint: string | null
  explanation: string | null
}

interface MultipleChoiceProps {
  exercise: Exercise
  onAnswer: (isCorrect: boolean) => void
}

export default function MultipleChoice({ exercise, onAnswer }: MultipleChoiceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSelect = (option: string) => {
    if (showFeedback) return
    
    setSelectedAnswer(option)
    setShowFeedback(true)
    
    const isCorrect = option === exercise.correctAnswer
    setTimeout(() => {
      onAnswer(isCorrect)
      setShowFeedback(false)
      setSelectedAnswer(null)
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

      <div className="space-y-3">
        {exercise.options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrect = option === exercise.correctAnswer
          const showCorrectFeedback = showFeedback && isCorrect
          const showWrongFeedback = showFeedback && isSelected && !isCorrect

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={showFeedback}
              className={`
                w-full p-4 text-left rounded-lg border-2 transition-all font-medium
                ${showCorrectFeedback
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : showWrongFeedback
                  ? 'border-red-500 bg-red-50 text-red-800'
                  : isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }
                ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showCorrectFeedback && <span className="text-2xl">✓</span>}
                {showWrongFeedback && <span className="text-2xl">✗</span>}
              </div>
            </button>
          )
        })}
      </div>

      {showFeedback && exercise.explanation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Explanation:</strong> {exercise.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
