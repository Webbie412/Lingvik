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

    const { unitId, grammarFocus, vocabularyIds, sentencePool } = await request.json()

    // Get unit and vocabulary
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        vocabularySet: {
          include: {
            vocabulary: true
          }
        }
      }
    })

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      )
    }

    // Generate exercises using the vocabulary and grammar focus
    const generatedExercises = await generateExercisesWithAI(
      unit,
      grammarFocus,
      vocabularyIds,
      sentencePool
    )

    // Create draft lesson
    const draftLesson = await prisma.draftLesson.create({
      data: {
        unitId,
        name: `Generated Lesson - ${unit.name}`,
        description: `AI-generated lesson for ${grammarFocus}`,
        exercises: generatedExercises,
        status: 'draft',
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      draftLesson,
    })
  } catch (error) {
    console.error('Error generating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    )
  }
}

async function generateExercisesWithAI(
  unit: any,
  grammarFocus: string,
  vocabularyIds: string[],
  sentencePool?: any[]
) {
  // This is a simplified AI generation - in production, this would call an actual AI service
  // For MVP, we'll generate rule-based exercises
  
  const vocabulary = unit.vocabularySet.map((vs: any) => vs.vocabulary)
  const targetWords = vocabularyIds 
    ? vocabulary.filter((v: any) => vocabularyIds.includes(v.id))
    : vocabulary.slice(0, 5)

  const exercises = []

  // Generate multiple choice vocabulary exercises
  for (let i = 0; i < Math.min(3, targetWords.length); i++) {
    const word = targetWords[i]
    const otherWords = vocabulary
      .filter((v: any) => v.id !== word.id)
      .slice(0, 3)
      .map((v: any) => v.english)

    exercises.push({
      type: 'multiple_choice',
      prompt: `What does "${word.icelandic}" mean in English?`,
      correctAnswers: [word.english],
      options: shuffle([word.english, ...otherWords]),
      grammarTag: grammarFocus,
      difficulty: 1,
      order: i + 1,
      xpReward: 5,
    })
  }

  // Generate typing exercises
  for (let i = 0; i < Math.min(2, targetWords.length); i++) {
    const word = targetWords[i]
    exercises.push({
      type: 'typing',
      prompt: `Translate to Icelandic: "${word.english}"`,
      correctAnswers: [word.icelandic],
      grammarTag: grammarFocus,
      difficulty: 2,
      order: exercises.length + 1,
      xpReward: 5,
    })
  }

  // Generate fill-in-the-blank if we have sentence pool
  if (sentencePool && sentencePool.length > 0) {
    const sentence = sentencePool[0]
    const words = sentence.icelandic.split(' ')
    const blankIndex = Math.floor(words.length / 2)
    const blankWord = words[blankIndex]
    
    exercises.push({
      type: 'fill_blank',
      prompt: `Fill in the blank: ${words.map((w: string, i: number) => 
        i === blankIndex ? '___' : w
      ).join(' ')}`,
      correctAnswers: [blankWord],
      grammarTag: grammarFocus,
      difficulty: 2,
      order: exercises.length + 1,
      xpReward: 5,
    })
  }

  return exercises
}

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
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

    const draftLessons = await prisma.draftLesson.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ draftLessons })
  } catch (error) {
    console.error('Error fetching draft lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draft lessons' },
      { status: 500 }
    )
  }
}
