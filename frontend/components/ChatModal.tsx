"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { ChatMessage } from "@/app/page"
import { api, ApiError } from "@/lib/api"

interface ChatModalProps {
  topic: string
  messages: ChatMessage[]
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void
  onClose: () => void
}

export default function ChatModal({ topic, messages, setMessages, onClose }: ChatModalProps) {
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev: ChatMessage[]) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await api.chatWithWikipedia(topic, input)
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.answer,
        timestamp: new Date(),
      }
      setMessages((prev: ChatMessage[]) => [...prev, aiMessage])
    } catch (err) {
      let errorContent = "Sorry, I'm having trouble connecting to the server. Please try again."
      
      if (err instanceof ApiError) {
        if (err.status === 500 && err.message.includes("GROQ_API_KEY")) {
          errorContent = "AI chat is not configured. Please set up your GROQ API key in the backend."
        } else if (err.status === 404) {
          errorContent = "Topic not found. Please try scraping the content first."
        } else {
          errorContent = `Sorry, I encountered an error: ${err.message}`
        }
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: errorContent,
        timestamp: new Date(),
      }
      setMessages((prev: ChatMessage[]) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const suggestedQuestions = [
    "What are the key points?",
    "Explain in simple terms",
    "Give me examples",
    "What are the main concepts?",
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-[#00A8E8] rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#00A8E8]/20">
          <h2 className="text-lg font-semibold text-white">Chatting about: {topic}</h2>
          <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
            ✕
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === "user" ? "bg-[#00A8E8] text-white" : "bg-gray-800 text-gray-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        <div className="px-4 py-2 border-t border-[#00A8E8]/20">
          <div className="flex flex-wrap gap-2 mb-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                onClick={() => setInput(question)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#00A8E8]/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-[#0D1117] border border-[#00A8E8] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8E8]"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-[#00A8E8] text-white hover:bg-[#0078D4]"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}