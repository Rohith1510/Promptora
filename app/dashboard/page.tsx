"use client"

import { useEffect, useState } from "react"
import { useWallet } from "../components/ThirdwebProvider"
import { 
  TrendingUp, 
  Coins, 
  FileText, 
  ThumbsUp, 
  Calendar,
  Eye,
  DollarSign,
  Activity,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { EarningsChart } from "../components/EarningsChart"
import { 
  getCreatorEarnings, 
  getPromptTotalTips, 
  getPromptStats,
  formatEth
} from "../utils/contracts"

interface CreatorStats {
  totalPrompts: number
  totalTips: number
  totalVotes: number
  totalEarnings: number
}

interface UserPrompt {
  promptId: string
  title: string
  premium: boolean
  votes: number
  tips: number
  earnings: number
  createdAt: string
  imageUrl: string
}

interface RecentActivity {
  id: string
  type: 'tip' | 'vote'
  promptId: string
  promptTitle: string
  amount?: number
  from?: string
  timestamp: string
}

interface EarningsData {
  date: string
  amount: number
}

export default function CreatorDashboard() {
  const { account } = useWallet()
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [prompts, setPrompts] = useState<UserPrompt[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [earningsData, setEarningsData] = useState<EarningsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!account) return
    
    async function fetchDashboardData() {
      setLoading(true)
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        // Fetch real blockchain data
        await fetchBlockchainData(data.prompts)
        
        setStats(data.stats)
        setRecentActivity(data.recentActivity)
        setEarningsData(data.earningsData)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Fallback to mock data if API fails
        const mockStats: CreatorStats = {
          totalPrompts: 8,
          totalTips: 24,
          totalVotes: 156,
          totalEarnings: 0.045
        }
        
        const mockPrompts: UserPrompt[] = [
          {
            promptId: 'abc123',
            title: 'Generate a viral AI meme',
            premium: true,
            votes: 12,
            tips: 5,
            earnings: 0.015,
            createdAt: '2024-01-15',
            imageUrl: 'ipfs://QmExampleImage1'
          },
          {
            promptId: 'def456',
            title: 'Professional resume writer',
            premium: false,
            votes: 8,
            tips: 3,
            earnings: 0.008,
            createdAt: '2024-01-10',
            imageUrl: 'ipfs://QmExampleImage2'
          },
          {
            promptId: 'ghi789',
            title: 'Midjourney logo generator',
            premium: true,
            votes: 20,
            tips: 8,
            earnings: 0.022,
            createdAt: '2024-01-05',
            imageUrl: 'ipfs://QmExampleImage3'
          }
        ]
        
        await fetchBlockchainData(mockPrompts)
        
        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'tip',
            promptId: 'abc123',
            promptTitle: 'Generate a viral AI meme',
            amount: 0.005,
            from: '0x1234...5678',
            timestamp: '2024-01-20T10:30:00Z'
          },
          {
            id: '2',
            type: 'vote',
            promptId: 'def456',
            promptTitle: 'Professional resume writer',
            timestamp: '2024-01-20T09:15:00Z'
          },
          {
            id: '3',
            type: 'tip',
            promptId: 'ghi789',
            promptTitle: 'Midjourney logo generator',
            amount: 0.003,
            from: '0x8765...4321',
            timestamp: '2024-01-20T08:45:00Z'
          }
        ]
        
        const mockEarnings: EarningsData[] = [
          { date: '2024-01-15', amount: 0.005 },
          { date: '2024-01-16', amount: 0.008 },
          { date: '2024-01-17', amount: 0.003 },
          { date: '2024-01-18', amount: 0.012 },
          { date: '2024-01-19', amount: 0.007 },
          { date: '2024-01-20', amount: 0.010 }
        ]
        
        setStats(mockStats)
        setRecentActivity(mockActivity)
        setEarningsData(mockEarnings)
      } finally {
        setLoading(false)
      }
    }
    
    async function fetchBlockchainData(prompts: UserPrompt[]) {
      if (!account) return
      
      try {
        // Get creator's total earnings from blockchain
        const totalEarnings = await getCreatorEarnings(account)
        
        // Update each prompt with real blockchain data
        const updatedPrompts = await Promise.all(
          prompts.map(async (prompt) => {
            try {
              const stats = await getPromptStats(prompt.promptId)
              const totalTips = await getPromptTotalTips(prompt.promptId)
              
              return {
                ...prompt,
                votes: stats?.upvotes || prompt.votes,
                tips: Math.floor(Math.random() * 10) + 1, // Mock tips count for now
                earnings: parseFloat(formatEth(totalTips))
              }
            } catch (error) {
              console.error(`Error fetching blockchain data for prompt ${prompt.promptId}:`, error)
              return prompt
            }
          })
        )
        
        setPrompts(updatedPrompts)
        
        // Update stats with real blockchain data
        const totalVotes = updatedPrompts.reduce((sum, p) => sum + p.votes, 0)
        const totalTips = updatedPrompts.reduce((sum, p) => sum + p.tips, 0)
        
        setStats({
          totalPrompts: updatedPrompts.length,
          totalTips,
          totalVotes,
          totalEarnings: parseFloat(formatEth(totalEarnings))
        })
        
      } catch (error) {
        console.error('Error fetching blockchain data:', error)
      }
    }
    
    fetchDashboardData()
  }, [account])

  if (!account) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Creator Dashboard
            </span>
          </h1>
          <p className="text-gray-600">Please connect your wallet to view your creator dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              Creator Dashboard
            </span>
          </h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
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
              Creator Dashboard
            </span>
          </h1>
        <p className="text-gray-600">Track your prompts, earnings, and activity</p>
      </div>

      {/* Bhindi AI Analytics Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-4">🤖 Bhindi AI Moderation Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats?.totalPrompts}</div>
            <div className="text-sm opacity-90">Total Prompts</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-300">{stats?.totalPrompts}</div>
            <div className="text-sm opacity-90">Flagged Prompts</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-300">{stats?.totalPrompts}%</div>
            <div className="text-sm opacity-90">Accuracy</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats?.totalPrompts}</div>
            <div className="text-sm opacity-90">Categories Monitored</div>
          </div>
        </div>
        
        {/* Top Flagged Categories */}
        {stats?.totalPrompts > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Top Flagged Categories:</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: stats.totalPrompts }, (_, index) => (
                <span key={index} className="bg-red-500/20 px-3 py-1 rounded-full text-sm">
                  Category {index + 1}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Prompts</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalPrompts}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalVotes}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Coins className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tips</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalTips}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEarnings} ETH</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Your Prompts */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Prompts</h2>
            <div className="space-y-4">
              {prompts.map(prompt => (
                <div key={prompt.promptId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={prompt.imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")}
                      alt={prompt.title}
                      className="w-12 h-12 object-cover rounded"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                    <div>
                      <h3 className="font-medium">{prompt.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {prompt.votes}
                        </span>
                        <span className="flex items-center">
                          <Coins className="h-4 w-4 mr-1" />
                          {prompt.tips}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {prompt.earnings} ETH
                        </span>
                        {prompt.premium && (
                          <span className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded text-xs">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {activity.type === 'tip' ? (
                    <Coins className="h-4 w-4 text-green-600" />
                  ) : (
                    <ThumbsUp className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.type === 'tip' ? 'Tip received' : 'Vote received'}
                  </p>
                  <p className="text-xs text-gray-600">{activity.promptTitle}</p>
                  {activity.amount && (
                    <p className="text-xs text-green-600">+{activity.amount} ETH</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="card mt-8">
        <EarningsChart data={earningsData} />
      </div>
    </div>
  )
} 