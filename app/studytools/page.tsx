"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare, Mic, Sun, Moon, UserRound, Globe } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import ParticlesWrapper to avoid SSR issues
const ParticlesWrapper = dynamic(() => import("@/components/ParticlesWrapper"), { ssr: false })

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const router = useRouter()

  const handleClick = () => {
    router.push("/studytools/Voicechat")
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
        isDarkMode ? "bg-black" : "bg-white"
      }`}
    >
      {/* Particles Background - Only show in dark mode */}
      {isDarkMode && <ParticlesWrapper />}

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-12">
            <h1
              className={`text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              AI Summarizer Tools
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={`rounded-full ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              }`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF Summarizer Card */}
            <Card
              onClick={() => router.push("/studytools/pdfsummarizer")}
              className={`overflow-hidden ${
                isDarkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              } hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">PDF Summarizer</CardTitle>
                <CardDescription className={isDarkMode ? "text-gray-300" : "text-gray-500"}>
                  Extract key insights from your PDF documents
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  Upload your PDF files and get concise summaries highlighting the most important
                  information.
                </p>
              </CardContent>
              <CardFooter className="relative z-10">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Summarize PDF
                </Button>
              </CardFooter>
            </Card>

            {/* Text Summarizer Card */}
            <Card
              onClick={() => router.push("/studytools/textsummarizer")}
              className={`overflow-hidden ${
                isDarkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              } hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Text Summarizer</CardTitle>
                <CardDescription className={isDarkMode ? "text-gray-300" : "text-gray-500"}>
                  Condense long articles and text content
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  Paste your long-form content and receive a concise summary that captures the
                  essential points.
                </p>
              </CardContent>
              <CardFooter className="relative z-10">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Summarize Text
                </Button>
              </CardFooter>
            </Card>

            {/* Voice Assistant Card */}
       

            <Card
              onClick={() => router.push("/studytools/Voicechat")}
              className={`overflow-hidden ${
                isDarkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              } hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Multilingual Assistant</CardTitle>
                <CardDescription className={isDarkMode ? "text-gray-300" : "text-gray-500"}>
                  Voice assistant with multiple language support
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  Interact with your AI assistant in multiple languages. Automatic language detection and translation powered by Sarvam AI.
                </p>
              </CardContent>
              <CardFooter className="relative z-10">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Try Multilingual Assistant
                </Button>
              </CardFooter>
            </Card>
            {/* AI Mock Interview Card */}
            <Card
              onClick={() => router.push("/studytools/mockinterview")}
              className={`overflow-hidden ${
                isDarkMode
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              } hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <UserRound className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-xl">AI Mock Interview</CardTitle>
                <CardDescription className={isDarkMode ? "text-gray-300" : "text-gray-500"}>
                  Practice interview skills with AI feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  Simulate job interviews with our AI interviewer and receive instant feedback to improve your performance.
                </p>
              </CardContent>
              <CardFooter className="relative z-10">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Start Mock Interview
                </Button>
              </CardFooter>
            </Card>

            {/* Multilingual Voice Assistant Card */}
          </div>
        </div>
      </div>
    </div>
  )
}
