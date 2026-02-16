'use client'

import { useState } from 'react'

export default function LessonGenerator() {
  const [title, setTitle] = useState('')
  const [vocabulary, setVocabulary] = useState('')
  const [grammar, setGrammar] = useState('')
  const [difficulty, setDifficulty] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          targetVocab: vocabulary.split(',').map(v => v.trim()).filter(Boolean),
          grammarPoints: grammar.split(',').map(g => g.trim()).filter(Boolean),
          difficulty,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Lesson draft created successfully! ID: ${data.draftId}`)
        setTitle('')
        setVocabulary('')
        setGrammar('')
        setDifficulty(1)
      } else {
        setMessage(`✗ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('✗ Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Generate Lesson with AI
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Use LLM to generate a lesson draft based on vocabulary and grammar constraints
      </p>

      <form onSubmit={handleGenerate} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Introduction to Numbers"
            required
          />
        </div>

        <div>
          <label htmlFor="vocabulary" className="block text-sm font-medium text-gray-700 mb-1">
            Target Vocabulary (comma-separated)
          </label>
          <input
            type="text"
            id="vocabulary"
            value={vocabulary}
            onChange={(e) => setVocabulary(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., einn, tveir, þrír, fjórir"
            required
          />
        </div>

        <div>
          <label htmlFor="grammar" className="block text-sm font-medium text-gray-700 mb-1">
            Grammar Points (comma-separated)
          </label>
          <input
            type="text"
            id="grammar"
            value={grammar}
            onChange={(e) => setGrammar(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., cardinal numbers, basic counting"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty Level: {difficulty}
          </label>
          <input
            type="range"
            id="difficulty"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Beginner</span>
            <span>Advanced</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={generating}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? '🤖 Generating Lesson...' : '🤖 Generate Lesson Draft'}
        </button>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.startsWith('✓') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Make sure OPENAI_API_KEY is set in your environment variables for AI generation to work.
        </p>
      </div>
    </div>
  )
}
