'use client'

import { useState } from 'react'

interface Exercise {
  question: string
  correctAnswer: string
  options: string[]
  hint: string | null
  explanation: string | null
}

interface WordOrderProps {
  exercise: Exercise
  onAnswer: (isCorrect: boolean) => void
}

export default function WordOrder({ exercise, onAnswer }: WordOrderProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>(exercise.options)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleWordClick = (word: string, fromSelected: boolean) => {
    if (showFeedback) return

    if (fromSelected) {
      setSelectedWords(selectedWords.filter(w => w !== word))
      setAvailableWords([...availableWords, word])
    } else {
      setAvailableWords(availableWords.filter(w => w !== word))
      setSelectedWords([...selectedWords, word])
    }
  }

  const handleCheck = () => {
    if (showFeedback || selectedWords.length === 0) return

    const userAnswer = selectedWords.join('|')
    const correct = userAnswer === exercise.correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)

    setTimeout(() => {
      onAnswer(correct)
      setShowFeedback(false)
      setSelectedWords([])
      setAvailableWords(exercise.options)
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

      {/* Selected words area */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Your answer:</p>
        <div className={`
          min-h-[60px] p-4 border-2 rounded-lg flex flex-wrap gap-2
          ${showFeedback
            ? isCorrect
              ? 'border-green-500 bg-green-50'
              : 'border-red-500 bg-red-50'
            : 'border-blue-300 bg-blue-50'
          }
        `}>
          {selectedWords.length === 0 ? (
            <span className="text-gray-400 italic">Click words below to build your answer</span>
          ) : (
            selectedWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word, true)}
                disabled={showFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {word}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available words */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Available words:</p>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word, false)}
              disabled={showFeedback}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {showFeedback && (
        <div className={`mb-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? '✓ Correct!' : `✗ Not quite. Correct order: ${exercise.correctAnswer.split('|').join(' ')}`}
          </p>
          {exercise.explanation && (
            <p className="mt-2 text-sm text-gray-700">
              {exercise.explanation}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={selectedWords.length === 0 || showFeedback}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Check Answer
      </button>
    </div>
  )
}
