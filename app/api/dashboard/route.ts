import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Google Sheets setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  SCOPES
)
const sheets = google.sheets({ version: 'v4', auth })

export async function GET(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_SHEET_ID) {
      return NextResponse.json({ 
        error: 'GOOGLE_SHEET_ID not configured',
        suggestion: 'Add GOOGLE_SHEET_ID to your environment variables'
      }, { status: 400 })
    }

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:G',
    })

    const rows = response.data.values || []
    
    // Transform data (no header row to skip)
    const prompts = rows.map((row, index) => {
      const [promptId, title, prompt, tags, premium, imageUrl, createdAt] = row
      
      return {
        promptId: promptId || `prompt_${index}`,
        title: title || 'Untitled Prompt',
        premium: premium === 'TRUE',
        votes: Math.floor(Math.random() * 50) + 1,
        tips: Math.floor(Math.random() * 10) + 1,
        earnings: parseFloat((Math.random() * 0.1).toFixed(4)),
        createdAt: createdAt || new Date().toISOString(),
        imageUrl: imageUrl || 'ipfs://QmDefaultImage'
      }
    })

    // Calculate stats
    const stats = {
      totalPrompts: prompts.length,
      totalTips: prompts.reduce((sum, p) => sum + p.tips, 0),
      totalVotes: prompts.reduce((sum, p) => sum + p.votes, 0),
      totalEarnings: parseFloat(prompts.reduce((sum, p) => sum + p.earnings, 0).toFixed(4))
    }

    // Generate recent activity
    const recentActivity = prompts.slice(0, 5).map((prompt, index) => ({
      id: `activity_${index}`,
      type: Math.random() > 0.5 ? 'tip' : 'vote' as 'tip' | 'vote',
      promptId: prompt.promptId,
      promptTitle: prompt.title,
      amount: prompt.type === 'tip' ? prompt.earnings : undefined,
      from: '0x' + Math.random().toString(36).substring(2, 15),
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }))

    // Generate earnings data for the last 7 days
    const earningsData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: parseFloat((Math.random() * 0.02).toFixed(4))
    }))

    return NextResponse.json({ 
      success: true, 
      stats,
      prompts,
      recentActivity,
      earningsData
    })

  } catch (err) {
    console.error('Failed to fetch dashboard data from Google Sheets:', err)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data', 
      details: (err as Error).message,
      suggestion: 'Check your Google Sheets configuration and permissions'
    }, { status: 500 })
  }
} 