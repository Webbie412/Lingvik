'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'import' | 'generate' | 'drafts'>('import')
  const [imports, setImports] = useState<any[]>([])
  const [draftLessons, setDraftLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Import form state
  const [importSource, setImportSource] = useState('icelandic_online')
  const [importType, setImportType] = useState('vocabulary')
  const [importData, setImportData] = useState('')

  // Generate form state
  const [unitId, setUnitId] = useState('')
  const [grammarFocus, setGrammarFocus] = useState('')
  const [vocabularyIds, setVocabularyIds] = useState<string[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [importsRes, draftsRes] = await Promise.all([
        fetch('/api/admin/import'),
        fetch('/api/admin/draft-lessons')
      ])

      const importsData = await importsRes.json()
      const draftsData = await draftsRes.json()

      setImports(importsData.imports || [])
      setDraftLessons(draftsData.draftLessons || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const parsedData = JSON.parse(importData)
      
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: importSource,
          type: importType,
          data: parsedData,
        }),
      })

      if (response.ok) {
        alert('Import successful!')
        setImportData('')
        fetchData()
      } else {
        const error = await response.json()
        alert(`Import failed: ${error.error}`)
      }
    } catch (error) {
      alert('Invalid JSON data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/draft-lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId,
          grammarFocus,
          vocabularyIds,
        }),
      })

      if (response.ok) {
        alert('Lesson draft generated!')
        setActiveTab('drafts')
        fetchData()
      } else {
        const error = await response.json()
        alert(`Generation failed: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to generate lesson')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to approve and publish this draft lesson?')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/draft-lessons/${draftId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewNotes: 'Approved',
        }),
      })

      if (response.ok) {
        alert('Draft lesson approved and published!')
        fetchData()
      } else {
        const error = await response.json()
        alert(`Approval failed: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to approve draft')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Lingvik Admin</h1>
          <div className="flex gap-4">
            <Link href="/learn" className="text-gray-600 hover:text-gray-800">
              Back to Learning
            </Link>
            <span className="text-gray-600">{session?.user?.email}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === 'import'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📥 Import Curriculum
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === 'generate'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              🤖 Generate Lesson
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === 'drafts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              📝 Draft Lessons ({draftLessons.filter(d => d.status === 'draft').length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'import' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Import Curriculum Data</h2>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Supported Sources:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Icelandic Online (University of Iceland)</li>
                  <li>Icelandic frequency word lists (top 1k/3k words)</li>
                  <li>Tatoeba parallel corpora</li>
                  <li>Wiktionary morphology datasets</li>
                </ul>
              </div>

              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    value={importSource}
                    onChange={(e) => setImportSource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="icelandic_online">Icelandic Online</option>
                    <option value="frequency_list">Frequency List</option>
                    <option value="tatoeba">Tatoeba</option>
                    <option value="wiktionary">Wiktionary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vocabulary">Vocabulary</option>
                    <option value="sentences">Sentences</option>
                    <option value="morphology">Morphology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    JSON Data
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={10}
                    placeholder='[{"icelandic": "hestur", "english": "horse", "partOfSpeech": "noun", "frequency": 500}]'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste JSON array of curriculum data
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Importing...' : 'Import Data'}
                </button>
              </form>

              {/* Recent Imports */}
              {imports.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Recent Imports</h3>
                  <div className="space-y-2">
                    {imports.slice(0, 5).map((imp) => (
                      <div key={imp.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{imp.source} - {imp.type}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            imp.status === 'completed' ? 'bg-green-100 text-green-700' :
                            imp.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {imp.status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(imp.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Generate Lesson Draft</h2>
              
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  ⚠️ Generated lessons must be reviewed and approved before publishing.
                  AI will use imported vocabulary and grammar rules to create exercises.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit ID
                  </label>
                  <input
                    type="text"
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="unit-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: unit-1, unit-2, unit-3
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grammar Focus
                  </label>
                  <input
                    type="text"
                    value={grammarFocus}
                    onChange={(e) => setGrammarFocus(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Present tense verbs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Generating...' : '🤖 Generate Lesson Draft'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Draft Lessons</h2>
            
            {draftLessons.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-600">
                No draft lessons yet. Generate some lessons to see them here.
              </div>
            ) : (
              <div className="space-y-4">
                {draftLessons.map((draft) => (
                  <div key={draft.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{draft.name}</h3>
                        <p className="text-gray-600 text-sm">{draft.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(draft.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        draft.status === 'approved' ? 'bg-green-100 text-green-700' :
                        draft.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {draft.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Exercises: {Array.isArray(draft.exercises) ? draft.exercises.length : 0}
                      </p>
                      {Array.isArray(draft.exercises) && (
                        <div className="space-y-2">
                          {draft.exercises.slice(0, 3).map((ex: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded text-sm">
                              <span className="font-medium">{ex.type}</span>: {ex.prompt}
                            </div>
                          ))}
                          {draft.exercises.length > 3 && (
                            <p className="text-xs text-gray-500 px-3">
                              +{draft.exercises.length - 3} more exercises
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {draft.status === 'draft' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveDraft(draft.id)}
                          disabled={loading}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                          ✓ Approve & Publish
                        </button>
                        <button
                          disabled={loading}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
