import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">
            Lingvik
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            Learn Icelandic the fun way
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master Icelandic through gamified lessons, spaced repetition, 
            and AI-powered exercises. Start your journey today!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/auth/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition text-center"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition text-center"
          >
            Login
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Structured Curriculum</h3>
            <p className="text-gray-600">
              Follow a carefully designed curriculum based on Icelandic Online, 
              progressing from beginner to advanced levels.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">Gamified Learning</h3>
            <p className="text-gray-600">
              Earn XP, maintain streaks, and unlock achievements as you 
              progress through lessons and master vocabulary.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Spaced Repetition</h3>
            <p className="text-gray-600">
              Review vocabulary at optimal intervals using spaced repetition 
              to maximize retention and long-term learning.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">What You'll Learn</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">📖 Vocabulary</h4>
              <p className="text-gray-700">
                Learn high-frequency words and phrases used in everyday Icelandic
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">✍️ Grammar</h4>
              <p className="text-gray-700">
                Master grammar concepts from basic to advanced structures
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">💬 Conversation</h4>
              <p className="text-gray-700">
                Practice real-world dialogues and sentence construction
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">👂 Listening</h4>
              <p className="text-gray-700">
                Train your ear with audio exercises and pronunciation practice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
