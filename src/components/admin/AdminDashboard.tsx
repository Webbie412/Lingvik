'use client'

import { useState } from 'react'
import FrequencyListUploader from './FrequencyListUploader'
import CorpusUploader from './CorpusUploader'
import LessonGenerator from './LessonGenerator'
import LessonDraftManager from './LessonDraftManager'

type Tab = 'upload' | 'generate' | 'drafts'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('upload')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Studio</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition ${
                  activeTab === 'upload'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📤 Upload Data
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition ${
                  activeTab === 'generate'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🤖 Generate Lessons
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition ${
                  activeTab === 'drafts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📝 Manage Drafts
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'upload' && (
              <div className="space-y-8">
                <FrequencyListUploader />
                <div className="border-t border-gray-200 pt-8">
                  <CorpusUploader />
                </div>
              </div>
            )}
            {activeTab === 'generate' && <LessonGenerator />}
            {activeTab === 'drafts' && <LessonDraftManager />}
          </div>
        </div>
      </div>
    </div>
  )
}
