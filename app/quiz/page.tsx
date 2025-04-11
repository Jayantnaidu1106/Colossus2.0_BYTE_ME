"use client";
import QuizComponent from "@/components/quiz-component";
import { SessionProvider } from "next-auth/react";
import QuizErrorBoundary from "@/components/QuizErrorBoundary";
import { Suspense } from "react";

export default function Home() {
    return (
        <div className="min-h-screen bg-black text-white">
            <SessionProvider>
                <Suspense fallback={<div className="p-8 text-center">Loading quiz...</div>}>
                    <QuizErrorBoundary>
                        <QuizComponent />
                    </QuizErrorBoundary>
                </Suspense>
            </SessionProvider>
        </div>
    );
}