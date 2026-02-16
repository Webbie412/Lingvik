'use client'

import Link from 'next/link'

interface Unit {
  id: string
  title: string
  description: string | null
  order: number
  isLocked: boolean
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  order: number
  xpReward: number
}

interface LearningPathProps {
  units: Unit[]
  completedLessonIds: string[]
}

export default function LearningPath({ units, completedLessonIds }: LearningPathProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Your Learning Path</h2>
      
      {units.map((unit, unitIndex) => (
        <div key={unit.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {unitIndex + 1}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{unit.title}</h3>
              {unit.description && (
                <p className="text-sm text-gray-600">{unit.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unit.lessons.map((lesson) => {
              const isCompleted = completedLessonIds.includes(lesson.id)
              const isLocked = unit.isLocked && !isCompleted

              return (
                <Link
                  key={lesson.id}
                  href={isLocked ? '#' : `/lesson/${lesson.id}`}
                  className={`
                    block p-4 rounded-lg border-2 transition-all
                    ${isCompleted 
                      ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                      : isLocked
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                      : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-500'
                    }
                  `}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">
                        {isCompleted ? '✓ Completed' : `${lesson.xpReward} XP`}
                      </p>
                    </div>
                    {isLocked && (
                      <span className="text-gray-400">🔒</span>
                    )}
                    {isCompleted && (
                      <span className="text-green-600 text-2xl">✓</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
