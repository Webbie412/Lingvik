'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

// Types
interface Exercise {
  id: string
  type: string
  prompt: string
  correctAnswers: string[]
  options?: string[] | { left: string[], right: string[] }
  audioUrl?: string
  imageUrl?: string
  xpReward: number
  order: number
}

interface Lesson {
  id: string
  name: string
  description: string
  xpReward: number
  exercises: Exercise[]
  unit: {
    id: string
    name: string
    grammarFocus: string
  }
}

interface AttemptResult {
  isCorrect: boolean
  correctAnswers?: string[]
  attempt: {
    id: string
  }
}

export default function LessonPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [wordOrderAnswer, setWordOrderAnswer] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [matchingPairs, setMatchingPairs] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    show: boolean
    isCorrect: boolean
    correctAnswers?: string[]
  }>({ show: false, isCorrect: false })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchLesson()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, lessonId])

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`)
      if (!res.ok) throw new Error('Failed to fetch lesson')
      const data = await res.json()
      setLesson(data.lesson)
      
      // Initialize word order if first exercise is word_order
      if (data.lesson.exercises[0]?.type === 'word_order' && data.lesson.exercises[0].options) {
        setAvailableWords([...data.lesson.exercises[0].options])
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentExercise = (): Exercise | null => {
    return lesson?.exercises[currentExerciseIndex] || null
  }

  const handleSubmitAnswer = async () => {
    const exercise = getCurrentExercise()
    if (!exercise || submitting) return

    setSubmitting(true)

    let answer = ''
    
    // Prepare answer based on exercise type
    switch (exercise.type) {
      case 'multiple_choice':
        answer = selectedOption || ''
        break
      case 'typing':
      case 'fill_blank':
        answer = userAnswer.trim()
        break
      case 'word_order':
        answer = wordOrderAnswer.join(' ')
        break
      case 'matching':
        answer = JSON.stringify(matchingPairs)
        break
      case 'listening':
        answer = userAnswer.trim()
        break
      default:
        answer = userAnswer.trim()
    }

    try {
      const res = await fetch(`/api/exercises/${exercise.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswer: answer,
          timeSpent: 0
        })
      })

      if (!res.ok) throw new Error('Failed to submit answer')

      const result: AttemptResult = await res.json()
      
      setFeedback({
        show: true,
        isCorrect: result.isCorrect,
        correctAnswers: result.correctAnswers
      })

      if (result.isCorrect) {
        setTotalXP(prev => prev + exercise.xpReward)
        setCorrectCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    setFeedback({ show: false, isCorrect: false })
    setUserAnswer('')
    setSelectedOption(null)
    setWordOrderAnswer([])
    setMatchingPairs({})
    setSelectedLeft(null)

    if (currentExerciseIndex < (lesson?.exercises.length || 0) - 1) {
      const nextIndex = currentExerciseIndex + 1
      setCurrentExerciseIndex(nextIndex)
      
      // Initialize next exercise if word_order
      const nextExercise = lesson?.exercises[nextIndex]
      if (nextExercise?.type === 'word_order' && nextExercise.options) {
        setAvailableWords([...nextExercise.options])
      }
    } else {
      completeLesson()
    }
  }

  const completeLesson = async () => {
    if (!lesson) return

    const score = Math.round((correctCount / lesson.exercises.length) * 100)

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          completed: true,
          score
        })
      })
      
      setTotalXP(prev => prev + lesson.xpReward)
      setCompleted(true)
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  // Word order handlers
  const handleWordClick = (word: string) => {
    setWordOrderAnswer([...wordOrderAnswer, word])
    setAvailableWords(availableWords.filter(w => w !== word))
  }

  const handleRemoveWord = (index: number) => {
    const word = wordOrderAnswer[index]
    setAvailableWords([...availableWords, word])
    setWordOrderAnswer(wordOrderAnswer.filter((_, i) => i !== index))
  }

  // Matching handlers
  const handleMatchingClick = (item: string, side: 'left' | 'right') => {
    if (side === 'left') {
      if (selectedLeft === item) {
        setSelectedLeft(null)
      } else {
        setSelectedLeft(item)
      }
    } else if (selectedLeft) {
      setMatchingPairs({ ...matchingPairs, [selectedLeft]: item })
      setSelectedLeft(null)
    }
  }

  const renderExerciseUI = () => {
    const exercise = getCurrentExercise()
    if (!exercise) return null

    switch (exercise.type) {
      case 'multiple_choice':
        const options = exercise.options as string[] || []
        return (
          <div className="space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                disabled={feedback.show}
                className={`w-full p-4 text-left rounded-lg border-2 transition ${
                  selectedOption === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } ${feedback.show ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        )

      case 'typing':
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={feedback.show}
            placeholder="Type your answer..."
            className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !feedback.show) {
                handleSubmitAnswer()
              }
            }}
          />
        )

      case 'word_order':
        return (
          <div className="space-y-4">
            {/* Answer area */}
            <div className="min-h-[80px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              {wordOrderAnswer.length === 0 ? (
                <p className="text-gray-400 text-center">Click words below to build your answer</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {wordOrderAnswer.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => !feedback.show && handleRemoveWord(index)}
                      disabled={feedback.show}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-60"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Available words */}
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => !feedback.show && handleWordClick(word)}
                  disabled={feedback.show}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )

      case 'matching':
        const matchOptions = (exercise.options as { left: string[], right: string[] }) || { left: [], right: [] }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-2">Match these:</p>
              {matchOptions.left?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => !feedback.show && handleMatchingClick(item, 'left')}
                  disabled={feedback.show || !!matchingPairs[item]}
                  className={`w-full p-3 text-left rounded-lg border-2 transition ${
                    selectedLeft === item
                      ? 'border-blue-500 bg-blue-50'
                      : matchingPairs[item]
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${feedback.show ? 'cursor-not-allowed' : ''}`}
                >
                  {item}
                  {matchingPairs[item] && (
                    <span className="text-sm text-green-600 ml-2">→ {matchingPairs[item]}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-2">With these:</p>
              {matchOptions.right?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => !feedback.show && selectedLeft && handleMatchingClick(item, 'right')}
                  disabled={feedback.show || !selectedLeft || Object.values(matchingPairs).includes(item)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition ${
                    Object.values(matchingPairs).includes(item)
                      ? 'border-green-500 bg-green-50 opacity-60'
                      : selectedLeft
                      ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 bg-white'
                      : 'border-gray-200 bg-gray-100 opacity-60'
                  } ${feedback.show || !selectedLeft ? 'cursor-not-allowed' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )

      case 'fill_blank':
        const parts = exercise.prompt.split('___')
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg text-lg">
              {parts.map((part, index) => (
                <span key={index}>
                  {part}
                  {index < parts.length - 1 && (
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={feedback.show}
                      className="inline-block mx-2 px-3 py-1 border-b-2 border-blue-500 bg-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ width: '150px' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !feedback.show) {
                          handleSubmitAnswer()
                        }
                      }}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
        )

      case 'listening':
        return (
          <div className="space-y-4">
            {exercise.audioUrl && (
              <div className="flex justify-center">
                <audio controls className="w-full max-w-md">
                  <source src={exercise.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={feedback.show}
              placeholder="Type what you hear..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !feedback.show) {
                  handleSubmitAnswer()
                }
              }}
            />
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={feedback.show}
            placeholder="Type your answer..."
            className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !feedback.show) {
                handleSubmitAnswer()
              }
            }}
          />
        )
    }
  }

  const canSubmit = () => {
    const exercise = getCurrentExercise()
    if (!exercise || feedback.show) return false

    switch (exercise.type) {
      case 'multiple_choice':
        return !!selectedOption
      case 'typing':
      case 'fill_blank':
      case 'listening':
        return userAnswer.trim().length > 0
      case 'word_order':
        return wordOrderAnswer.length > 0
      case 'matching':
        const matchOptions = (exercise.options as { left: string[] }) || { left: [] }
        return Object.keys(matchingPairs).length === (matchOptions.left?.length || 0)
      default:
        return userAnswer.trim().length > 0
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">Lesson not found</p>
          <Link href="/learn" className="text-blue-600 hover:underline">
            Return to lessons
          </Link>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Lesson Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            Great job completing {lesson.name}!
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{correctCount}/{lesson.exercises.length}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">+{totalXP}</div>
                <div className="text-sm text-gray-600">XP Earned</div>
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-800">
                Score: {Math.round((correctCount / lesson.exercises.length) * 100)}%
              </div>
            </div>
          </div>

          <Link
            href="/learn"
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Continue Learning
          </Link>
        </div>
      </div>
    )
  }

  const exercise = getCurrentExercise()
  if (!exercise) return null

  const progress = ((currentExerciseIndex + 1) / lesson.exercises.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <Link href="/learn" className="text-gray-600 hover:text-gray-800">
              ← Back
            </Link>
            <div className="text-sm font-medium text-gray-600">
              {currentExerciseIndex + 1} / {lesson.exercises.length}
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Exercise prompt */}
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-3">
              {exercise.type.replace('_', ' ').toUpperCase()}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {exercise.type === 'fill_blank' ? 'Fill in the blank:' : exercise.prompt}
            </h2>
            {exercise.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={exercise.imageUrl}
                alt="Exercise"
                className="w-full max-w-md mx-auto rounded-lg mb-4"
              />
            )}
          </div>

          {/* Exercise UI */}
          <div className="mb-6">
            {renderExerciseUI()}
          </div>

          {/* Feedback */}
          {feedback.show && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                feedback.isCorrect
                  ? 'bg-green-50 border-2 border-green-500'
                  : 'bg-red-50 border-2 border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {feedback.isCorrect ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <p className={`font-semibold ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {feedback.isCorrect ? 'Correct!' : 'Not quite right'}
                  </p>
                  {!feedback.isCorrect && feedback.correctAnswers && (
                    <p className="text-sm text-gray-700 mt-1">
                      Correct answer: {feedback.correctAnswers.join(' or ')}
                    </p>
                  )}
                  {feedback.isCorrect && (
                    <p className="text-sm text-green-700 mt-1">
                      +{exercise.xpReward} XP
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!feedback.show ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!canSubmit() || submitting}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                  canSubmit() && !submitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Checking...' : 'Check Answer'}
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
