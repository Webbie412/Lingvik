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
    const { userAnswer, timeSpent } = await request.json()

    // Get exercise
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Check if answer is correct
    const correctAnswers = JSON.parse(exercise.correctAnswers as string) as string[]
    const isCorrect = correctAnswers.some(
      answer => answer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    )

    // Record attempt
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        userId: session.user.id,
        exerciseId: id,
        userAnswer,
        isCorrect,
        timeSpent,
      }
    })

    // Award XP for correct answer
    if (isCorrect) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: {
            increment: exercise.xpReward
          }
        }
      })
    }

    return NextResponse.json({
      attempt,
      isCorrect,
      correctAnswers: isCorrect ? null : correctAnswers
    })
  } catch (error) {
    console.error('Error recording attempt:', error)
    return NextResponse.json(
      { error: 'Failed to record attempt' },
      { status: 500 }
    )
  }
}
