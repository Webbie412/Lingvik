import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const drafts = await prisma.lessonDraft.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error('Fetch drafts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
