import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, vocabularyId, quality } = body

    if (!userId || !vocabularyId || typeof quality !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get or create vocabulary mastery record
    let mastery = await prisma.vocabularyMastery.findUnique({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId
        }
      }
    })

    // SM-2 spaced repetition algorithm
    let { easeFactor, interval, repetitions } = mastery || {
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0
    }

    // Update based on quality (0-5)
    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      repetitions++
    } else {
      // Incorrect response - reset
      repetitions = 0
      interval = 1
    }

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (easeFactor < 1.3) easeFactor = 1.3

    // Calculate next review date
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)

    // Calculate mastery level (0-5)
    const masteryLevel = Math.min(5, Math.floor(repetitions / 3))

    // Upsert mastery record
    mastery = await prisma.vocabularyMastery.upsert({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId
        }
      },
      create: {
        userId,
        vocabularyId,
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastReviewed: new Date(),
        masteryLevel,
      },
      update: {
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastReviewed: new Date(),
        masteryLevel,
      }
    })

    // Create review record
    await prisma.review.create({
      data: {
        userId,
        vocabularyId,
        quality,
      }
    })

    return NextResponse.json({
      success: true,
      nextReview,
      masteryLevel,
      interval,
    })
  } catch (error) {
    console.error('Review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
