"use client"

import { motion } from "framer-motion"
import ParticlesWrapper from "@/components/ParticlesWrapper"

export default function VoiceAssistantPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Particles Background */}
      <ParticlesWrapper />
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-12 pb-8 px-4 sm:px-6 lg:px-8"
        >
          <h1 className="text-4xl font-bold text-center text-white">
            Voice Assistant
          </h1>
          <p className="mt-4 text-center text-gray-400 max-w-2xl mx-auto">
            Get help with your studies through voice commands and responses
          </p>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-gray-800"
          >
            <div className="space-y-8">
              {/* Voice Assistant Status */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-indigo-600/20 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400">Voice Assistant is ready</p>
              </div>

              {/* Commands List */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Available Commands</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    "Summarize this text"
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    "Explain this concept"
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    "Create a quiz about..."
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  Start Voice Assistant
                </button>
                <button className="w-full bg-gray-700 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors">
                  Stop Voice Assistant
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 