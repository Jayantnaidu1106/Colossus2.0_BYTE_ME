from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.cluster.util import cosine_distance
import numpy as np
import networkx as nx
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create upload folder if it doesn't exist
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Download NLTK resources
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)

    # Verify that the resources are available
    from nltk.tokenize import word_tokenize
    word_tokenize("Test sentence.")
    from nltk.corpus import stopwords
    stopwords.words('english')

    print("NLTK resources successfully loaded.")
except Exception as e:
    print(f"Error loading NLTK resources: {e}")
    print("Downloading additional NLTK resources...")
    nltk.download('all', quiet=True)  # Download all NLTK resources as a fallback

def extract_text_from_pdf(pdf_file_path):
    """Extract text from PDF file"""
    with open(pdf_file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text

def sentence_similarity(sent1, sent2, stopwords=None):
    """Calculate similarity between two sentences"""
    if stopwords is None:
        stopwords = []

    # Custom word tokenization function as a fallback
    def custom_tokenize(text):
        import re
        # Split on word boundaries and filter out non-word characters
        return [word.lower() for word in re.findall(r'\b\w+\b', text.lower())]

    # Try to use NLTK's word_tokenize, fall back to custom tokenization if it fails
    try:
        sent1_tokens = [word.lower() for word in word_tokenize(sent1)]
        sent2_tokens = [word.lower() for word in word_tokenize(sent2)]
    except Exception as e:
        print(f"Error in word tokenization: {e}")
        sent1_tokens = custom_tokenize(sent1)
        sent2_tokens = custom_tokenize(sent2)

    sent1 = sent1_tokens
    sent2 = sent2_tokens

    all_words = list(set(sent1 + sent2))

    vector1 = [0] * len(all_words)
    vector2 = [0] * len(all_words)

    # Build the vector for the first sentence
    for w in sent1:
        if w not in stopwords:
            vector1[all_words.index(w)] += 1

    # Build the vector for the second sentence
    for w in sent2:
        if w not in stopwords:
            vector2[all_words.index(w)] += 1

    # Calculate cosine similarity
    if sum(vector1) == 0 or sum(vector2) == 0:
        return 0.0
    return 1 - cosine_distance(vector1, vector2)

def build_similarity_matrix(sentences, stop_words):
    """Create similarity matrix among all sentences"""
    # Create an empty similarity matrix
    similarity_matrix = np.zeros((len(sentences), len(sentences)))

    for idx1 in range(len(sentences)):
        for idx2 in range(len(sentences)):
            if idx1 == idx2:  # Same sentences
                continue
            similarity_matrix[idx1][idx2] = sentence_similarity(sentences[idx1], sentences[idx2], stop_words)

    return similarity_matrix

def generate_summary(text, num_sentences=5):
    """Generate summary using TextRank algorithm"""
    # Tokenize the text into sentences
    try:
        sentences = sent_tokenize(text)
    except Exception as e:
        print(f"Error in sentence tokenization: {e}")
        # Fallback: split by periods, question marks, and exclamation points
        import re
        sentences = re.split(r'(?<=[.!?])(\s+)', text)
        # Filter out empty strings
        sentences = [s.strip() for s in sentences if s.strip()]

    # Handle case with fewer sentences than requested summary length
    if len(sentences) <= num_sentences:
        return ' '.join(sentences)

    # Get English stop words
    stop_words = stopwords.words('english')

    # Build similarity matrix
    sentence_similarity_matrix = build_similarity_matrix(sentences, stop_words)

    # Rank sentences using PageRank algorithm
    sentence_similarity_graph = nx.from_numpy_array(sentence_similarity_matrix)
    scores = nx.pagerank(sentence_similarity_graph)

    # Sort sentences by score and select top ones for summary
    ranked_sentences = sorted(((scores[i], s) for i, s in enumerate(sentences)), reverse=True)

    # Get the top N sentences for the summary
    summary_sentences = [ranked_sentences[i][1] for i in range(min(num_sentences, len(ranked_sentences)))]

    # Sort the selected sentences based on their original order in the text
    original_order = []
    for sentence in summary_sentences:
        original_order.append((sentences.index(sentence), sentence))

    original_order.sort()
    summary = ' '.join([sentence for _, sentence in original_order])

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
    app.run(host='0.0.0.0', port=5000, debug=True)
