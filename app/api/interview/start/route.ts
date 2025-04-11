import { NextRequest, NextResponse } from 'next/server';

// Mock data to return when Flask server is unavailable
const mockInterviewData = {
  success: true,
  interview_id: 'mock-interview-123',
  questions: [
    'Tell me about your experience with this technology?',
    'What are your strengths and weaknesses?',
    'Why do you want this job?',
    'Where do you see yourself in 5 years?',
    'Describe a challenging situation you faced and how you handled it.'
  ],
  message: 'Mock interview started successfully. The Flask server is currently unavailable, so we\'re providing mock data.',
};

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }

    console.log('Forwarding request to Flask backend...');

    try {
      // Try to connect to the Flask backend with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch('http://localhost:5001/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from Flask API:', errorText);
        // Return mock data with a warning
        return NextResponse.json({
          ...mockInterviewData,
          warning: `Flask API returned an error: ${errorText}. Using mock data instead.`
        });
      }

      const data = await response.json();

      // Transform the Flask API response to match the expected format in the frontend
      const transformedData = {
        success: data.success,
        interview_id: data.interview_id,
        questions: data.questions || mockInterviewData.questions,
        message: 'Interview started successfully.'
      };

      return NextResponse.json(transformedData);
    } catch (fetchError) {
      console.error('Error connecting to Flask backend:', fetchError);
      // Return mock data when Flask server is unavailable
      return NextResponse.json(mockInterviewData);
    }
  } catch (error) {
    console.error('Error in proxy API route:', error);
    // Return mock data for any other errors
    return NextResponse.json({
      ...mockInterviewData,
      warning: `Encountered an error: ${error instanceof Error ? error.message : String(error)}. Using mock data instead.`
    });
  }
}
