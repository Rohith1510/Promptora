import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Mock data
  const prompts = [
    {
      promptId: 'abc123',
      title: 'Generate a viral AI meme',
      prompt: 'Create a meme that will go viral on Twitter.',
      tags: ['#meme', '#viral'],
      premium: true,
      imageUrl: 'ipfs://QmExampleImage1',
      votes: 12,
      creator: '0x123...'
    },
    {
      promptId: 'def456',
      title: 'Write a professional resume',
      prompt: 'Prompt for ChatGPT to write a resume.',
      tags: ['#resume', '#career'],
      premium: false,
      imageUrl: 'ipfs://QmExampleImage2',
      votes: 8,
      creator: '0x456...'
    },
    {
      promptId: 'ghi789',
      title: 'Midjourney logo prompt',
      prompt: 'Prompt for Midjourney to generate a modern logo.',
      tags: ['#logo', '#midjourney'],
      premium: true,
      imageUrl: 'ipfs://QmExampleImage3',
      votes: 20,
      creator: '0x789...'
    }
  ]
  return NextResponse.json(prompts)
} 
 