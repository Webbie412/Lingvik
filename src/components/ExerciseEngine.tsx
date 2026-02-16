'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MultipleChoice from './exercises/MultipleChoice'
import Matching from './exercises/Matching'
import WordOrder from './exercises/WordOrder'
import Typing from './exercises/Typing'

interface Exercise {
  id: string
  type: string
  question: string
  correctAnswer: string
  options: string[]
  hint: string | null
  explanation: string | null
}

interface Lesson {
  id: string
  title: string
  xpReward: number
}

interface ExerciseEngineProps {
  lesson: Lesson
  exercises: Exercise[]
  userId: string
  isCompleted: boolean
}

export default function ExerciseEngine({ 
  lesson, 
  exercises, 
  userId,
  isCompleted 
}: ExerciseEngineProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)

  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100

  const handleAnswer = async (isCorrect: boolean) => {
    // Record the answer
    setAnswers({ ...answers, [currentExercise.id]: isCorrect })

    // Save attempt to database
    try {
      await fetch('/api/exercise/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          exerciseId: currentExercise.id,
          isCorrect,
        }),
      })
    } catch (error) {
      console.error('Failed to save attempt:', error)
    }

    // Move to next exercise or show results
    if (currentIndex < exercises.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, 1000)
    } else {
      // Completed all exercises
      setTimeout(() => {
        setShowResults(true)
        completeLesson()
      }, 1000)
    }
  }

  const completeLesson = async () => {
    setLoading(true)
    try {
      const correctAnswers = Object.values(answers).filter(Boolean).length
      const score = (correctAnswers / exercises.length) * 100

      await fetch('/api/lesson/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId: lesson.id,
          score,
        }),
      })
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  if (showResults) {
    const correctAnswers = Object.values(answers).filter(Boolean).length
    const score = Math.round((correctAnswers / exercises.length) * 100)

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">
            {score >= 80 ? '🎉' : score >= 60 ? '😊' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Lesson Complete!
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored {score}%
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-lg text-blue-800">
              +{lesson.xpReward} XP earned!
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/learn')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Continue Learning
            </button>
            {score < 80 && (
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Practice Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.push('/learn')}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕ Exit
            </button>
            <h2 className="text-lg font-semibold text-gray-800">{lesson.title}</h2>
            <span className="text-sm text-gray-600">
              {currentIndex + 1}/{exercises.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Exercise content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          {currentExercise.type === 'MULTIPLE_CHOICE' && (
            <MultipleChoice
              exercise={currentExercise}
              onAnswer={handleAnswer}
            />
          )}
          {currentExercise.type === 'MATCHING' && (
            <Matching
              exercise={currentExercise}
              onAnswer={handleAnswer}
            />
          )}
          {currentExercise.type === 'WORD_ORDER' && (
            <WordOrder
              exercise={currentExercise}
              onAnswer={handleAnswer}
            />
          )}
          {currentExercise.type === 'TYPING' && (
            <Typing
              exercise={currentExercise}
              onAnswer={handleAnswer}
            />
          )}
        </div>
      </div>
    </div>
  )
}
