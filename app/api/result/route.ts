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
      // Generate default suggestion when API key is missing
      const defaultSuggestion = generateDefaultSuggestion(topic, incorrectQuestions);

      // Store fallback result in MongoDB
      try {
        if (email) {
          const client = await clientPromise;
          const db = client.db();

          // Calculate the score
          const correctAnswers = totalQuestions - incorrectQuestions.length;
          const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) : 0;

          // Save the fallback quiz result
          await db.collection('quizzes').insertOne({
            email,
            timestamp: new Date(),
            topic,
            totalQuestions,
            correctAnswers,
            incorrectQuestions,
            score,
            suggestion: defaultSuggestion.suggestion,
            weakTopics: defaultSuggestion.topics || [topic],
            isFallback: true
          });

          console.log(`Saved fallback quiz result for ${email} on topic ${topic}`);

          // Update user's weak topics
          const weakTopics = defaultSuggestion.topics || [topic];
          if (weakTopics.length > 0) {
            // Get the user's current weak topics
            const user = await db.collection('users').findOne({ email });
            const currentWeakTopics = user?.weaktopics || [];

            // Combine current and new weak topics, remove duplicates
            const updatedWeakTopics = [...new Set([...currentWeakTopics, ...weakTopics])];

            // Update the user's weak topics
            await db.collection('users').updateOne(
              { email },
              { $set: { weaktopics: updatedWeakTopics } },
              { upsert: true }
            );

            console.log(`Updated weak topics for ${email} (fallback):`, updatedWeakTopics);
          }
        } else {
          console.warn('No email provided, fallback quiz result not saved to MongoDB');
        }
      } catch (dbError) {
        console.error('Error saving fallback quiz result to MongoDB:', dbError);
        // Continue with the response even if saving to DB fails
      }

      return NextResponse.json({ suggestion: JSON.stringify(defaultSuggestion, null, 2) });
    }

    // If no incorrect questions, handle perfect score
    if (!incorrectQuestions.length) {
      const perfectScoreSuggestion = {
        suggestion: `Congratulations! You got a perfect score on the ${topic} quiz. Keep up the great work!`,
        topics: [topic]
      };

      // Store perfect score in MongoDB
      try {
        if (email) {
          const client = await clientPromise;
          const db = client.db();

          // Save the perfect quiz result
          await db.collection('quizzes').insertOne({
            email,
            timestamp: new Date(),
            topic,
            totalQuestions,
            correctAnswers: totalQuestions,
            incorrectQuestions: [],
            score: 1.0, // Perfect score
            suggestion: perfectScoreSuggestion.suggestion,
            weakTopics: [],
            isPerfectScore: true
          });

          console.log(`Saved perfect quiz result for ${email} on topic ${topic}`);
        } else {
          console.warn('No email provided, perfect quiz result not saved to MongoDB');
        }
      } catch (dbError) {
        console.error('Error saving perfect quiz result to MongoDB:', dbError);
        // Continue with the response even if saving to DB fails
      }

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
      // Generate default suggestion when API call fails
      const defaultSuggestion = generateDefaultSuggestion(topic, incorrectQuestions);

      // Store API error fallback result in MongoDB
      try {
        if (email) {
          const client = await clientPromise;
          const db = client.db();

          // Calculate the score
          const correctAnswers = totalQuestions - incorrectQuestions.length;
          const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) : 0;

          // Save the API error fallback quiz result
          await db.collection('quizzes').insertOne({
            email,
            timestamp: new Date(),
            topic,
            totalQuestions,
            correctAnswers,
            incorrectQuestions,
            score,
            suggestion: defaultSuggestion.suggestion,
            weakTopics: defaultSuggestion.topics || [topic],
            isApiErrorFallback: true,
            error: apiError instanceof Error ? apiError.message : String(apiError)
          });

          console.log(`Saved API error fallback quiz result for ${email} on topic ${topic}`);

          // Update user's weak topics
          const weakTopics = defaultSuggestion.topics || [topic];
          if (weakTopics.length > 0) {
            // Get the user's current weak topics
            const user = await db.collection('users').findOne({ email });
            const currentWeakTopics = user?.weaktopics || [];

            // Combine current and new weak topics, remove duplicates
            const updatedWeakTopics = [...new Set([...currentWeakTopics, ...weakTopics])];

            // Update the user's weak topics
            await db.collection('users').updateOne(
              { email },
              { $set: { weaktopics: updatedWeakTopics } },
              { upsert: true }
            );

            console.log(`Updated weak topics for ${email} (API error fallback):`, updatedWeakTopics);
          }
        } else {
          console.warn('No email provided, API error fallback quiz result not saved to MongoDB');
        }
      } catch (dbError) {
        console.error('Error saving API error fallback quiz result to MongoDB:', dbError);
        // Continue with the response even if saving to DB fails
      }

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

    // Store quiz results in MongoDB
    try {
      if (email) {
        const client = await clientPromise;
        const db = client.db();

        // Calculate the score
        const correctAnswers = totalQuestions - incorrectQuestions.length;
        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) : 0;

        // Extract weak topics from the Gemini response
        const weakTopics = resultData.topics || [];

        // Save the quiz result
        await db.collection('quizzes').insertOne({
          email,
          timestamp: new Date(),
          topic,
          totalQuestions,
          correctAnswers,
          incorrectQuestions,
          score,
          suggestion: resultData.suggestion,
          weakTopics
        });

        console.log(`Saved quiz result for ${email} on topic ${topic}`);

        // Update user's weak topics in their profile
        if (weakTopics.length > 0) {
          // Get the user's current weak topics
          const user = await db.collection('users').findOne({ email });
          const currentWeakTopics = user?.weaktopics || [];

          // Combine current and new weak topics, remove duplicates
          const updatedWeakTopics = [...new Set([...currentWeakTopics, ...weakTopics])];

          // Update the user's weak topics
          await db.collection('users').updateOne(
            { email },
            { $set: { weaktopics: updatedWeakTopics } },
            { upsert: true }
          );

          console.log(`Updated weak topics for ${email}:`, updatedWeakTopics);
        }
      } else {
        console.warn('No email provided, quiz results not saved to MongoDB');
      }
    } catch (dbError) {
      console.error('Error saving quiz results to MongoDB:', dbError);
      // Continue with the response even if saving to DB fails
    }

    // Return the formatted Gemini response to the frontend
    return NextResponse.json({ suggestion: formattedResponse });
  } catch (error) {
    console.error("Error in result route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
