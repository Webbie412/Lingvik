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
        const word = parts[0].trim()
        const frequency = parseInt(parts[1].trim()) || 0
        const rank = parts[2] ? parseInt(parts[2].trim()) : i

        entries.push({ word, frequency, rank })
      }
    }

    // Bulk insert with upsert to avoid duplicates
    let count = 0
    for (const entry of entries) {
      await prisma.frequencyList.upsert({
        where: { word: entry.word },
        update: {
          frequency: entry.frequency,
          rank: entry.rank,
        },
        create: entry,
      })
      count++
    }

    return NextResponse.json({
      success: true,
      count,
      message: `Imported ${count} words`
    })
  } catch (error) {
    console.error('Frequency list upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
