"use client"

import { useState } from "react"
import { useWallet } from "./ThirdwebProvider"
import { getPromptPassContract, hasPromptPass } from "../utils/contracts"
import { Lock, Crown, CheckCircle } from "lucide-react"

export default function PromptPassMinter() {
  const { account } = useWallet()
  const [loading, setLoading] = useState(false)
  const [hasPass, setHasPass] = useState(false)
  const [checking, setChecking] = useState(false)

  const checkPromptPass = async () => {
    if (!account) return
    
    setChecking(true)
    try {
      const hasAccess = await hasPromptPass(account)
      setHasPass(hasAccess)
    } catch (error) {
      console.error('Error checking prompt pass:', error)
    } finally {
      setChecking(false)
    }
  }

  const mintPromptPass = async () => {
    if (!account) {
      alert('Please connect your wallet to mint a Prompt Pass')
      return
    }

    setLoading(true)
    try {
      const contract = getPromptPassContract()
      if (!contract) {
        throw new Error('Contract not available')
      }

      const tx = await contract.mintPromptPass()
      await tx.wait()
      
      alert('Prompt Pass minted successfully! You now have access to premium content.')
      setHasPass(true)
    } catch (error: any) {
      console.error('Error minting prompt pass:', error)
      alert(error.message || 'Failed to mint Prompt Pass')
    } finally {
      setLoading(false)
    }
  }

  // Check for prompt pass when account changes
  useState(() => {
    if (account) {
      checkPromptPass()
    }
  })

  if (!account) {
    return (
      <div className="card p-6 text-center">
        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
        <p className="text-gray-600">Connect your wallet to mint a Prompt Pass</p>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="card p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking Prompt Pass status...</p>
      </div>
    )
  }

  if (hasPass) {
    return (
      <div className="card p-6 text-center bg-green-50 border-green-200">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-green-800">Prompt Pass Active</h3>
        <p className="text-green-600">You have access to all premium content!</p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="text-center mb-6">
        <Crown className="h-12 w-12 text-secondary-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Get Your Prompt Pass</h3>
        <p className="text-gray-600 mb-4">
          Unlock access to premium AI prompts and exclusive content
        </p>
        <div className="bg-secondary-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold text-secondary-800 mb-2">What you get:</h4>
          <ul className="text-sm text-secondary-700 space-y-1">
            <li>• Access to premium prompts</li>
            <li>• Early access to new features</li>
            <li>• Exclusive creator tools</li>
            <li>• Priority support</li>
          </ul>
        </div>
      </div>
      
      <button
        onClick={mintPromptPass}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Minting...
          </>
        ) : (
          <>
            <Crown className="h-4 w-4" />
            Mint Prompt Pass (Free)
          </>
        )}
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-3">
        Limited to 10,000 total passes • One per wallet
      </p>
    </div>
  )
} 