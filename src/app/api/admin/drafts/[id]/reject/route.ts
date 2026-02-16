import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const draftId = context.params.id

    const draft = await prisma.lessonDraft.findUnique({
      where: { id: draftId }
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Update draft status to rejected
    await prisma.lessonDraft.update({
      where: { id: draftId },
      data: {
        status: 'REJECTED',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Draft rejected'
    })
  } catch (error) {
    console.error('Reject draft error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
