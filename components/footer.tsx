import type React from "react"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-950 to-[#0f172a] text-white border-t border-indigo-500/20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="text-2xl font-bold text-white mb-4">Atlas AI</div>
            <p className="mb-4 max-w-md">
              Revolutionizing education with AI-powered personalized learning experiences.
            </p>
          </div>



        </div>

        <div className="border-t border-indigo-500/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm"> {new Date().getFullYear()} Atlas AI.</p>
          <div className="mt-4 md:mt-0">
            <a
              href="mailto:jayantnaidu.4229@gmail.com"
              className="inline-flex items-center text-sm hover:text-white transition-colors"
            >
              <Mail size={16} className="mr-2" />
              jayantnaidu.4229@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  )
}

