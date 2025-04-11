import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    
    console.log('Received request in text summarize API route');
    
    // Validate the request body
    if (!body.text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }
    
    // Forward the request to the Flask backend
    const response = await fetch('http://localhost:5000/api/summarize-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: body.text,
        summary_length: body.summary_length || 5
      }),
    });
    
    console.log('Flask API response status:', response.status);
    
    // If the response is not OK, throw an error
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from Flask API:', errorText);
      
      // If the Flask backend is not available, use a fallback summarization method
      if (response.status === 404 || response.status === 503 || response.status === 500) {
        console.log('Using fallback summarization method');
        const summary = fallbackSummarize(body.text, body.summary_length || 5);
        
        return NextResponse.json({
          original_text: body.text,
          summary: summary,
          original_length: body.text.length,
          summary_length: summary.length,
          warning: 'Using fallback summarization method because the Flask backend is not available'
        });
      }
      
      return NextResponse.json(
        { error: `Failed to summarize text: ${errorText}` },
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    console.log('Received data from Flask API');
    
    // Return the response data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in text summarize API route:', error);
    
    // If there's an error, try to use the fallback summarization method
    try {
      const body = await req.json();
      if (body.text) {
        const summary = fallbackSummarize(body.text, body.summary_length || 5);
        
        return NextResponse.json({
          original_text: body.text,
          summary: summary,
          original_length: body.text.length,
          summary_length: summary.length,
          warning: 'Using fallback summarization method due to an error'
        });
      }
    } catch (fallbackError) {
      console.error('Error in fallback summarization:', fallbackError);
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Fallback summarization method
function fallbackSummarize(text: string, numSentences: number): string {
  // Split text into sentences
  const sentences = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
  
  // If there are fewer sentences than requested, return the whole text
  if (sentences.length <= numSentences) {
    return text;
  }
  
  // Simple algorithm to score sentences based on word frequency
  const wordFrequency: Record<string, number> = {};
  
  // Count word frequency
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
  });
  
  // Score sentences based on word frequency
  const sentenceScores = sentences.map(sentence => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    let score = 0;
    
    words.forEach(word => {
      if (word.length > 3) {
        score += wordFrequency[word] || 0;
      }
    });
    
    // Normalize by sentence length to avoid bias towards longer sentences
    return { sentence, score: words.length > 0 ? score / words.length : 0 };
  });
  
  // Sort sentences by score and select top ones
  const topSentences = [...sentenceScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .map(item => item.sentence);
  
  // Sort the selected sentences based on their original order
  const orderedSentences = topSentences
    .map(sentence => ({
      sentence,
      index: sentences.indexOf(sentence)
    }))
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);
  
  // Join the sentences to form the summary
  return orderedSentences.join(' ');
}
