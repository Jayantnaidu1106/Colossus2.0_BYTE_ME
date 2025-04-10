'use client';

import React, { useState, useRef } from 'react';
import { FaFileUpload, FaFileAlt, FaSpinner, FaDownload } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface SummaryResult {
  original_text: string;
  summary: string;
  original_length: number;
  summary_length: number;
}

export default function PDFSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [summaryLength, setSummaryLength] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSummaryLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummaryLength(parseInt(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('summary_length', summaryLength.toString());

      console.log('Sending request to backend with:', {
        file: file.name,
        size: file.size,
        summary_length: summaryLength
      });

      // Use the Next.js API route as a proxy to avoid CORS issues
      console.log('Fetching through Next.js proxy API route...');
      const response = await fetch('/api/pdf-summarize', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorMessage = 'Failed to summarize PDF';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use the raw text
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Received data from backend:', data);

      // Validate the response data
      if (!data || typeof data !== 'object') {
        console.error('Invalid response format:', data);
        toast.error('Received invalid response format from server');
        return;
      }

      // Check if summary exists and is not empty
      if (!data.summary || typeof data.summary !== 'string' || data.summary.trim() === '') {
        console.error('Summary is missing or empty:', data);
        toast.error('The generated summary is empty');
        return;
      }

      console.log('Summary content:', data.summary);

      // Set the result state
      setResult({
        original_text: data.original_text || '',
        summary: data.summary,
        original_length: data.original_length || 0,
        summary_length: data.summary_length || 0
      });

      toast.success('PDF summarized successfully!');
    } catch (error) {
      console.error('Error summarizing PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to summarize PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!result) {
      toast.error('No summary available to download');
      return;
    }

    console.log('Downloading summary:', result.summary);

    try {
      // Create a blob with the summary text
      const blob = new Blob([result.summary], { type: 'text/plain' });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'summary.txt';

      // Append to the document and click
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('Summary downloaded successfully!');
    } catch (error) {
      console.error('Error downloading summary:', error);
      toast.error('Failed to download summary');
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">PDF Summarizer</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Upload PDF</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <FaFileAlt className="w-8 h-8 mb-3 text-indigo-500" />
                        <p className="mb-2 text-sm text-gray-500 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <FaFileUpload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF files only</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Summary Length (sentences): {summaryLength}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={summaryLength}
                onChange={handleSummaryLengthChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Shorter</span>
                <span>Longer</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!file || isLoading}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Summarize PDF'
                )}
              </button>
              {file && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Summary Result</h2>
              <button
                onClick={handleDownloadSummary}
                className="flex items-center text-indigo-600 hover:text-indigo-800"
                disabled={!result.summary}
              >
                <FaDownload className="mr-1" />
                Download
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Compression: {Math.round((1 - result.summary_length / result.original_length) * 100)}%</span>
                <span>{result.summary_length} / {result.original_length} characters</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-indigo-600 rounded-full"
                  style={{ width: `${(result.summary_length / result.original_length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Summary</h3>
                {result.summary ? (
                  <div className="p-4 bg-indigo-50 rounded-md text-gray-800 whitespace-pre-wrap">
                    {result.summary}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-md text-red-800 border border-red-200">
                    No summary could be generated. Please try a different PDF file.
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Original Text</h3>
                {result.original_text ? (
                  <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-md text-gray-600 whitespace-pre-wrap">
                    {result.original_text}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 rounded-md text-yellow-800 border border-yellow-200">
                    No text could be extracted from the PDF file.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
