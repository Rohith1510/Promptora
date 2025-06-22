'use client'

import { ConnectWallet } from './ConnectWallet'
import { useWallet } from './ThirdwebProvider'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Navigation() {
  const { account } = useWallet()

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Promptora</span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/explore" className="text-gray-600 hover:text-gray-900 transition-colors">
              Explore
            </Link>
            <Link href="/submit" className="text-gray-600 hover:text-gray-900 transition-colors">
              Submit
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