'use client'

import { ThirdwebProvider as ThirdwebProviderBase } from '@thirdweb-dev/react'

export function ThirdwebProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProviderBase 
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      autoConnect={false}
      supportedWallets={[]}
    >
      {children}
    </ThirdwebProviderBase>
  )
} 