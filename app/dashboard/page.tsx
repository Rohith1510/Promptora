"use client"

import { useEffect, useState } from "react"
import { useAddress } from "@thirdweb-dev/react"
import { 
  TrendingUp, 
  Coins, 
  FileText, 
  ThumbsUp, 
  Calendar,
  Eye,
  DollarSign,
  Activity
} from "lucide-react"
import Link from "next/link"

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
  const address = useAddress()
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [prompts, setPrompts] = useState<UserPrompt[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [earningsData, setEarningsData] = useState<EarningsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    
    async function fetchDashboardData() {
      setLoading(true)
      try {
        // Mock data - replace with real API calls
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
        setPrompts(mockPrompts)
        setRecentActivity(mockActivity)
        setEarningsData(mockEarnings)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [address])

  if (!address) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-gray-600">Please connect your wallet to view your creator dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-gray-600">Loading your stats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <Link href="/submit" className="btn-primary">
          Submit New Prompt
        </Link>
      </div>

      {/* Stats Overview */}
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
                  <div className="text-right text-sm text-gray-600">
                    <div>{new Date(prompt.createdAt).toLocaleDateString()}</div>
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
                <div className={`p-2 rounded-full ${
                  activity.type === 'tip' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {activity.type === 'tip' ? (
                    <Coins className="h-4 w-4 text-green-600" />
                  ) : (
                    <ThumbsUp className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'tip' ? 'Tip received' : 'New vote'}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.promptTitle}
                  </p>
                  {activity.type === 'tip' && activity.amount && (
                    <p className="text-sm text-green-600 font-medium">
                      +{activity.amount} ETH
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4">Earnings Over Time</h2>
        <div className="h-64 flex items-end justify-between space-x-2">
          {earningsData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary-500 rounded-t"
                style={{ height: `${(data.amount / Math.max(...earningsData.map(d => d.amount))) * 200}px` }}
              />
              <div className="text-xs text-gray-600 mt-2">
                {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs font-medium text-gray-900">
                {data.amount} ETH
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 