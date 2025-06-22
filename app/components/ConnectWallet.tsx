'use client'

import { useWallet } from './ThirdwebProvider'

export function ConnectWallet() {
  const { account, connect, disconnect, isConnected } = useWallet()

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Connect Wallet
    </button>
  )
} 