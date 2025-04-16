import React, { useState } from 'react'
import { Copy, Check, MessageSquare, Edit2, Save } from 'lucide-react'
import { Tweet } from '../types'

interface TweetResultsProps {
  tweets: Tweet[]
  isLoading: boolean
  error: string | null
}

const TweetResults: React.FC<TweetResultsProps> = ({ tweets, isLoading, error }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState<string>('')

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const startEditing = (tweet: Tweet, index: number) => {
    setEditingIndex(index)
    setEditedContent(tweet.content)
  }

  const saveEdit = (index: number) => {
    if (editedContent.trim()) {
      tweets[index].content = editedContent
      setEditingIndex(null)
    }
  }

  const getTweetRoleBadge = (tweet: Tweet) => {
    if (!tweet.threadRole) return null
    
    const roleColors = {
      opening: 'bg-blue-100 text-blue-800',
      content: 'bg-purple-100 text-purple-800',
      closing: 'bg-green-100 text-green-800'
    }
    
    const roleLabels = {
      opening: 'Opening',
      content: 'Content',
      closing: 'Closing'
    }
    
    return (
      <span className={`inline-block ${roleColors[tweet.threadRole]} text-xs px-2 py-0.5 rounded mr-2`}>
        {roleLabels[tweet.threadRole]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-pulse bg-indigo-100 p-4 rounded-full mb-4">
            <MessageSquare size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Crafting your tweets...</h3>
          <p className="text-gray-500 text-sm">This may take a moment, especially if processing files or images.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (tweets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block bg-indigo-100 p-4 rounded-full mb-4">
            <MessageSquare size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Your tweets will appear here</h3>
          <p className="text-gray-500 text-sm">Fill out the form and click "Generate Tweets" to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Generated Tweets</h2>
        <span className="text-sm text-gray-500">{tweets.length} tweet{tweets.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="space-y-6">
        {tweets.map((tweet, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center mb-1">
              {tweet.threadIndex !== undefined && (
                <div className="text-xs font-medium text-indigo-600 mr-2">
                  Thread {tweet.threadIndex + 1}/{tweet.threadTotal}
                </div>
              )}
              
              {getTweetRoleBadge(tweet)}
            </div>
            
            {editingIndex === index ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                  rows={4}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveEdit(index)}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
                  >
                    <Save size={14} className="mr-1" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-800 whitespace-pre-wrap mb-3">{tweet.content}</p>
                
                {tweet.hashtags && tweet.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tweet.hashtags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {tweet.length} · {tweet.tone}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(tweet, index)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                      title="Edit tweet"
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleCopy(tweet.content, index)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TweetResults
