// app/api/voice-assistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import clientPromise from '@/lib/mongodb';
import {
  detectLanguage,
  transcribeAudio,
  translateText,
  textToSpeech,
  SUPPORTED_LANGUAGES
} from '@/lib/sarvam';

export async function POST(req: NextRequest) {
  try {
    // Check if the request is a form data (audio) or JSON (text)
    const contentType = req.headers.get('content-type') || '';

    let message = '';
    let email = 'test@example.com'; // Default email for testing
    let sourceLanguage = 'en';
    let targetLanguage = 'en';
    let audioBlob: Blob | null = null;

    // Handle audio input (multipart form data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      audioBlob = formData.get('audio') as Blob;
      email = formData.get('email') as string || email;
      targetLanguage = formData.get('targetLanguage') as string || 'en';

      if (!audioBlob) {
        return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
      }

      try {
        // Detect the language of the audio
        sourceLanguage = await detectLanguage(audioBlob);

        // Set the target language to match the source language (respond in same language)
        targetLanguage = sourceLanguage;
        console.log(`Detected language: ${sourceLanguage}, will respond in the same language`);

        // Transcribe the audio to text in the detected language
        message = await transcribeAudio(audioBlob, sourceLanguage);

        console.log(`Transcribed message (${sourceLanguage}): ${message}`);
      } catch (transcriptionError) {
        console.error('Error processing audio:', transcriptionError);
        return NextResponse.json({
          error: 'Failed to process audio',
          details: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error'
        }, { status: 500 });
      }
    }
    // Handle text input (JSON)
    else {
      const body = await req.json();
      message = body.message;
      email = body.email || email;
      sourceLanguage = body.sourceLanguage || 'en';
      targetLanguage = body.targetLanguage || 'en';

      if (!message) {
        return NextResponse.json({ error: 'No message provided' }, { status: 400 });
      }
    }

    // Connect to MongoDB to get user data
    const client = await clientPromise;
    const db = client.db();

    // Fetch user's weak topics and preferences from the database
    const user = await db.collection('users').findOne({ email });
    const weakTopics = user?.weaktopics || [];
    const standard = user?.standard || '';

    // Save the user's language preference if it's different from the default
    if (targetLanguage !== 'en' && targetLanguage !== user?.preferredLanguage) {
      await db.collection('users').updateOne(
        { email },
        { $set: { preferredLanguage: targetLanguage } },
        { upsert: true }
      );
    }

    console.log("Processing voice assistant request for user:", {
      email,
      standard,
      weakTopics,
      sourceLanguage,
      targetLanguage
    });

    // If the source language is not English, translate the message to English for processing
    let processMessage = message;
    if (sourceLanguage !== 'en') {
      try {
        processMessage = await translateText(message, sourceLanguage, 'en');
        console.log(`Translated message to English: ${processMessage}`);
      } catch (translationError) {
        console.error('Error translating input to English:', translationError);
        // Continue with the original message if translation fails
        processMessage = message;
      }
    }

    // Initialize the GoogleGenAI client with your Gemini API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("No Gemini API key found in environment variables");
      return NextResponse.json(
        { error: 'Gemini API key is missing' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Determine the language name for better context
    const languageName = sourceLanguage === 'en' ? 'English' :
                        sourceLanguage === 'hi' ? 'Hindi' :
                        sourceLanguage === 'ta' ? 'Tamil' :
                        sourceLanguage === 'te' ? 'Telugu' :
                        sourceLanguage === 'kn' ? 'Kannada' :
                        sourceLanguage === 'ml' ? 'Malayalam' :
                        sourceLanguage === 'bn' ? 'Bengali' :
                        sourceLanguage === 'gu' ? 'Gujarati' :
                        sourceLanguage === 'mr' ? 'Marathi' : 'their language';

    // Construct the prompt for Gemini with more context
    const prompt = `
You are Atlas AI, an educational voice assistant helping a student in ${standard || 'school'}.
The student has identified the following topics as areas they want to improve: ${weakTopics.join(', ') || 'various subjects'}.

The student is speaking in ${languageName} and asks: "${processMessage}"

Please provide a helpful, educational response that is clear and concise. Focus on explaining concepts in a way that's easy to understand.
If the question is about a specific topic, provide relevant information and examples.
If the question is unclear, ask for clarification.
If the question is not related to education, politely redirect the conversation to educational topics.

Keep your response between 100-150 words so it can be easily translated back to ${languageName}.

Your response (in English):
`;

    // Call the Gemini API with enhanced parameters
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 800,
        responseMimeType: "text/plain",
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
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
    let responseText = geminiResponse.text.trim();

    // Always translate the response to the target language
    // This ensures the response is in the user's preferred language
    try {
      console.log(`Translating Gemini response from English to ${targetLanguage}...`);
      console.log(`Original response (first 100 chars): ${responseText.substring(0, 100)}...`);

      responseText = await translateText(responseText, 'en', targetLanguage);

      console.log(`Successfully translated response to ${targetLanguage}`);
      console.log(`Translated response (first 100 chars): ${responseText.substring(0, 100)}...`);
    } catch (translationError) {
      console.error(`Error translating response to ${targetLanguage}:`, translationError);

      // Try a simpler translation approach as fallback
      try {
        // Create a simpler version of the text for translation
        const simplifiedText = responseText
          .split('.')
          .slice(0, 3) // Take only first 3 sentences
          .join('.');

        console.log(`Attempting simplified translation with text: ${simplifiedText}`);
        const simplifiedTranslation = await translateText(simplifiedText, 'en', targetLanguage);

        if (simplifiedTranslation && simplifiedTranslation.length > 20) {
          responseText = simplifiedTranslation;
          console.log(`Using simplified translation instead`);
        } else {
          // Continue with the English response if all translation attempts fail
          console.log(`Simplified translation also failed, using English response`);
        }
      } catch (fallbackError) {
        console.error(`Fallback translation also failed:`, fallbackError);
        // Continue with the English response
      }
    }

    // Generate audio response if requested
    let audioResponse: string | null = null;
    if (audioBlob) {
      try {
        const speechBlob = await textToSpeech(responseText, targetLanguage);
        // Convert the blob to base64 for sending in the response
        audioResponse = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(speechBlob);
        });
      } catch (speechError) {
        console.error('Error generating speech:', speechError);
        // Continue without audio if speech generation fails
      }
    }

    // Save the conversation to the database
    try {
      await db.collection('conversations').insertOne({
        email,
        timestamp: new Date(),
        userMessage: message,
        assistantResponse: responseText,
        sourceLanguage,
        targetLanguage
      });
    } catch (dbError) {
      console.error('Error saving conversation to database:', dbError);
      // Continue even if saving to the database fails
    }

    // Return the response with enhanced information
    return NextResponse.json({
      text: responseText,
      model: "gemini-2.0-flash",
      sourceLanguage,
      targetLanguage,
      languageName,
      audio: audioResponse,
      supportedLanguages: SUPPORTED_LANGUAGES,
      userMessage: message, // Return the original message for confirmation
      translatedUserMessage: processMessage !== message ? processMessage : undefined, // Only include if translation happened
      timestamp: new Date().toISOString(),
      isTranslated: targetLanguage !== 'en' || sourceLanguage !== 'en',
      detectedLanguage: sourceLanguage
    });
  } catch (error) {
    console.error('Error in voice assistant API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
