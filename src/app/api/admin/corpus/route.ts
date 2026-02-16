import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { csvData } = body

    if (!csvData) {
      return NextResponse.json(
        { error: 'CSV data is required' },
        { status: 400 }
      )
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n')
    const entries = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || i === 0) continue // Skip header and empty lines

      const parts = line.split(',')
      if (parts.length >= 2) {
        const icelandic = parts[0].trim()
        const english = parts[1].trim()
        const difficulty = parts[2] ? parseInt(parts[2].trim()) : 1

        entries.push({
          icelandic,
          english,
          difficulty,
        })
      }
    }

    // Bulk insert
    const result = await prisma.sentenceCorpus.createMany({
      data: entries,
      skipDuplicates: true,
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Imported ${result.count} sentences`
    })
  } catch (error) {
    console.error('Corpus upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
