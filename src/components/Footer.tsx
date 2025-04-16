import React from 'react'
import { Heart } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} TweetCraft. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center">
            <p className="text-gray-600 text-sm flex items-center">
              Made with <Heart size={14} className="mx-1 text-red-500" /> by TweetCraft Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
