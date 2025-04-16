import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Image, Upload, X, ChevronDown, ChevronUp } from 'lucide-react'
import { generateTweets } from '../services/tweetService'
import { Tweet, TweetLength, TweetTone, ThreadStyle, ThreadStructure } from '../types'

interface TweetGeneratorProps {
  setTweets: React.Dispatch<React.SetStateAction<Tweet[]>>
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

const TweetGenerator: React.FC<TweetGeneratorProps> = ({ setTweets, setIsLoading, setError }) => {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<TweetTone>('Professional')
  const [length, setLength] = useState<TweetLength>('Medium')
  const [threadMode, setThreadMode] = useState(false)
  const [threadCount, setThreadCount] = useState(3)
  const [threadStyle, setThreadStyle] = useState<ThreadStyle>('Standard')
  const [threadStructure, setThreadStructure] = useState<ThreadStructure>('Opening-Content-Closing')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'pdf' | 'text' | 'image' | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      
      // Safely determine file type with null checks
      if (selectedFile && selectedFile.type) {
        if (selectedFile.type === 'application/pdf') {
          setFileType('pdf')
          setFilePreview(null)
        } else if (selectedFile.type.startsWith('text/')) {
          setFileType('text')
          setFilePreview(null)
        } else if (selectedFile.type.startsWith('image/')) {
          setFileType('image')
          const reader = new FileReader()
          reader.onload = () => {
            setFilePreview(reader.result as string)
          }
          reader.readAsDataURL(selectedFile)
        } else {
          // Handle unknown file type
          setFileType(null)
          setFilePreview(null)
          setError('Unsupported file type. Please upload a PDF, text, or image file.')
        }
      } else {
        // Handle case where file type is undefined
        setFileType(null)
        setFilePreview(null)
      }
    }
  }, [setError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  })

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    setFileType(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!topic && !file) {
      setError('Please enter a topic or upload a file')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (file) {
        setIsProcessingFile(true)
      }
      
      const generatedTweets = await generateTweets({
        topic,
        tone,
        length,
        threadMode,
        threadCount: threadMode ? threadCount : 1,
        threadStyle: threadMode ? threadStyle : undefined,
        threadStructure: threadMode ? threadStructure : undefined,
        file
      })
      
      setTweets(generatedTweets)
    } catch (error) {
      console.error('Error generating tweets:', error)
      setError('Failed to generate tweets. Please try again.')
    } finally {
      setIsLoading(false)
      setIsProcessingFile(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generate Tweets</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic or Keyword
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AI in healthcare, remote work tips, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload File or Image (Optional)
          </label>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition ${
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {fileType === 'pdf' && <FileText size={20} className="text-indigo-600 mr-2" />}
                  {fileType === 'text' && <FileText size={20} className="text-indigo-600 mr-2" />}
                  {fileType === 'image' && <Image size={20} className="text-indigo-600 mr-2" />}
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div>
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDF, TXT, PNG, JPG, JPEG
                </p>
              </div>
            )}
          </div>
          
          {filePreview && (
            <div className="mt-2 relative">
              <img 
                src={filePreview} 
                alt="Preview" 
                className="max-h-40 rounded-md mx-auto object-contain" 
              />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as TweetTone)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Professional">Professional</option>
              <option value="Casual">Casual</option>
              <option value="Humorous">Humorous</option>
              <option value="Motivational">Motivational</option>
              <option value="Controversial">Controversial</option>
              <option value="Educational">Educational</option>
              <option value="Enthusiastic">Enthusiastic</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
              Length
            </label>
            <select
              id="length"
              value={length}
              onChange={(e) => setLength(e.target.value as TweetLength)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Short">Short</option>
              <option value="Medium">Medium</option>
              <option value="Long">Long</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="threadMode"
              checked={threadMode}
              onChange={(e) => setThreadMode(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="threadMode" className="ml-2 block text-sm text-gray-700">
              Generate Thread
            </label>
          </div>
          
          {threadMode && (
            <div className="pl-6 mt-3 space-y-4">
              <div>
                <label htmlFor="threadCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Tweets in Thread
                </label>
                <input
                  type="range"
                  id="threadCount"
                  min="2"
                  max="10"
                  value={threadCount}
                  onChange={(e) => setThreadCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2</span>
                  <span>{threadCount}</span>
                  <span>10</span>
                </div>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showAdvancedOptions ? (
                    <>
                      <ChevronUp size={16} className="mr-1" />
                      Hide Advanced Thread Options
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="mr-1" />
                      Show Advanced Thread Options
                    </>
                  )}
                </button>
              </div>
              
              {showAdvancedOptions && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <label htmlFor="threadStyle" className="block text-sm font-medium text-gray-700 mb-1">
                      Thread Style
                    </label>
                    <select
                      id="threadStyle"
                      value={threadStyle}
                      onChange={(e) => setThreadStyle(e.target.value as ThreadStyle)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Storytelling">Storytelling</option>
                      <option value="Tips">Tips/Listicle</option>
                      <option value="FAQ">FAQ Style</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {threadStyle === 'Storytelling' && "Creates a narrative with beginning, middle, and end"}
                      {threadStyle === 'Tips' && "Formats tweets as numbered tips or list items"}
                      {threadStyle === 'FAQ' && "Structures tweets as questions and answers"}
                      {threadStyle === 'Standard' && "Regular tweets connected in a thread"}
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="threadStructure" className="block text-sm font-medium text-gray-700 mb-1">
                      Thread Structure
                    </label>
                    <select
                      id="threadStructure"
                      value={threadStructure}
                      onChange={(e) => setThreadStructure(e.target.value as ThreadStructure)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Opening-Content-Closing">Opening-Content-Closing</option>
                      <option value="Sequential">Sequential</option>
                      <option value="Problem-Solution">Problem-Solution</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {threadStructure === 'Opening-Content-Closing' && "Starts with an intro, followed by main content, and ends with a conclusion"}
                      {threadStructure === 'Sequential' && "Each tweet builds on the previous one in a logical sequence"}
                      {threadStructure === 'Problem-Solution' && "Presents problems first, then solutions"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={(!topic && !file)}
          className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            (!topic && !file) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          Generate Tweets
        </button>
      </form>
    </div>
  )
}

export default TweetGenerator
