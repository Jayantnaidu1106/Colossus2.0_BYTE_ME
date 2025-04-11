import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to ping the Flask backend
    const response = await fetch('http://localhost:5001/api/ping', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('Error pinging Flask server:', error);
      return null;
    });

    if (!response || !response.ok) {
      return NextResponse.json(
        { success: false, error: 'Flask server is not running or not responding' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, message: 'Flask server is running' });
  } catch (error) {
    console.error('Error in ping API route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to ping Flask server' },
      { status: 500 }
    );
  }
}
