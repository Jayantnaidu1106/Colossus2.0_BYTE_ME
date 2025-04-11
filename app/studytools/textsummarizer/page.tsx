'use client';

import React, { useState } from 'react';
import { FaSpinner, FaDownload, FaClipboard, FaCheck, FaSun, FaMoon } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import ParticlesWrapper to avoid SSR issues
const ParticlesWrapper = dynamic(() => import("@/components/ParticlesWrapper"), { ssr: false });

interface SummaryResult {
  original_text: string;
  summary: string;
  original_length: number;
  summary_length: number;
}

export default function TextSummarizer() {
  const [text, setText] = useState<string>('');
  const [summaryLength, setSummaryLength] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSummaryLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummaryLength(parseInt(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please enter some text to summarize');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch('/api/text-summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          summary_length: summaryLength,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize text');
      }

      const data = await response.json();
      setResult(data);
      toast.success('Text summarized successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to summarize text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result?.summary) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSummary = () => {
    if (!result?.summary) return;
    const blob = new Blob([result.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDarkMode ? "bg-black" : "bg-white"
    }`}>
      {/* Particles Background - Only show in dark mode */}
      {isDarkMode && <ParticlesWrapper />}
      
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold text-center ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Text Summarizer
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors duration-300`}
            >
              {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>
          </div>

          <div className={`rounded-lg shadow-md p-6 mb-8 ${
            isDarkMode 
              ? "bg-white/10 backdrop-blur-lg" 
              : "bg-white"
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}>
                  Enter Text
                </label>
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Paste or type the text you want to summarize..."
                  className={`w-full h-64 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    isDarkMode 
                      ? "bg-black/20 text-gray-200 border-gray-600" 
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}>
                  Summary Length (sentences): {summaryLength}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={summaryLength}
                  onChange={handleSummaryLengthChange}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
                <div className={`flex justify-between text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  <span>Shorter</span>
                  <span>Longer</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Summarize Text'
                )}
              </button>
            </form>
          </div>

          {result && (
            <div className={`rounded-lg shadow-md p-6 ${
              isDarkMode 
                ? "bg-white/10 backdrop-blur-lg" 
                : "bg-white"
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}>
                  Summary Result
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopySummary}
                    className={`flex items-center px-3 py-1 rounded-md border ${
                      isDarkMode 
                        ? "text-indigo-400 hover:text-indigo-300 border-indigo-600 hover:bg-indigo-900/20" 
                        : "text-indigo-600 hover:text-indigo-800 border-indigo-200 hover:bg-indigo-50"
                    }`}
                    disabled={!result.summary}
                  >
                    {copied ? (
                      <FaCheck className="mr-1" />
                    ) : (
                      <FaClipboard className="mr-1" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownloadSummary}
                    className={`flex items-center px-3 py-1 rounded-md border ${
                      isDarkMode 
                        ? "text-indigo-400 hover:text-indigo-300 border-indigo-600 hover:bg-indigo-900/20" 
                        : "text-indigo-600 hover:text-indigo-800 border-indigo-200 hover:bg-indigo-50"
                    }`}
                    disabled={!result.summary}
                  >
                    <FaDownload className="mr-1" />
                    Download
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className={`flex justify-between text-sm mb-2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  <span>Compression: {Math.round((1 - result.summary_length / result.original_length) * 100)}%</span>
                  <span>{result.summary_length} / {result.original_length} characters</span>
                </div>
                <div className={`h-2 w-full rounded-full ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}>
                  <div
                    className="h-2 bg-indigo-600 rounded-full"
                    style={{ width: `${(result.summary_length / result.original_length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className={`font-medium mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}>
                    Summary
                  </h3>
                  {result.summary ? (
                    <div className={`p-4 rounded-md whitespace-pre-wrap ${
                      isDarkMode 
                        ? "bg-black/20 text-gray-200" 
                        : "bg-indigo-50 text-gray-800"
                    }`}>
                      {result.summary}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-md border ${
                      isDarkMode 
                        ? "bg-red-900/20 text-red-200 border-red-700" 
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}>
                      No summary could be generated. Please try different text.
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`font-medium mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}>
                    Original Text
                  </h3>
                  <div className={`max-h-96 overflow-y-auto p-4 rounded-md whitespace-pre-wrap ${
                    isDarkMode 
                      ? "bg-black/20 text-gray-300" 
                      : "bg-gray-50 text-gray-600"
                  }`}>
                    {result.original_text}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
