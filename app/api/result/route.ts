// app/api/result/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GoogleGenAI } from "@google/genai";

// Function to generate a default suggestion when API is unavailable
function generateDefaultSuggestion(topic: string, incorrectQuestions: string[]) {
  return {
    suggestion: `Based on your quiz results on ${topic}, we recommend focusing on the core concepts and principles. Review the questions you missed and try to understand the underlying concepts. Consider using additional learning resources to strengthen your knowledge in this area.`,
    topics: [topic]
  };
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let topic = '';
    let incorrectQuestions: string[] = [];
    let totalQuestions = 0;
    let email = '';

    try {
      const body = await req.json();
      topic = body.topic || 'General Knowledge';
      incorrectQuestions = Array.isArray(body.incorrectQuestions) ? body.incorrectQuestions : [];
      totalQuestions = body.totalQuestions || 5;
      email = body.email || '';
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Email validation is optional for this endpoint
    if (!email) {
      console.warn('No email provided, proceeding with anonymous user');
    }

    // Construct the prompt for Gemini
    const prompt = `
You are an professional educational teacher. A student took a quiz on "${topic}" and answered some questions incorrectly.
Here are the questions that were answered incorrectly:
${incorrectQuestions}

Please analyze these questions and determine which topics the student is weak in. Then, provide clear suggestions on how the student can improve and list out the weak topics in an array. Give suggestion in a friendly and polite manner and specify the topics on which the student should focus more.

Respond strictly in JSON format as:
{
  "suggestion": "the actual suggestion",
  "topics": ["topic1", "topic2", ...]
}
    `;

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      // Return default suggestion when API key is missing
      const defaultSuggestion = generateDefaultSuggestion(topic, incorrectQuestions);
      return NextResponse.json({ suggestion: JSON.stringify(defaultSuggestion, null, 2) });
    }

    // If no incorrect questions, return a simple success message
    if (!incorrectQuestions.length) {
      const perfectScoreSuggestion = {
        suggestion: `Congratulations! You got a perfect score on the ${topic} quiz. Keep up the great work!`,
        topics: [topic]
      };
      return NextResponse.json({ suggestion: JSON.stringify(perfectScoreSuggestion, null, 2) });
    }

    // Initialize the GoogleGenAI client with your Gemini API key
    const ai = new GoogleGenAI({ apiKey });

    // Call Gemini API with error handling
    let geminiResponse;
    try {
      geminiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      console.log("Gemini Response:", geminiResponse);
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      // Return default suggestion when API call fails
      const defaultSuggestion = generateDefaultSuggestion(topic, incorrectQuestions);
      return NextResponse.json({ suggestion: JSON.stringify(defaultSuggestion, null, 2) });
    }

    if (!geminiResponse || !geminiResponse.text) {
      return NextResponse.json(
        { error: "Failed to get a valid response from Gemini API" },
        { status: 500 }
      );
    }

    // Retrieve the raw response text and remove any markdown formatting if present
    let responseText = geminiResponse.text.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
    }

    // Parse the response text into JSON
    let resultData;
    try {
      resultData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse Gemini API response" },
        { status: 500 }
      );
    }

    // Pretty-print the JSON with indentation
    const formattedResponse = JSON.stringify(resultData, null, 2);

    // Optionally, update the user record in the DB if you have logic to extract topics
    // For now, we're only returning the formatted response

    // Return the formatted Gemini response to the frontend
    return NextResponse.json({ suggestion: formattedResponse });
  } catch (error) {
    console.error("Error in result route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
