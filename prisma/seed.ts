import { PrismaClient, ExerciseType, LessonStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create badges
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { name: 'First Steps' },
      update: {},
      create: {
        name: 'First Steps',
        description: 'Complete your first lesson',
        requirement: 'complete_1_lesson',
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Week Warrior' },
      update: {},
      create: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        requirement: 'maintain_7_day_streak',
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Vocab Master' },
      update: {},
      create: {
        name: 'Vocab Master',
        description: 'Master 50 vocabulary words',
        requirement: 'master_50_vocab',
      },
    }),
  ])

  console.log('Created badges:', badges.length)

  // Create Unit 1: Basics
  const unit1 = await prisma.unit.upsert({
    where: { id: 'unit-1-basics' },
    update: {},
    create: {
      id: 'unit-1-basics',
      title: 'Unit 1: Basics',
      description: 'Learn basic Icelandic greetings and introductions',
      order: 1,
      isLocked: false,
    },
  })

  console.log('Created Unit 1:', unit1.title)

  // Create basic vocabulary
  const vocabularies = await Promise.all([
    prisma.vocabulary.upsert({
      where: { icelandic: 'halló' },
      update: {},
      create: {
        icelandic: 'halló',
        english: 'hello',
        partOfSpeech: 'interjection',
        frequency: 100,
        exampleSentence: 'Halló! Hvað segirðu?',
      },
    }),
    prisma.vocabulary.upsert({
      where: { icelandic: 'bless' },
      update: {},
      create: {
        icelandic: 'bless',
        english: 'goodbye',
        partOfSpeech: 'interjection',
        frequency: 95,
        exampleSentence: 'Bless! Sjáumst.',
      },
    }),
    prisma.vocabulary.upsert({
      where: { icelandic: 'takk' },
      update: {},
      create: {
        icelandic: 'takk',
        english: 'thank you',
        partOfSpeech: 'noun',
        frequency: 90,
        exampleSentence: 'Takk fyrir!',
      },
    }),
    prisma.vocabulary.upsert({
      where: { icelandic: 'já' },
      update: {},
      create: {
        icelandic: 'já',
        english: 'yes',
        partOfSpeech: 'adverb',
        frequency: 98,
        exampleSentence: 'Já, það er rétt.',
      },
    }),
    prisma.vocabulary.upsert({
      where: { icelandic: 'nei' },
      update: {},
      create: {
        icelandic: 'nei',
        english: 'no',
        partOfSpeech: 'adverb',
        frequency: 97,
        exampleSentence: 'Nei, ekki ég.',
      },
    }),
    prisma.vocabulary.upsert({
      where: { icelandic: 'ég' },
      update: {},
      create: {
        icelandic: 'ég',
        english: 'I',
        partOfSpeech: 'pronoun',
        frequency: 99,
        exampleSentence: 'Ég heiti Anna.',
      },
    }),
    prisma.vocabulary.upsert({
      where: { icelandic: 'heiti' },
      update: {},
      create: {
        icelandic: 'heiti',
        english: 'am called/named',
        partOfSpeech: 'verb',
        frequency: 85,
        exampleSentence: 'Ég heiti Jón.',
      },
    }),
  ])

  console.log('Created vocabularies:', vocabularies.length)

  // Create Lesson 1: Greetings
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson-1-greetings' },
    update: {},
    create: {
      id: 'lesson-1-greetings',
      unitId: unit1.id,
      title: 'Lesson 1: Greetings',
      description: 'Learn how to say hello and goodbye in Icelandic',
      order: 1,
      xpReward: 10,
      status: LessonStatus.PUBLISHED,
    },
  })

  console.log('Created Lesson 1:', lesson1.title)

  // Create exercises for Lesson 1
  const exercises = await Promise.all([
    // MCQ Exercise 1
    prisma.exercise.create({
      data: {
        lessonId: lesson1.id,
        type: ExerciseType.MULTIPLE_CHOICE,
        order: 1,
        question: 'How do you say "hello" in Icelandic?',
        correctAnswer: 'halló',
        options: ['halló', 'bless', 'takk', 'góðan daginn'],
        hint: 'It sounds similar to English!',
        explanation: 'Halló is the informal way to say hello in Icelandic.',
      },
    }),
    // MCQ Exercise 2
    prisma.exercise.create({
      data: {
        lessonId: lesson1.id,
        type: ExerciseType.MULTIPLE_CHOICE,
        order: 2,
        question: 'What does "bless" mean?',
        correctAnswer: 'goodbye',
        options: ['hello', 'goodbye', 'thank you', 'please'],
        hint: 'It\'s used when leaving.',
        explanation: 'Bless is the common way to say goodbye in Icelandic.',
      },
    }),
    // Typing Exercise
    prisma.exercise.create({
      data: {
        lessonId: lesson1.id,
        type: ExerciseType.TYPING,
        order: 3,
        question: 'Type "thank you" in Icelandic:',
        correctAnswer: 'takk',
        options: [],
        hint: 'It\'s a short word.',
        explanation: 'Takk means thank you. You can also say "takk fyrir" (thanks for).',
      },
    }),
    // Word Order Exercise
    prisma.exercise.create({
      data: {
        lessonId: lesson1.id,
        type: ExerciseType.WORD_ORDER,
        order: 4,
        question: 'Arrange the words: "My name is Anna" in Icelandic',
        correctAnswer: 'Ég|heiti|Anna',
        options: ['Ég', 'heiti', 'Anna'],
        hint: 'Think: I am-called Anna',
        explanation: 'In Icelandic, "Ég heiti Anna" literally means "I am called Anna".',
      },
    }),
    // MCQ Exercise 3
    prisma.exercise.create({
      data: {
        lessonId: lesson1.id,
        type: ExerciseType.MULTIPLE_CHOICE,
        order: 5,
        question: 'How do you say "yes" in Icelandic?',
        correctAnswer: 'já',
        options: ['já', 'nei', 'kannski', 'veit ekki'],
        hint: 'It starts with j',
        explanation: 'Já means yes in Icelandic.',
      },
    }),
  ])

  console.log('Created exercises:', exercises.length)

  // Link exercises to vocabularies
  await Promise.all([
    prisma.exerciseVocabulary.create({
      data: {
        exerciseId: exercises[0].id,
        vocabularyId: vocabularies[0].id, // halló
      },
    }),
    prisma.exerciseVocabulary.create({
      data: {
        exerciseId: exercises[1].id,
        vocabularyId: vocabularies[1].id, // bless
      },
    }),
    prisma.exerciseVocabulary.create({
      data: {
        exerciseId: exercises[2].id,
        vocabularyId: vocabularies[2].id, // takk
      },
    }),
  ])

  // Create Lesson 2: Basic Phrases
  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'lesson-2-phrases' },
    update: {},
    create: {
      id: 'lesson-2-phrases',
      unitId: unit1.id,
      title: 'Lesson 2: Basic Phrases',
      description: 'Learn essential everyday phrases',
      order: 2,
      xpReward: 15,
      status: LessonStatus.PUBLISHED,
    },
  })

  console.log('Created Lesson 2:', lesson2.title)

  // Add sample frequency list entries
  const frequencyWords = [
    { word: 'og', frequency: 10000, rank: 1 },
    { word: 'í', frequency: 9500, rank: 2 },
    { word: 'að', frequency: 9000, rank: 3 },
    { word: 'er', frequency: 8500, rank: 4 },
    { word: 'á', frequency: 8000, rank: 5 },
  ]

  for (const fw of frequencyWords) {
    await prisma.frequencyList.upsert({
      where: { word: fw.word },
      update: {},
      create: fw,
    })
  }

  console.log('Created frequency list entries:', frequencyWords.length)

  // Add sample sentences to corpus
  const sentences = [
    {
      icelandic: 'Halló, hvað segirðu?',
      english: 'Hello, how are you?',
      difficulty: 1,
    },
    {
      icelandic: 'Ég heiti Anna.',
      english: 'My name is Anna.',
      difficulty: 1,
    },
    {
      icelandic: 'Gott að kynnast þér.',
      english: 'Nice to meet you.',
      difficulty: 2,
    },
  ]

  for (const sentence of sentences) {
    await prisma.sentenceCorpus.create({
      data: sentence,
    })
  }

  console.log('Created sentence corpus entries:', sentences.length)

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
