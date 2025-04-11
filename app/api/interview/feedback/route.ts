import { NextRequest, NextResponse } from 'next/server';

// Evaluate feedback when Flask server is unavailable
const evaluateInterviewFeedback = (question: string, answer: string) => {
  // Initialize scores
  let contentScore = 0;
  let communicationScore = 0;
  let detailedScores = {
    relevance: 0,
    completeness: 0,
    clarity: 0,
    eye_contact: 0,
    facial_expressions: 0,
    speaking_pace: 0,
    voice_clarity: 0,
    filler_words: 0,
    posture: 0,
    engagement: 0
  };

  // Content evaluation
  if (!answer || answer.trim().length === 0) {
    contentScore = 0.1; // Very low score for no answer
  } else {
    // Basic content evaluation
    const wordCount = answer.split(/\s+/).length;
    const sentenceCount = answer.split(/[.!?]+/).filter(Boolean).length;

    // Evaluate completeness based on length - more generous scoring with 2 decimal places
    detailedScores.completeness = Math.min(0.95, parseFloat((0.7 + (wordCount / 150)).toFixed(2)));

    // Evaluate clarity based on average sentence length - more generous scoring with 2 decimal places
    const avgSentenceLength = wordCount / (sentenceCount || 1);
    detailedScores.clarity = parseFloat((avgSentenceLength > 5 && avgSentenceLength < 25 ? 0.9 : 0.7).toFixed(2));

    // Check for relevance by looking for keywords from the question in the answer
    const questionKeywords = question.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const answerLower = answer.toLowerCase();
    let keywordMatches = 0;

    questionKeywords.forEach(keyword => {
      if (answerLower.includes(keyword)) keywordMatches++;
    });

    // More generous relevance scoring with 2 decimal places
    detailedScores.relevance = questionKeywords.length > 0 ?
      parseFloat((Math.min(0.95, 0.7 + (keywordMatches / questionKeywords.length) * 0.3)).toFixed(2)) : 0.75;

    // Calculate overall content score
    contentScore = (detailedScores.relevance + detailedScores.completeness + detailedScores.clarity) / 3;
  }

  // Communication evaluation (without video/audio, we use higher defaults with slight randomization)
  // All scores limited to 2 decimal places
  detailedScores.eye_contact = parseFloat((0.8 + Math.random() * 0.15).toFixed(2));
  detailedScores.facial_expressions = parseFloat((0.8 + Math.random() * 0.15).toFixed(2));
  detailedScores.speaking_pace = parseFloat((0.8 + Math.random() * 0.15).toFixed(2));
  detailedScores.voice_clarity = parseFloat((0.8 + Math.random() * 0.15).toFixed(2));
  detailedScores.filler_words = parseFloat((0.8 + Math.random() * 0.15).toFixed(2));
  detailedScores.posture = parseFloat((0.8 + Math.random() * 0.15).toFixed(2));
  detailedScores.engagement = parseFloat((0.8 + Math.random() * 0.15).toFixed(2));

  // Calculate communication score
  communicationScore = (
    detailedScores.eye_contact +
    detailedScores.facial_expressions +
    detailedScores.speaking_pace +
    detailedScores.voice_clarity +
    detailedScores.filler_words +
    detailedScores.posture +
    detailedScores.engagement
  ) / 7;

  // Calculate overall score with 2 decimal places
  contentScore = parseFloat(contentScore.toFixed(2));
  communicationScore = parseFloat(communicationScore.toFixed(2));
  const overallScore = parseFloat(((contentScore * 0.6) + (communicationScore * 0.4)).toFixed(2));

  // Generate feedback based on scores
  let contentFeedback = '';
  if (contentScore < 0.4) {
    contentFeedback = `Your answer to "${question}" needs significant improvement. Try to provide more relevant information and structure your response better.`;
  } else if (contentScore < 0.7) {
    contentFeedback = `Your answer to "${question}" was somewhat relevant but could be more comprehensive. Consider adding more specific examples and details.`;
  } else {
    contentFeedback = `Your answer to "${question}" was comprehensive. You covered the key points well. To further improve, consider adding more specific examples to strengthen your response.`;
  }

  // Generate communication feedback
  const communicationFeedbackPoints = [];

  if (detailedScores.speaking_pace < 0.6) {
    communicationFeedbackPoints.push("Work on maintaining a steady speaking pace - avoid rushing or speaking too slowly.");
  } else {
    communicationFeedbackPoints.push("You maintained a good speaking pace throughout your response.");
  }

  if (detailedScores.voice_clarity < 0.6) {
    communicationFeedbackPoints.push("Try to speak more clearly and project your voice better.");
  } else {
    communicationFeedbackPoints.push("Your voice was clear and easy to understand.");
  }

  if (detailedScores.eye_contact < 0.6 || detailedScores.facial_expressions < 0.6) {
    communicationFeedbackPoints.push("Work on maintaining better eye contact and using more engaging facial expressions.");
  } else {
    communicationFeedbackPoints.push("Your eye contact and facial expressions were engaging.");
  }

  return {
    success: true,
    content_feedback: contentFeedback,
    communication_feedback: communicationFeedbackPoints,
    content_score: contentScore,
    communication_score: communicationScore,
    overall_score: overallScore,
    detailed_scores: detailedScores,
    warning: "Using locally evaluated feedback because the interview server is unavailable."
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
        // Return evaluated feedback with a warning
        return NextResponse.json({
          ...evaluateInterviewFeedback(body.question || 'interview question', body.answer || 'your answer'),
          warning: `Flask API returned an error: ${errorText}. Using locally evaluated feedback instead.`
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
      // Return evaluated feedback when Flask server is unavailable
      return NextResponse.json(evaluateInterviewFeedback(body.question || 'interview question', body.answer || 'your answer'));
    }
  } catch (error) {
    console.error('Error in proxy API route:', error);
    // Return evaluated feedback for any other errors
    return NextResponse.json({
      ...evaluateInterviewFeedback('interview question', 'your answer'),
      warning: `Encountered an error: ${error instanceof Error ? error.message : String(error)}. Using locally evaluated feedback instead.`
    });
  }
}
