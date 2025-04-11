"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import {
  Brain,
  FileQuestion,
  Video,
  LineChartIcon as ChartLineUp,
  Calculator,
  Mic,
  Camera,
  CuboidIcon as Cube,
  Accessibility,
  ArrowRight,
  Quote,
} from "lucide-react"
import Navbar from "@/components/navbar"
import FeatureCard from "@/components/feature-card"
import HeroSection from "@/components/hero-section"
import Footer from "@/components/footer"
import ThreeDModel from "@/components/three-d-model"
import dynamic from "next/dynamic"
import ErrorBoundary from "@/components/ErrorBoundary"

// Dynamically import ParticlesWrapper with error handling
const ParticlesWrapper = dynamic(() => import("@/components/ParticlesWrapper").catch(err => {
  console.error('Error loading ParticlesWrapper:', err);
  return () => null; // Return empty component on error
}), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black"></div> // Fallback while loading
})

export default function Home() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "24/7 AI Mentor Support",
      description: "Get personalized attention from AI mentors anytime, anywhere to help with your studies.",
    },
    {
      icon: <FileQuestion className="h-8 w-8 text-primary" />,
      title: "AI-Generated Quizzes",
      description: "Upskill yourself with personalized quizzes and get detailed analysis to improve your weak areas.",
    },

    {
      icon: <ChartLineUp className="h-8 w-8 text-primary" />,
      title: "Adaptive Learning",
      description: "Our AI adjusts difficulty levels and learning paths based on your performance.",
    },
    {
      icon: <FileQuestion className="h-8 w-8 text-primary" />,
      title: "PDF Summarizer",
      description: "Get concise summaries of uploaded documents and ask questions related to the material.",
    },
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "YouTube Video Summarizer",
      description: "Extract key points from educational videos without watching the entire content.",
    },
    {
      icon: <ChartLineUp className="h-8 w-8 text-primary" />,
      title: "Progress Tracking",
      description: "Monitor your daily progress to stay motivated and achieve more in your learning journey.",
    },
    {
      icon: <Calculator className="h-8 w-8 text-primary" />,
      title: "Scientific Calculator",
      description: "Access a built-in scientific calculator for solving complex mathematical problems.",
    },
    {
      icon: <Mic className="h-8 w-8 text-primary" />,
      title: "Multilingual Voice Support",
      description: "Ask questions through voice in multiple languages for a more natural learning experience.",
    },

    {
      icon: <Cube className="h-8 w-8 text-primary" />,
      title: "3D Visualization",
      description: "Experience interactive 3D models to better understand complex concepts and structures.",
    },
    {
      icon: <Accessibility className="h-8 w-8 text-primary" />,
      title: "Accessibility Features",
      description: "Special tools like speech-to-text for learners with disabilities to ensure education for all.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Particles Background with Error Boundary */}
      <ErrorBoundary>
        <ParticlesWrapper />
      </ErrorBoundary>
      <Navbar />
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Revolutionize Your Learning Experience</h2>
          <p className="text-lg text-white max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with proven educational methods to provide a personalized
            learning journey.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </motion.div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 backdrop-blur-sm text-white border-t border-b border-indigo-500/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Quote className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <p className="text-2xl md:text-3xl font-light italic mb-6">
              "Education is the most powerful weapon which you can use to change the world. With AI, we're making that
              weapon accessible to everyone, everywhere, at any time."
            </p>
            <p className="text-lg font-medium">— Inspired by Nelson Mandela</p>
          </motion.div>
        </div>
      </section>

      {/* 3D Visualization Demo */}
      <section className="py-20 px-4 bg-transparent text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Interactive 3D Learning</h2>
            <p className="text-lg text-white max-w-3xl mx-auto">
              Visualize complex concepts with our interactive 3D models for better understanding and retention.
            </p>
          </div>

          <div className="h-[500px] bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-indigo-500/20">
            <ThreeDModel />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-transparent text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Learning Journey?
          </h2>
          <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already experiencing the future of education with our AI-powered learning
            platform.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <a
              href="/api/auth/signup"
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-500/20"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

