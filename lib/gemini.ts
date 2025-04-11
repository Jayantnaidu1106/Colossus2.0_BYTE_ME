// lib/gemini.ts
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Generative AI with your API key
// For development, we'll use a hardcoded API key if the environment variable is not set
// In production, always use environment variables
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || 'AIzaSyDJC5a7zgwuUjsU5ODWQT_QoUqgkA-Xk8Y'; // Example key - replace with your actual key

// Log API key status (without revealing the full key)
console.log(`Gemini API Key status: ${API_KEY ? 'Set (first 4 chars: ' + API_KEY.substring(0, 4) + '...)' : 'Not set'}`);

// Create the Gemini client
let ai;
try {
  ai = new GoogleGenAI({ apiKey: API_KEY });
  console.log('Successfully initialized Gemini API client');
} catch (error) {
  console.error('Failed to initialize Gemini API client:', error);
  // Create a dummy client that will throw errors when used
  ai = {
    models: {
      generateContent: () => {
        throw new Error('Gemini API client failed to initialize');
      }
    }
  } as any;
}

export async function generateGeminiResponse(
  prompt: string,
  context: string = '',
  weakTopics: string[] = []
): Promise<string> {
  // Add a unique ID to track this specific request through logs
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  console.log(`[${requestId}] Starting Gemini request for: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);

  try {
    // Construct a more detailed prompt with context and weak topics
    let enhancedPrompt = prompt;

    if (context) {
      enhancedPrompt = `${context}\n\n${prompt}`;
    }

    if (weakTopics.length > 0) {
      enhancedPrompt = `The student has identified the following areas they need help with: ${weakTopics.join(', ')}.\n\n${enhancedPrompt}`;
    }

    // Add instructions for educational responses
    enhancedPrompt = `As an educational AI tutor, please provide a helpful, accurate, and educational response to the following question. Focus on explaining concepts clearly and providing examples where appropriate.\n\n${enhancedPrompt}`;

    console.log(`[${requestId}] Sending to Gemini API:`, enhancedPrompt.substring(0, 100) + '...');
    console.log(`[${requestId}] Using API key starting with: ${API_KEY.substring(0, 4)}...`);

    // Check if we're using the example API key
    if (API_KEY === 'AIzaSyDJC5a7zgwuUjsU5ODWQT_QoUqgkA-Xk8Y') {
      console.warn(`[${requestId}] WARNING: Using example API key. This will not work! Please replace with your actual Gemini API key.`);
      throw new Error('Using example API key. Please replace with your actual Gemini API key.');
    }

    // Generate content using the new API
    console.time(`[${requestId}] Gemini API call`);
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001', // Using the latest model
      contents: enhancedPrompt,
      generationConfig: {
        temperature: 0.7,  // Add some creativity but not too random
        topP: 0.9,        // Diverse responses
        topK: 40,         // Consider a good range of tokens
        maxOutputTokens: 2048  // Allow longer responses
      }
    });
    console.timeEnd(`[${requestId}] Gemini API call`);

    // Check if we have a valid response
    if (!response) {
      console.error(`[${requestId}] Null response from Gemini API`);
      throw new Error('Received null response from Gemini API');
    }

    if (!response.text) {
      console.error(`[${requestId}] Empty text in response:`, JSON.stringify(response));
      throw new Error('Received response with no text from Gemini API');
    }

    // Extract and return the text
    const text = response.text;
    console.log(`[${requestId}] Generated text from Gemini (${text.length} chars):`, text.substring(0, 100) + '...');
    return text;
  } catch (error) {
    console.error(`[${requestId}] Error generating response from Gemini:`, error);

    // Create a more informative error message
    let errorMessage = 'Failed to generate response from Gemini API';

    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }

    // Add a note about the API key if it's the example one
    if (API_KEY === 'AIzaSyDJC5a7zgwuUjsU5ODWQT_QoUqgkA-Xk8Y') {
      errorMessage += '. You are using the example API key. Please replace it with your actual Gemini API key.';
    }

    throw new Error(errorMessage);
  }
}
