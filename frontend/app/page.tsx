"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Scraper from "@/components/Scraper"
import ChatModal from "@/components/ChatModal"
import StatsSection from "@/components/StatsSection"
import Footer from "@/components/Footer"
import BackendStatus from "@/components/BackendStatus"

export interface ScrapedContent {
  topic: string
  content_length: number
  word_count: number
  content: string
  processing_time: number
}

export interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export default function HomePage() {
  const [currentTopic, setCurrentTopic] = useState<string | null>(null)
  const [scrapedContent, setScrapedContent] = useState<ScrapedContent | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScrapeComplete = (content: ScrapedContent) => {
    setScrapedContent(content)
    setCurrentTopic(content.topic)
    setError(null)
  }

  const handleChatOpen = () => {
    setIsChatOpen(true)
    // Initialize chat with welcome message
    if (chatMessages.length === 0 && currentTopic) {
      setChatMessages([
        {
          id: "1",
          type: "ai",
          content: `Hi! I'm ready to help you learn about "${currentTopic}". What would you like to know?`,
          timestamp: new Date(),
        },
      ])
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <Header />
      <main>
        <Hero />
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <BackendStatus />
        </div>
        <Scraper
          onScrapeComplete={handleScrapeComplete}
          onChatOpen={handleChatOpen}
          scrapedContent={scrapedContent}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          error={error}
          setError={setError}
        />
        <StatsSection />
      </main>
      <Footer />

      {isChatOpen && currentTopic && (
        <ChatModal
          topic={currentTopic}
          messages={chatMessages}
          setMessages={setChatMessages}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  )
}
