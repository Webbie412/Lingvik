'use client'

import { useState } from 'react'

interface Exercise {
  question: string
  correctAnswer: string
  options: string[]
  hint: string | null
  explanation: string | null
}

interface MatchingProps {
  exercise: Exercise
  onAnswer: (isCorrect: boolean) => void
}

export default function Matching({ exercise, onAnswer }: MatchingProps) {
  // For matching exercises, we expect:
  // options: ["word1", "meaning1", "word2", "meaning2", ...]
  // correctAnswer: "word1:meaning1,word2:meaning2,..."
  
  const [matches, setMatches] = useState<{ [key: string]: string }>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Parse pairs from options (even indices are left, odd are right)
  const leftItems = exercise.options.filter((_, i) => i % 2 === 0)
  const rightItems = exercise.options.filter((_, i) => i % 2 === 1)

  const handleLeftClick = (item: string) => {
    if (showFeedback) return
    setSelectedLeft(item)
  }

  const handleRightClick = (item: string) => {
    if (showFeedback || !selectedLeft) return

    setMatches({ ...matches, [selectedLeft]: item })
    setSelectedLeft(null)
  }

  const handleCheck = () => {
    if (showFeedback || Object.keys(matches).length !== leftItems.length) return

    // Build answer string
    const userAnswer = Object.entries(matches)
      .sort()
      .map(([k, v]) => `${k}:${v}`)
      .join(',')

    const correct = userAnswer === exercise.correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)

    setTimeout(() => {
      onAnswer(correct)
      setShowFeedback(false)
      setMatches({})
      setSelectedLeft(null)
      setShowHint(false)
    }, 2000)
  }

  const getMatchedItem = (leftItem: string) => matches[leftItem]

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

      <p className="text-sm text-gray-600 mb-4">
        Click a word on the left, then click its match on the right
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Left column */}
        <div className="space-y-2">
          {leftItems.map((item, index) => {
            const matched = getMatchedItem(item)
            const isSelected = selectedLeft === item

            return (
              <button
                key={index}
                onClick={() => handleLeftClick(item)}
                disabled={showFeedback || !!matched}
                className={`
                  w-full p-3 rounded-lg border-2 text-left transition-all
                  ${matched
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                  }
                  ${showFeedback || matched ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {item}
                {matched && <span className="ml-2">→ {matched}</span>}
              </button>
            )
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {rightItems.map((item, index) => {
            const isMatched = Object.values(matches).includes(item)

            return (
              <button
                key={index}
                onClick={() => handleRightClick(item)}
                disabled={showFeedback || isMatched || !selectedLeft}
                className={`
                  w-full p-3 rounded-lg border-2 text-left transition-all
                  ${isMatched
                    ? 'border-green-500 bg-green-50 text-green-800 opacity-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                  }
                  ${showFeedback || isMatched || !selectedLeft ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>

      {showFeedback && (
        <div className={`mb-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Not quite. Try again!'}
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
        disabled={Object.keys(matches).length !== leftItems.length || showFeedback}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Check Answer
      </button>
    </div>
  )
}
