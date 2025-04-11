// Test script for Gemini API integration
const { GoogleGenAI } = require('@google/genai');

// Replace with your actual API key
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || 'AIzaSyDJC5a7zgwuUjsU5ODWQT_QoUqgkA-Xk8Y';

async function testGeminiAPI() {
  console.log('Testing Gemini API integration...');
  console.log(`API Key: ${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`);
  
  try {
    // Initialize the API client
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('Successfully initialized Gemini API client');
    
    // Test a simple query
    console.log('Sending test query to Gemini API...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: 'What is the capital of France?',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100
      }
    });
    
    // Check the response
    if (!response || !response.text) {
      console.error('Received empty response from Gemini API');
      return;
    }
    
    console.log('Received response from Gemini API:');
    console.log(response.text);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    
    if (API_KEY === 'AIzaSyDJC5a7zgwuUjsU5ODWQT_QoUqgkA-Xk8Y') {
      console.error('You are using the example API key. Please replace it with your actual Gemini API key.');
    }
  }
}

// Run the test
testGeminiAPI();
