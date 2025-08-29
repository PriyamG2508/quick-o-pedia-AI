import { Github, Mail, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#0D1117] border-t border-[#00A8E8]/20 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">Quick-o-pedia</h3>
            <p className="text-gray-400 mb-4">Transform your learning experience</p>
            <div className="flex items-center gap-4">
              <a href="https://github.com" className="text-gray-400 hover:text-[#00A8E8] transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="mailto:contact@quickopedia.com" className="text-gray-400 hover:text-[#00A8E8] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-[#00A8E8] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  AI Chat
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  Instant Scraping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  Free Downloads
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  24/7 Access
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  Status Page
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">About</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A8E8] transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#00A8E8]/20 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2024 Quick-o-pedia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
