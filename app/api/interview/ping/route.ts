import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to ping the Flask backend with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    try {
      const response = await fetch('http://localhost:5001/api/ping', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: 'Flask server returned an error',
            status: 'unavailable',
            mockAvailable: true
          },
          { status: 200 } // Return 200 to prevent client-side errors
        );
      }

      return NextResponse.json({ success: true, message: 'Flask server is running', status: 'available' });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error connecting to Flask server:', fetchError);

      // Return a successful response with mock availability flag
      return NextResponse.json(
        {
          success: false,
          error: 'Flask server is not running or not responding',
          status: 'unavailable',
          mockAvailable: true
        },
        { status: 200 } // Return 200 to prevent client-side errors
      );
    }
  } catch (error) {
    console.error('Error in ping API route:', error);

    // Return a successful response with mock availability flag
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to ping Flask server',
        status: 'error',
        mockAvailable: true
      },
      { status: 200 } // Return 200 to prevent client-side errors
    );
  }
}
