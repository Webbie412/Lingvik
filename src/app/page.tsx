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
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              A gamified language-learning platform for Icelandic with AI-generated lessons and spaced-repetition training.
            </p>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
