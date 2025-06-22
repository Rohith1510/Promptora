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
      range: 'Sheet1!A:G', // Adjust range based on your sheet structure
    })

    const rows = response.data.values || []
    
    // Transform data (no header row to skip)
    const prompts = rows.map((row, index) => {
      // Assuming columns: [promptId, title, prompt, tags, premium, imageUrl, createdAt]
      const [promptId, title, prompt, tags, premium, imageUrl, createdAt] = row
      
      return {
        promptId: promptId || `prompt_${index}`,
        title: title || 'Untitled Prompt',
        prompt: prompt || '',
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        premium: premium === 'TRUE',
        imageUrl: imageUrl || 'ipfs://QmDefaultImage',
        votes: Math.floor(Math.random() * 50) + 1, // Mock votes for now
        creator: '0x' + Math.random().toString(36).substring(2, 15) // Mock creator address
      }
    })

    return NextResponse.json({ 
      success: true, 
      prompts,
      total: prompts.length
    })

  } catch (err) {
    console.error('Failed to fetch prompts from Google Sheets:', err)
    return NextResponse.json({ 
      error: 'Failed to fetch prompts', 
      details: (err as Error).message,
      suggestion: 'Check your Google Sheets configuration and permissions'
    }, { status: 500 })
  }
} 
 