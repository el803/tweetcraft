import React, { useState } from 'react'
import TweetGenerator from '../components/TweetGenerator'
import TweetResults from '../components/TweetResults'
import { Tweet } from '../types'

const HomePage: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tweet Generator</h1>
        <p className="text-lg text-gray-600">
          Create engaging tweets and threads in seconds with AI assistance
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <TweetGenerator 
            setTweets={setTweets} 
            setIsLoading={setIsLoading} 
            setError={setError} 
          />
        </div>
        
        <div>
          <TweetResults 
            tweets={tweets} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
      </div>
    </div>
  )
}

export default HomePage
