import { Settings, Bot, Download, Infinity } from "lucide-react"

export default function Hero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
          LEARN{" "}
          <span className="bg-gradient-to-r from-[#00A8E8] to-[#0078D4] bg-clip-text text-transparent">FASTER</span>.
          UNDERSTAND DEEPER.
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Your AI-powered assistant for Wikipedia. Scrape articles instantly and chat with AI to master new subjects.
        </p>
        <button className="bg-[#00A8E8] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0078D4] transition-colors">
          Try Now For Free
        </button>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
          {[
            { title: "Instant", subtitle: "Scraping", icon: Settings },
            { title: "AI", subtitle: "Chat", icon: Bot },
            { title: "Download", subtitle: "Content", icon: Download },
            { title: "Free &", subtitle: "Unlimited", icon: Infinity },
          ].map((feature, index) => (
            <div key={index} className="bg-[#0D1117] border border-[#00A8E8] rounded-lg p-4 flex items-center gap-3">
              <feature.icon className="h-8 w-8 text-[#00A8E8] flex-shrink-0" />
              <div className="text-left">
                <div className="text-lg font-semibold text-white">{feature.title}</div>
                <div className="text-sm text-gray-400">{feature.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
