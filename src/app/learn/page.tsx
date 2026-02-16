import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import LearningPath from '@/components/LearningPath'
import UserStats from '@/components/UserStats'

export default async function LearnPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get user progress
  const userProgress = await prisma.userProgress.findUnique({
    where: { userId: session.user.id },
    include: {
      currentUnit: true,
    }
  })

  // Get all units with lessons
  const units = await prisma.unit.findMany({
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
      }
    }
  })

  // Get completed lessons
  const completedLessons = await prisma.completedLesson.findMany({
    where: { userId: session.user.id },
    select: { lessonId: true }
  })

  const completedLessonIds = completedLessons.map(cl => cl.lessonId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Lingvik</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">👤 {session.user.name || session.user.email}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LearningPath 
              units={units} 
              completedLessonIds={completedLessonIds}
            />
          </div>
          <div>
            <UserStats 
              totalXp={userProgress?.totalXp || 0}
              currentStreak={userProgress?.currentStreak || 0}
              level={userProgress?.level || 1}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
