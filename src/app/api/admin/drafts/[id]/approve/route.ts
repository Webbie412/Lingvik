import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExerciseType, LessonStatus } from '@prisma/client'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const draftId = params.id

    const draft = await prisma.lessonDraft.findUnique({
      where: { id: draftId }
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    if (draft.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Draft is not pending' },
        { status: 400 }
      )
    }

    // Get or create a unit for this lesson (default to unit 1)
    const unit = await prisma.unit.findFirst({
      where: { order: 1 }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'No unit available for publishing' },
        { status: 400 }
      )
    }

    // Get the highest lesson order in this unit
    const lastLesson = await prisma.lesson.findFirst({
      where: { unitId: unit.id },
      orderBy: { order: 'desc' }
    })

    const nextOrder = (lastLesson?.order || 0) + 1

    // Create the lesson
    const generatedContent = draft.generatedContent as { description?: string; exercises?: any[] } | null
    const lesson = await prisma.lesson.create({
      data: {
        unitId: unit.id,
        title: draft.title,
        description: draft.description || generatedContent?.description || null,
        order: nextOrder,
        xpReward: 10 + (draft.difficulty * 5),
        status: LessonStatus.PUBLISHED,
      }
    })

    // Create exercises if generated content exists
    if (generatedContent?.exercises) {
      const exercises = generatedContent.exercises
      
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i]
        
        await prisma.exercise.create({
          data: {
            lessonId: lesson.id,
            type: ex.type as ExerciseType,
            order: i + 1,
            question: ex.question,
            correctAnswer: ex.correctAnswer,
            options: ex.options || [],
            hint: ex.hint,
            explanation: ex.explanation,
          }
        })
      }
    }

    // Update draft status
    await prisma.lessonDraft.update({
      where: { id: draftId },
      data: {
        status: 'PUBLISHED',
        approvedAt: new Date(),
        publishedLessonId: lesson.id,
      }
    })

    return NextResponse.json({
      success: true,
      lessonId: lesson.id,
      message: 'Lesson published successfully'
    })
  } catch (error) {
    console.error('Approve draft error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
