// app/api/dashboard/quiz-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the user's email from the session
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Get the user's quiz results
    const quizzes = await db.collection('quizzes')
      .find({ email })
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .toArray();

    // Calculate average scores
    let avgScore = 0;
    let topicCounts: Record<string, number> = {};
    let topicScores: Record<string, number> = {};

    if (quizzes.length > 0) {
      // Calculate overall average score
      avgScore = quizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / quizzes.length;
      
      // Calculate per-topic statistics
      quizzes.forEach(quiz => {
        const topic = quiz.topic || 'Unknown';
        if (!topicCounts[topic]) {
          topicCounts[topic] = 0;
          topicScores[topic] = 0;
        }
        topicCounts[topic]++;
        topicScores[topic] += (quiz.score || 0);
      });
    }

    // Calculate average score per topic
    const topicAverages = Object.keys(topicCounts).map(topic => ({
      topic,
      count: topicCounts[topic],
      avgScore: topicScores[topic] / topicCounts[topic]
    }));

    // Format the data for the dashboard
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz._id,
      date: quiz.timestamp,
      topic: quiz.topic,
      score: parseFloat((quiz.score || 0).toFixed(2)),
      totalQuestions: quiz.totalQuestions,
      correctAnswers: quiz.correctAnswers,
      weakTopics: quiz.weakTopics || []
    }));

    // Return the quiz stats
    return NextResponse.json({
      success: true,
      quizzes: formattedQuizzes,
      stats: {
        totalQuizzes: quizzes.length,
        avgScore: parseFloat(avgScore.toFixed(2)),
        topicStats: topicAverages
      }
    });
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz stats' }, { status: 500 });
  }
}
