import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { source, type, data } = await request.json()

    // Create curriculum import record
    const curriculumImport = await prisma.curriculumImport.create({
      data: {
        source,
        type,
        status: 'processing',
        data,
        metadata: {
          importedBy: session.user.id,
          importedAt: new Date().toISOString(),
        },
      },
    })

    // Process the import based on type
    try {
      if (type === 'vocabulary') {
        await processVocabularyImport(data)
      } else if (type === 'sentences') {
        await processSentencesImport(data)
      } else if (type === 'morphology') {
        await processMorphologyImport(data)
      }

      await prisma.curriculumImport.update({
        where: { id: curriculumImport.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        import: curriculumImport,
      })
    } catch (error) {
      await prisma.curriculumImport.update({
        where: { id: curriculumImport.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }
  } catch (error) {
    console.error('Error importing curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to import curriculum' },
      { status: 500 }
    )
  }
}

async function processVocabularyImport(data: any) {
  // Expected format: Array of { icelandic, english, partOfSpeech, frequency }
  const vocabularyList = Array.isArray(data) ? data : data.vocabulary

  for (const item of vocabularyList) {
    await prisma.vocabulary.upsert({
      where: { icelandic: item.icelandic },
      update: {
        english: item.english,
        partOfSpeech: item.partOfSpeech,
        frequency: item.frequency,
      },
      create: {
        icelandic: item.icelandic,
        english: item.english,
        partOfSpeech: item.partOfSpeech,
        frequency: item.frequency,
      },
    })
  }
}

async function processSentencesImport(data: any) {
  // Expected format: Array of { icelandic, english, source }
  // Store sentences as metadata for exercise generation
  const sentences = Array.isArray(data) ? data : data.sentences
  
  // For now, just validate the format
  // In a full implementation, these would be stored and used for AI generation
  if (!sentences.every((s: any) => s.icelandic && s.english)) {
    throw new Error('Invalid sentence format')
  }
}

async function processMorphologyImport(data: any) {
  // Expected format: Array of morphology rules for verbs/nouns
  // Store morphology data as metadata for exercise generation
  const morphology = Array.isArray(data) ? data : data.morphology
  
  // For now, just validate the format
  // In a full implementation, these would be stored and used for conjugation drills
  if (!morphology.every((m: any) => m.word && m.forms)) {
    throw new Error('Invalid morphology format')
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const imports = await prisma.curriculumImport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ imports })
  } catch (error) {
    console.error('Error fetching imports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch imports' },
      { status: 500 }
    )
  }
}
