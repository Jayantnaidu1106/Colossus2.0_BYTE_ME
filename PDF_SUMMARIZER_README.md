# PDF Summarizer Feature

This feature allows users to upload PDF documents and get concise summaries using natural language processing techniques.

## Architecture

The PDF Summarizer consists of two main components:

1. **Flask Backend**: A Python-based service that handles PDF processing and text summarization
2. **Next.js Frontend**: A React component that provides the user interface for uploading PDFs and displaying summaries

## How It Works

1. The user uploads a PDF file through the web interface
2. The file is sent to the Flask backend
3. The backend extracts text from the PDF using PyPDF2
4. The text is processed and summarized using the TextRank algorithm
5. The summary is returned to the frontend and displayed to the user

## Setup Instructions

### Prerequisites

- Python 3.7+ with pip
- Node.js and npm
- MongoDB (for the main application)

### Installation

1. Install the Flask backend dependencies:
   ```
   cd flask-backend
   pip install -r requirements.txt
   ```

2. Install the Next.js frontend dependencies (if not already installed):
   ```
   npm install
   ```

### Running the Application

You can start both the frontend and backend with the provided batch file:

```
start-app.bat
```

Or start them separately:

1. Start the Flask backend:
   ```
   cd flask-backend
   python app.py
   ```

2. Start the Next.js frontend:
   ```
   npm run dev
   ```

## Usage

1. Navigate to the Study Tools section in the application
2. Click on the PDF Summarizer card
3. Upload a PDF file
4. Adjust the summary length using the slider
5. Click "Summarize PDF"
6. View the generated summary and original text
7. Download the summary if needed

## Technical Details

### Backend

- **Flask**: Web framework for the API
- **PyPDF2**: Library for extracting text from PDFs
- **NLTK**: Natural Language Toolkit for text processing
- **NetworkX**: Used for implementing the TextRank algorithm

### Frontend

- **Next.js**: React framework for the user interface
- **React**: JavaScript library for building the UI
- **Tailwind CSS**: Utility-first CSS framework for styling

## Algorithm

The summarization uses the TextRank algorithm, which is based on Google's PageRank. It works by:

1. Breaking the text into sentences
2. Creating a graph where sentences are nodes
3. Calculating similarity between sentences using cosine similarity
4. Ranking sentences based on their importance in the graph
5. Selecting the top-ranked sentences for the summary
6. Arranging them in their original order

## Limitations

- Works best with well-structured PDFs
- May struggle with PDFs containing complex layouts, tables, or images
- Performance depends on the length and complexity of the document
