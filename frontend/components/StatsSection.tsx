"use client"

import { useEffect, useState } from "react"

export default function StatsSection() {
  const [counts, setCounts] = useState({
    articles: 0,
    conversations: 0,
    students: 0,
    uptime: 0,
  })

  useEffect(() => {
    const targets = {
      articles: 50000,
      conversations: 25000,
      students: 10000,
      uptime: 99.9,
    }

    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps

      setCounts({
        articles: Math.floor(targets.articles * progress),
        conversations: Math.floor(targets.conversations * progress),
        students: Math.floor(targets.students * progress),
        uptime: Math.min(targets.uptime, targets.uptime * progress),
      })

      if (step >= steps) {
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#00A8E8] mb-2">
              {counts.articles.toLocaleString()}+
            </div>
            <div className="text-gray-400">Articles Scraped</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#00A8E8] mb-2">
              {counts.conversations.toLocaleString()}+
            </div>
            <div className="text-gray-400">AI Conversations</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#00A8E8] mb-2">
              {counts.students.toLocaleString()}+
            </div>
            <div className="text-gray-400">Students Helped</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#00A8E8] mb-2">{counts.uptime.toFixed(1)}%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  )
}
