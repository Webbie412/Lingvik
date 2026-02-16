import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { reviewNotes } = await request.json()

    // Get draft lesson
    const draftLesson = await prisma.draftLesson.findUnique({
      where: { id },
    })

    if (!draftLesson) {
      return NextResponse.json(
        { error: 'Draft lesson not found' },
        { status: 404 }
      )
    }

    // Create actual lesson
    const lesson = await prisma.lesson.create({
      data: {
        unitId: draftLesson.unitId!,
        name: draftLesson.name,
        description: draftLesson.description,
        order: 99, // Admin should set proper order
        xpReward: 15,
        isPublished: true,
      },
    })

    // Create exercises from draft
    const exercises = draftLesson.exercises as any[]
    for (const exerciseData of exercises) {
      await prisma.exercise.create({
        data: {
          lessonId: lesson.id,
          type: exerciseData.type,
          prompt: exerciseData.prompt,
          correctAnswers: JSON.stringify(exerciseData.correctAnswers),
          options: exerciseData.options ? JSON.stringify(exerciseData.options) : undefined,
          grammarTag: exerciseData.grammarTag,
          difficulty: exerciseData.difficulty,
          order: exerciseData.order,
          xpReward: exerciseData.xpReward,
        },
      })
    }

    // Update draft status
    await prisma.draftLesson.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewNotes,
      },
    })

    return NextResponse.json({
      success: true,
      lesson,
    })
  } catch (error) {
    console.error('Error approving draft lesson:', error)
    return NextResponse.json(
      { error: 'Failed to approve draft lesson' },
      { status: 500 }
    )
  }
}
