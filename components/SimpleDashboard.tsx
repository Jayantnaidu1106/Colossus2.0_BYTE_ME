'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileQuestion, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

// Static mock data
const mockData = {
  user: { name: "Demo User" },
  performanceData: [
    { quizNumber: 1, marks: 75 },
    { quizNumber: 2, marks: 82 },
    { quizNumber: 3, marks: 68 },
    { quizNumber: 4, marks: 90 },
    { quizNumber: 5, marks: 85 }
  ],
  weakTopics: ["Algebra", "Chemistry", "Physics"],
  onlineDates: [],
};

// Inspirational quotes
const quotes = [
  "The beautiful thing about learning is that no one can take it away from you. — B.B. King",
  "Education is the passport to the future, for tomorrow belongs to those who prepare for it today. — Malcolm X",
  "The more that you read, the more things you will know. The more that you learn, the more places you'll go. — Dr. Seuss",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi",
];

const SimpleDashboard: React.FC = () => {
  // Static background gradient
  const backgroundStyle = {
    background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(25,25,112,0.5) 100%)',
  };

  // Static decorative elements
  const decorativeElements = (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute top-3/4 left-2/3 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl"></div>
    </div>
  );

  // Static bar chart
  const barChart = (
    <div className="h-64 w-full">
      <div className="flex h-full items-end justify-between gap-2 px-2">
        {mockData.performanceData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-12 rounded-t-md" 
              style={{ 
                height: `${item.marks * 0.6}%`, 
                backgroundColor: item.marks < 70 ? '#ef4444' : item.marks < 80 ? '#f97316' : item.marks < 90 ? '#3b82f6' : '#4ade80'
              }}
            ></div>
            <div className="mt-2 text-xs text-white">Quiz {item.quizNumber}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {decorativeElements}
      
      <header className="bg-black/80 backdrop-blur-sm shadow-md relative z-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Atlas AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="flex text-white hover:text-blue-400 items-center gap-2">
              Dashboard
            </Button>
            <Button variant="ghost" className="flex text-white hover:text-blue-400 items-center gap-2"
              asChild
            >
              <Link href="/studytools">Study Tools</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-800">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Performance Tracker</h2>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                {barChart}
              </div>
            </div>
          </div>

          <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Areas to Improve</CardTitle>
              <CardDescription className="text-gray-200">Focus on these topics to boost your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockData.weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/70 border border-gray-700">
                    <span className="text-white">{topic}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-800 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Daily Inspiration</h3>
          </div>
          <div className="mt-4">
            <blockquote className="border-l-4 border-blue-500 pl-4">
              <p className="text-lg font-medium text-white italic">{quotes[Math.floor(Math.random() * quotes.length)]}</p>
            </blockquote>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-full bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white"><Brain className="h-6 w-6 mr-2 text-primary" /> AI Personal Tutor</CardTitle>
              <CardDescription className="text-gray-200">Get personalized help with any subject or topic</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 mb-4">
                Ask questions, get explanations, and receive personalized guidance on any academic subject.
              </p>
              <Button className="w-full" asChild>
                <Link href="/mentor">Start Learning <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full bg-gray-900/50 backdrop-blur-sm border border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white"><FileQuestion className="h-6 w-6 mr-2 text-primary" /> AI Quiz Generator</CardTitle>
              <CardDescription className="text-gray-200">Test your knowledge with personalized quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 mb-4">
                Generate custom quizzes on any topic to test your knowledge and identify areas for improvement.
              </p>
              <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 mb-4">
                <h4 className="font-medium text-sm text-white mb-2">Recent Quiz Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {["World History", "Calculus", "Machine Learning"].map((topic) => (
                    <div key={topic} className="bg-blue-900/70 text-blue-200 hover:bg-blue-800 px-3 py-1 rounded-full text-xs">
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href="/quiz">Take a Quiz <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-medium text-white mb-4">Recent Performance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-white">Correct: {mockData.performanceData.reduce((sum, item) => sum + (item.marks >= 70 ? 1 : 0), 0)}</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-white">Incorrect: {mockData.performanceData.reduce((sum, item) => sum + (item.marks < 70 ? 1 : 0), 0)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;
