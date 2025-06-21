import { NextRequest, NextResponse } from 'next/server'
import { OpenAIApi, Configuration } from 'openai'
import { google } from 'googleapis'
import fetch from 'node-fetch'

// --- ENV VARS NEEDED ---
// OPENAI_API_KEY
// GOOGLE_SERVICE_ACCOUNT_EMAIL
// GOOGLE_PRIVATE_KEY
// GOOGLE_SHEET_ID
// DISCORD_WEBHOOK_URL (or SLACK_WEBHOOK_URL)

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }))

// Google Sheets setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  SCOPES
)
const sheets = google.sheets({ version: 'v4', auth })

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { title, prompt, tags, premium, imageUrl, wallet } = data
  const timestamp = new Date().toISOString()
  const promptId = Math.random().toString(36).substring(2, 10) // simple unique id

  // 1. Run GPT-based moderation on text
  let flagged = false
  let flaggedReason = ''
  try {
    const modRes = await openai.createModeration({ input: `${title}\n${prompt}` })
    const results = modRes.data.results[0]
    if (results.flagged) {
      flagged = true
      flaggedReason = JSON.stringify(results.categories)
    }
  } catch (err) {
    return NextResponse.json({ error: 'Moderation failed', details: err.message }, { status: 500 })
  }

  // 2. If flagged, alert Discord/Slack and return error
  if (flagged) {
    const alertMsg = {
      content: `🚨 Prompt flagged by moderation!\nTitle: ${title}\nWallet: ${wallet}\nReason: ${flaggedReason}`
    }
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertMsg)
      })
    }
    // (Optional: Add Slack webhook support here)
    return NextResponse.json({ error: 'Prompt flagged by moderation', reason: flaggedReason }, { status: 400 })
  }

  // 3. If passed, add to Google Sheet
  try {
    const row = [
      promptId,
      title,
      prompt,
      wallet,
      imageUrl,
      premium ? 'TRUE' : 'FALSE',
      timestamp
    ]
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Prompts!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    })
    return NextResponse.json({ success: true, promptId })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to write to Google Sheet', details: err.message }, { status: 500 })
  }
} 