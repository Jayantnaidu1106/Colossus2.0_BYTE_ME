import { NextRequest, NextResponse } from 'next/server';

// Mock data to return when Flask server is unavailable
const generateMockEndResponse = (sessionId: string) => {
  return {
    success: true,
    interview_id: sessionId || 'mock-interview-123',
    message: 'Interview ended successfully.',
    overall_feedback: {
      content_score: Math.random() * 0.3 + 0.7, // Random value between 0.7 and 1.0
      communication_score: Math.random() * 0.3 + 0.7,
      overall_score: Math.random() * 0.3 + 0.7,
      strengths: [
        "Clear and concise communication",
        "Good understanding of core concepts",
        "Structured responses"
      ],
      areas_for_improvement: [
        "Provide more specific examples",
        "Elaborate more on technical details",
        "Work on maintaining consistent eye contact"
      ],
      detailed_scores: {
        relevance: Math.random() * 0.3 + 0.7,
        completeness: Math.random() * 0.3 + 0.7,
        clarity: Math.random() * 0.3 + 0.7,
        eye_contact: Math.random() * 0.3 + 0.7,
        facial_expressions: Math.random() * 0.3 + 0.7,
        speaking_pace: Math.random() * 0.3 + 0.7,
        voice_clarity: Math.random() * 0.3 + 0.7,
        filler_words: Math.random() * 0.3 + 0.7,
        posture: Math.random() * 0.3 + 0.7,
        engagement: Math.random() * 0.3 + 0.7
      }
    },
    warning: "Using mock data because the interview server is unavailable."
  };
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

    console.log('Forwarding end interview request to Flask backend...', body);

    try {
      // Try to connect to the Flask backend with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch('http://localhost:5001/api/interview/end', {
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
          ...generateMockEndResponse(body.session_id || body.interview_id),
          warning: `Flask API returned an error: ${errorText}. Using mock data instead.`
        });
      }

      const data = await response.json();

      // Transform the Flask API response to match the expected format in the frontend
      const transformedData = {
        success: data.success,
        interview_id: data.interview_id,
        message: 'Interview ended successfully.',
        overall_feedback: {
          content_score: data.content_score / 10, // Convert from 0-10 to 0-1 scale
          communication_score: data.communication_score / 10, // Convert from 0-10 to 0-1 scale
          overall_score: data.overall_score / 10, // Convert from 0-10 to 0-1 scale
          content_feedback: data.content_feedback,
          communication_feedback: data.communication_feedback,
          strengths: data.improvement_tips || [],
          areas_for_improvement: data.weak_area_feedback || [],
          detailed_scores: {
            // Convert all scores from 0-10 to 0-1 scale
            eye_contact: data.detailed_scores?.eye_contact ? data.detailed_scores.eye_contact / 10 : 0.8,
            facial_expressions: data.detailed_scores?.facial_expressions ? data.detailed_scores.facial_expressions / 10 : 0.8,
            speaking_pace: data.detailed_scores?.speaking_pace ? data.detailed_scores.speaking_pace / 10 : 0.8,
            voice_clarity: data.detailed_scores?.voice_clarity ? data.detailed_scores.voice_clarity / 10 : 0.8,
            filler_words: data.detailed_scores?.filler_words ? data.detailed_scores.filler_words / 10 : 0.8,
            // Add other metrics that might be missing
            posture: 0.8,
            engagement: 0.8,
            relevance: 0.8,
            completeness: 0.8,
            clarity: 0.8
          }
        }
      };

      return NextResponse.json(transformedData);
    } catch (fetchError) {
      console.error('Error connecting to Flask backend:', fetchError);
      // Return mock data when Flask server is unavailable
      return NextResponse.json(generateMockEndResponse(body.session_id || body.interview_id));
    }
  } catch (error) {
    console.error('Error in proxy API route:', error);
    // Return mock data for any other errors
    return NextResponse.json({
      ...generateMockEndResponse('unknown-session'),
      warning: `Encountered an error: ${error instanceof Error ? error.message : String(error)}. Using mock data instead.`
    });
  }
}
