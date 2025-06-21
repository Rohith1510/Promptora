'use client'

import { ThirdwebProvider as ThirdwebProviderBase } from '@thirdweb-dev/react'

// Custom Base Goerli chain configuration
const baseGoerli = {
  id: 84531,
  name: "Base Goerli",
  network: "base-goerli",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["https://goerli.base.org"] },
    public: { http: ["https://goerli.base.org"] },
  },
  blockExplorers: {
    default: { name: "BaseScan", url: "https://goerli.basescan.org" },
  },
  testnet: true,
}

export function ThirdwebProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProviderBase 
      activeChain={baseGoerli}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      {children}
    </ThirdwebProviderBase>
  )
} 