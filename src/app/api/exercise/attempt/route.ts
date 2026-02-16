import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, exerciseId, isCorrect } = body

    if (!userId || !exerciseId || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const attempt = await prisma.exerciseAttempt.create({
      data: {
        userId,
        exerciseId,
        userAnswer: '', // Could store actual answer if needed
        isCorrect,
      }
    })

    return NextResponse.json({ success: true, attemptId: attempt.id })
  } catch (error) {
    console.error('Exercise attempt error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
