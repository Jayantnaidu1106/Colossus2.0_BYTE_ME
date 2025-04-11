import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Evaluate interview data when Flask server is unavailable
const evaluateInterviewEnd = (sessionId: string, sessionData?: any) => {
  // Default scores if no session data is provided - more generous with 2 decimal places
  let contentScore = 0.85;
  let communicationScore = 0.85;
  let detailedScores = {
    relevance: 0.85,
    completeness: 0.85,
    clarity: 0.85,
    eye_contact: 0.85,
    facial_expressions: 0.85,
    speaking_pace: 0.85,
    voice_clarity: 0.85,
    filler_words: 0.85,
    posture: 0.85,
    engagement: 0.85
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

        // Calculate scores for this question - more generous with 2 decimal places
        const questionScores = {
          relevance: parseFloat((Math.min(0.95, 0.7 + (wordCount / 150))).toFixed(2)),
          completeness: parseFloat((Math.min(0.95, 0.7 + (wordCount / 100))).toFixed(2)),
          clarity: parseFloat(((sentenceCount > 0 && wordCount / sentenceCount < 25) ? 0.9 : 0.75).toFixed(2))
        };

        // Add to total scores
        totalDetailedScores.relevance += questionScores.relevance;
        totalDetailedScores.completeness += questionScores.completeness;
        totalDetailedScores.clarity += questionScores.clarity;

        // Communication scores (simulated) - more generous with 2 decimal places
        totalDetailedScores.eye_contact += parseFloat((0.75 + Math.random() * 0.2).toFixed(2));
        totalDetailedScores.facial_expressions += parseFloat((0.75 + Math.random() * 0.2).toFixed(2));
        totalDetailedScores.speaking_pace += parseFloat((0.75 + Math.random() * 0.2).toFixed(2));
        totalDetailedScores.voice_clarity += parseFloat((0.75 + Math.random() * 0.2).toFixed(2));
        totalDetailedScores.filler_words += parseFloat((0.75 + Math.random() * 0.2).toFixed(2));
        totalDetailedScores.posture += parseFloat((0.75 + Math.random() * 0.2).toFixed(2));
        totalDetailedScores.engagement += parseFloat((0.75 + Math.random() * 0.2).toFixed(2));
      }
    });

    // Calculate averages if we have questions
    if (questionCount > 0) {
      // Average detailed scores with 2 decimal places
      Object.keys(totalDetailedScores).forEach(key => {
        detailedScores[key] = parseFloat((totalDetailedScores[key] / questionCount).toFixed(2));
      });

      // Calculate content score from detailed scores with 2 decimal places
      contentScore = parseFloat(((detailedScores.relevance + detailedScores.completeness + detailedScores.clarity) / 3).toFixed(2));

      // Calculate communication score with 2 decimal places
      communicationScore = parseFloat((
        detailedScores.eye_contact +
        detailedScores.facial_expressions +
        detailedScores.speaking_pace +
        detailedScores.voice_clarity +
        detailedScores.filler_words +
        detailedScores.posture +
        detailedScores.engagement
      ) / 7).toFixed(2);
    }
  }

  // Calculate overall score with 2 decimal places
  const overallScore = parseFloat(((contentScore * 0.6) + (communicationScore * 0.4)).toFixed(2));

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

      // Save the interview results to MongoDB
      try {
        const session = await getServerSession(authOptions);
        const email = session?.user?.email;

        if (email) {
          const client = await clientPromise;
          const db = client.db();

          // Save the interview result
          await db.collection('interviews').insertOne({
            email,
            timestamp: new Date(),
            interview_id: transformedData.interview_id,
            content_score: transformedData.overall_feedback.content_score,
            communication_score: transformedData.overall_feedback.communication_score,
            overall_score: transformedData.overall_feedback.overall_score,
            detailed_scores: transformedData.overall_feedback.detailed_scores,
            strengths: transformedData.overall_feedback.strengths,
            areas_for_improvement: transformedData.overall_feedback.areas_for_improvement
          });

          console.log(`Saved interview result for ${email} with ID ${transformedData.interview_id}`);

          // Update user's weak topics based on areas for improvement
          const weakTopics = transformedData.overall_feedback.areas_for_improvement
            .map((area: string) => {
              // Extract the main topic from the improvement area
              const topicMatch = area.match(/^(\w+)/);
              return topicMatch ? topicMatch[0] : null;
            })
            .filter(Boolean); // Remove null values

          if (weakTopics.length > 0) {
            // Get the user's current weak topics
            const user = await db.collection('users').findOne({ email });
            const currentWeakTopics = user?.weaktopics || [];

            // Combine current and new weak topics, remove duplicates
            const updatedWeakTopics = [...new Set([...currentWeakTopics, ...weakTopics])];

            // Update the user's weak topics
            await db.collection('users').updateOne(
              { email },
              { $set: { weaktopics: updatedWeakTopics } },
              { upsert: true }
            );

            console.log(`Updated weak topics for ${email}:`, updatedWeakTopics);
          }
        } else {
          console.warn('No user email found in session, interview results not saved to MongoDB');
        }
      } catch (dbError) {
        console.error('Error saving interview results to MongoDB:', dbError);
        // Continue with the response even if saving to DB fails
      }

      return NextResponse.json(transformedData);
    } catch (fetchError) {
      console.error('Error connecting to Flask backend:', fetchError);
      // Evaluate the interview locally
      const evaluatedData = evaluateInterviewEnd(body.session_id || body.interview_id, body);

      // Save the fallback results to MongoDB
      try {
        const session = await getServerSession(authOptions);
        const email = session?.user?.email;

        if (email) {
          const client = await clientPromise;
          const db = client.db();

          // Save the interview result
          await db.collection('interviews').insertOne({
            email,
            timestamp: new Date(),
            interview_id: evaluatedData.interview_id,
            content_score: evaluatedData.overall_feedback.content_score,
            communication_score: evaluatedData.overall_feedback.communication_score,
            overall_score: evaluatedData.overall_feedback.overall_score,
            detailed_scores: evaluatedData.overall_feedback.detailed_scores,
            strengths: evaluatedData.overall_feedback.strengths,
            areas_for_improvement: evaluatedData.overall_feedback.areas_for_improvement,
            is_fallback: true
          });

          console.log(`Saved fallback interview result for ${email} with ID ${evaluatedData.interview_id}`);

          // Update user's weak topics based on areas for improvement
          const weakTopics = evaluatedData.overall_feedback.areas_for_improvement
            .map((area: string) => {
              // Extract the main topic from the improvement area
              const topicMatch = area.match(/^(\w+)/);
              return topicMatch ? topicMatch[0] : null;
            })
            .filter(Boolean); // Remove null values

          if (weakTopics.length > 0) {
            // Get the user's current weak topics
            const user = await db.collection('users').findOne({ email });
            const currentWeakTopics = user?.weaktopics || [];

            // Combine current and new weak topics, remove duplicates
            const updatedWeakTopics = [...new Set([...currentWeakTopics, ...weakTopics])];

            // Update the user's weak topics
            await db.collection('users').updateOne(
              { email },
              { $set: { weaktopics: updatedWeakTopics } },
              { upsert: true }
            );

            console.log(`Updated weak topics for ${email} (fallback):`, updatedWeakTopics);
          }
        } else {
          console.warn('No user email found in session, fallback interview results not saved to MongoDB');
        }
      } catch (dbError) {
        console.error('Error saving fallback interview results to MongoDB:', dbError);
        // Continue with the response even if saving to DB fails
      }

      // Return the evaluated data
      return NextResponse.json(evaluatedData);
    }
  } catch (error) {
    console.error('Error in proxy API route:', error);
    // Evaluate the interview locally for any other errors
    const evaluatedData = evaluateInterviewEnd('unknown-session');
    const responseData = {
      ...evaluatedData,
      warning: `Encountered an error: ${error instanceof Error ? error.message : String(error)}. Using locally evaluated data instead.`
    };

    // Try to save the emergency fallback results to MongoDB
    try {
      const session = await getServerSession(authOptions);
      const email = session?.user?.email;

      if (email) {
        const client = await clientPromise;
        const db = client.db();

        // Save the interview result
        await db.collection('interviews').insertOne({
          email,
          timestamp: new Date(),
          interview_id: evaluatedData.interview_id || 'emergency-fallback',
          content_score: evaluatedData.overall_feedback.content_score,
          communication_score: evaluatedData.overall_feedback.communication_score,
          overall_score: evaluatedData.overall_feedback.overall_score,
          detailed_scores: evaluatedData.overall_feedback.detailed_scores,
          strengths: evaluatedData.overall_feedback.strengths,
          areas_for_improvement: evaluatedData.overall_feedback.areas_for_improvement,
          is_emergency_fallback: true,
          error: error instanceof Error ? error.message : String(error)
        });

        console.log(`Saved emergency fallback interview result for ${email}`);

        // Update user's weak topics with some default topics
        const defaultWeakTopics = ['Communication', 'Preparation', 'Technical'];

        // Get the user's current weak topics
        const user = await db.collection('users').findOne({ email });
        const currentWeakTopics = user?.weaktopics || [];

        // Combine current and default weak topics, remove duplicates
        const updatedWeakTopics = [...new Set([...currentWeakTopics, ...defaultWeakTopics])];

        // Update the user's weak topics
        await db.collection('users').updateOne(
          { email },
          { $set: { weaktopics: updatedWeakTopics } },
          { upsert: true }
        );

        console.log(`Updated weak topics for ${email} (emergency fallback):`, updatedWeakTopics);
      }
    } catch (dbError) {
      console.error('Error saving emergency fallback interview results to MongoDB:', dbError);
      // Continue with the response even if saving to DB fails
    }

    return NextResponse.json(responseData);
  }
}
