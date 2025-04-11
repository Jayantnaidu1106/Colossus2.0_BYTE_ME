# Voice Assistant with Google Gemini Integration

This guide explains how to set up and use the Voice Assistant feature with Google Gemini API integration.

## Overview

The Voice Assistant feature allows users to:
- Ask questions using voice or text input
- Get AI-powered responses from Google Gemini
- Hear spoken responses through text-to-speech

## Setup Instructions

1. **Get a Google Gemini API Key**
   - Go to [Google AI Studio](https://ai.google.dev/)
   - Create an account or sign in
   - Navigate to the API Keys section
   - Create a new API key

2. **Update your .env file**
   - Add your Gemini API key to the .env file:
   ```
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Install dependencies**
   - Make sure all dependencies are installed:
   ```bash
   npm install
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

## Using the Voice Assistant

1. Navigate to the Study Tools section
2. Click on the Voice Assistant card
3. Use the microphone button to speak your question, or type it in the text box
4. The assistant will respond with text and spoken audio

## Features

- **Voice Recognition**: Automatically converts your speech to text
- **Text-to-Speech**: Reads responses aloud
- **Google Gemini Integration**: Powered by Google's advanced AI model
- **Educational Focus**: Optimized for educational questions and topics
- **Personalization**: Takes into account the user's weak topics for better assistance

## Technical Implementation

The Voice Assistant uses:
- Web Speech API for speech recognition and synthesis
- Google Gemini API for generating responses
- MongoDB for storing user data and weak topics
- Next.js API routes for backend communication

## Troubleshooting

If you encounter issues:

1. **Voice recognition not working**
   - Make sure you're using a compatible browser (Chrome recommended)
   - Check that your microphone is working and has permissions

2. **No response from Gemini API**
   - Verify your API key is correct in the .env file
   - Check the browser console for error messages
   - Ensure you have internet connectivity

3. **Text-to-speech not working**
   - Make sure your device has audio output enabled
   - Try using a different browser

## Privacy Note

Voice data is processed locally using the Web Speech API and is not stored. Text queries are sent to Google Gemini API for processing according to Google's privacy policy.
