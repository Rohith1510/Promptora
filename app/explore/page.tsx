"use client"

import { useEffect, useState } from "react"
import { Lock, Star, Coins, ThumbsUp, X, ArrowLeft } from "lucide-react"
import { useWallet } from "../components/ThirdwebProvider"
import Link from "next/link"
import { 
  tipPrompt, 
  votePrompt, 
  getPromptStats, 
  getPromptTotalTips, 
  hasUserVoted,
  hasPromptPass,
  formatEth
} from "../utils/contracts"

interface Prompt {
  promptId: string
  title: string
  prompt: string
  tags: string[]
  premium: boolean
  imageUrl: string
  votes: number
  creator: string
  creatorAddress?: string // Add creator address for tipping
}

type VoteState = {
  loading: boolean
  success: boolean
  error: string
}

type TipState = {
  open: boolean
  amount: string
  loading: boolean
  success: boolean
  error: string
}

export default function ExplorePromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "premium" | "free">("all")
  const [loading, setLoading] = useState(true)
  const [voteState, setVoteState] = useState<Record<string, VoteState>>({})
  const [tipState, setTipState] = useState<Record<string, TipState>>({})
  const [userVoteStatus, setUserVoteStatus] = useState<Record<string, boolean>>({})
  const [hasUserPromptPass, setHasUserPromptPass] = useState(false)
  const { account } = useWallet()

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true)
      try {
        const response = await fetch('/api/prompts')
        if (!response.ok) {
          throw new Error('Failed to fetch prompts')
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        // Add creator addresses to prompts (using promptId as address for demo)
        const promptsWithAddresses = (data.prompts || []).map((prompt: Prompt) => ({
          ...prompt,
          creatorAddress: `0x${prompt.promptId.padEnd(40, '0').slice(0, 40)}` // Demo address
        }))
        
        setPrompts(promptsWithAddresses)
        
        // Fetch blockchain data for each prompt
        await fetchBlockchainData(promptsWithAddresses)
      } catch (error) {
        console.error('Failed to fetch prompts:', error)
        // Fallback to mock data if API fails
        const fallbackPrompts: Prompt[] = [
          {
            promptId: "1",
            title: "Generate a viral AI meme",
            prompt: "Create a funny meme about AI that would go viral on social media",
            tags: ["AI", "Meme", "Viral"],
            premium: false,
            imageUrl: "ipfs://QmExample1",
            votes: 42,
            creator: "0x1234...5678",
            creatorAddress: "0x1234567890123456789012345678901234567890"
          },
          {
            promptId: "2",
            title: "Professional resume writer",
            prompt: "Write a professional resume for a software engineer with 5 years experience",
            tags: ["Resume", "Professional", "Career"],
            premium: true,
            imageUrl: "ipfs://QmExample2",
            votes: 28,
            creator: "0x8765...4321",
            creatorAddress: "0x8765432109876543210987654321098765432109"
          },
          {
            promptId: "3",
            title: "Midjourney logo generator",
            prompt: "Create a modern logo for a tech startup using Midjourney",
            tags: ["Logo", "Midjourney", "Design"],
            premium: false,
            imageUrl: "ipfs://QmExample3",
            votes: 35,
            creator: "0xabcd...efgh",
            creatorAddress: "0xabcdef1234567890abcdef1234567890abcdef12"
          }
        ]
        setPrompts(fallbackPrompts)
        await fetchBlockchainData(fallbackPrompts)
      } finally {
        setLoading(false)
      }
    }
    
    async function fetchBlockchainData(prompts: Prompt[]) {
      if (!account) return
      
      try {
        // Check if user has prompt pass
        const hasPass = await hasPromptPass(account)
        setHasUserPromptPass(hasPass)
        
        // Check voting status for each prompt
        const voteStatuses: Record<string, boolean> = {}
        for (const prompt of prompts) {
          const hasVoted = await hasUserVoted(prompt.promptId, account)
          voteStatuses[prompt.promptId] = hasVoted
        }
        setUserVoteStatus(voteStatuses)
        
        // Update prompts with real blockchain data
        const updatedPrompts = await Promise.all(
          prompts.map(async (prompt) => {
            try {
              const stats = await getPromptStats(prompt.promptId)
              const totalTips = await getPromptTotalTips(prompt.promptId)
              
              return {
                ...prompt,
                votes: stats?.upvotes || prompt.votes,
                totalTips: parseFloat(totalTips)
              }
            } catch (error) {
              console.error(`Error fetching blockchain data for prompt ${prompt.promptId}:`, error)
              return prompt
            }
          })
        )
        
        setPrompts(updatedPrompts)
      } catch (error) {
        console.error('Error fetching blockchain data:', error)
      }
    }
    
    fetchPrompts()
  }, [account])

  const filtered = prompts.filter(p => {
    if (filter === "premium" && !p.premium) return false
    if (filter === "free" && p.premium) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleVote(promptId: string) {
    if (!account) {
      alert('Please connect your wallet to vote')
      return
    }
    
    setVoteState(s => ({ ...s, [promptId]: { loading: true, success: false, error: "" } }))
    try {
      // Use real smart contract voting
      await votePrompt(promptId, true) // true for upvote
      
      // Update local state
      setPrompts(ps => ps.map(p => p.promptId === promptId ? { ...p, votes: p.votes + 1 } : p))
      setUserVoteStatus(s => ({ ...s, [promptId]: true }))
      setVoteState(s => ({ ...s, [promptId]: { loading: false, success: true, error: "" } }))
    } catch (err: any) {
      setVoteState(s => ({ ...s, [promptId]: { loading: false, success: false, error: err.message || "Vote failed" } }))
    }
  }

  function openTip(promptId: string) {
    setTipState(s => ({ ...s, [promptId]: { open: true, amount: "0.001", loading: false, success: false, error: "" } }))
  }
  
  function closeTip(promptId: string) {
    setTipState(s => ({ ...s, [promptId]: { ...s[promptId], open: false } }))
  }
  
  function setTipAmount(promptId: string, amount: string) {
    setTipState(s => ({ ...s, [promptId]: { ...s[promptId], amount } }))
  }

  async function handleTip(prompt: Prompt) {
    if (!account) {
      alert('Please connect your wallet to tip')
      return
    }
    
    if (!prompt.creatorAddress) {
      alert('Creator address not available')
      return
    }
    
    setTipState(s => ({ ...s, [prompt.promptId]: { ...s[prompt.promptId], loading: true, error: "", success: false } }))
    try {
      // Use real smart contract tipping
      await tipPrompt(prompt.promptId, prompt.creatorAddress, tipState[prompt.promptId]?.amount || "0.001")
      
      setTipState(s => ({ ...s, [prompt.promptId]: { ...s[prompt.promptId], loading: false, success: true, error: "" } }))
    } catch (err: any) {
      setTipState(s => ({ ...s, [prompt.promptId]: { ...s[prompt.promptId], loading: false, success: false, error: err.message || "Tip failed" } }))
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/" 
         className="inline-flex items-center text-gray-600 hover:text-gray-500 transition-colors text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-white" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Explore Prompts
            </span>
          </h1>
        <p className="text-gray-300">Discover and vote on the best AI prompts</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "premium" | "free")}
          className="px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Prompts</option>
          <option value="premium">Premium Only</option>
          <option value="free">Free Only</option>
        </select>
      </div>

      {/* Prompts Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading prompts...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(prompt => {
            const isPremiumLocked = prompt.premium && !hasUserPromptPass
            const hasVoted = userVoteStatus[prompt.promptId]
            
            return (
              <div key={prompt.promptId} className="card relative">
                {prompt.premium && (
                  <div className="absolute top-4 right-4 bg-secondary-100 text-secondary-700 px-2 py-1 rounded flex items-center gap-1">
                    <Lock className="h-4 w-4" /> Premium
                  </div>
                )}
                <img
                  src={prompt.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
                  alt={prompt.title}
                  className="w-full h-40 object-cover rounded mb-4"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <h2 className="text-lg font-semibold mb-2">{prompt.title}</h2>
                <div className="flex flex-wrap gap-2 mb-2">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{prompt.votes} votes</span>
                </div>
                <button
                  className={`btn-primary w-full flex items-center justify-center gap-2 mb-2 ${
                    hasVoted ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={voteState[prompt.promptId]?.loading || hasVoted}
                  onClick={() => handleVote(prompt.promptId)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {voteState[prompt.promptId]?.loading ? "Voting..." : hasVoted ? "Voted" : "Vote"}
                </button>
                {voteState[prompt.promptId]?.success && (
                  <div className="text-green-600 text-sm mb-2">Vote submitted!</div>
                )}
                {voteState[prompt.promptId]?.error && (
                  <div className="text-red-600 text-sm mb-2">{voteState[prompt.promptId].error}</div>
                )}
                
                {/* Tip UI */}
                {tipState[prompt.promptId]?.open ? (
                  <div className="mb-2 p-3 rounded-lg border border-gray-200 bg-gray-50 relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => closeTip(prompt.promptId)}><X className="h-4 w-4" /></button>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        className="input-field flex-1"
                        value={tipState[prompt.promptId]?.amount || "0.001"}
                        onChange={e => setTipAmount(prompt.promptId, e.target.value)}
                        placeholder="ETH amount"
                      />
                      <button
                        className="btn-secondary"
                        disabled={tipState[prompt.promptId]?.loading}
                        onClick={() => handleTip(prompt)}
                      >
                        {tipState[prompt.promptId]?.loading ? "Tipping..." : "Send Tip"}
                      </button>
                    </div>
                    {tipState[prompt.promptId]?.success && <div className="text-green-600 text-sm">Tip sent!</div>}
                    {tipState[prompt.promptId]?.error && <div className="text-red-600 text-sm">{tipState[prompt.promptId].error}</div>}
                  </div>
                ) : (
                  <button className="btn-secondary w-full flex items-center justify-center gap-2 mb-2" onClick={() => openTip(prompt.promptId)}>
                    <Coins className="h-4 w-4" /> Tip Creator
                  </button>
                )}
                
                {/* NFT Gating for premium prompts */}
                {isPremiumLocked && (
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-xl z-10">
                    <Lock className="h-8 w-8 text-secondary-600 mb-2" />
                    <span className="text-secondary-700 font-semibold mb-2">Premium content</span>
                    <span className="text-secondary-600 text-sm">Get a Prompt Pass to unlock</span>
                  </div>
                )}
                
                {/* Show prompt text only if not locked */}
                {!isPremiumLocked && (
                  <div className="mt-2 text-gray-700 text-sm whitespace-pre-line">
                    {prompt.prompt}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 