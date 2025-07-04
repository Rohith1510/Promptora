'use client'

import { ConnectWallet } from './ConnectWallet'
import { useWallet } from './ThirdwebProvider'
import Link from 'next/link'
import { Sparkles, Bot } from 'lucide-react'
import Image from 'next/image'

export function Navigation() {
  const { account } = useWallet()

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="Promptora Logo" 
                width={42} 
                height={42} 
              />
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Promptora</span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/explore" className="text-gray-600 hover:text-gray-900 transition-colors">
              Explore
            </Link>
            <Link href="/submit" className="text-gray-600 hover:text-gray-900 transition-colors">
              Submit
            </Link>
            <Link href="/bhindi-agent" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
              <Bot className="h-4 w-4" />
              <span>Bhindi Agent</span>
            </Link>
            {account && (
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
            )}
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  )
} 