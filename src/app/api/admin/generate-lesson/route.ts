import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, targetVocab, grammarPoints, difficulty } = body

    if (!title || !targetVocab || targetVocab.length === 0) {
      return NextResponse.json(
        { error: 'Title and target vocabulary are required' },
        { status: 400 }
      )
    }

    // Generate lesson content using LLM (if API key is available)
    let generatedContent = null
    
    if (process.env.OPENAI_API_KEY) {
      try {
        generatedContent = await generateLessonWithLLM({
          title,
          targetVocab,
          grammarPoints,
          difficulty,
        })
      } catch (error) {
        console.error('LLM generation failed:', error)
        // Continue without generated content
      }
    }

    // Create draft
    const draft = await prisma.lessonDraft.create({
      data: {
        title,
        targetVocab,
        grammarPoints: grammarPoints || [],
        difficulty,
        generatedContent,
        status: 'PENDING',
      }
    })

    return NextResponse.json({
      success: true,
      draftId: draft.id,
      message: 'Lesson draft created successfully'
    })
  } catch (error) {
    console.error('Lesson generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateLessonWithLLM(params: {
  title: string
  targetVocab: string[]
  grammarPoints: string[]
  difficulty: number
}) {
  const { title, targetVocab, grammarPoints, difficulty } = params

  const prompt = `Generate a Duolingo-style Icelandic language lesson with the following specifications:

Title: ${title}
Target Vocabulary: ${targetVocab.join(', ')}
Grammar Points: ${grammarPoints.join(', ')}
Difficulty Level: ${difficulty}/5

Please create:
1. A brief lesson description (2-3 sentences)
2. 5 varied exercises including:
   - Multiple choice questions (test vocabulary recognition)
   - Typing exercises (practice spelling)
   - Word order exercises (practice sentence structure)
   - Translation exercises

For each exercise, provide:
- Type (MULTIPLE_CHOICE, TYPING, WORD_ORDER, or MATCHING)
- Question text
- Correct answer
- Options (for MCQ and word order)
- Hint
- Explanation

Return as JSON with structure:
{
  "description": "lesson description",
  "exercises": [
    {
      "type": "MULTIPLE_CHOICE",
      "question": "...",
      "correctAnswer": "...",
      "options": ["...", "...", "...", "..."],
      "hint": "...",
      "explanation": "..."
    }
  ]
}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Icelandic language teacher creating educational content for language learners.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error('LLM API request failed')
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content generated')
  }

  // Try to parse JSON from the response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse LLM response as JSON')
  }

  // Return raw content if parsing fails
  return { raw: content }
}
