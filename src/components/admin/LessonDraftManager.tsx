'use client'

import { useState, useEffect } from 'react'

interface LessonDraft {
  id: string
  title: string
  description: string | null
  status: string
  difficulty: number
  targetVocab: string[]
  grammarPoints: string[]
  createdAt: string
  generatedContent: any
}

export default function LessonDraftManager() {
  const [drafts, setDrafts] = useState<LessonDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDraft, setSelectedDraft] = useState<LessonDraft | null>(null)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/admin/drafts')
      const data = await response.json()
      setDrafts(data.drafts || [])
    } catch (error) {
      console.error('Failed to fetch drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (draftId: string) => {
    if (!confirm('Are you sure you want to approve and publish this lesson?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/drafts/${draftId}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('✓ Lesson approved and published!')
        fetchDrafts()
        setSelectedDraft(null)
      } else {
        alert('✗ Failed to approve lesson')
      }
    } catch (error) {
      alert('✗ Error approving lesson')
    }
  }

  const handleReject = async (draftId: string) => {
    if (!confirm('Are you sure you want to reject this draft?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/drafts/${draftId}/reject`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('✓ Draft rejected')
        fetchDrafts()
        setSelectedDraft(null)
      } else {
        alert('✗ Failed to reject draft')
      }
    } catch (error) {
      alert('✗ Error rejecting draft')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading drafts...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Lesson Drafts
      </h2>

      {drafts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No lesson drafts yet. Generate one using the AI generator!
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{draft.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Difficulty: {draft.difficulty} | Status: <span className={`
                      ${draft.status === 'PENDING' ? 'text-yellow-600' : ''}
                      ${draft.status === 'APPROVED' ? 'text-green-600' : ''}
                      ${draft.status === 'REJECTED' ? 'text-red-600' : ''}
                      ${draft.status === 'PUBLISHED' ? 'text-blue-600' : ''}
                      font-semibold
                    `}>{draft.status}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                  {draft.targetVocab.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {draft.targetVocab.slice(0, 5).map((word, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {word}
                        </span>
                      ))}
                      {draft.targetVocab.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{draft.targetVocab.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDraft(draft)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                  >
                    View
                  </button>
                  {draft.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(draft.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(draft.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Draft detail modal */}
      {selectedDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedDraft.title}</h3>
              <button
                onClick={() => setSelectedDraft(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Target Vocabulary</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDraft.targetVocab.map((word, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Grammar Points</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDraft.grammarPoints.map((point, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              {selectedDraft.generatedContent && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Generated Content</h4>
                  <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedDraft.generatedContent, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {selectedDraft.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedDraft.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      ✓ Approve & Publish
                    </button>
                    <button
                      onClick={() => handleReject(selectedDraft.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
