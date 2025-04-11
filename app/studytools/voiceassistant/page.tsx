'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaSpinner, FaSun, FaMoon } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import ParticlesWrapper to avoid SSR issues
const ParticlesWrapper = dynamic(() => import("@/components/ParticlesWrapper"), { ssr: false });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleAudioSubmission(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const handleAudioSubmission = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await fetch('/api/voice-assistant', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { role: 'user', content: data.user_message },
        { role: 'assistant', content: data.assistant_response }
      ]);
      toast.success('Response received');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDarkMode ? "bg-black" : "bg-white"
    }`}>
      {/* Particles Background - Only show in dark mode */}
      {isDarkMode && <ParticlesWrapper />}
      
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold text-center ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              Voice Assistant
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode 
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors duration-300`}
            >
              {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>
          </div>

          <div className={`rounded-lg shadow-md p-6 mb-8 ${
            isDarkMode 
              ? "bg-white/10 backdrop-blur-lg" 
              : "bg-white"
          }`}>
            <div className="flex justify-center space-x-4">
              <button
                onClick={startRecording}
                disabled={isRecording || isProcessing}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isDarkMode 
                    ? "bg-indigo-900/50 text-indigo-200 hover:bg-indigo-800/50" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaMicrophone className="mr-2" />
                Start Recording
              </button>
              <button
                onClick={stopRecording}
                disabled={!isRecording || isProcessing}
                className={`flex items-center px-4 py-2 rounded-md ${
                  isDarkMode 
                    ? "bg-red-900/50 text-red-200 hover:bg-red-800/50" 
                    : "bg-red-600 text-white hover:bg-red-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FaStop className="mr-2" />
                Stop Recording
              </button>
            </div>

            {isProcessing && (
              <div className="mt-4 flex justify-center">
                <div className={`flex items-center ${
                  isDarkMode ? "text-indigo-300" : "text-indigo-600"
                }`}>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing audio...
                </div>
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <div className={`rounded-lg shadow-md p-6 ${
              isDarkMode 
                ? "bg-white/10 backdrop-blur-lg" 
                : "bg-white"
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}>
                Conversation
              </h2>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.role === 'user'
                        ? isDarkMode
                          ? "bg-indigo-900/20 text-indigo-100"
                          : "bg-indigo-50 text-indigo-900"
                        : isDarkMode
                          ? "bg-gray-800/20 text-gray-100"
                          : "bg-gray-50 text-gray-900"
                    }`}
                  >
                    <div className={`font-medium mb-1 ${
                      isDarkMode ? "text-indigo-300" : "text-indigo-600"
                    }`}>
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 