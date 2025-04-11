# Multilingual Voice Assistant with Sarvam AI Integration

This guide explains how to set up and use the Multilingual Voice Assistant feature with Sarvam AI integration.

## Overview

The Multilingual Voice Assistant allows users to:
- Speak or type in multiple languages
- Get AI-powered responses in their preferred language
- Automatic language detection for voice input
- Text-to-speech responses in the selected language

## Supported Languages

The assistant currently supports the following languages:
- English
- Hindi
- Tamil
- Telugu
- Kannada
- Malayalam
- Bengali
- Gujarati
- Marathi

More languages can be added by updating the `SUPPORTED_LANGUAGES` array in `lib/sarvam.ts`.

## Setup Instructions

1. **Get a Sarvam AI API Key**
   - Go to [Sarvam AI](https://sarvam.ai/)
   - Create an account or sign in
   - Navigate to the API Keys section
   - Create a new API key

2. **Update your .env file**
   - Add your Sarvam AI key to the .env file:
   ```
   SARVAM_API_KEY="your-sarvam-ai-api-key"
   ```

3. **Install dependencies**
   - Make sure all dependencies are installed:
   ```bash
   npm install axios
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

## Using the Multilingual Voice Assistant

1. Navigate to the Study Tools section
2. Click on the Multilingual Assistant card
3. Select your preferred language from the language selector (globe icon)
4. Use the microphone button to speak in any supported language
5. The assistant will automatically detect the language, transcribe your speech, and respond in your preferred language
6. You can also type your questions in any language

## Features

- **Automatic Language Detection**: The assistant can automatically detect the language you're speaking
- **Speech-to-Text in Multiple Languages**: Transcribe speech in various Indian languages
- **Text-to-Speech in Multiple Languages**: Get spoken responses in your preferred language
- **Language Translation**: Translate between languages for seamless communication
- **Google Gemini Integration**: Powered by Google's advanced AI model for responses
- **Educational Focus**: Optimized for educational questions and topics
- **Personalization**: Takes into account the user's weak topics for better assistance

## Technical Implementation

The Multilingual Voice Assistant uses:
- **Sarvam AI API** for:
  - Language detection
  - Speech-to-text in multiple languages
  - Text translation
  - Text-to-speech in multiple languages
- **Google Gemini API** for generating responses
- **MongoDB** for storing user data, weak topics, and language preferences
- **Next.js API routes** for backend communication

## Architecture

1. **Frontend Component** (`app/studytools/multilingual-assistant/page.tsx`):
   - Handles user interface and audio recording
   - Sends audio or text to the backend
   - Plays audio responses

2. **Backend API** (`app/api/voice-assistant/route.ts`):
   - Processes audio or text input
   - Communicates with Sarvam AI for language processing
   - Communicates with Google Gemini for response generation
   - Returns processed responses to the frontend

3. **Sarvam AI Utility** (`lib/sarvam.ts`):
   - Provides functions for language detection, transcription, translation, and text-to-speech
   - Handles communication with the Sarvam AI API

## Troubleshooting

If you encounter issues:

1. **Voice recognition not working**
   - Make sure you're using a compatible browser (Chrome recommended)
   - Check that your microphone is working and has permissions
   - Ensure you have a stable internet connection

2. **Language detection issues**
   - Speak clearly and avoid background noise
   - Try speaking longer phrases for better detection
   - If detection fails, manually select your language

3. **No response from Sarvam AI**
   - Verify your API key is correct in the .env file
   - Check the browser console for error messages
   - Ensure you have internet connectivity

4. **Text-to-speech not working**
   - Make sure your device has audio output enabled
   - Try using a different browser
   - Check if the selected language is supported for text-to-speech

## Development Notes

To add support for additional languages:
1. Update the `SUPPORTED_LANGUAGES` array in `lib/sarvam.ts`
2. Ensure Sarvam AI supports the language for all required features
3. Test thoroughly with native speakers of the language

To modify the assistant's behavior:
1. Update the prompt in `app/api/voice-assistant/route.ts`
2. Adjust the language detection and translation parameters in `lib/sarvam.ts`
3. Modify the UI components in `app/studytools/multilingual-assistant/page.tsx`
