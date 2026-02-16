'use client'

import { useState } from 'react'

export default function CorpusUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const text = await file.text()
      const response = await fetch('/api/admin/corpus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData: text }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ Successfully imported ${data.count} sentences`)
        setFile(null)
      } else {
        setMessage(`✗ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('✗ Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Upload Sentence Corpus
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload a CSV file with Icelandic sentences and translations. Expected format: icelandic,english,difficulty
      </p>

      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Sentence Corpus'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.startsWith('✓') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
