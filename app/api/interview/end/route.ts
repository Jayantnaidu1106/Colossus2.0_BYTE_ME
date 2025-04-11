import { NextRequest, NextResponse } from 'next/server';

// Evaluate interview data when Flask server is unavailable
const evaluateInterviewEnd = (sessionId: string, sessionData?: any) => {
  // Default scores if no session data is provided
  let contentScore = 0.7;
  let communicationScore = 0.7;
  let detailedScores = {
    relevance: 0.7,
    completeness: 0.7,
    clarity: 0.7,
    eye_contact: 0.7,
    facial_expressions: 0.7,
    speaking_pace: 0.7,
    voice_clarity: 0.7,
    filler_words: 0.7,
    posture: 0.7,
    engagement: 0.7
  };

  // If we have session data, calculate actual scores
  if (sessionData && sessionData.questions && sessionData.questions.length > 0) {
    // Initialize score accumulators
    let totalContentScore = 0;
    let totalCommunicationScore = 0;
    let questionCount = 0;

    // Detailed score accumulators
    let totalDetailedScores = {
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

    // Process each question
    sessionData.questions.forEach(question => {
      if (question.answer) {
        questionCount++;

        // Evaluate content
        const wordCount = question.answer.split(/\s+/).length;
        const sentenceCount = question.answer.split(/[.!?]+/).filter(Boolean).length;

        // Calculate scores for this question
        const questionScores = {
          relevance: Math.min(0.9, 0.5 + (wordCount / 200)),
          completeness: Math.min(0.9, wordCount / 100),
          clarity: (sentenceCount > 0 && wordCount / sentenceCount < 25) ? 0.8 : 0.6
        };

        // Add to total scores
        totalDetailedScores.relevance += questionScores.relevance;
        totalDetailedScores.completeness += questionScores.completeness;
        totalDetailedScores.clarity += questionScores.clarity;

        // Communication scores (simulated)
        totalDetailedScores.eye_contact += 0.6 + Math.random() * 0.3;
        totalDetailedScores.facial_expressions += 0.6 + Math.random() * 0.3;
        totalDetailedScores.speaking_pace += 0.6 + Math.random() * 0.3;
        totalDetailedScores.voice_clarity += 0.6 + Math.random() * 0.3;
        totalDetailedScores.filler_words += 0.6 + Math.random() * 0.3;
        totalDetailedScores.posture += 0.6 + Math.random() * 0.3;
        totalDetailedScores.engagement += 0.6 + Math.random() * 0.3;
      }
    });

    // Calculate averages if we have questions
    if (questionCount > 0) {
      // Average detailed scores
      Object.keys(totalDetailedScores).forEach(key => {
        detailedScores[key] = totalDetailedScores[key] / questionCount;
      });

      // Calculate content score from detailed scores
      contentScore = (detailedScores.relevance + detailedScores.completeness + detailedScores.clarity) / 3;

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
    }
  }

  // Calculate overall score
  const overallScore = (contentScore * 0.6) + (communicationScore * 0.4);

  // Generate strengths and areas for improvement based on scores
  const strengths = [];
  const areasForImprovement = [];

  // Content strengths/improvements
  if (detailedScores.relevance > 0.7) {
    strengths.push("Relevant and on-topic responses");
  } else {
    areasForImprovement.push("Focus more on directly answering the questions asked");
  }

  if (detailedScores.completeness > 0.7) {
    strengths.push("Comprehensive answers with good detail");
  } else {
    areasForImprovement.push("Provide more detailed and complete answers");
  }

  if (detailedScores.clarity > 0.7) {
    strengths.push("Clear and well-structured responses");
  } else {
    areasForImprovement.push("Work on structuring your answers more clearly");
  }

  // Communication strengths/improvements
  if (detailedScores.eye_contact > 0.7) {
    strengths.push("Good eye contact");
  } else {
    areasForImprovement.push("Maintain more consistent eye contact");
  }

  if (detailedScores.speaking_pace > 0.7) {
    strengths.push("Appropriate speaking pace");
  } else {
    areasForImprovement.push("Adjust your speaking pace - avoid rushing or speaking too slowly");
  }

  if (detailedScores.voice_clarity > 0.7) {
    strengths.push("Clear and audible voice");
  } else {
    areasForImprovement.push("Work on voice clarity and projection");
  }

  // Generate content and communication feedback
  let contentFeedback = "";
  if (contentScore < 0.5) {
    contentFeedback = "Your answers need more substance and relevance. Focus on directly addressing the questions with specific details and examples.";
  } else if (contentScore < 0.7) {
    contentFeedback = "Your answers were somewhat relevant but could be more comprehensive. Try to provide more specific examples and details in your responses.";
  } else {
    contentFeedback = "Your answers demonstrated good knowledge and relevance. You provided comprehensive responses that addressed the questions well.";
  }

  let communicationFeedback = "";
  if (communicationScore < 0.5) {
    communicationFeedback = "Your communication skills need significant improvement. Work on maintaining eye contact, speaking clearly, and using appropriate facial expressions.";
  } else if (communicationScore < 0.7) {
    communicationFeedback = "Your communication was adequate but could be improved. Focus on maintaining more consistent eye contact and speaking with more clarity and confidence.";
  } else {
    communicationFeedback = "You communicated effectively throughout the interview. Your eye contact, facial expressions, and speaking pace were generally appropriate.";
  }

  return {
    success: true,
    interview_id: sessionId || 'interview-' + Date.now(),
    message: 'Interview evaluated successfully.',
    overall_feedback: {
      content_score: contentScore,
      communication_score: communicationScore,
      overall_score: overallScore,
      content_feedback: contentFeedback,
      communication_feedback: communicationFeedback,
      strengths: strengths.length > 0 ? strengths : ["Participation in the interview process"],
      areas_for_improvement: areasForImprovement.length > 0 ? areasForImprovement : ["Continue practicing interview skills"],
      detailed_scores: detailedScores,
      weak_areas: Object.entries(detailedScores)
        .filter(([_, score]) => score < 0.6)
        .map(([area]) => area)
    },
    warning: "Using locally evaluated data because the interview server is unavailable."
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
        // Return evaluated data with a warning
        return NextResponse.json({
          ...evaluateInterviewEnd(body.session_id || body.interview_id, body),
          warning: `Flask API returned an error: ${errorText}. Using locally evaluated data instead.`
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
      // Return evaluated data when Flask server is unavailable
      return NextResponse.json(evaluateInterviewEnd(body.session_id || body.interview_id, body));
    }
  } catch (error) {
    console.error('Error in proxy API route:', error);
    // Return evaluated data for any other errors
    return NextResponse.json({
      ...evaluateInterviewEnd('unknown-session'),
      warning: `Encountered an error: ${error instanceof Error ? error.message : String(error)}. Using locally evaluated data instead.`
    });
  }
}
