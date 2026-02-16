import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, lessonId, score } = body

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get lesson details
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Check if already completed
    const existing = await prisma.completedLesson.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      }
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Lesson already completed',
        xpEarned: 0
      })
    }

    // Create completion record
    await prisma.completedLesson.create({
      data: {
        userId,
        lessonId,
        score,
        xpEarned: lesson.xpReward,
      }
    })

    // Update user progress
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    })

    if (userProgress) {
      const now = new Date()
      const lastActive = userProgress.lastActiveDate
      const isConsecutiveDay = lastActive && 
        (now.getTime() - lastActive.getTime()) < 48 * 60 * 60 * 1000 && // Within 48 hours
        now.getDate() !== lastActive.getDate() // Different day

      await prisma.userProgress.update({
        where: { userId },
        data: {
          totalXp: { increment: lesson.xpReward },
          currentStreak: isConsecutiveDay 
            ? { increment: 1 }
            : lastActive && now.getDate() === lastActive.getDate()
            ? userProgress.currentStreak // Same day, no change
            : 1, // Reset streak
          longestStreak: isConsecutiveDay && userProgress.currentStreak + 1 > userProgress.longestStreak
            ? userProgress.currentStreak + 1
            : userProgress.longestStreak,
          lastActiveDate: now,
          level: Math.floor((userProgress.totalXp + lesson.xpReward) / 100) + 1,
        }
      })

      // Record streak
      await prisma.streak.upsert({
        where: {
          userId_date: {
            userId,
            date: new Date(now.setHours(0, 0, 0, 0))
          }
        },
        create: {
          userId,
          date: new Date(now.setHours(0, 0, 0, 0)),
          xpEarned: lesson.xpReward,
        },
        update: {
          xpEarned: { increment: lesson.xpReward }
        }
      })

      // Check for badge awards
      const completedCount = await prisma.completedLesson.count({
        where: { userId }
      })

      if (completedCount === 1) {
        const firstStepsBadge = await prisma.badge.findFirst({
          where: { requirement: 'complete_1_lesson' }
        })
        if (firstStepsBadge) {
          await prisma.userBadge.upsert({
            where: {
              userId_badgeId: {
                userId,
                badgeId: firstStepsBadge.id
              }
            },
            create: {
              userId,
              badgeId: firstStepsBadge.id
            },
            update: {}
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      xpEarned: lesson.xpReward,
      message: 'Lesson completed successfully'
    })
  } catch (error) {
    console.error('Lesson completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
