"use client"

import { useState, useEffect } from "react"
import { api, type HealthResponse } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function BackendStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      setLoading(true)
      setError(null)
      const healthData = await api.healthCheck()
      setHealth(healthData)
    } catch (err) {
      setError("Backend server is not reachable")
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-[#0D1117] border-[#00A8E8] p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-sm">Checking backend status...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[#0D1117] border-red-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-400 text-sm">{error}</span>
          </div>
          <button
            onClick={checkHealth}
            className="text-xs text-gray-400 hover:text-white"
          >
            Retry
          </button>
        </div>
      </Card>
    )
  }

  if (!health) return null

  return (
    <Card className="bg-[#0D1117] border-[#00A8E8] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            health.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-gray-400 text-sm">Backend Status</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={health.status === 'healthy' ? 'default' : 'secondary'}>
            {health.status}
          </Badge>
          <Badge variant={health.groq_api_configured ? 'default' : 'destructive'}>
            {health.groq_api_configured ? 'AI Ready' : 'AI Not Configured'}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
