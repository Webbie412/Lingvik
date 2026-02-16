import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting database seed...')

  // Create an admin user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lingvik.com' },
    update: {},
    create: {
      email: 'admin@lingvik.com',
      name: 'Admin User',
      password: hashedPassword,
      xp: 0,
      streak: 0,
    },
  })
  console.log('Created admin user:', admin.email)

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Test User',
      password: hashedPassword,
      xp: 100,
      streak: 3,
    },
  })
  console.log('Created test user:', testUser.email)

  // Create Level: Beginner (A1)
  const beginnerLevel = await prisma.level.upsert({
    where: { id: 'level-beginner' },
    update: {},
    create: {
      id: 'level-beginner',
      name: 'Beginner',
      description: 'Start your Icelandic journey',
      order: 1,
      cefrLevel: 'A1',
    },
  })
  console.log('Created level:', beginnerLevel.name)

  // Create Unit 1: Greetings and Basics
  const unit1 = await prisma.unit.upsert({
    where: { id: 'unit-1' },
    update: {},
    create: {
      id: 'unit-1',
      levelId: beginnerLevel.id,
      name: 'Greetings and Basics',
      description: 'Learn essential greetings and basic phrases',
      order: 1,
      grammarFocus: 'Present tense, basic sentence structure',
      cefrLevel: 'A1',
      isPublished: true,
    },
  })
  console.log('Created unit:', unit1.name)

  // Create vocabulary for Unit 1
  const vocab1 = [
    { icelandic: 'halló', english: 'hello', partOfSpeech: 'interjection', frequency: 100 },
    { icelandic: 'bless', english: 'goodbye', partOfSpeech: 'interjection', frequency: 150 },
    { icelandic: 'takk', english: 'thanks', partOfSpeech: 'interjection', frequency: 80 },
    { icelandic: 'já', english: 'yes', partOfSpeech: 'adverb', frequency: 50 },
    { icelandic: 'nei', english: 'no', partOfSpeech: 'adverb', frequency: 60 },
    { icelandic: 'góðan daginn', english: 'good day', partOfSpeech: 'phrase', frequency: 200 },
    { icelandic: 'ég', english: 'I', partOfSpeech: 'pronoun', frequency: 10 },
    { icelandic: 'þú', english: 'you', partOfSpeech: 'pronoun', frequency: 20 },
    { icelandic: 'heiti', english: 'am called/named', partOfSpeech: 'verb', frequency: 300 },
    { icelandic: 'er', english: 'is/am/are', partOfSpeech: 'verb', frequency: 5 },
  ]

  for (const word of vocab1) {
    const vocabulary = await prisma.vocabulary.upsert({
      where: { icelandic: word.icelandic },
      update: {},
      create: word,
    })
    
    await prisma.unitVocabulary.upsert({
      where: {
        unitId_vocabularyId: {
          unitId: unit1.id,
          vocabularyId: vocabulary.id,
        },
      },
      update: {},
      create: {
        unitId: unit1.id,
        vocabularyId: vocabulary.id,
      },
    })
  }
  console.log('Created vocabulary for Unit 1')

  // Create Lesson 1
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson-1' },
    update: {},
    create: {
      id: 'lesson-1',
      unitId: unit1.id,
      name: 'Basic Greetings',
      description: 'Learn how to say hello and goodbye',
      order: 1,
      xpReward: 15,
      isPublished: true,
    },
  })
  console.log('Created lesson:', lesson1.name)

  // Create exercises for Lesson 1
  const exercises = [
    {
      type: 'multiple_choice',
      prompt: 'How do you say "hello" in Icelandic?',
      correctAnswers: JSON.stringify(['halló']),
      options: JSON.stringify(['halló', 'bless', 'takk', 'góðan daginn']),
      grammarTag: 'greetings',
      difficulty: 1,
      order: 1,
      xpReward: 5,
    },
    {
      type: 'multiple_choice',
      prompt: 'What does "bless" mean in English?',
      correctAnswers: JSON.stringify(['goodbye']),
      options: JSON.stringify(['hello', 'goodbye', 'thanks', 'yes']),
      grammarTag: 'greetings',
      difficulty: 1,
      order: 2,
      xpReward: 5,
    },
    {
      type: 'typing',
      prompt: 'Translate to Icelandic: "thank you"',
      correctAnswers: JSON.stringify(['takk', 'takk fyrir']),
      
      grammarTag: 'greetings',
      difficulty: 2,
      order: 3,
      xpReward: 5,
    },
    {
      type: 'word_order',
      prompt: 'Arrange these words: "I am called Anna" (Ég heiti Anna)',
      correctAnswers: JSON.stringify(['Ég heiti Anna']),
      options: JSON.stringify(['Ég', 'heiti', 'Anna']),
      grammarTag: 'introductions',
      difficulty: 2,
      order: 4,
      xpReward: 5,
    },
    {
      type: 'multiple_choice',
      prompt: 'How do you say "yes" in Icelandic?',
      correctAnswers: JSON.stringify(['já']),
      options: JSON.stringify(['já', 'nei', 'takk', 'bless']),
      grammarTag: 'basic_words',
      difficulty: 1,
      order: 5,
      xpReward: 5,
    },
  ]

  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: {
        ...exercise,
        lessonId: lesson1.id,
      },
    })
  }
  console.log('Created exercises for Lesson 1')

  // Create Unit 2: Family and People
  const unit2 = await prisma.unit.upsert({
    where: { id: 'unit-2' },
    update: {},
    create: {
      id: 'unit-2',
      levelId: beginnerLevel.id,
      name: 'Family and People',
      description: 'Talk about family members and people',
      order: 2,
      grammarFocus: 'Nouns, basic possessives',
      cefrLevel: 'A1',
      isPublished: true,
    },
  })
  console.log('Created unit:', unit2.name)

  // Create vocabulary for Unit 2
  const vocab2 = [
    { icelandic: 'faðir', english: 'father', partOfSpeech: 'noun', frequency: 400 },
    { icelandic: 'móðir', english: 'mother', partOfSpeech: 'noun', frequency: 410 },
    { icelandic: 'bróðir', english: 'brother', partOfSpeech: 'noun', frequency: 450 },
    { icelandic: 'systir', english: 'sister', partOfSpeech: 'noun', frequency: 460 },
    { icelandic: 'barn', english: 'child', partOfSpeech: 'noun', frequency: 350 },
    { icelandic: 'maður', english: 'man', partOfSpeech: 'noun', frequency: 250 },
    { icelandic: 'kona', english: 'woman', partOfSpeech: 'noun', frequency: 260 },
    { icelandic: 'vinur', english: 'friend', partOfSpeech: 'noun', frequency: 380 },
  ]

  for (const word of vocab2) {
    const vocabulary = await prisma.vocabulary.upsert({
      where: { icelandic: word.icelandic },
      update: {},
      create: word,
    })
    
    await prisma.unitVocabulary.upsert({
      where: {
        unitId_vocabularyId: {
          unitId: unit2.id,
          vocabularyId: vocabulary.id,
        },
      },
      update: {},
      create: {
        unitId: unit2.id,
        vocabularyId: vocabulary.id,
      },
    })
  }
  console.log('Created vocabulary for Unit 2')

  // Create Lesson 2
  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'lesson-2' },
    update: {},
    create: {
      id: 'lesson-2',
      unitId: unit2.id,
      name: 'Family Members',
      description: 'Learn words for family members',
      order: 1,
      xpReward: 15,
      isPublished: true,
    },
  })
  console.log('Created lesson:', lesson2.name)

  // Create exercises for Lesson 2
  const exercises2 = [
    {
      type: 'multiple_choice',
      prompt: 'What is "mother" in Icelandic?',
      correctAnswers: JSON.stringify(['móðir']),
      options: JSON.stringify(['móðir', 'faðir', 'systir', 'bróðir']),
      grammarTag: 'family',
      difficulty: 1,
      order: 1,
      xpReward: 5,
    },
    {
      type: 'matching',
      prompt: 'Match the Icelandic words with their English meanings',
      correctAnswers: JSON.stringify([
        { icelandic: 'faðir', english: 'father' },
        { icelandic: 'systir', english: 'sister' },
        { icelandic: 'bróðir', english: 'brother' },
      ]),
      options: JSON.stringify({
        icelandic: ['faðir', 'systir', 'bróðir'],
        english: ['father', 'sister', 'brother'],
      }),
      grammarTag: 'family',
      difficulty: 2,
      order: 2,
      xpReward: 5,
    },
    {
      type: 'typing',
      prompt: 'Translate to Icelandic: "friend"',
      correctAnswers: JSON.stringify(['vinur']),
      
      grammarTag: 'people',
      difficulty: 2,
      order: 3,
      xpReward: 5,
    },
  ]

  for (const exercise of exercises2) {
    await prisma.exercise.create({
      data: {
        ...exercise,
        lessonId: lesson2.id,
      },
    })
  }
  console.log('Created exercises for Lesson 2')

  // Create Unit 3: Numbers and Time
  const unit3 = await prisma.unit.upsert({
    where: { id: 'unit-3' },
    update: {},
    create: {
      id: 'unit-3',
      levelId: beginnerLevel.id,
      name: 'Numbers and Time',
      description: 'Learn to count and tell time',
      order: 3,
      grammarFocus: 'Cardinal numbers, time expressions',
      cefrLevel: 'A1',
      isPublished: true,
    },
  })
  console.log('Created unit:', unit3.name)

  // Create vocabulary for Unit 3
  const vocab3 = [
    { icelandic: 'einn', english: 'one', partOfSpeech: 'numeral', frequency: 100 },
    { icelandic: 'tveir', english: 'two', partOfSpeech: 'numeral', frequency: 110 },
    { icelandic: 'þrír', english: 'three', partOfSpeech: 'numeral', frequency: 120 },
    { icelandic: 'fjórir', english: 'four', partOfSpeech: 'numeral', frequency: 130 },
    { icelandic: 'fimm', english: 'five', partOfSpeech: 'numeral', frequency: 140 },
    { icelandic: 'dagur', english: 'day', partOfSpeech: 'noun', frequency: 200 },
    { icelandic: 'vika', english: 'week', partOfSpeech: 'noun', frequency: 250 },
    { icelandic: 'mánuður', english: 'month', partOfSpeech: 'noun', frequency: 280 },
  ]

  for (const word of vocab3) {
    const vocabulary = await prisma.vocabulary.upsert({
      where: { icelandic: word.icelandic },
      update: {},
      create: word,
    })
    
    await prisma.unitVocabulary.upsert({
      where: {
        unitId_vocabularyId: {
          unitId: unit3.id,
          vocabularyId: vocabulary.id,
        },
      },
      update: {},
      create: {
        unitId: unit3.id,
        vocabularyId: vocabulary.id,
      },
    })
  }
  console.log('Created vocabulary for Unit 3')

  // Create Lesson 3
  const lesson3 = await prisma.lesson.upsert({
    where: { id: 'lesson-3' },
    update: {},
    create: {
      id: 'lesson-3',
      unitId: unit3.id,
      name: 'Counting 1-5',
      description: 'Learn numbers one through five',
      order: 1,
      xpReward: 15,
      isPublished: true,
    },
  })
  console.log('Created lesson:', lesson3.name)

  // Create exercises for Lesson 3
  const exercises3 = [
    {
      type: 'multiple_choice',
      prompt: 'What is "one" in Icelandic?',
      correctAnswers: JSON.stringify(['einn']),
      options: JSON.stringify(['einn', 'tveir', 'þrír', 'fjórir']),
      grammarTag: 'numbers',
      difficulty: 1,
      order: 1,
      xpReward: 5,
    },
    {
      type: 'typing',
      prompt: 'Translate to Icelandic: "three"',
      correctAnswers: JSON.stringify(['þrír']),
      
      grammarTag: 'numbers',
      difficulty: 2,
      order: 2,
      xpReward: 5,
    },
    {
      type: 'multiple_choice',
      prompt: 'What does "fimm" mean?',
      correctAnswers: JSON.stringify(['five']),
      options: JSON.stringify(['three', 'four', 'five', 'six']),
      grammarTag: 'numbers',
      difficulty: 1,
      order: 3,
      xpReward: 5,
    },
  ]

  for (const exercise of exercises3) {
    await prisma.exercise.create({
      data: {
        ...exercise,
        lessonId: lesson3.id,
      },
    })
  }
  console.log('Created exercises for Lesson 3')

  // Create some achievements
  const achievements = [
    {
      name: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      xpReward: 10,
      condition: JSON.stringify({ lessonsCompleted: 1 }),
    },
    {
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      xpReward: 50,
      condition: JSON.stringify({ streak: 7 }),
    },
    {
      name: 'Vocabulary Master',
      description: 'Learn 50 new words',
      icon: '📚',
      xpReward: 100,
      condition: JSON.stringify({ vocabularyLearned: 50 }),
    },
    {
      name: 'Unit Champion',
      description: 'Complete all lessons in a unit',
      icon: '🏆',
      xpReward: 25,
      condition: JSON.stringify({ unitsCompleted: 1 }),
    },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    })
  }
  console.log('Created achievements')

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
