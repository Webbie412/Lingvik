# Lingvik

A Duolingo-style language learning web application for Icelandic, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎮 **Gamified Learning**: Earn XP, maintain streaks, unlock badges
- 📚 **Multiple Exercise Types**: MCQ, typing, word-order, matching exercises
- 🧠 **Spaced Repetition**: Smart vocabulary review using SM-2 algorithm
- 🤖 **AI-Powered Content**: Generate lessons with LLM integration
- 🔐 **Authentication**: Email/password and OAuth (Google, GitHub)
- 👨‍💼 **Admin Studio**: Upload frequency lists, import corpus, manage lesson drafts

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI API (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Webbie412/Lingvik.git
cd Lingvik
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL and other credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lingvik?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
# Optional: OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# Optional: AI lesson generation
OPENAI_API_KEY=""
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
lingvik/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Seed data for Unit 1
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── learn/        # Main learning interface
│   │   ├── lesson/       # Individual lesson pages
│   │   ├── review/       # Vocabulary review
│   │   └── admin/        # Admin studio
│   ├── components/       # React components
│   │   ├── exercises/    # Exercise types
│   │   └── admin/        # Admin components
│   └── lib/              # Utilities
└── public/               # Static assets
```

## Database Schema

The application uses the following main models:

- **User**: User accounts and authentication
- **Unit**: Learning units (e.g., "Unit 1: Basics")
- **Lesson**: Individual lessons within units
- **Exercise**: Different exercise types (MCQ, typing, etc.)
- **UserProgress**: Track XP, streaks, level
- **Vocabulary**: Icelandic words with translations
- **VocabularyMastery**: Spaced repetition data
- **Badge**: Achievements
- **LessonDraft**: AI-generated lesson drafts for review

## Admin Studio

Access the admin panel at `/admin` to:

1. **Upload Frequency Lists**: CSV format with `word,frequency,rank`
2. **Import Sentence Corpus**: CSV format with `icelandic,english,difficulty`
3. **Generate Lessons**: Use AI to create lesson drafts
4. **Manage Drafts**: Review, edit, approve/reject lesson drafts

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with initial data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License - see LICENSE file for details

## Acknowledgments

- Inspired by Duolingo's learning approach
- Uses SM-2 spaced repetition algorithm
- Built with modern web technologies

