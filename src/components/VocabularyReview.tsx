'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Vocabulary {
  id: string
  icelandic: string
  english: string
  partOfSpeech: string | null
  exampleSentence: string | null
}

interface VocabularyMastery {
  vocabularyId: string
  vocabulary: Vocabulary
  masteryLevel: number
  repetitions: number
}

interface VocabularyReviewProps {
  vocabularies: VocabularyMastery[]
  userId: string
}

export default function VocabularyReview({ vocabularies, userId }: VocabularyReviewProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)

  if (vocabularies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            All caught up!
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have any vocabulary to review right now. Come back later!
          </p>
          <button
            onClick={() => router.push('/learn')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Learning
          </button>
        </div>
      </div>
    )
  }

  const currentVocab = vocabularies[currentIndex]

  const handleQualityRating = async (quality: number) => {
    // quality: 0-5 (0 = total blackout, 5 = perfect response)
    try {
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          vocabularyId: currentVocab.vocabularyId,
          quality,
        }),
      })

      setReviewedCount(reviewedCount + 1)
      
      if (currentIndex < vocabularies.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        // Completed all reviews
        router.push('/learn')
      }
    } catch (error) {
      console.error('Review submission failed:', error)
    }
  }

  const progress = ((currentIndex + 1) / vocabularies.length) * 100

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
            <h2 className="text-lg font-semibold text-gray-800">Vocabulary Review</h2>
            <span className="text-sm text-gray-600">
              {currentIndex + 1}/{vocabularies.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Review content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              {!showAnswer ? (
                <>
                  <h3 className="text-4xl font-bold text-gray-800 mb-4">
                    {currentVocab.vocabulary.icelandic}
                  </h3>
                  {currentVocab.vocabulary.partOfSpeech && (
                    <p className="text-sm text-gray-500 mb-4">
                      {currentVocab.vocabulary.partOfSpeech}
                    </p>
                  )}
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="mt-4 bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Show Answer
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-4xl font-bold text-gray-800 mb-2">
                    {currentVocab.vocabulary.icelandic}
                  </h3>
                  <p className="text-2xl text-gray-600 mb-4">
                    {currentVocab.vocabulary.english}
                  </p>
                  {currentVocab.vocabulary.partOfSpeech && (
                    <p className="text-sm text-gray-500 mb-2">
                      ({currentVocab.vocabulary.partOfSpeech})
                    </p>
                  )}
                  {currentVocab.vocabulary.exampleSentence && (
                    <p className="text-sm text-gray-600 italic mt-4 p-3 bg-gray-50 rounded">
                      {currentVocab.vocabulary.exampleSentence}
                    </p>
                  )}

                  <div className="mt-8">
                    <p className="text-sm text-gray-600 mb-3">How well did you know this?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleQualityRating(0)}
                        className="py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                      >
                        😰 Again
                      </button>
                      <button
                        onClick={() => handleQualityRating(3)}
                        className="py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition"
                      >
                        🤔 Hard
                      </button>
                      <button
                        onClick={() => handleQualityRating(4)}
                        className="py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                      >
                        😊 Good
                      </button>
                      <button
                        onClick={() => handleQualityRating(5)}
                        className="py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
                      >
                        😄 Easy
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {currentVocab.masteryLevel > 0 && (
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Mastery Level: {currentVocab.masteryLevel}/5 | 
                  Reviews: {currentVocab.repetitions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
