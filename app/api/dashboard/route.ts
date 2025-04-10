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
    if (user.result && Array.isArray(user.result)) {
      performanceData = user.result.map((quiz: any, index: number) => ({
        quizNumber: index + 1,
        marks: quiz.score || 0
      }));
    } else if (user.result && typeof user.result === 'object') {
      // Handle if result is stored as an object
      performanceData = Object.entries(user.result).map(([key, value]: [string, any]) => ({
        quizNumber: parseInt(key) + 1,
        marks: typeof value === 'number' ? value : (value.score || 0)
      }));
    }

    const weakTopics = user.weaktopics || [];

    return NextResponse.json({
      user: {
        name: user.name
      },
      performanceData,
      result: user.result, // Raw result data
      weakTopics
    });

  } catch (error) {
    console.error("Dashboard data fetch (by email) error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
