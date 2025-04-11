// app/api/voice-assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON request
    const { message, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Connect to MongoDB to get user data
    const client = await clientPromise;
    const db = client.db();

    // Fetch user's weak topics from the database
    const user = await db.collection('users').findOne({ email });
    const weakTopics = user?.weaktopics || [];
    const standard = user?.standard || '';

    console.log("Processing voice assistant request for user:", {
      email,
      standard,
      weakTopics
    });

    // Initialize the GoogleGenAI client with your Gemini API key
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Construct the prompt for Gemini
    const prompt = `
You are Atlas AI, an educational voice assistant helping a student in ${standard || 'school'}.
The student has identified the following topics as areas they want to improve: ${weakTopics.join(', ') || 'various subjects'}.

The student asks: "${message}"

Provide a helpful, conversational response that:
1. Is concise and easy to understand when spoken aloud (150-200 words maximum)
2. Gives accurate educational information
3. If the question relates to one of their weak topics, provide extra explanation and encouragement
4. Use a friendly, supportive tone appropriate for a student
5. If the question isn't clear, politely ask for clarification
6. If the question isn't education-related, gently redirect to educational topics

Your response:
`;

    // Call the Gemini API
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    console.log("Gemini API response received");

    // Ensure we got a valid response
    if (!geminiResponse || !geminiResponse.text) {
      console.error("Invalid response from Gemini API");
      return NextResponse.json(
        { error: 'Failed to get a valid response from Gemini API' },
        { status: 500 }
      );
    }

    // Get the response text
    const responseText = geminiResponse.text.trim();

    // Return the response
    return NextResponse.json({
      text: responseText,
      model: "gemini-2.0-flash"
    });
  } catch (error) {
    console.error("Error in voice assistant API route:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
