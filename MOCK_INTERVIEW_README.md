# AI Mock Interview Feature

This feature allows users to practice interview skills with an AI interviewer that provides instant feedback on their responses.

## Architecture

The AI Mock Interview consists of two main components:

1. **Flask Backend**: A Python-based service that handles interview questions, feedback generation, and session management
2. **Next.js Frontend**: A React component that provides the user interface for the interview simulation

## How It Works

1. The user selects an interview type (general, technical, behavioral, or mixed)
2. The backend generates a set of relevant interview questions
3. The user answers each question in text format (with future support for voice input)
4. The AI analyzes the response and provides feedback
5. At the end of the interview, the user receives an overall performance assessment and improvement tips

## Setup Instructions

### Prerequisites

- Python 3.7+ with pip
- Node.js and npm

### Installation

1. Install the Flask backend dependencies:
   ```
   cd flask-backend
   pip install flask flask-cors
   ```

2. Install the Next.js frontend dependencies (if not already installed):
   ```
   npm install
   ```

### Running the Application

You can start both the frontend and backend with the provided batch file:

```
start-mock-interview.bat
```

Or start them separately:

1. Start the Flask backend:
   ```
   cd flask-backend
   python mock_interview_app.py
   ```

2. Start the Next.js frontend:
   ```
   npm run dev
   ```

## Usage

1. Navigate to the Study Tools section in the application
2. Click on the AI Mock Interview card
3. Select the type of interview you want to practice
4. Answer each question in the text area
5. Submit your answer to receive feedback
6. Continue through all questions to complete the interview
7. Review your overall performance and improvement tips

## Technical Details

### Backend

- **Flask**: Web framework for the API
- **Python**: Core programming language
- **JSON**: Data storage for interview questions

### Frontend

- **Next.js**: React framework for the user interface
- **React**: JavaScript library for building the UI
- **Tailwind CSS**: Utility-first CSS framework for styling

## Features

- Multiple interview types (general, technical, behavioral, mixed)
- Instant feedback on responses
- Performance scoring
- Overall assessment and improvement tips
- Responsive design for all devices

## Future Enhancements

- Voice input for answers using speech recognition
- More sophisticated AI feedback using machine learning
- Industry-specific interview questions
- Video recording option for body language analysis
- Integration with job application tracking

## Limitations

- Currently uses rule-based feedback rather than advanced AI
- Limited question database
- Text-only interface (no voice input/output yet)
- Feedback is generic rather than highly personalized
