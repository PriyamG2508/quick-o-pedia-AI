import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b border-[#00A8E8]/20 bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-[#00A8E8]" />
              <h1 className="text-xl font-bold text-white">Quick-o-pedia</h1>
            </div>
          </div>
          <Button variant="outline" className="border-[#00A8E8] text-white hover:bg-[#00A8E8]/10 bg-transparent">
            Get Started →
          </Button>
        </div>
      </div>
    </header>
  )
}
