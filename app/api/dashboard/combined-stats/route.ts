// app/api/dashboard/combined-stats/route.ts
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
      .sort({ timestamp: -1 })
      .toArray();

    // Get the user's interview results
    const interviews = await db.collection('interviews')
      .find({ email })
      .sort({ timestamp: -1 })
      .toArray();

    // Get the user's weak topics
    const user = await db.collection('users').findOne({ email });
    const weakTopics = user?.weaktopics || [];

    // Format quiz data for the dashboard
    const formattedQuizzes = quizzes.map((quiz, index) => ({
      id: quiz._id?.toString() || `quiz-${index}`,
      type: 'quiz',
      date: quiz.timestamp,
      topic: quiz.topic,
      score: parseFloat((quiz.score || 0).toFixed(2)),
      totalQuestions: quiz.totalQuestions,
      correctAnswers: quiz.correctAnswers,
      weakTopics: quiz.weakTopics || []
    }));

    // Format interview data for the dashboard
    const formattedInterviews = interviews.map((interview, index) => ({
      id: interview.interview_id || interview._id?.toString() || `interview-${index}`,
      type: 'interview',
      date: interview.timestamp,
      content_score: parseFloat((interview.content_score || 0).toFixed(2)),
      communication_score: parseFloat((interview.communication_score || 0).toFixed(2)),
      overall_score: parseFloat((interview.overall_score || 0).toFixed(2)),
      strengths: interview.strengths || [],
      areas_for_improvement: interview.areas_for_improvement || []
    }));

    // Combine all performance data for the chart
    const performanceData = [
      ...formattedQuizzes.map((quiz, index) => ({
        quizNumber: index + 1,
        marks: quiz.score * 100, // Convert from 0-1 scale to 0-100
        type: 'quiz',
        date: new Date(quiz.date).toLocaleDateString()
      })),
      ...formattedInterviews.map((interview, index) => ({
        quizNumber: formattedQuizzes.length + index + 1,
        marks: interview.overall_score * 100, // Convert from 0-1 scale to 0-100
        contentScore: interview.content_score * 100,
        communicationScore: interview.communication_score * 100,
        type: 'interview',
        date: new Date(interview.date).toLocaleDateString()
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate overall statistics
    const stats = {
      totalQuizzes: quizzes.length,
      totalInterviews: interviews.length,
      avgQuizScore: quizzes.length > 0 
        ? parseFloat((quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length).toFixed(2)) 
        : 0,
      avgInterviewScore: interviews.length > 0 
        ? parseFloat((interviews.reduce((sum, i) => sum + (i.overall_score || 0), 0) / interviews.length).toFixed(2)) 
        : 0,
      weakTopics: weakTopics
    };

    // Return the combined stats
    return NextResponse.json({
      success: true,
      user: {
        name: user?.name || session?.user?.name || email.split('@')[0],
        email
      },
      performanceData,
      quizzes: formattedQuizzes,
      interviews: formattedInterviews,
      weakTopics,
      stats,
      hasInterviewData: interviews.length > 0,
      hasQuizData: quizzes.length > 0
    });
  } catch (error) {
    console.error('Error fetching combined stats:', error);
    return NextResponse.json({ error: 'Failed to fetch combined stats' }, { status: 500 });
  }
}
