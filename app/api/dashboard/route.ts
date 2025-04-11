import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { email } = data;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB directly
    const client = await clientPromise;
    const db = client.db();

    // Fetch user by email
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare performance data for the graph
    let performanceData = [];

    // Get quiz performance data
    if (user.result && Array.isArray(user.result)) {
      performanceData = user.result.map((quiz: any, index: number) => ({
        quizNumber: index + 1,
        marks: quiz.score || 0,
        type: 'Quiz'
      }));
    } else if (user.result && typeof user.result === 'object') {
      // Handle if result is stored as an object
      performanceData = Object.entries(user.result).map(([key, value]: [string, any]) => ({
        quizNumber: parseInt(key) + 1,
        marks: typeof value === 'number' ? value : (value.score || 0),
        type: 'Quiz'
      }));
    }

    // Get mock interview data
    const interviewSessions = await db.collection('interviewSessions')
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Add interview data to performance data
    if (interviewSessions && interviewSessions.length > 0) {
      const interviewData = interviewSessions.map((session: any, index: number) => {
        // Extract scores from the session
        const contentScore = session.overallFeedback?.content_score || 0;
        const communicationScore = session.overallFeedback?.communication_score || 0;
        const overallScore = session.overallFeedback?.overall_score || 0;

        // Convert scores to 0-100 scale
        const normalizedScore = Math.round(overallScore * 100);

        return {
          quizNumber: performanceData.length + index + 1,
          marks: normalizedScore,
          type: 'Interview',
          contentScore: Math.round(contentScore * 100),
          communicationScore: Math.round(communicationScore * 100)
        };
      });

      // Combine quiz and interview data
      performanceData = [...performanceData, ...interviewData];
    }

    // Get weak topics from user data
    let weakTopics = user.weaktopics || [];

    // Add weak areas from interview sessions if available
    if (interviewSessions && interviewSessions.length > 0) {
      const interviewWeakAreas = interviewSessions
        .filter((session: any) => session.overallFeedback?.weak_areas)
        .flatMap((session: any) => {
          const weakAreas = session.overallFeedback.weak_areas;
          return Array.isArray(weakAreas) ?
            weakAreas.map((area: string) => `Interview: ${area.replace('_', ' ')}`) :
            [];
        });

      // Add interview weak areas to weak topics
      if (interviewWeakAreas.length > 0) {
        // Get unique weak areas
        const uniqueWeakAreas = [...new Set(interviewWeakAreas)];
        weakTopics = [...weakTopics, ...uniqueWeakAreas].slice(0, 10); // Limit to 10 topics
      }
    }

    return NextResponse.json({
      user: {
        name: user.name
      },
      performanceData,
      result: user.result, // Raw result data
      weakTopics,
      interviewData: interviewSessions || [],
      hasInterviewData: interviewSessions && interviewSessions.length > 0
    });

  } catch (error) {
    console.error("Dashboard data fetch (by email) error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
