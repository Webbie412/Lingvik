import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const progress = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
      include: {
        lesson: {
          select: {
            id: true,
            name: true,
            unitId: true,
          }
        }
      }
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        xp: true,
        streak: true,
        lastActive: true,
      }
    })

    return NextResponse.json({
      progress,
      user
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { lessonId, completed, score } = await request.json()

    // Update or create progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        }
      },
      update: {
        completed,
        score,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        lessonId,
        completed,
        score,
        completedAt: completed ? new Date() : null,
      }
    })

    // If lesson completed, award XP
    if (completed) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId }
      })

      if (lesson) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            xp: {
              increment: lesson.xpReward
            },
            lastActive: new Date(),
          }
        })
      }
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
