from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import PyPDF2
import re
import numpy as np
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
# Enable CORS with more specific settings
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "methods": "*"}})

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

# Create upload folder if it doesn't exist
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def extract_text_from_pdf(pdf_file_path):
    """Extract text from PDF file"""
    try:
        with open(pdf_file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            print(f"PDF has {total_pages} pages")

            text = ""
            for page_num in range(total_pages):
                try:
                    page_text = pdf_reader.pages[page_num].extract_text()
                    if page_text:
                        text += page_text + "\n\n"  # Add double newline between pages
                    else:
                        print(f"Warning: Empty text extracted from page {page_num + 1}")
                except Exception as e:
                    print(f"Error extracting text from page {page_num + 1}: {str(e)}")

            # Check if we got any text
            if not text.strip():
                print("Warning: No text extracted from PDF, trying alternative method")
                # Try an alternative approach (simplified)
                text = ""
                for page_num in range(total_pages):
                    try:
                        page = pdf_reader.pages[page_num]
                        page_text = ""
                        # Try to extract text from page objects directly
                        if '/Contents' in page:
                            page_text = str(page['/Contents'])
                        if not page_text.strip():
                            page_text = str(page)
                        text += page_text + "\n\n"
                    except Exception as e:
                        print(f"Alternative extraction failed for page {page_num + 1}: {str(e)}")

            print(f"Extracted {len(text)} characters from PDF")
            return text
    except Exception as e:
        print(f"Error opening or processing PDF: {str(e)}")
        raise

def tokenize_sentences(text):
    """Split text into sentences using regex"""
    if not text or len(text.strip()) == 0:
        print("Warning: Empty text provided to tokenize_sentences")
        return []

    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)

    # Replace common abbreviations to prevent false sentence breaks
    text = re.sub(r'(Mr\.|Mrs\.|Dr\.|Prof\.|etc\.)', lambda m: m.group(0).replace('.', '<DOT>'), text)

    # Split on sentence boundaries (period, question mark, exclamation point)
    # followed by a space and capital letter or end of string
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z]|$)', text)

    # Restore abbreviation dots
    sentences = [s.replace('<DOT>', '.') for s in sentences]

    # Filter out empty strings, strip whitespace, and ensure minimum length
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]

    # If we have no sentences (possibly due to poor PDF extraction), fall back to splitting by newlines
    if not sentences:
        print("Warning: No sentences found with primary method, falling back to newline splitting")
        sentences = [s.strip() for s in text.split('\n') if s.strip() and len(s.strip()) > 10]

    # If we still have no sentences, create artificial chunks
    if not sentences:
        print("Warning: No sentences found with fallback method, creating artificial chunks")
        # Split text into chunks of approximately 100 characters
        words = text.split()
        chunks = []
        current_chunk = []

        for word in words:
            current_chunk.append(word)
            if len(' '.join(current_chunk)) > 100:
                chunks.append(' '.join(current_chunk))
                current_chunk = []

        if current_chunk:  # Add the last chunk if it exists
            chunks.append(' '.join(current_chunk))

        sentences = chunks

    print(f"Tokenized {len(sentences)} sentences")
    return sentences

def tokenize_words(text):
    """Split text into words using regex"""
    # Split on word boundaries and filter out non-word characters
    return re.findall(r'\b\w+\b', text.lower())

def calculate_word_frequency(sentences):
    """Calculate word frequency across all sentences"""
    word_freq = {}
    for sentence in sentences:
        words = tokenize_words(sentence)
        for word in words:
            if word not in word_freq:
                word_freq[word] = 1
            else:
                word_freq[word] += 1
    return word_freq

def score_sentences(sentences, word_freq):
    """Score sentences based on word frequency"""
    sentence_scores = {}
    for i, sentence in enumerate(sentences):
        words = tokenize_words(sentence)
        # Avoid division by zero for empty sentences
        if len(words) == 0:
            continue
        score = sum(word_freq.get(word, 0) for word in words) / len(words)
        sentence_scores[i] = score
    return sentence_scores

def generate_summary(text, num_sentences=5):
    """Generate summary by selecting top-scoring sentences"""
    # Tokenize text into sentences
    sentences = tokenize_sentences(text)

    # Handle case with fewer sentences than requested summary length
    if len(sentences) <= num_sentences:
        return ' '.join(sentences)

    # Calculate word frequency
    word_freq = calculate_word_frequency(sentences)

    # Score sentences
    sentence_scores = score_sentences(sentences, word_freq)

    # Get top-scoring sentence indices
    top_indices = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)[:num_sentences]

    # Sort indices to maintain original order
    top_indices.sort(key=lambda x: x[0])

    # Construct summary
    summary = ' '.join(sentences[idx] for idx, _ in top_indices)

    return summary

@app.route('/api/summarize', methods=['POST'])
def summarize_pdf():
    """API endpoint to summarize PDF"""
    print("\n\n===== Received summarize request =====")
    print(f"Request files: {list(request.files.keys()) if request.files else 'None'}")
    print(f"Request form: {dict(request.form) if request.form else 'None'}")

    if 'file' not in request.files:
        print("Error: No file part in request")
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    print(f"Received file: {file.filename}, size: {file.content_length if hasattr(file, 'content_length') else 'unknown'}")

    if file.filename == '':
        print("Error: Empty filename")
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.pdf'):
        # Save the uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        print(f"Saved file to {file_path}")

        try:
            # Extract text from PDF
            text = extract_text_from_pdf(file_path)
            print(f"Extracted text length: {len(text)} characters")

            # Get summary length from request or use default
            summary_length = int(request.form.get('summary_length', 5))
            print(f"Summary length: {summary_length} sentences")

            # Generate summary
            summary = generate_summary(text, summary_length)
            print(f"Generated summary length: {len(summary)} characters")

            # Clean up - remove the uploaded file
            os.remove(file_path)
            print(f"Removed temporary file: {file_path}")

            # Ensure the summary is not empty
            if not summary or len(summary.strip()) == 0:
                print("Warning: Generated summary is empty, using a portion of the original text")
                # Use the first few sentences of the original text as a fallback
                sentences = tokenize_sentences(text)
                if sentences:
                    summary = ' '.join(sentences[:min(5, len(sentences))])
                else:
                    # Last resort: use the first 500 characters
                    summary = text[:500] + "..."

            # Print the actual summary content for debugging
            print(f"Summary content (first 100 chars): {summary[:100]}...")

            response_data = {
                'original_text': text,
                'summary': summary,
                'original_length': len(text),
                'summary_length': len(summary)
            }

            print("Sending response with summary")
            response = jsonify(response_data)

            # Explicitly set content type
            response.headers['Content-Type'] = 'application/json'

            return response

        except Exception as e:
            # Clean up in case of error
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Removed temporary file due to error: {file_path}")

            error_message = str(e)
            print(f"Error processing PDF: {error_message}")
            import traceback
            print(traceback.format_exc())

            return jsonify({'error': error_message}), 500

    return jsonify({'error': 'Invalid file format. Please upload a PDF file.'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
