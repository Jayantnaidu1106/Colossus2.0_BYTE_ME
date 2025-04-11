from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Create upload folder if it doesn't exist
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def extract_text_from_pdf(file_path):
    """Simple function to extract text from PDF"""
    try:
        # Try to use PyPDF2 if available
        try:
            import PyPDF2
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except ImportError:
            # If PyPDF2 is not available, return a placeholder
            return "PDF text extraction not available. Please install PyPDF2."
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def generate_summary(text, num_sentences=5):
    """Generate a simple summary by taking the first few sentences"""
    # Split text into sentences (simple approach)
    sentences = text.replace('\n', ' ').split('. ')
    # Take the first num_sentences sentences as a summary
    summary = '. '.join(sentences[:num_sentences]) + '.'
    return summary

@app.route('/api/summarize', methods=['POST'])
def summarize_pdf():
    """API endpoint to summarize PDF"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.pdf'):
        # Save the uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            # Extract text from PDF
            text = extract_text_from_pdf(file_path)

            # Get summary length from request or use default
            summary_length = int(request.form.get('summary_length', 5))

            # Generate summary
            summary = generate_summary(text, summary_length)

            # Clean up - remove the uploaded file
            os.remove(file_path)

            return jsonify({
                'original_text': text,
                'summary': summary,
                'original_length': len(text),
                'summary_length': len(summary)
            })
        except Exception as e:
            # Clean up in case of error
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file format. Please upload a PDF file.'}), 400

if __name__ == '__main__':
    print("Starting PDF Summarizer Flask server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
