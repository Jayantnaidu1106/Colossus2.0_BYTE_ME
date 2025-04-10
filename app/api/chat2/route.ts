// app/api/chat2/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Import the mock response generator functions
import { generateMockResponse } from './mockResponseGenerator';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON request
    const { message, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Connect to MongoDB directly
    const client = await clientPromise;
    const db = client.db();

    // Fetch user's weak topics from the database
    const user = await db.collection('users').findOne({ email });
    const weakTopics = user?.weaktopics || [];

    console.log("Processing chat2 request for user with weak topics:", weakTopics);

    // Instead of calling the Gemini API, we'll generate a mock response
    // This simulates what the AI would respond with
    const mockResponse = generateMockResponse(message, weakTopics);

    // Log the mock response
    console.log("Generated mock response:", mockResponse);

    // Log what we're returning
    const responseData = {
      text: mockResponse,
      model: "mock-ai-model-v2"
    };

    console.log('Returning response data:', responseData);

    // Return the mock response
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}