# PDF Summarizer Flask Backend

This is a Flask backend service for the Atlas AI application that provides PDF summarization functionality.

## Features

- PDF text extraction
- Text summarization using TextRank algorithm
- RESTful API endpoint for PDF processing

## Setup

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Run the Flask application:

```bash
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

### POST /api/summarize

Summarizes a PDF document.

**Request:**
- Form data with:
  - `file`: PDF file to summarize
  - `summary_length`: (Optional) Number of sentences in the summary (default: 5)

**Response:**
```json
{
  "original_text": "Full text extracted from the PDF",
  "summary": "Generated summary of the PDF",
  "original_length": 12345,
  "summary_length": 678
}
```

## How it works

1. The PDF file is uploaded and saved temporarily
2. Text is extracted from the PDF using PyPDF2
3. The text is tokenized into sentences
4. A similarity matrix is built between all sentences
5. The TextRank algorithm (based on PageRank) is applied to rank sentences by importance
6. The top N sentences are selected and arranged in their original order
7. The summary is returned along with the original text and length statistics
