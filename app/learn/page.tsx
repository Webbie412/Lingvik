'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Vocabulary {
  id: string
  icelandic: string
  english: string
  partOfSpeech: string
}

interface Lesson {
  id: string
  name: string
  description: string
  order: number
  xpReward: number
}

interface Unit {
  id: string
  name: string
  description: string
  order: number
  grammarFocus: string
  lessons: Lesson[]
  vocabularySet: Array<{ vocabulary: Vocabulary }>
}

interface Level {
  id: string
  name: string
  description: string
  order: number
  cefrLevel: string
  units: Unit[]
}

export default function LearnPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [levels, setLevels] = useState<Level[]>([])
  const [userProgress, setUserProgress] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        fetch('/api/lessons'),
        fetch('/api/progress')
      ])

      const lessonsData = await lessonsRes.json()
      const progressData = await progressRes.json()

      setLevels(lessonsData.levels)
      setUserProgress(progressData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-600">Loading your lessons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/learn" className="text-2xl font-bold text-blue-600">
            Lingvik
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-semibold text-gray-700">
                {userProgress.user?.xp || 0} XP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="font-semibold text-gray-700">
                {userProgress.user?.streak || 0} day streak
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600">Continue your Icelandic learning journey</p>
        </div>

        {levels.map((level) => (
          <div key={level.id} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {level.name}
              </h2>
              <p className="text-gray-600">{level.description} • {level.cefrLevel}</p>
            </div>

            <div className="space-y-6">
              {level.units.map((unit) => (
                <div key={unit.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Unit {unit.order}: {unit.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{unit.description}</p>
                    {unit.grammarFocus && (
                      <p className="text-sm text-blue-600">
                        📝 Grammar: {unit.grammarFocus}
                      </p>
                    )}
                  </div>

                  {/* Vocabulary Preview */}
                  {unit.vocabularySet.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        New vocabulary ({unit.vocabularySet.length} words)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {unit.vocabularySet.slice(0, 5).map((item) => (
                          <span
                            key={item.vocabulary.id}
                            className="text-xs bg-white px-2 py-1 rounded"
                          >
                            {item.vocabulary.icelandic}
                          </span>
                        ))}
                        {unit.vocabularySet.length > 5 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{unit.vocabularySet.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lessons */}
                  <div className="space-y-2">
                    {unit.lessons.map((lesson) => {
                      const isCompleted = userProgress.progress?.some(
                        (p: any) => p.lessonId === lesson.id && p.completed
                      )

                      return (
                        <Link
                          key={lesson.id}
                          href={`/lesson/${lesson.id}`}
                          className={`block p-4 rounded-lg transition ${
                            isCompleted
                              ? 'bg-green-50 border-2 border-green-500'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {isCompleted ? '✅' : '📖'}
                              </span>
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {lesson.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {lesson.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-600">
                                +{lesson.xpReward} XP
                              </p>
                              {isCompleted && (
                                <p className="text-xs text-green-600">Completed</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {levels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No lessons available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
