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

    // Get spreadsheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID
    })

    const sheetNames = metadata.data.sheets?.map(sheet => sheet.properties?.title) || []
    
    // Fetch current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:G',
    })

    const rows = response.data.values || []
    
    return NextResponse.json({
      success: true,
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      availableSheets: sheetNames,
      currentData: rows,
      rowCount: rows.length,
      suggestion: rows.length === 0 ? 
        'No data found. Submit a prompt using the submit form to add data to your sheet.' :
        `Found ${rows.length} rows of data. The first row should be headers.`
    })

  } catch (err) {
    console.error('Test connection error:', err)
    return NextResponse.json({ 
      error: 'Failed to test Google Sheets connection', 
      details: (err as Error).message,
      suggestion: 'Check your GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID environment variables'
    }, { status: 500 })
  }
} 