"use client"

import { useState } from "react"

interface ContentAnalysis {
  flagged: boolean
  categories: {
    hate: boolean
    violence: boolean
    harassment: boolean
    self_harm: boolean
    sexual: boolean
    illegal: boolean
  }
  confidence: number
  provider: string
  flaggedWords?: string[]
  riskLevel: 'low' | 'medium' | 'high'
  suggestions: string[]
  timestamp: string
}

export default function BhindiAgentPage() {
  const [prompt, setPrompt] = useState("")
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function analyzeContent() {
    if (!prompt.trim()) return
    
    setLoading(true)
    setError("")
    setAnalysis(null)

    try {
      const response = await fetch("/api/bhindi-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (err: any) {
      setError(err.message || "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (categories: any) => {
    const flaggedCount = Object.values(categories).filter(Boolean).length
    if (flaggedCount >= 3) return 'high'
    if (flaggedCount >= 1) return 'medium'
    return 'low'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-black bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl text-white font-bold mb-2">🤖 Bhindi Agent</h1>
        <p className="text-black">AI-powered content analysis and moderation</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl text-black font-bold mb-4">Content Analysis</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-black text-sm font-medium mb-2">Enter your prompt or content:</label>
            <textarea
              className="w-full h-32 p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste your content here for AI analysis..."
            />
          </div>
          <button
            onClick={analyzeContent}
            disabled={loading || !prompt.trim()}
            className="btn-primary w-full"
          >
            {loading ? "Analyzing..." : "Analyze Content"}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl text-black font-bold mb-6">Analysis Results</h2>
          
          {/* Summary Card */}
          <div className={`border rounded-lg p-4 mb-6 ${getRiskColor(analysis.riskLevel)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-black font-semibold">Risk Assessment</h3>
                <p className="text-smtext-black text-black opacity-50">
                  {analysis.flagged ? "Content flagged for review" : "Content appears safe"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl text-black font-bold capitalize">{analysis.riskLevel}</div>
                <div className="text-sm opacity-80">Risk Level</div>
              </div>
            </div>
          </div>

          {/* Categories Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg text-black font-semibold mb-4">Content Categories</h3>
              <div className="space-y-3">
                {Object.entries(analysis.categories).map(([category, flagged]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 text-black rounded-lg">
                    <span className="capitalize font-medium">{category.replace('_', ' ')}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      flagged ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {flagged ? 'Flagged' : 'Safe'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg text-blackfont-semibold mb-4">Analysis Details</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-black text-gray-600">Confidence Score</div>
                  <div className="text-lg text-black font-semibold">{(analysis.confidence * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">AI Provider</div>
                  <div className="text-lg text-black font-semibold">{analysis.provider}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Analysis Time</div>
                  <div className="text-lg text-black font-semibold">{new Date(analysis.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Flagged Words */}
          {analysis.flaggedWords && analysis.flaggedWords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Flagged Words</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.flaggedWords.map((word, index) => (
                  <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <h3 className="text-lg text-black font-semibold mb-3">Suggestions</h3>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 text-black bg-blue-50 rounded-lg">
                    <div className="text-blue-500 mt-1">💡</div>
                    <div className="text-sm text-black">{suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}
    </div>
  )
} 