// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { generateMockResponse } from './mockResponseGenerator';
import { generateGeminiResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON request
    const { message, context, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Valid message is required' }, { status: 400 });
    }

    // Connect to MongoDB directly
    const client = await clientPromise;
    const db = client.db();

    // Fetch user's weak topics from the database
    const user = await db.collection('users').findOne({ email });
    const weakTopics = user?.weaktopics || [];

    console.log("Processing chat request for user with weak topics:", weakTopics);

    try {
      // Try to use the Gemini API first
      console.log("Attempting to generate response with Gemini API for message:", message.substring(0, 50) + '...');
      const geminiResponse = await generateGeminiResponse(message, context, weakTopics);

      // Log the response
      console.log("Generated Gemini response successfully, length:", geminiResponse.length);

      // Verify we have a valid response
      if (!geminiResponse || geminiResponse.trim().length === 0) {
        throw new Error('Received empty response from Gemini API');
      }

      // Save the conversation to the database for future reference
      await db.collection('conversations').insertOne({
        email,
        timestamp: new Date(),
        message,
        response: geminiResponse,
        source: 'gemini'
      });

      // Return the Gemini response in a simpler format
      return NextResponse.json({
        text: geminiResponse,
        model: "gemini-2.0-flash-001",
        success: true
      });
    } catch (geminiError) {
      // Create a request ID for tracking this error
      const errorId = Date.now().toString(36);
      console.error(`[${errorId}] Gemini API error:`, geminiError);

      // Extract the error message
      let errorMessage = 'Unknown error';
      if (geminiError instanceof Error) {
        errorMessage = geminiError.message;
      }

      // Check if this is an API key issue
      const isApiKeyIssue =
        errorMessage.includes('API key') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('credentials') ||
        errorMessage.includes('example API key');

      // Log detailed information about the error
      console.log(`[${errorId}] Error details:`, {
        message: message.substring(0, 50) + '...',
        errorType: geminiError instanceof Error ? geminiError.constructor.name : typeof geminiError,
        isApiKeyIssue
      });

      // Fallback to mock response if Gemini API fails
      console.log(`[${errorId}] Falling back to mock response generator`);
      const mockResponse = generateMockResponse(message, weakTopics);

      // Save the conversation with mock response
      await db.collection('conversations').insertOne({
        email,
        timestamp: new Date(),
        message,
        response: mockResponse,
        source: 'mock',
        error: errorMessage,
        errorId
      });

      // Return the mock response with appropriate warning
      return NextResponse.json({
        text: mockResponse,
        model: "mock-fallback",
        warning: isApiKeyIssue
          ? "Using fallback response generator because the Gemini API key is invalid or missing. Please configure a valid API key."
          : `Using fallback response generator due to Gemini API error: ${errorMessage.substring(0, 100)}`,
        errorId,
        success: true
      });
    }
  } catch (error) {
    console.error("Chat error:", error);
    // Try to use mock response as a last resort
    try {
      const mockResponse = generateMockResponse(message || 'Help me learn', weakTopics || []);
      return NextResponse.json({
        text: mockResponse,
        model: "emergency-fallback",
        warning: "Emergency fallback response due to server error",
        success: true
      });
    } catch (finalError) {
      // If all else fails, return a structured error
      return NextResponse.json(
        {
          error: 'Failed to process chat request',
          success: false,
          text: "I'm sorry, but I'm having technical difficulties right now. Please try again later."
        },
        { status: 500 }
      );
    }
  }
}
