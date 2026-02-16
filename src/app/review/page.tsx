import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import VocabularyReview from '@/components/VocabularyReview'

export default async function ReviewPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get vocabularies due for review
  const now = new Date()
  const vocabDueForReview = await prisma.vocabularyMastery.findMany({
    where: {
      userId: session.user.id,
      nextReview: {
        lte: now
      }
    },
    include: {
      vocabulary: true
    },
    take: 10, // Review 10 at a time
    orderBy: {
      nextReview: 'asc'
    }
  })

  // If no vocab due for review, get new vocab to learn
  let vocabularies = vocabDueForReview
  if (vocabularies.length === 0) {
    const learnedVocabIds = await prisma.vocabularyMastery.findMany({
      where: { userId: session.user.id },
      select: { vocabularyId: true }
    })

    const learnedIds = learnedVocabIds.map(v => v.vocabularyId)

    const newVocab = await prisma.vocabulary.findMany({
      where: {
        id: {
          notIn: learnedIds
        }
      },
      take: 5,
      orderBy: {
        frequency: 'desc' // Start with most frequent words
      }
    })

    vocabularies = newVocab.map(v => ({
      id: '',
      userId: session.user.id,
      vocabularyId: v.id,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReview: now,
      lastReviewed: null,
      masteryLevel: 0,
      createdAt: now,
      updatedAt: now,
      vocabulary: v
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <VocabularyReview
        vocabularies={vocabularies}
        userId={session.user.id}
      />
    </div>
  )
}
