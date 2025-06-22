'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  account: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnected: boolean
  provider: ethers.providers.Web3Provider | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(ethProvider)
      
      // Check if already connected
      checkConnection()
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', () => window.location.reload())
    }
  }, [])

  const checkConnection = async () => {
    if (provider) {
      try {
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null)
      setIsConnected(false)
    } else {
      setAccount(accounts[0])
      setIsConnected(true)
    }
  }

  const connect = async () => {
    if (!provider) {
      alert('Please install MetaMask!')
      return
    }

    try {
      const accounts = await provider.send('eth_requestAccounts', [])
      setAccount(accounts[0])
      setIsConnected(true)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet')
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsConnected(false)
  }

  const value = {
    account,
    connect,
    disconnect,
    isConnected,
    provider
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
} 