import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('Forwarding frame processing request to Flask backend...');
    // Forward the request to the enhanced Flask backend
    const response = await fetch('http://localhost:5001/api/interview/process-frame', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from Flask API:', errorText);
      return NextResponse.json(
        { success: false, error: `Failed to process frame: ${errorText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in proxy API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
}
