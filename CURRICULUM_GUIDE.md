# Curriculum Extension Guide

This guide explains how to extend the Lingvik curriculum using imported datasets and AI-generated content.

## Table of Contents

1. [Overview](#overview)
2. [Data Sources](#data-sources)
3. [Import Process](#import-process)
4. [Generating Lessons](#generating-lessons)
5. [Review and Approval](#review-and-approval)
6. [Best Practices](#best-practices)

---

## Overview

Lingvik supports importing curriculum data from various open sources and generating lessons using AI. All AI-generated content requires admin approval before being published to students.

### Workflow

1. **Import** vocabulary, sentences, or morphology data
2. **Generate** lesson drafts using imported data
3. **Review** generated content
4. **Approve** and publish lessons
5. **Monitor** student progress

---

## Data Sources

### 1. Icelandic Online (University of Iceland)

**What it provides:**
- Unit themes and structure
- Grammar progression
- Vocabulary lists
- Dialogues

**Format:**
```json
{
  "vocabulary": [
    {
      "icelandic": "hestur",
      "english": "horse",
      "partOfSpeech": "noun",
      "frequency": 500,
      "notes": "Common animal"
    }
  ]
}
```

**How to use:**
1. Extract content from [Icelandic Online](https://icelandiconline.com)
2. Convert to JSON format
3. Import via Admin Dashboard

### 2. Frequency Word Lists

**What it provides:**
- Top 1,000 / 3,000 most common words
- Frequency rankings
- Part of speech

**Format:**
```json
[
  {"icelandic": "vera", "english": "to be", "partOfSpeech": "verb", "frequency": 1},
  {"icelandic": "hafa", "english": "to have", "partOfSpeech": "verb", "frequency": 2},
  {"icelandic": "geta", "english": "can", "partOfSpeech": "verb", "frequency": 3}
]
```

**Sources:**
- Wiktionary frequency lists
- Corpus-based word frequencies
- Academic linguistic databases

### 3. Tatoeba Parallel Corpora

**What it provides:**
- Icelandic-English sentence pairs
- Real-world usage examples
- Translation practice material

**Format:**
```json
{
  "sentences": [
    {
      "icelandic": "Góðan daginn!",
      "english": "Good day!",
      "source": "tatoeba",
      "id": "123456"
    }
  ]
}
```

**How to extract:**
```bash
# Download Tatoeba data
wget https://downloads.tatoeba.org/exports/sentences.tar.bz2

# Filter for Icelandic
# Convert to JSON
# Import to Lingvik
```

### 4. Wiktionary Morphology

**What it provides:**
- Verb conjugations
- Noun declensions
- Grammatical patterns

**Format:**
```json
{
  "morphology": [
    {
      "word": "tala",
      "type": "verb",
      "infinitive": "tala",
      "forms": {
        "present": {
          "1sg": "tala",
          "2sg": "talar",
          "3sg": "talar"
        }
      }
    }
  ]
}
```

---

## Import Process

### Via Admin Dashboard

1. **Navigate to Admin Panel**
   - Login with admin credentials
   - Go to `/admin`
   - Click "Import Curriculum" tab

2. **Select Source and Type**
   - Source: icelandic_online, frequency_list, tatoeba, wiktionary
   - Type: vocabulary, sentences, morphology

3. **Paste JSON Data**
   - Format data according to source type
   - Validate JSON before importing
   - Click "Import Data"

### Via API

```javascript
// Import vocabulary programmatically
const importVocabulary = async (data) => {
  const response = await fetch('/api/admin/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'frequency_list',
      type: 'vocabulary',
      data: data
    })
  });
  
  return response.json();
};
```

### Batch Import Script

```javascript
// scripts/import-vocabulary.js
const fs = require('fs');

async function batchImport(filename) {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  
  // Split into chunks of 100
  const chunks = [];
  for (let i = 0; i < data.length; i += 100) {
    chunks.push(data.slice(i, i + 100));
  }
  
  // Import each chunk
  for (const chunk of chunks) {
    await fetch('http://localhost:3000/api/admin/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'custom',
        type: 'vocabulary',
        data: chunk
      })
    });
    
    // Wait 1 second between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

batchImport('./data/vocabulary-1000.json');
```

---

## Generating Lessons

### Automatic Generation

1. **Go to "Generate Lesson" tab**
2. **Fill in details:**
   - Unit ID (e.g., "unit-1")
   - Grammar focus (e.g., "Present tense verbs")
   - Vocabulary IDs (optional - specific words to include)

3. **Click "Generate Lesson Draft"**

The AI will:
- Select appropriate vocabulary from the unit
- Create multiple exercise types
- Follow grammar focus guidelines
- Generate prompts and answer options

### Exercise Generation Logic

Current implementation generates:
- **Multiple Choice**: Vocabulary translation questions
- **Typing**: Translation exercises
- **Fill-in-the-Blank**: From sentence corpus
- **Word Order**: Sentence construction
- **Matching**: Vocabulary pairs

### Customizing Generation

To customize lesson generation, edit:
```
/app/api/admin/draft-lessons/route.ts
```

The `generateExercisesWithAI()` function contains the generation logic.

For true AI generation, integrate:
- OpenAI API
- Anthropic Claude
- Custom LLM fine-tuned on Icelandic

Example integration:
```javascript
async function generateWithAI(prompt, vocabulary) {
  const response = await openai.createCompletion({
    model: "gpt-4",
    prompt: `Generate 5 Icelandic exercises for ${prompt}
             Using vocabulary: ${vocabulary.join(', ')}
             Format: JSON array of exercises`,
    temperature: 0.7,
  });
  
  return JSON.parse(response.choices[0].text);
}
```

---

## Review and Approval

### Draft Review Process

1. **View Draft Lessons**
   - Go to "Draft Lessons" tab
   - See all pending drafts

2. **Review Content**
   - Check exercise quality
   - Verify translations
   - Test difficulty level
   - Ensure grammar alignment

3. **Approve or Reject**
   - Click "Approve & Publish" to make live
   - Click "Reject" to remove draft
   - Add review notes for documentation

### Quality Checklist

Before approving, verify:
- [ ] All translations are correct
- [ ] Grammar explanations are accurate
- [ ] Difficulty matches unit level
- [ ] Exercise variety is appropriate
- [ ] No offensive or inappropriate content
- [ ] Audio files work (if applicable)
- [ ] Images are appropriate (if applicable)

---

## Best Practices

### Curriculum Design

1. **Follow CEFR Levels**
   - A1: Basic greetings, numbers, simple sentences
   - A2: Past tense, common phrases, directions
   - B1: Complex sentences, opinions, descriptions
   - B2: Formal language, abstract concepts
   - C1: Nuanced expressions, idioms
   - C2: Native-level complexity

2. **Progressive Difficulty**
   - Start with high-frequency words
   - Introduce grammar gradually
   - Build on previous lessons
   - Review before advancing

3. **Balanced Exercise Types**
   - Mix of recognition and production
   - Include listening and typing
   - Vary difficulty within lessons
   - Provide immediate feedback

### Data Quality

1. **Vocabulary Selection**
   - Prioritize frequency over obscurity
   - Include relevant cultural terms
   - Group by theme (family, food, travel)
   - Add context and usage notes

2. **Sentence Pairs**
   - Use natural, conversational language
   - Verify translations are accurate
   - Include variety of sentence structures
   - Mark difficulty levels

3. **Morphology Data**
   - Cover all common conjugations
   - Include irregular forms
   - Provide usage examples
   - Link to vocabulary items

### Lesson Structure

Recommended structure per lesson:
1. **Introduction** (1-2 exercises)
   - Preview new vocabulary
   - Introduce grammar concept

2. **Practice** (5-7 exercises)
   - Multiple choice for recognition
   - Typing for production
   - Listening for comprehension

3. **Application** (2-3 exercises)
   - Sentence construction
   - Fill-in-the-blank
   - Matching

4. **Review** (1-2 exercises)
   - Mixed question types
   - Previously learned content

### Maintenance

1. **Regular Updates**
   - Add new vocabulary monthly
   - Update based on student feedback
   - Fix reported errors promptly
   - Expand advanced levels

2. **Analytics Review**
   - Monitor completion rates
   - Identify difficult exercises
   - Track student performance
   - Adjust difficulty accordingly

3. **Community Input**
   - Accept curriculum suggestions
   - Incorporate user feedback
   - Collaborate with Icelandic speakers
   - Stay updated with language changes

---

## Advanced Topics

### Custom Exercise Types

To add new exercise types:

1. Update database schema
2. Add rendering logic in lesson page
3. Implement grading logic in API
4. Add generation rules for AI

### AI Model Fine-Tuning

For better results, consider:
- Fine-tuning on Icelandic corpus
- Training on linguistic patterns
- Incorporating grammar rules
- Using retrieval-augmented generation

### Integration with External APIs

Connect to:
- Forvo for pronunciation audio
- Google Cloud TTS for Icelandic
- Dictionary APIs for definitions
- Grammar checking services

---

## Resources

### Icelandic Language Resources
- [Icelandic Online](https://icelandiconline.com) - Official curriculum
- [Tatoeba](https://tatoeba.org) - Sentence database
- [Wiktionary](https://is.wiktionary.org) - Morphology data
- [Málföng](https://malfong.is) - Language resources

### Development Tools
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [Next.js Docs](https://nextjs.org/docs) - Framework docs
- [Tailwind CSS](https://tailwindcss.com) - Styling

### Support
- GitHub Issues for bugs
- Discussions for questions
- Email for private concerns

---

## Example Workflows

### Adding a New Unit

```javascript
// 1. Create unit
const unit = await prisma.unit.create({
  data: {
    levelId: 'level-beginner',
    name: 'Food and Dining',
    description: 'Learn words related to food',
    order: 4,
    grammarFocus: 'Nouns and articles',
    cefrLevel: 'A1',
    isPublished: true,
  }
});

// 2. Import vocabulary
await importVocabulary([
  {icelandic: 'matur', english: 'food', partOfSpeech: 'noun'},
  {icelandic: 'vatn', english: 'water', partOfSpeech: 'noun'},
  // ... more words
]);

// 3. Generate lessons
await generateLesson({
  unitId: unit.id,
  grammarFocus: 'Nouns and articles',
});

// 4. Review and approve
// Via admin dashboard
```

### Importing from CSV

```javascript
const csv = require('csv-parser');
const fs = require('fs');

const results = [];
fs.createReadStream('vocabulary.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    await importVocabulary(results);
  });
```

---

## Conclusion

The curriculum system is designed to be flexible and scalable. Start with the provided examples, then expand based on your needs and student feedback. Always prioritize quality over quantity, and involve native Icelandic speakers in the review process when possible.

For questions or contributions, please open an issue or pull request on GitHub.
