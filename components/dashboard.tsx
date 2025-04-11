"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import {
  Brain, FileQuestion, LogOut, Video, BookOpen, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamically import ParticlesWrapper to avoid SSR issues
const ParticlesWrapper = dynamic(() => import("./ParticlesWrapper"), { ssr: false })

const motivationalQuotes = [
  "The only way to learn mathematics is to do mathematics. — Paul Halmos",
  "Education is the passport to the future... — Malcolm X",
  "The beautiful thing about learning is that no one can take it away from you. — B.B. King",
]

interface PerformanceItem {
  quizNumber: number
  marks: number
  type: string
  contentScore?: number
  communicationScore?: number
  date?: string
}

interface InterviewResult {
  id: string
  date: string
  content_score: number
  communication_score: number
  overall_score: number
}

interface DashboardData {
  user: {
    name: string
  }
  performanceData: PerformanceItem[]
  weakTopics: string[]
  onlineDates: any[]
  hasInterviewData: boolean
  interviewData: any[]
}

export default function Dashboard() {
  const [randomQuote, setRandomQuote] = useState("")
  const [chartFilter, setChartFilter] = useState<'all' | 'quiz' | 'interview'>('all')
  const { data: session, status } = useSession()
  const router = useRouter()

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    user: { name: "" },
    performanceData: [],
    weakTopics: [],
    onlineDates: [],
    hasInterviewData: false,
    interviewData: []
  })

  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      // Fetch combined stats from our new API endpoint
      const res = await fetch("/api/dashboard/combined-stats")

      if (!res.ok) {
        throw new Error(`Failed to fetch dashboard data: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      console.log('Fetched combined dashboard stats:', data)

      if (data.success) {
        // Set dashboard data from the combined stats
        setDashboardData({
          user: {
            name: data.user?.name || session?.user?.name || "User",
          },
          performanceData: data.performanceData || [],
          weakTopics: data.weakTopics || [],
          onlineDates: data.onlineDates || [],
          hasInterviewData: data.hasInterviewData || false,
          interviewData: data.interviews || []
        })
      } else {
        // Fallback to old method if the new API fails
        console.error('Combined stats API returned an error:', data.error)

        // Fetch basic dashboard data using the old method
        const oldRes = await fetch("/api/dashboard", {
          method: "POST",
          body: JSON.stringify({ email: session?.user?.email }),
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!oldRes.ok) throw new Error("Failed to fetch dashboard data using old method")

        const oldData = await oldRes.json()

        // Build performanceData from result if needed
        let performanceArray = []
        if (Array.isArray(oldData.performanceData) && oldData.performanceData.length > 0) {
          performanceArray = oldData.performanceData
        } else if (oldData.result && typeof oldData.result === "object") {
          performanceArray = Object.entries(oldData.result).map(([quizNumber, marks]) => ({
            quizNumber: Number(quizNumber),
            marks: Number(marks),
            type: 'quiz'
          }))
        }

        // Try to fetch interview stats separately
        try {
          const statsRes = await fetch("/api/dashboard/stats")

          if (statsRes.ok) {
            const statsData = await statsRes.json()
            console.log('Fetched interview stats:', statsData)

            // Add interview data to performance array
            if (statsData.interviews && statsData.interviews.length > 0) {
              const interviewPerformance = statsData.interviews.map((interview: InterviewResult, index: number) => ({
                quizNumber: performanceArray.length + index + 1, // Continue numbering from quiz data
                marks: interview.overall_score * 100, // Convert from 0-1 scale to 0-100
                contentScore: interview.content_score,
                communicationScore: interview.communication_score,
                type: 'interview',
                date: new Date(interview.date).toLocaleDateString()
              }))

              // Combine quiz and interview data
              performanceArray = [...performanceArray, ...interviewPerformance]
            }

            setDashboardData({
              user: {
                name: oldData.user?.name || session?.user?.name || "User",
              },
              performanceData: performanceArray,
              weakTopics: statsData.weakTopics || (Array.isArray(oldData.weakTopics) ? oldData.weakTopics : []),
              onlineDates: oldData.onlineDates || [],
              hasInterviewData: statsData.interviews && statsData.interviews.length > 0,
              interviewData: statsData.interviews || []
            })
          } else {
            // If stats API fails, use only the basic dashboard data
            console.error('Failed to fetch interview stats:', await statsRes.text())

            setDashboardData({
              user: {
                name: oldData.user?.name || session?.user?.name || "User",
              },
              performanceData: performanceArray,
              weakTopics: Array.isArray(oldData.weakTopics) ? oldData.weakTopics : [],
              onlineDates: oldData.onlineDates || [],
              hasInterviewData: oldData.hasInterviewData || false,
              interviewData: oldData.interviewData || []
            })
          }
        } catch (statsError) {
          console.error('Error fetching interview stats:', statsError)

          setDashboardData({
            user: {
              name: oldData.user?.name || session?.user?.name || "User",
            },
            performanceData: performanceArray,
            weakTopics: Array.isArray(oldData.weakTopics) ? oldData.weakTopics : [],
            onlineDates: oldData.onlineDates || [],
            hasInterviewData: oldData.hasInterviewData || false,
            interviewData: oldData.interviewData || []
          })
        }
      }

    } catch (error) {
      console.error("Error loading dashboard:", error)
      setDashboardData({
        user: { name: "User" },
        performanceData: [],
        weakTopics: [],
        onlineDates: [],
        hasInterviewData: false,
        interviewData: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData()
    } else if (status === "unauthenticated") {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    setRandomQuote(motivationalQuotes[randomIndex])
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Particles Background for loading state */}
        <ParticlesWrapper />
        <div className="text-center bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-xl z-10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-gray-900 relative overflow-hidden">
      {/* Particles Background */}
      <ParticlesWrapper />
      <header className="bg-white/90 backdrop-blur-sm shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Atlas AI
            </span>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="flex text-black hover:text-primary items-center gap-2">
                <Video className="h-4 w-4" /> AI Mock Interview
              </Button>
              <Button variant="ghost" className="flex text-black hover:text-primary items-center gap-2"
                onClick={() => { router.push("/studytools") }}>
                <BookOpen className="h-4 w-4" /> Study Tools
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Performance Summary */}
        <motion.div
          className="mb-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Quiz Stats */}
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Total Quizzes</p>
                <p className="text-2xl font-bold text-green-700">{dashboardData.performanceData.filter(item => item.type === 'quiz').length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Avg. Quiz Score</p>
                <p className="text-2xl font-bold text-blue-700">
                  {dashboardData.performanceData.filter(item => item.type === 'quiz').length > 0
                    ? (dashboardData.performanceData.filter(item => item.type === 'quiz').reduce((sum, item) => sum + item.marks, 0) /
                      dashboardData.performanceData.filter(item => item.type === 'quiz').length).toFixed(1) + '%'
                    : 'N/A'}
                </p>
              </div>

              {/* Interview Stats */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Total Interviews</p>
                <p className="text-2xl font-bold text-purple-700">{dashboardData.performanceData.filter(item => item.type === 'interview').length}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-600 mb-1">Avg. Interview Score</p>
                <p className="text-2xl font-bold text-indigo-700">
                  {dashboardData.performanceData.filter(item => item.type === 'interview').length > 0
                    ? (dashboardData.performanceData.filter(item => item.type === 'interview').reduce((sum, item) => sum + item.marks, 0) /
                      dashboardData.performanceData.filter(item => item.type === 'interview').length).toFixed(1) + '%'
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Graph and Weak Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <motion.div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Performance Tracker</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartFilter('all')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${chartFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setChartFilter('quiz')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${chartFilter === 'quiz' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    Quizzes
                  </button>
                  {dashboardData.hasInterviewData && (
                    <button
                      onClick={() => setChartFilter('interview')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${chartFilter === 'interview' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                      Interviews
                    </button>
                  )}
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardData.performanceData.filter(item =>
                      chartFilter === 'all' ? true :
                      item.type.toLowerCase() === chartFilter
                    )}>
                    <defs>
                      <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="colorContent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="colorCommunication" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="quizNumber" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value, name) => {
                        const formattedName = {
                          marks: 'Overall Score',
                          contentScore: 'Content Score',
                          communicationScore: 'Communication Score'
                        }[name] || name;
                        return [`${value}`, formattedName];
                      }}
                      labelFormatter={(label) => {
                        const item = dashboardData.performanceData.find(d => d.quizNumber === label);
                        return item ? `${item.type} ${label}` : `Assessment ${label}`;
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="marks"
                      name="Overall Score"
                      stroke="#4ade80"
                      fillOpacity={1}
                      fill="url(#colorMarks)"
                      activeDot={{ r: 8 }}
                    />
                    {/* Only show these lines for interview data */}
                    {(chartFilter === 'interview' || chartFilter === 'all') && dashboardData.hasInterviewData && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="contentScore"
                          stroke="#3b82f6"
                          fillOpacity={0.6}
                          fill="url(#colorContent)"
                          name="contentScore"
                        />
                        <Area
                          type="monotone"
                          dataKey="communicationScore"
                          stroke="#8b5cf6"
                          fillOpacity={0.6}
                          fill="url(#colorCommunication)"
                          name="communicationScore"
                        />
                      </>
                    )}
                    {/* Removed duplicate area components */}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          <motion.div className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-800">Areas to Improve</CardTitle>
                <CardDescription className="text-gray-600">Focus on these topics to boost your performance</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Group weak topics by type */}
                {(() => {
                  const quizTopics = dashboardData.weakTopics.filter(topic => !topic.startsWith('Interview:'));
                  const interviewTopics = dashboardData.weakTopics.filter(topic => topic.startsWith('Interview:'));

                  return (
                    <div className="space-y-4">
                      {quizTopics.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            Quiz Weak Areas
                          </h3>
                          <ul className="space-y-2 pl-5">
                            {quizTopics.map((topic, index) => (
                              <motion.li
                                key={`quiz-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                className="text-gray-700 text-sm list-disc"
                              >
                                {topic}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {interviewTopics.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            Interview Weak Areas
                          </h3>
                          <ul className="space-y-2 pl-5">
                            {interviewTopics.map((topic, index) => (
                              <motion.li
                                key={`interview-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                className="text-gray-700 text-sm list-disc"
                              >
                                {topic.replace('Interview: ', '')}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dashboardData.weakTopics.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No weak areas identified yet. Complete more assessments to get personalized feedback.</p>
                      )}
                    </div>
                  );
                })()}

              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Interview Performance Breakdown (conditionally rendered) */}
        {dashboardData.hasInterviewData && (
          <motion.div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Interview Performance Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Communication Skills</h3>
                <div className="space-y-3">
                  {dashboardData.interviewData[0]?.overallFeedback?.detailed_scores &&
                    Object.entries(dashboardData.interviewData[0].overallFeedback.detailed_scores)
                      .filter(([key]) => ['eye_contact', 'facial_expressions', 'speaking_pace', 'voice_clarity', 'filler_words'].includes(key))
                      .map(([key, value]) => {
                        const score = typeof value === 'number' ? value : 0;
                        const formattedKey = key.replace('_', ' ');
                        const displayScore = Math.round(score * 100);
                        const getColorClass = (score: number) => {
                          if (score >= 0.8) return 'bg-green-500';
                          if (score >= 0.6) return 'bg-yellow-500';
                          return 'bg-red-500';
                        };
                        return (
                          <div key={key} className="flex items-center">
                            <span className="w-32 text-sm capitalize">{formattedKey}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                              <div
                                className={`h-2.5 rounded-full ${getColorClass(score)}`}
                                style={{ width: `${displayScore}%` }}
                              ></div>
                            </div>
                            <span className="w-10 text-sm font-medium text-right">{displayScore}%</span>
                          </div>
                        );
                      })
                  }
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Content Quality</h3>
                <div className="space-y-3">
                  {dashboardData.interviewData[0]?.overallFeedback?.detailed_scores &&
                    Object.entries(dashboardData.interviewData[0].overallFeedback.detailed_scores)
                      .filter(([key]) => ['relevance', 'completeness', 'clarity'].includes(key))
                      .map(([key, value]) => {
                        const score = typeof value === 'number' ? value : 0;
                        const formattedKey = key.replace('_', ' ');
                        const displayScore = Math.round(score * 100);
                        const getColorClass = (score: number) => {
                          if (score >= 0.8) return 'bg-blue-500';
                          if (score >= 0.6) return 'bg-yellow-500';
                          return 'bg-red-500';
                        };
                        return (
                          <div key={key} className="flex items-center">
                            <span className="w-32 text-sm capitalize">{formattedKey}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-2">
                              <div
                                className={`h-2.5 rounded-full ${getColorClass(score)}`}
                                style={{ width: `${displayScore}%` }}
                              ></div>
                            </div>
                            <span className="w-10 text-sm font-medium text-right">{displayScore}%</span>
                          </div>
                        );
                      })
                  }
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Motivational Quote */}
        <motion.div className="bg-white backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary text-xl">"</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-800 italic">{randomQuote}</p>
            </div>
          </div>
        </motion.div>

        {/* AI Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="h-full bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800"><Brain className="h-6 w-6 mr-2 text-primary" /> AI Personal Tutor</CardTitle>
                <CardDescription className="text-gray-600">Get personalized help powered by Google Gemini</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4">
                  Your AI tutor powered by Google Gemini adapts to your learning style and provides explanations tailored to your needs and weak areas.
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {["Math", "Science", "History", "Literature", "Languages", "Coding"].map(subject => (
                    <Badge key={subject} variant="outline" className="justify-center">{subject}</Badge>
                  ))}
                </div>
                <Button className="w-full mt-4" size="lg" onClick={() => router.push("/mentor")}>
                  Chat with AI Tutor <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Card className="h-full bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800"><FileQuestion className="h-6 w-6 mr-2 text-primary" /> AI Quiz Generator</CardTitle>
                <CardDescription className="text-gray-600">Test your knowledge with personalized quizzes</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4">
                  Enter any topic and get custom quizzes with feedback and improvement tips.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Quiz Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Algebra", "Cell Biology", "Ancient Rome"].map(topic => (
                      <Badge key={topic} className="bg-blue-100 text-blue-800 hover:bg-blue-200">{topic}</Badge>
                    ))}
                  </div>
                </div>
                <Button className="w-full mt-4" size="lg" onClick={() => router.push("/quiz")}>
                  Generate a Quiz <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
