import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await req.formData();
    
    console.log('Received request in proxy API route');
    console.log('Form data keys:', Array.from(formData.keys()));
    
    // Forward the request to the Flask backend
    const response = await fetch('http://localhost:5000/api/summarize', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Flask API response status:', response.status);
    
    // If the response is not OK, throw an error
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from Flask API:', errorText);
      return NextResponse.json(
        { error: `Failed to summarize PDF: ${errorText}` },
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    console.log('Received data from Flask API');
    
    // Return the response data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in proxy API route:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
