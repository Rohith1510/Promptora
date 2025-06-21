"use client"

import { useEffect, useState } from "react"
import { Lock, Star, Coins, ThumbsUp, X } from "lucide-react"
import { useAddress, useContract, useContractWrite, useNFTBalance } from "@thirdweb-dev/react"

interface Prompt {
  promptId: string
  title: string
  prompt: string
  tags: string[]
  premium: boolean
  imageUrl: string
  votes: number
  creator: string
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

const TIPPING_CONTRACT = process.env.NEXT_PUBLIC_PROMPT_TIPPING_CONTRACT_ADDRESS || ""
const PROMPT_PASS_CONTRACT = process.env.NEXT_PUBLIC_PROMPT_PASS_CONTRACT_ADDRESS || ""
const PROMPT_PASS_TOKEN_ID = "1"

export default function ExplorePromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "premium" | "free">("all")
  const [loading, setLoading] = useState(true)
  const [voteState, setVoteState] = useState<Record<string, VoteState>>({})
  const [tipState, setTipState] = useState<Record<string, TipState>>({})
  const [minting, setMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [mintError, setMintError] = useState("")
  const address = useAddress()
  const { contract: tipContract } = useContract(TIPPING_CONTRACT)
  const { mutateAsync: tipPrompt } = useContractWrite(tipContract, "tipPrompt")
  const { contract: passContract } = useContract(PROMPT_PASS_CONTRACT, "edition-drop")
  const { data: nftBalance, refetch: refetchNFT } = useNFTBalance(passContract, address, PROMPT_PASS_TOKEN_ID)
  const { mutateAsync: claimNFT } = useContractWrite(passContract, "claim")

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true)
      const res = await fetch("/api/prompts")
      const data = await res.json()
      setPrompts(data)
      setLoading(false)
    }
    fetchPrompts()
  }, [])

  const filtered = prompts.filter(p => {
    if (filter === "premium" && !p.premium) return false
    if (filter === "free" && p.premium) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleVote(promptId: string) {
    setVoteState(s => ({ ...s, [promptId]: { loading: true, success: false, error: "" } }))
    try {
      const proof = "mock-proof"
      const nullifierHash = "mock-nullifierHash-" + promptId
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, nullifierHash, proof }),
      })
      if (!res.ok) throw new Error("Failed to vote")
      setPrompts(ps => ps.map(p => p.promptId === promptId ? { ...p, votes: p.votes + 1 } : p))
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
    setTipState(s => ({ ...s, [prompt.promptId]: { ...s[prompt.promptId], loading: true, error: "", success: false } }))
    try {
      if (!tipPrompt) throw new Error("Contract not ready")
      const amount = tipState[prompt.promptId]?.amount || "0.001"
      await tipPrompt({
        args: [prompt.promptId, prompt.creator],
        overrides: { value: BigInt(Math.floor(Number(amount) * 1e18)) },
      })
      setTipState(s => ({ ...s, [prompt.promptId]: { ...s[prompt.promptId], loading: false, success: true, error: "" } }))
    } catch (err: any) {
      setTipState(s => ({ ...s, [prompt.promptId]: { ...s[prompt.promptId], loading: false, success: false, error: err.message || "Tip failed" } }))
    }
  }

  async function handleMint() {
    setMinting(true)
    setMintError("")
    setMintSuccess(false)
    try {
      if (!claimNFT) throw new Error("Contract not ready")
      await claimNFT({ args: [address, PROMPT_PASS_TOKEN_ID, 1] })
      setMintSuccess(true)
      await refetchNFT()
    } catch (err: any) {
      setMintError(err.message || "Mint failed")
    } finally {
      setMinting(false)
    }
  }

  const ownsPass = nftBalance && nftBalance.displayValue && nftBalance.displayValue !== "0"

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Explore Prompts</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          className="input-field flex-1"
          placeholder="Search prompts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input-field w-40" value={filter} onChange={e => setFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>
      </div>
      {loading ? (
        <div>Loading prompts...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {filtered.map(prompt => {
            const isPremiumLocked = prompt.premium && !ownsPass
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
                  className="btn-primary w-full flex items-center justify-center gap-2 mb-2"
                  disabled={voteState[prompt.promptId]?.loading}
                  onClick={() => handleVote(prompt.promptId)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {voteState[prompt.promptId]?.loading ? "Voting..." : "Vote"}
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
                    <span className="text-secondary-700 font-semibold mb-2">Unlock with PromptPass NFT</span>
                    <button
                      className="btn-primary"
                      disabled={minting}
                      onClick={handleMint}
                    >
                      {minting ? "Minting..." : "Mint PromptPass"}
                    </button>
                    {mintSuccess && <div className="text-green-600 text-sm mt-2">Minted! Refresh to unlock.</div>}
                    {mintError && <div className="text-red-600 text-sm mt-2">{mintError}</div>}
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