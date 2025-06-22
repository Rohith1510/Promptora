import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fetch from 'node-fetch'

// --- ENV VARS NEEDED ---
// GOOGLE_SERVICE_ACCOUNT_EMAIL
// GOOGLE_PRIVATE_KEY
// GOOGLE_SHEET_ID
// DISCORD_WEBHOOK_URL (or SLACK_WEBHOOK_URL)
// HUGGINGFACE_API_KEY
// BHINDI_API_KEY

// Google Sheets setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  SCOPES
)
const sheets = google.sheets({ version: 'v4', auth })

// Free local moderation alternative
function localModeration(content: string) {
  const harmfulWords = [
    'hate', 'violence', 'harassment', 'self-harm', 'sexual', 'illegal',
    'drugs', 'weapons', 'terrorism', 'discrimination', 'abuse'
  ];
  
  const lowerContent = content.toLowerCase();
  const flaggedWords = harmfulWords.filter(word => 
    lowerContent.includes(word)
  );
  
  return {
    flagged: flaggedWords.length > 0,
    categories: flaggedWords.length > 0 ? {
      hate: lowerContent.includes('hate'),
      violence: lowerContent.includes('violence'),
      harassment: lowerContent.includes('harassment'),
      self_harm: lowerContent.includes('self-harm'),
      sexual: lowerContent.includes('sexual'),
      illegal: lowerContent.includes('illegal')
    } : {},
    flaggedWords
  };
}

// Hugging Face moderation
async function huggingFaceModeration(content: string) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/roberta-hate-speech-detection",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: content }),
      }
    );
    
    const result = await response.json();
    
    // Hugging Face returns an array with scores
    const scores = Array.isArray(result) ? result[0] : result;
    
    return {
      flagged: scores?.label === 'LABEL_1' && scores?.score > 0.7,
      categories: {
        hate: scores?.label === 'LABEL_1' && scores?.score > 0.7,
        violence: false, // This model only detects hate speech
        harassment: false,
        self_harm: false,
        sexual: false,
        illegal: false
      },
      confidence: scores?.score || 0
    };
  } catch (error) {
    console.error('Hugging Face moderation error:', error);
    // Fallback to local moderation
    return localModeration(content);
  }
}

// Bhindi AI API integration (for Bhindi track)
async function bhindiAIModeration(content: string) {
  try {
    const response = await fetch(
      "https://api.bhindi.ai/v1/moderate",
      {
        headers: {
          Authorization: `Bearer ${process.env.BHINDI_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          text: content,
          options: {
            categories: ['hate', 'violence', 'harassment', 'self_harm', 'sexual', 'illegal'],
            threshold: 0.7
          }
        }),
      }
    );
    
    const result = await response.json();
    
    return {
      flagged: result.flagged || false,
      categories: result.categories || {},
      confidence: result.confidence || 0,
      provider: 'Bhindi AI'
    };
  } catch (error) {
    console.error('Bhindi AI moderation error:', error);
    // Fallback to Hugging Face
    return await huggingFaceModeration(content);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, prompt, wallet } = await req.json()
    const promptId = Math.random().toString(36).substring(2, 10) // simple unique id

    // Choose your moderation provider:
    // Option 1: Bhindi AI API (for Bhindi track)
    const moderationResult = await bhindiAIModeration(`${title}\n${prompt}`)
    
    // Option 2: Hugging Face (FREE)
    // const moderationResult = await huggingFaceModeration(`${title}\n${prompt}`)
    
    // Option 3: Local moderation (completely free, no API key needed)
    // const moderationResult = localModeration(`${title}\n${prompt}`)
    
    // Option 4: OpenAI (paid, but very cheap)
    // const modRes = await openai.createModeration({ input: `${title}\n${prompt}` })
    // const moderationResult = { flagged: modRes.data.results[0].flagged, categories: modRes.data.results[0].categories }

    // 1. If flagged, alert Discord/Slack and return error
    if (moderationResult.flagged) {
      const flaggedReason = JSON.stringify(moderationResult.categories)
      const alertMsg = {
        content: `🚨 Prompt flagged by moderation!\nTitle: ${title}\nReason: ${flaggedReason}`
      }
      if (process.env.DISCORD_WEBHOOK_URL) {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertMsg)
        })
      }
      return NextResponse.json({ error: 'Prompt flagged by moderation', reason: flaggedReason }, { status: 400 })
    }

    // 2. If passed, add to Google Sheet
    try {
      // Use default sheet name (Sheet1) instead of "Prompts"
      const sheetName = 'Sheet1'
      const range = `${sheetName}!A:G`
      
      const row = [
        promptId,
        title,
        prompt,
        wallet ? wallet.join(', ') : '',
        new Date().toISOString()
      ]
      
      console.log('Attempting to write to Google Sheet:', {
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
        row
      })
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] }
      })
      
      return NextResponse.json({ success: true, promptId })
    } catch (err) {
      console.error('Google Sheets error:', err)
      return NextResponse.json({ 
        error: 'Failed to write to Google Sheet', 
        details: (err as Error).message,
        suggestion: 'Make sure your Google Sheet has a sheet named "Sheet1" and the service account has write permissions'
      }, { status: 500 })
    }
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to process request', details: (err as Error).message }, { status: 500 })
  }
} 