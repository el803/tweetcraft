import React from 'react'
import { Twitter, FileText, Image, MessageSquare } from 'lucide-react'

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">About TweetCraft</h1>
        <p className="text-xl text-gray-600">Your AI-powered tweet generation assistant</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="prose prose-indigo max-w-none">
          <p className="lead">
            TweetCraft helps you create engaging, professional tweets and threads in seconds using advanced AI technology.
          </p>
          
          <h2>Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Twitter size={24} className="text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Tweet Generation</h3>
                <p className="mt-1 text-gray-500">
                  Generate single tweets or entire threads with customizable tones and lengths.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <FileText size={24} className="text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">File Processing</h3>
                <p className="mt-1 text-gray-500">
                  Upload PDFs or text files to generate tweets based on their content.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Image size={24} className="text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Image Analysis</h3>
                <p className="mt-1 text-gray-500">
                  Extract text from images and use it as a basis for tweet generation.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <MessageSquare size={24} className="text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Multiple Tones</h3>
                <p className="mt-1 text-gray-500">
                  Choose from various tones including professional, casual, humorous, and more.
                </p>
              </div>
            </div>
          </div>
          
          <h2>How It Works</h2>
          <p>
            TweetCraft uses advanced AI models to generate high-quality tweet content based on your input. 
            Simply enter a topic, select your preferred tone and length, and optionally upload a file or image. 
            The AI will analyze your inputs and generate engaging tweets that you can use directly or edit to your liking.
          </p>
          
          <h2>Privacy & Data</h2>
          <p>
            We value your privacy. Any files or images you upload are processed securely and are not stored 
            permanently on our servers. The content is only used to generate tweets during your current session.
          </p>
          
          <div className="bg-indigo-50 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-medium text-indigo-800 mb-2">Get Started</h3>
            <p className="text-indigo-700">
              Head back to the home page and start generating engaging tweets for your social media presence!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
