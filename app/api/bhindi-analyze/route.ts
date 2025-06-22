import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'

// Enhanced local moderation with detailed analysis
function localModerationWithAnalysis(content: string) {
  const harmfulWords = {
    hate: ['hate', 'racist', 'discrimination', 'bigot', 'supremacist', 'nazi', 'fascist'],
    violence: ['kill', 'killing', 'murder', 'attack', 'weapon', 'bomb', 'shoot', 'shooting', 'stab', 'stabbing', 'beat', 'beating', 'hurt', 'harm', 'violence', 'violent', 'assault', 'fight', 'fighting', 'war', 'battle', 'destroy', 'destruction'],
    harassment: ['harassment', 'bully', 'bullying', 'stalk', 'stalking', 'threaten', 'threatening', 'intimidate', 'intimidation', 'abuse', 'abusive'],
    self_harm: ['self-harm', 'suicide', 'kill myself', 'end my life', 'cut', 'cutting', 'overdose', 'overdosing', 'die', 'death', 'dead'],
    sexual: ['sexual', 'porn', 'pornography', 'explicit', 'adult content', 'nsfw', 'nude', 'nudity', 'sex', 'sexy'],
    illegal: ['illegal', 'drugs', 'steal', 'stealing', 'fraud', 'terrorism', 'terrorist', 'bomb', 'bombing', 'hack', 'hacking', 'rob', 'robbing']
  }
  
  const lowerContent = content.toLowerCase()
  const flaggedCategories: any = {}
  const flaggedWords: string[] = []
  
  // Check each category
  Object.entries(harmfulWords).forEach(([category, words]) => {
    const foundWords = words.filter(word => lowerContent.includes(word))
    if (foundWords.length > 0) {
      flaggedCategories[category] = true
      flaggedWords.push(...foundWords)
    } else {
      flaggedCategories[category] = false
    }
  })
  
  const flagged = flaggedWords.length > 0
  const riskLevel = flaggedWords.length >= 3 ? 'high' : flaggedWords.length >= 1 ? 'medium' : 'low'
  
  // Generate suggestions
  const suggestions = []
  if (flaggedCategories.hate) {
    suggestions.push("Consider using more inclusive and respectful language")
  }
  if (flaggedCategories.violence) {
    suggestions.push("⚠️ WARNING: Content contains violent language - avoid references to harm, killing, or violence")
  }
  if (flaggedCategories.harassment) {
    suggestions.push("Ensure content promotes positive interactions")
  }
  if (flaggedCategories.self_harm) {
    suggestions.push("Content should not promote self-harm or dangerous behaviors")
  }
  if (flaggedCategories.sexual) {
    suggestions.push("Keep content appropriate for all audiences")
  }
  if (flaggedCategories.illegal) {
    suggestions.push("Ensure content complies with legal requirements")
  }
  
  if (!flagged) {
    suggestions.push("Content appears safe and appropriate")
  }
  
  return {
    flagged,
    categories: flaggedCategories,
    confidence: flagged ? 0.9 : 0.95,
    provider: 'Local Analysis',
    flaggedWords: [...new Set(flaggedWords)], // Remove duplicates
    riskLevel,
    suggestions,
    timestamp: new Date().toISOString()
  }
}

// Hugging Face moderation with detailed analysis
async function huggingFaceModerationWithAnalysis(content: string) {
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
    )
    
    const result = await response.json()
    const scores = Array.isArray(result) ? result[0] : result
    
    const flagged = scores?.label === 'LABEL_1' && scores?.score > 0.7
    const confidence = scores?.score || 0
    
    const categories = {
      hate: flagged,
      violence: false,
      harassment: false,
      self_harm: false,
      sexual: false,
      illegal: false
    }
    
    const riskLevel = flagged ? 'high' : confidence > 0.3 ? 'medium' : 'low'
    
    const suggestions = []
    if (flagged) {
      suggestions.push("Content may contain hate speech - consider revising")
      suggestions.push("Use more inclusive and respectful language")
    } else {
      suggestions.push("Content appears safe from hate speech detection")
    }
    
    return {
      flagged,
      categories,
      confidence,
      provider: 'Hugging Face AI',
      flaggedWords: flagged ? ['hate_speech_detected'] : [],
      riskLevel,
      suggestions,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Hugging Face moderation error:', error)
    return localModerationWithAnalysis(content)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt provided' }, { status: 400 })
    }

    // Use enhanced local moderation as primary (better for violence detection)
    let analysis = localModerationWithAnalysis(prompt)
    
    // Only use Hugging Face if you have the API key and want hate speech detection
    if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'hf_demo') {
      try {
        const hfAnalysis = await huggingFaceModerationWithAnalysis(prompt)
        // Combine results - if either flags content, it's flagged
        analysis = {
          ...analysis,
          flagged: analysis.flagged || hfAnalysis.flagged,
          categories: {
            ...analysis.categories,
            hate: analysis.categories.hate || hfAnalysis.categories.hate
          },
          provider: 'Local + Hugging Face AI',
          suggestions: [...analysis.suggestions, ...hfAnalysis.suggestions]
        }
      } catch (error) {
        console.error('Hugging Face fallback failed:', error)
      }
    }
    
    return NextResponse.json(analysis)
    
  } catch (error: any) {
    console.error('Bhindi analyze error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error.message }, 
      { status: 500 }
    )
  }
} 