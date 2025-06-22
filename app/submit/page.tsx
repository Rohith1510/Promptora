"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SubmitPromptPage() {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [tags, setTags] = useState("")
  const [premium, setPremium] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Mock upload function - replace with real upload logic later
  async function mockUpload(file: File): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Return a mock IPFS URL
    return `ipfs://QmMock${Date.now()}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    let imageUrl = ""
    try {
      if (image) {
        imageUrl = await mockUpload(image)
      }
      // Send to Bhindi webhook (placeholder)
      const res = await fetch("/api/bhindi-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          prompt,
          tags: tags.split(",").map(t => t.trim()),
          premium,
          imageUrl,
        }),
      })
      if (!res.ok) throw new Error("Failed to submit prompt")
      setSuccess("Prompt submitted for moderation!")
      setTitle("")
      setPrompt("")
      setTags("")
      setPremium(false)
      setImage(null)
    } catch (err: any) {
      setError(err.message || "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-500 transition-colors text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2 text-white" />
          Back to Home
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
          Submit a Prompt
        </span>
      </h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required maxLength={80} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Prompt Text</label>
          <textarea className="input-field" value={prompt} onChange={e => setPrompt(e.target.value)} required rows={4} maxLength={1000} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tags (comma separated)</label>
          <input className="input-field" value={tags} onChange={e => setTags(e.target.value)} placeholder="#resume, #logo" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="premium" checked={premium} onChange={e => setPremium(e.target.checked)} />
          <label htmlFor="premium" className="font-medium">Premium (NFT required to unlock)</label>
        </div>
        <div>
          <label className="block mb-1 font-medium">Image (optional)</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? "Submitting..." : "Submit Prompt"}</button>
        {success && <div className="text-green-600 font-medium mt-2">{success}</div>}
        {error && <div className="text-red-600 font-medium mt-2">{error}</div>}
      </form>
    </div>
  )
} 