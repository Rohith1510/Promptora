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

    // Test 1: Get spreadsheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID
    })

    const sheetNames = metadata.data.sheets?.map(sheet => sheet.properties?.title) || []
    
    // Test 2: Try to read from Sheet1
    let readTest = null
    try {
      const readResult = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sheet1!A1:A5'
      })
      readTest = { success: true, rows: readResult.data.values?.length || 0 }
    } catch (readErr) {
      readTest = { success: false, error: (readErr as Error).message }
    }

    // Test 3: Try to write a test row
    let writeTest = null
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sheet1!A:G',
        valueInputOption: 'USER_ENTERED',
        requestBody: { 
          values: [[
            'TEST_' + Date.now(),
            'Test Title',
            'Test Prompt',
            'test, tags',
            'FALSE',
            'test-image-url',
            new Date().toISOString()
          ]] 
        }
      })
      writeTest = { success: true }
    } catch (writeErr) {
      writeTest = { success: false, error: (writeErr as Error).message }
    }

    return NextResponse.json({
      success: true,
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      availableSheets: sheetNames,
      readTest,
      writeTest,
      suggestion: sheetNames.includes('Sheet1') 
        ? 'Sheet1 exists and should work' 
        : `Available sheets: ${sheetNames.join(', ')}. Consider renaming one to "Sheet1" or update the API to use "${sheetNames[0] || 'Sheet1'}"`
    })

  } catch (err) {
    console.error('Test sheets error:', err)
    return NextResponse.json({ 
      error: 'Failed to test Google Sheets', 
      details: (err as Error).message,
      suggestion: 'Check your GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID environment variables'
    }, { status: 500 })
  }
} 