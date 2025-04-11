// 'use client';

// import { useState, useEffect } from 'react';

// declare global {
//   interface Window {
//     SpeechRecognition: any;
//     webkitSpeechRecognition: typeof window.SpeechRecognition;
//   }
// }

// export default function Home() {
//   const [text, setText] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [recognition, setRecognition] = useState<any>(null);

//   // Initialize Speech Recognition
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       if (SpeechRecognition) {
//         const recog = new SpeechRecognition();
//         recog.continuous = false;
//         recog.lang = 'en-US';
//         recog.interimResults = false;

//         recog.onresult = (event: any) => {
//           setText(event.results[0][0].transcript);
//         };

//         recog.onend = () => {
//           setIsListening(false);
//         };

//         setRecognition(recog);
//       }
//     }
//   }, []);

//   const handleStartListening = () => {
//     if (recognition) {
//       setIsListening(true);
//       recognition.start();
//     }
//   };

//   const handleSpeak = () => {
//     const synth = window.speechSynthesis;
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = 'en-US';
//     synth.speak(utterance);
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
//       <h1 className="text-3xl font-bold mb-6">🎙️ Speech-to-Text & Text-to-Speech</h1>

//       <textarea
//         className="w-full max-w-2xl p-4 border rounded shadow mb-4"
//         rows={6}
//         placeholder="Speak or type something..."
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//       />

//       <div className="flex gap-4">
//         <button
//           onClick={handleStartListening}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           🎤 Start Listening
//         </button>
//         <button
//           onClick={handleSpeak}
//           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//         >
//           🔊 Speak Text
//         </button>
//       </div>

//       {isListening && <p className="mt-4 text-blue-600">🎧 Listening...</p>}
//     </main>
//   );
// }


// app/Voicechat/page.tsx


// 'use client';

// import { useState, useEffect, useRef } from 'react';

// declare global {
//   interface Window {
//     SpeechRecognition: any;
//     webkitSpeechRecognition: typeof window.SpeechRecognition;
//   }
// }

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
// }

// export default function Home() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [recognition, setRecognition] = useState<any>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Initialize Speech Recognition
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       if (SpeechRecognition) {
//         const recog = new SpeechRecognition();
//         recog.continuous = false;
//         recog.lang = 'en-US';
//         recog.interimResults = false;

//         recog.onresult = (event: any) => {
//           const transcript = event.results[0][0].transcript;
//           setInput(transcript);
//           // Auto-submit when speech is recognized
//           handleSubmit(transcript);
//         };

//         recog.onend = () => {
//           setIsListening(false);
//         };

//         setRecognition(recog);
//       }
//     }
//   }, []);

//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleStartListening = () => {
//     if (recognition) {
//       setIsListening(true);
//       recognition.start();
//     }
//   };

//   const speakText = (text: string) => {
//     if ('speechSynthesis' in window) {
//       // Cancel any ongoing speech
//       window.speechSynthesis.cancel();

//       setIsSpeaking(true);
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = 'en-US';

//       utterance.onend = () => {
//         setIsSpeaking(false);
//       };

//       window.speechSynthesis.speak(utterance);
//     }
//   };

//   const handleSubmit = async (text?: string) => {
//     const messageText = text || input;
//     if (!messageText.trim() || isProcessing) return;

//     // Add user message to chat
//     const userMessage: Message = { role: 'user', content: messageText };
//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsProcessing(true);

//     try {
//       // Send message to API
//       const response = await fetch('/api/chat/route', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           message: messageText,
//           email: 'user@example.com', // Replace with actual user email or auth
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to get response');
//       }

//       // Extract assistant response
//       const assistantMessage: Message = {
//         role: 'assistant',
//         content: data.response || "Sorry, I couldn't process that request."
//       };

//       setMessages(prev => [...prev, assistantMessage]);

//       // Speak the assistant's response
//       speakText(assistantMessage.content);

//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages(prev => [...prev, {
//         role: 'assistant',
//         content: 'Sorry, I encountered an error. Please try again.'
//       }]);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit();
//     }
//   };

//   return (
//     <main className="flex flex-col h-screen bg-gray-100">
//       <header className="bg-blue-600 text-white p-4">
//         <h1 className="text-2xl font-bold">AI Voice Assistant</h1>
//         <p className="text-sm">Talk to the AI and hear responses</p>
//       </header>

//       {/* Chat messages area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 && (
//           <div className="text-center text-gray-500 mt-10">
//             <p>Hello! How can I help you today?</p>
//             <p className="text-sm mt-2">Click the microphone button to speak, or type your question below.</p>
//           </div>
//         )}

//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`p-3 rounded-lg max-w-[80%] ${
//               msg.role === 'user'
//                 ? 'bg-blue-100 ml-auto'
//                 : 'bg-white mr-auto shadow'
//             }`}
//           >
//             {msg.content}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input area */}
//       <div className="p-4 bg-white border-t">
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleStartListening}
//             disabled={isListening}
//             className={`p-3 rounded-full ${
//               isListening
//                 ? 'bg-red-500 text-white'
//                 : 'bg-blue-600 text-white hover:bg-blue-700'
//             }`}
//             title="Start voice input"
//           >
//             🎤
//           </button>

//           <textarea
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyPress}
//             placeholder="Type your message or click the microphone..."
//             className="flex-1 p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//             rows={1}
//           />

//           <button
//             onClick={() => handleSubmit()}
//             disabled={isProcessing || !input.trim()}
//             className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
//           >
//             {isProcessing ? '...' : '➤'}
//           </button>
//         </div>

//         <div className="flex justify-between mt-2 text-sm text-gray-500">
//           {isListening && <span className="text-red-500">Listening...</span>}
//           {isSpeaking && <span className="text-green-500">Speaking...</span>}
//           {!isListening && !isSpeaking && <span>&nbsp;</span>}
//           <span>Press Enter to send</span>
//         </div>
//       </div>
//     </main>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ----------- Global Interface Declarations ----------- //
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: typeof window.SpeechRecognition;
  }
}

interface MessageMetadata {
  translated?: boolean;
  originalLanguage?: string;
  translatedText?: string;
  model?: string;
  language?: string;
  languageName?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: MessageMetadata;
}

interface Language {
  code: string;
  name: string;
  voice: string;
}

// ----------- Main Component ----------- //
export default function Home() {
  // ------------- State Hooks ------------- //
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Multilingual support state
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    voice: 'en-US-Neural2-F'
  });
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([
    { code: 'en', name: 'English', voice: 'en-US-Neural2-F' },
    { code: 'hi', name: 'Hindi', voice: 'hi-IN-Neural2-A' },
    { code: 'ta', name: 'Tamil', voice: 'ta-IN-Neural2-A' },
    { code: 'te', name: 'Telugu', voice: 'te-IN-Neural2-A' },
    { code: 'kn', name: 'Kannada', voice: 'kn-IN-Neural2-A' },
    { code: 'ml', name: 'Malayalam', voice: 'ml-IN-Neural2-A' },
  ]);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ----------- useEffect: Initialize Speech Recognition ----------- //
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;

        // Set language based on selected language
        const langCode = selectedLanguage.code;
        // Map language code to BCP 47 language tag
        const langMap: Record<string, string> = {
          'en': 'en-US',
          'hi': 'hi-IN',
          'ta': 'ta-IN',
          'te': 'te-IN',
          'kn': 'kn-IN',
          'ml': 'ml-IN'
        };
        recog.lang = langMap[langCode] || 'en-US';

        recog.interimResults = false;

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);

          // Show toast notification for detected speech
          toast.success(`Detected speech in ${selectedLanguage.name}`, {
            duration: 3000,
            icon: '🎤'
          });

          handleSubmit(transcript); // Auto submit on speech result
        };

        recog.onend = () => setIsListening(false);

        recog.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          setError(`Speech recognition error: ${event.error}`);

          toast.error(`Speech recognition error: ${event.error}`, {
            duration: 5000
          });
        };

        setRecognition(recog);
      }
    }
  }, [selectedLanguage]); // Re-initialize when language changes

  // ----------- useEffect: Auto Scroll to Bottom ----------- //
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ----------- Utility: Scroll Chat to Bottom ----------- //
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ----------- Voice: Start Listening ----------- //
  const handleStartListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  // ----------- Voice: Speak Text (Text-to-Speech) ----------- //
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel ongoing speech
      setIsSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(text);

      // Map language code to BCP 47 language tag
      const langMap: Record<string, string> = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN'
      };
      utterance.lang = langMap[selectedLanguage.code] || 'en-US';

      // Try to find a voice that matches the selected language
      const voices = window.speechSynthesis.getVoices();
      const languageVoices = voices.filter(voice =>
        voice.lang.startsWith(selectedLanguage.code)
      );

      if (languageVoices.length > 0) {
        utterance.voice = languageVoices[0];
      }

      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // ----------- Submit Handler (Text / Speech) ----------- //
  const handleSubmit = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isProcessing) return;

    setError(null); // Clear any previous errors

    // Show user message
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Use the new voice-assistant API that connects to Google Gemini
      const response = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          email: 'test@example.com', // In production, use the actual user email
          sourceLanguage: selectedLanguage.code,
          targetLanguage: selectedLanguage.code // Use the same language for input and output
        }),
      });

      const data = await response.json();

      // Log the response data for debugging
      console.log('Gemini API response data:', data);

      if (!response.ok) throw new Error(data.error || 'Failed to get response');

      // Extract the response text from the API response
      console.log('Response data structure:', Object.keys(data));

      let assistantResponseText = "Sorry, I couldn't process that request.";

      if (typeof data.text === 'string') {
        assistantResponseText = data.text;
        console.log('Using text property from Gemini:', assistantResponseText);
      } else if (typeof data.response === 'string') {
        assistantResponseText = data.response;
        console.log('Using response property:', assistantResponseText);
      } else {
        console.log('No valid response found in:', data);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantResponseText,
        metadata: {
          model: data.model || 'gemini-2.0-flash',
          translated: data.isTranslated || false,
          language: data.targetLanguage || selectedLanguage.code,
          languageName: data.languageName || selectedLanguage.name
        }
      };

      // Update detected language if available
      if (data.detectedLanguage) {
        setDetectedLanguage(data.detectedLanguage);
      }

      // Update supported languages if available
      if (data.supportedLanguages && data.supportedLanguages.length > 0) {
        setSupportedLanguages(data.supportedLanguages);
      }

      // Add assistant message to the chat (user message was already added)
      setMessages(prev => {
        console.log('Current messages:', prev);
        console.log('Adding assistant message:', assistantMessage);
        return [...prev, assistantMessage];
      });
      speakText(assistantResponseText); // Speak the response

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // ----------- Enter Key Submit ----------- //
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ----------- Render UI ----------- //
  return (
    <main className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Multilingual Voice Assistant <span className="text-sm font-normal bg-blue-700 px-2 py-1 rounded ml-2">Powered by Gemini</span></h1>
        <p className="text-sm">Ask questions in multiple languages and get spoken responses from Google's Gemini AI</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {supportedLanguages.map(lang => (
            <span
              key={lang.code}
              className={`text-xs px-2 py-0.5 rounded ${selectedLanguage.code === lang.code ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            >
              {lang.name}
            </span>
          ))}
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Chat Message Display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Hello! I'm your multilingual educational voice assistant powered by Google Gemini.</p>
            <p className="text-sm mt-2">Ask me questions about your studies, homework, or any educational topic in your preferred language.</p>
            <p className="text-sm mt-2">Select your language using the globe icon, then click the microphone button to speak, or type your question below.</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center">
                <Globe className="h-4 w-4 mr-1" /> Select language
              </span>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center">
                🎤 Speak in your language
              </span>
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto'
                : 'bg-white mr-auto shadow'
            }`}
          >
            <div>{msg.content}</div>

            {/* Show translation metadata if available */}
            {msg.metadata?.translated && (
              <div className="mt-1 text-xs text-gray-500">
                {msg.role === 'assistant' && msg.metadata.languageName && (
                  <div className="flex items-center gap-1">
                    <span>Powered by {msg.metadata.model}</span>
                    <span>•</span>
                    <span>Translated to {msg.metadata.languageName}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                title="Select language"
              >
                <Globe className="h-5 w-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h3 className="font-medium">Select Your Language</h3>
                <p className="text-xs text-gray-500 mb-2">The assistant will respond in your selected language</p>
                <div className="grid gap-1">
                  {supportedLanguages.map((language) => (
                    <button
                      key={language.code}
                      className={`text-left px-2 py-1 rounded ${selectedLanguage.code === language.code ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setSelectedLanguage(language);
                        toast.success(`Language changed to ${language.name}`);
                      }}
                    >
                      {language.name}
                      {detectedLanguage === language.code && (
                        <span className="ml-auto text-xs bg-green-100 text-green-800 px-1 rounded">
                          Detected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <button
            onClick={handleStartListening}
            disabled={isListening}
            className={`p-3 rounded-full ${
              isListening
                ? 'bg-red-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="Start voice input"
          >
            🎤
          </button>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Type your message in ${selectedLanguage.name} or click the microphone...`}
              className="w-full p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />

            {/* Language indicator */}
            <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white px-1 rounded">
              {selectedLanguage.name}
            </div>
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={isProcessing || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isProcessing ? '...' : '➤'}
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          {isListening && <span className="text-red-500">Listening...</span>}
          {isSpeaking && <span className="text-green-500">Speaking...</span>}
          {!isListening && !isSpeaking && <span>&nbsp;</span>}
          <span>Press Enter to send</span>
        </div>
      </div>
    </main>
  );
}
