import { NextRequest, NextResponse } from 'next/server';

// Mock feedback data to return when Flask server is unavailable
const generateMockFeedback = (question: string, answer: string) => {
  // Generate random scores between 0.7 and 0.95 for good feedback
  const randomScore = () => Math.round((Math.random() * 0.25 + 0.7) * 100) / 100;

  const contentScore = randomScore();
  const communicationScore = randomScore();
  const overallScore = (contentScore + communicationScore) / 2;

  return {
    success: true,
    content_feedback: `Your answer to "${question}" was comprehensive. You covered the key points well. Consider adding more specific examples to strengthen your response.`,
    communication_feedback: [
      "You communicated clearly and maintained good pace.",
      "Your tone was appropriate and you used minimal filler words.",
      "Continue to work on maintaining eye contact and engaging facial expressions."
    ],
    content_score: contentScore,
    communication_score: communicationScore,
    overall_score: overallScore,
    detailed_scores: {
      relevance: randomScore(),
      completeness: randomScore(),
      clarity: randomScore(),
      eye_contact: randomScore(),
      facial_expressions: randomScore(),
      speaking_pace: randomScore(),
      voice_clarity: randomScore(),
      filler_words: randomScore(),
      posture: randomScore(),
      engagement: randomScore()
    },
    warning: "Using mock feedback data because the interview server is unavailable."
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

    console.log('Forwarding feedback request to Flask backend...', body);

    try {
      // Try to connect to the Flask backend with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch('http://localhost:5001/api/interview/feedback', {
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
        // Return mock feedback with a warning
        return NextResponse.json({
          ...generateMockFeedback(body.question || 'interview question', body.answer || 'your answer'),
          warning: `Flask API returned an error: ${errorText}. Using mock feedback data instead.`
        });
      }

      const data = await response.json();

      // Transform the Flask API response to match the expected format in the frontend
      const transformedData = {
        success: data.success,
        content_feedback: data.content_feedback,
        communication_feedback: Array.isArray(data.communication_feedback)
          ? data.communication_feedback
          : [data.communication_feedback],
        content_score: data.content_score / 10, // Convert from 0-10 to 0-1 scale
        communication_score: data.communication_score / 10, // Convert from 0-10 to 0-1 scale
        overall_score: data.overall_score / 10, // Convert from 0-10 to 0-1 scale
        detailed_scores: {
          // Convert all scores from 0-10 to 0-1 scale if they exist
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
      };

      return NextResponse.json(transformedData);
    } catch (fetchError) {
      console.error('Error connecting to Flask backend:', fetchError);
      // Return mock feedback when Flask server is unavailable
      return NextResponse.json(generateMockFeedback(body.question || 'interview question', body.answer || 'your answer'));
    }
  } catch (error) {
    console.error('Error in proxy API route:', error);
    // Return mock feedback for any other errors
    return NextResponse.json({
      ...generateMockFeedback('interview question', 'your answer'),
      warning: `Encountered an error: ${error instanceof Error ? error.message : String(error)}. Using mock feedback data instead.`
    });
  }
}
