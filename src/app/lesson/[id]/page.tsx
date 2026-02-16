import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import ExerciseEngine from '@/components/ExerciseEngine'

interface PageProps {
  params: {
    id: string
  }
}

export default async function LessonPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      exercises: {
        orderBy: { order: 'asc' }
      },
      unit: true,
    }
  })

  if (!lesson) {
    redirect('/learn')
  }

  // Check if already completed
  const completed = await prisma.completedLesson.findUnique({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId: lesson.id
      }
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <ExerciseEngine 
        lesson={lesson}
        exercises={lesson.exercises}
        userId={session.user.id}
        isCompleted={!!completed}
      />
    </div>
  )
}
