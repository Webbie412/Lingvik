# Lingvik

A gamified language-learning platform focused on Icelandic, combining structured lessons, spaced-repetition vocabulary training, and AI-assisted exercise generation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-7.4-brightgreen)

## ✨ Features

### 🎓 For Learners

- **Structured Curriculum**: Progress from beginner to advanced through carefully designed levels and units
- **Multiple Exercise Types**: Multiple choice, typing, word order, matching, fill-in-the-blank, and listening exercises
- **Gamification**: Earn XP, maintain daily streaks, and unlock achievements
- **Spaced Repetition**: Review vocabulary at optimal intervals for better retention
- **Progress Tracking**: Monitor your learning journey with detailed progress stats
- **Mobile-Friendly**: Learn on any device with a responsive design

### 🛠️ For Admins

- **Curriculum Import**: Import vocabulary, sentences, and morphology from various sources
- **AI Lesson Generation**: Automatically generate lesson drafts using imported content
- **Review System**: All AI-generated content requires manual approval before publishing
- **Data Sources Support**:
  - Icelandic Online (University of Iceland)
  - Frequency word lists (top 1k/3k words)
  - Tatoeba parallel corpora
  - Wiktionary morphology datasets

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Database (PostgreSQL recommended, SQLite for development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Webbie412/Lingvik.git
cd Lingvik
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database**
```bash
# Run migrations
npx prisma migrate dev

# Seed with example data
npx prisma db seed
```

5. **Start development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

### Test Accounts

After seeding, you can login with:
- **Admin**: `admin@lingvik.com` / `password123`
- **User**: `user@test.com` / `password123`

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [Curriculum Guide](./CURRICULUM_GUIDE.md) - Extending the curriculum with imported datasets

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Prisma ORM with PostgreSQL/SQLite
- **Authentication**: NextAuth.js
- **Deployment**: Vercel, Railway, or Docker

### Database Schema

Core tables:
- **Users** - User accounts and gamification data
- **Levels** - Curriculum levels (Beginner, Intermediate, Advanced)
- **Units** - Learning units grouped by level
- **Lessons** - Individual lessons within units
- **Exercises** - Exercise content with various types
- **Vocabulary** - Word database with translations
- **UserProgress** - Student progress tracking
- **ExerciseAttempts** - Individual exercise submissions
- **ReviewQueue** - Spaced repetition scheduling
- **Achievements** - Gamification achievements
- **CurriculumImports** - Import tracking
- **DraftLessons** - AI-generated lessons awaiting approval

## 🎮 Features in Detail

### Exercise Types

1. **Multiple Choice**: Select the correct translation from 4 options
2. **Typing**: Type the translation in the target language
3. **Word Order**: Arrange words to form correct sentences
4. **Matching**: Match Icelandic words with English translations
5. **Fill-in-the-Blank**: Complete sentences with missing words
6. **Listening**: Transcribe or translate audio (placeholder)

### Gamification

- **XP System**: Earn points for completing exercises and lessons
- **Streaks**: Track consecutive days of learning
- **Achievements**: Unlock badges for milestones
- **Progress Bars**: Visual feedback on lesson completion
- **Celebrations**: Success animations when completing lessons

### Curriculum System

The curriculum is based on:
- **CEFR Levels**: A1 through C2 proficiency levels
- **Grammar Progression**: Systematic grammar introduction
- **Frequency-Based Vocabulary**: Most common words first
- **Thematic Units**: Grouped by real-world topics

## 🔧 Development

### Project Structure

```
Lingvik/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication
│   │   ├── lessons/      # Lesson endpoints
│   │   ├── progress/     # Progress tracking
│   │   ├── exercises/    # Exercise submission
│   │   └── admin/        # Admin endpoints
│   ├── auth/             # Auth pages
│   ├── learn/            # Main learning interface
│   ├── lesson/[id]/      # Individual lesson pages
│   └── admin/            # Admin dashboard
├── components/            # React components
├── lib/                   # Utilities and helpers
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Seed data script
│   └── migrations/       # Migration history
└── public/               # Static assets
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma migrate dev # Create new migration
npx prisma db seed   # Seed database with data
npx prisma generate  # Generate Prisma Client
```

### Adding New Features

1. **New Exercise Type**: Update schema, API, and lesson page
2. **New Unit**: Use admin dashboard or create programmatically
3. **Custom Import**: Extend `/api/admin/import` route
4. **New Achievement**: Add to seed file or database

## 🌍 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features (when test infrastructure exists)
- Update documentation as needed
- Respect existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Icelandic Online** (University of Iceland) - Curriculum inspiration
- **Tatoeba** - Sentence corpora
- **Wiktionary** - Morphology data
- **Next.js Team** - Amazing framework
- **Prisma Team** - Excellent ORM
- **Duolingo** - UX inspiration

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/Webbie412/Lingvik/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Webbie412/Lingvik/discussions)

## 🗺️ Roadmap

### MVP (Current)
- [x] User authentication
- [x] Lesson path interface
- [x] Exercise rendering (all types)
- [x] Progress tracking
- [x] Gamification (XP, streaks)
- [x] Admin curriculum import
- [x] AI lesson generation
- [x] Draft approval system

### Future Enhancements
- [ ] Spaced repetition algorithm refinement
- [ ] Audio integration for listening exercises
- [ ] Pronunciation practice with speech recognition
- [ ] Social features (leaderboards, friends)
- [ ] Mobile apps (iOS, Android)
- [ ] More language support
- [ ] Advanced analytics dashboard
- [ ] Community-contributed content

## 💡 Use Cases

- **Self-Study**: Learn Icelandic at your own pace
- **Classroom Supplement**: Teachers can use as homework tool
- **Language Exchange**: Practice with structured content
- **Travel Preparation**: Learn basics before visiting Iceland
- **Academic Research**: Study language learning patterns

## 🔒 Security

- Passwords hashed with bcrypt
- Session management with NextAuth.js
- Environment variables for secrets
- SQL injection prevention via Prisma
- Input validation on all endpoints
- HTTPS recommended for production

## ⚙️ Configuration

### Environment Variables

Required:
```env
DATABASE_URL=          # Database connection string
NEXTAUTH_URL=         # Your app URL
NEXTAUTH_SECRET=      # Random secret for NextAuth
```

Optional:
```env
GOOGLE_CLIENT_ID=     # For Google OAuth
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=     # For GitHub OAuth
GITHUB_CLIENT_SECRET=
```

### Database Providers

Supports:
- PostgreSQL (recommended for production)
- SQLite (great for development)
- MySQL (with schema adjustments)
- CockroachDB (serverless option)

## 📊 Stats

- **100%** TypeScript coverage
- **20+** API endpoints
- **6** exercise types supported
- **3** example units included
- **50+** vocabulary words seeded
- **15+** exercises pre-loaded

## 🎯 Goals

Make Icelandic learning:
1. **Accessible** - Free and open-source
2. **Effective** - Research-backed methods
3. **Engaging** - Gamification and immediate feedback
4. **Scalable** - Support thousands of learners
5. **Extensible** - Easy to add content and features

---

**Built with ❤️ for Icelandic language learners**
