"use client"

import { motion } from "framer-motion"
import ParticlesWrapper from "@/components/ParticlesWrapper"

export default function TextSummarizerPage() {
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
            Text Summarizer
          </h1>
          <p className="mt-4 text-center text-gray-400 max-w-2xl mx-auto">
            Paste your text and get a quick summary of the main points
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
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-200">
                  Enter your text
                </label>
                <textarea
                  className="w-full h-64 bg-white/10 border border-gray-700 rounded-md p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Paste your text here..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-200">
                    Summary Length
                  </label>
                  <select className="bg-white/10 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>

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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Generate Summary
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 