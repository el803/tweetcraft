import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Twitter } from 'lucide-react'

const Header: React.FC = () => {
  const location = useLocation()
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-full">
              <Twitter size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TweetCraft</span>
          </Link>
          
          <nav className="flex space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium ${
                location.pathname === '/' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium ${
                location.pathname === '/about' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
