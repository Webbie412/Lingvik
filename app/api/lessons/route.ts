import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const levels = await prisma.level.findMany({
      where: { },
      orderBy: { order: 'asc' },
      include: {
        units: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                name: true,
                description: true,
                order: true,
                xpReward: true,
              }
            },
            vocabularySet: {
              include: {
                vocabulary: {
                  select: {
                    id: true,
                    icelandic: true,
                    english: true,
                    partOfSpeech: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ levels })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}
