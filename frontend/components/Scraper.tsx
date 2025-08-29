"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { ScrapedContent } from "@/app/page"
import { api, ApiError } from "@/lib/api"
import { config } from "@/lib/config"

interface ScraperProps {
  onScrapeComplete: (content: ScrapedContent) => void
  onChatOpen: () => void
  scrapedContent: ScrapedContent | null
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export default function Scraper({
  onScrapeComplete,
  onChatOpen,
  scrapedContent,
  isLoading,
  setIsLoading,
  error,
  setError,
}: ScraperProps) {
  const [topic, setTopic] = useState("")

  const handleScrape = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const startTime = Date.now()
      const response = await api.scrapeWikipedia(topic)
      const processingTime = (Date.now() - startTime) / 1000

      const scrapedContent: ScrapedContent = {
        topic: response.topic,
        content_length: response.content_length,
        word_count: response.word_count,
        content: response.content,
        processing_time: processingTime,
      }

      onScrapeComplete(scrapedContent)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError(`Topic "${topic}" not found. Please check the spelling and try again.`)
        } else {
          setError(`Error: ${err.message}`)
        }
      } else {
        setError("Failed to scrape content. Please check if the backend server is running.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!scrapedContent) return

    const blob = new Blob([scrapedContent.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${scrapedContent.topic.replace(/\s+/g, "_")}_wikipedia.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#0D1117] border-[#00A8E8] p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Wikipedia Topic Scraper</h2>

          <div className="flex gap-4 mb-8">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter Wikipedia topic..."
              className="flex-1 bg-[#0D1117] border border-[#00A8E8] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8E8]"
              onKeyPress={(e) => e.key === "Enter" && handleScrape()}
            />
            <Button
              onClick={handleScrape}
              disabled={isLoading || !topic.trim()}
              className="bg-[#00A8E8] text-white hover:bg-[#0078D4] px-8"
            >
              {isLoading ? "Scraping..." : "Scrape"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {scrapedContent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#00A8E8]">
                    {scrapedContent.content_length.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Characters</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#00A8E8]">{scrapedContent.word_count.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Words</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#00A8E8]">{Math.ceil(scrapedContent.word_count / 200)}</div>
                  <div className="text-sm text-gray-400">Min Read</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#00A8E8]">{scrapedContent.processing_time}s</div>
                  <div className="text-sm text-gray-400">Process Time</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Content Preview</h3>
                <textarea
                  value={scrapedContent.content}
                  readOnly
                  className="w-full h-32 bg-[#0D1117] border border-[#00A8E8] rounded-lg p-4 text-white resize-none focus:outline-none"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-[#00A8E8] text-[#00A8E8] hover:bg-[#00A8E8]/10 bg-transparent"
                >
                  Download .txt
                </Button>
                <Button onClick={onChatOpen} className="bg-[#00A8E8] text-white hover:bg-[#0078D4]">
                  Start Chatting
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Popular Topics */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Popular topics:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {config.defaultTopics.map((popularTopic) => (
              <button
                key={popularTopic}
                onClick={() => setTopic(popularTopic)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
              >
                {popularTopic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
