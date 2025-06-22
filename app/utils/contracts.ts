import { ethers } from 'ethers'

// Contract ABIs
export const PROMPT_TIPPING_ABI = [
  "function tipPrompt(string memory promptId, address creator) external payable",
  "function getPromptTips(string memory promptId) external view returns (tuple(string promptId, address from, address creator, uint256 amount, uint256 timestamp)[])",
  "function getCreatorEarnings(address creator) external view returns (uint256)",
  "function getPromptTotalTips(string memory promptId) external view returns (uint256)",
  "event TipReceived(string indexed promptId, address indexed from, address indexed creator, uint256 amount, uint256 timestamp)"
]

export const PROMPT_VOTING_ABI = [
  "function votePrompt(string memory promptId, bool isUpvote, bytes32 zkProof) external",
  "function getPromptStats(string memory promptId) external view returns (uint256 upvotes, uint256 downvotes, uint256 totalVotes)",
  "function hasVoted(string memory promptId, address voter) external view returns (bool)",
  "function getPromptVotes(string memory promptId) external view returns (tuple(string promptId, address voter, bool isUpvote, uint256 timestamp, bytes32 zkProof)[])",
  "function getUserVoteCount(address user) external view returns (uint256)",
  "event VoteCast(string indexed promptId, address indexed voter, bool isUpvote, uint256 timestamp)"
]

export const PROMPT_PASS_ABI = [
  "function mintPromptPass() external",
  "function hasPromptPass(address user) external view returns (bool)",
  "function balanceOf(address account, uint256 id) external view returns (uint256)"
]

// Contract addresses (you'll need to deploy and update these)
export const CONTRACT_ADDRESSES = {
  PROMPT_TIPPING: process.env.NEXT_PUBLIC_PROMPT_TIPPING_ADDRESS || '0x0000000000000000000000000000000000000000',
  PROMPT_VOTING: process.env.NEXT_PUBLIC_PROMPT_VOTING_ADDRESS || '0x0000000000000000000000000000000000000000',
  PROMPT_PASS: process.env.NEXT_PUBLIC_PROMPT_PASS_ADDRESS || '0x0000000000000000000000000000000000000000'
}

// Get provider and signer
export function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum)
  }
  return null
}

export function getSigner() {
  const provider = getProvider()
  return provider?.getSigner() || null
}

// Contract instances
export function getPromptTippingContract() {
  const signer = getSigner()
  if (!signer) return null
  
  return new ethers.Contract(
    CONTRACT_ADDRESSES.PROMPT_TIPPING,
    PROMPT_TIPPING_ABI,
    signer
  )
}

export function getPromptVotingContract() {
  const signer = getSigner()
  if (!signer) return null
  
  return new ethers.Contract(
    CONTRACT_ADDRESSES.PROMPT_VOTING,
    PROMPT_VOTING_ABI,
    signer
  )
}

export function getPromptPassContract() {
  const signer = getSigner()
  if (!signer) return null
  
  return new ethers.Contract(
    CONTRACT_ADDRESSES.PROMPT_PASS,
    PROMPT_PASS_ABI,
    signer
  )
}

// Helper functions
export async function tipPrompt(promptId: string, creatorAddress: string, amount: string) {
  const contract = getPromptTippingContract()
  if (!contract) throw new Error('Contract not available')
  
  const amountWei = ethers.utils.parseEther(amount)
  
  const tx = await contract.tipPrompt(promptId, creatorAddress, {
    value: amountWei
  })
  
  return await tx.wait()
}

export async function votePrompt(promptId: string, isUpvote: boolean) {
  const contract = getPromptVotingContract()
  if (!contract) throw new Error('Contract not available')
  
  // For now, using a placeholder ZK proof (0x0)
  // In the future, this would be a real ZK proof
  const zkProof = ethers.utils.formatBytes32String('placeholder')
  
  const tx = await contract.votePrompt(promptId, isUpvote, zkProof)
  return await tx.wait()
}

export async function getPromptStats(promptId: string) {
  const contract = getPromptVotingContract()
  if (!contract) return null
  
  try {
    const [upvotes, downvotes, totalVotes] = await contract.getPromptStats(promptId)
    return {
      upvotes: upvotes.toNumber(),
      downvotes: downvotes.toNumber(),
      totalVotes: totalVotes.toNumber()
    }
  } catch (error) {
    console.error('Error fetching prompt stats:', error)
    return null
  }
}

export async function getPromptTotalTips(promptId: string) {
  const contract = getPromptTippingContract()
  if (!contract) return '0'
  
  try {
    const totalTips = await contract.getPromptTotalTips(promptId)
    return ethers.utils.formatEther(totalTips)
  } catch (error) {
    console.error('Error fetching prompt tips:', error)
    return '0'
  }
}

export async function getCreatorEarnings(creatorAddress: string) {
  const contract = getPromptTippingContract()
  if (!contract) return '0'
  
  try {
    const earnings = await contract.getCreatorEarnings(creatorAddress)
    return earnings
  } catch (error) {
    console.error('Error fetching creator earnings:', error)
    return '0'
  }
}

export async function hasUserVoted(promptId: string, userAddress: string) {
  const contract = getPromptVotingContract()
  if (!contract) return false
  
  try {
    return await contract.hasVoted(promptId, userAddress)
  } catch (error) {
    console.error('Error checking if user voted:', error)
    return false
  }
}

export async function hasPromptPass(userAddress: string) {
  const contract = getPromptPassContract()
  if (!contract) return false
  
  try {
    return await contract.hasPromptPass(userAddress)
  } catch (error) {
    console.error('Error checking prompt pass:', error)
    return false
  }
}

// Format ETH amounts
export function formatEth(wei: string | number) {
  if (typeof wei === 'string') {
    return ethers.utils.formatEther(wei)
  }
  return ethers.utils.formatEther(wei.toString())
}

export function parseEth(eth: string) {
  return ethers.utils.parseEther(eth)
} 