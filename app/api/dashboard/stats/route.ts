// app/api/dashboard/stats/route.ts
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

    // Get the user's interview results
    const interviews = await db.collection('interviews')
      .find({ email })
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .toArray();

    // Get the user's weak topics
    const user = await db.collection('users').findOne({ email });
    const weakTopics = user?.weaktopics || [];

    // Calculate average scores
    let avgContentScore = 0;
    let avgCommunicationScore = 0;
    let avgOverallScore = 0;

    if (interviews.length > 0) {
      avgContentScore = interviews.reduce((sum, interview) => sum + (interview.content_score || 0), 0) / interviews.length;
      avgCommunicationScore = interviews.reduce((sum, interview) => sum + (interview.communication_score || 0), 0) / interviews.length;
      avgOverallScore = interviews.reduce((sum, interview) => sum + (interview.overall_score || 0), 0) / interviews.length;
    }

    // Format the data for the dashboard
    const formattedInterviews = interviews.map(interview => ({
      id: interview.interview_id,
      date: interview.timestamp,
      content_score: parseFloat((interview.content_score || 0).toFixed(2)),
      communication_score: parseFloat((interview.communication_score || 0).toFixed(2)),
      overall_score: parseFloat((interview.overall_score || 0).toFixed(2))
    }));

    // Return the dashboard stats
    return NextResponse.json({
      success: true,
      interviews: formattedInterviews,
      weakTopics,
      stats: {
        totalInterviews: interviews.length,
        avgContentScore: parseFloat(avgContentScore.toFixed(2)),
        avgCommunicationScore: parseFloat(avgCommunicationScore.toFixed(2)),
        avgOverallScore: parseFloat(avgOverallScore.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
