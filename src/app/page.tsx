import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">
            Lingvik
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Learn Icelandic the fun way
          </p>
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4">Start Your Journey</h2>
            <p className="text-gray-600 mb-6">
              A gamified language-learning platform for Icelandic with AI-generated lessons and spaced-repetition training.
            </p>
            <div className="space-y-3">
              <Link 
                href="/auth/signup"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
              <Link 
                href="/auth/signin"
                className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-bold text-lg mb-2">Gamified Learning</h3>
              <p className="text-sm text-gray-600">
                Earn XP, maintain streaks, and unlock badges as you progress
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="font-bold text-lg mb-2">Smart Reviews</h3>
              <p className="text-sm text-gray-600">
                Spaced-repetition algorithm ensures you remember what you learn
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-bold text-lg mb-2">AI-Generated Content</h3>
              <p className="text-sm text-gray-600">
                Lessons created with AI to match your learning pace
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
