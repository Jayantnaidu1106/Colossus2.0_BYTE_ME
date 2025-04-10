from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "methods": "*"}})

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

# Load interview questions from JSON file
def load_questions():
    # Create questions directory if it doesn't exist
    if not os.path.exists('questions'):
        os.makedirs('questions')
    
    # Create default questions file if it doesn't exist
    default_questions_path = os.path.join('questions', 'default_questions.json')
    if not os.path.exists(default_questions_path):
        default_questions = {
            "general": [
                "Tell me about yourself.",
                "What are your strengths and weaknesses?",
                "Why do you want to work for this company?",
                "Where do you see yourself in 5 years?",
                "Describe a challenging situation you faced and how you handled it."
            ],
            "technical": [
                "Explain the difference between arrays and linked lists.",
                "What is object-oriented programming?",
                "How would you optimize a slow database query?",
                "Explain the concept of recursion with an example.",
                "What is the difference between HTTP and HTTPS?"
            ],
            "behavioral": [
                "Describe a time when you had to work with a difficult team member.",
                "Tell me about a project you're particularly proud of.",
                "How do you handle criticism?",
                "Describe your leadership style.",
                "How do you prioritize tasks when you have multiple deadlines?"
            ]
        }
        with open(default_questions_path, 'w') as f:
            json.dump(default_questions, f, indent=4)
    
    # Load questions from file
    try:
        with open(default_questions_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading questions: {e}")
        return {
            "general": ["Tell me about yourself."],
            "technical": ["What is your technical background?"],
            "behavioral": ["How do you handle challenges?"]
        }

# Initialize feedback responses
feedback_templates = {
    "positive": [
        "Great answer! You provided clear examples and demonstrated your skills effectively.",
        "Excellent response. You articulated your thoughts well and addressed the key points.",
        "Strong answer. You showed good understanding of the topic and communicated clearly.",
        "Very good! Your answer was structured well and you highlighted relevant experiences.",
        "Well done! You gave a comprehensive answer that effectively showcased your abilities."
    ],
    "neutral": [
        "Good start, but try to include more specific examples from your experience.",
        "Your answer covers the basics, but could benefit from more detail about your role.",
        "You made some good points, but consider structuring your answer with the STAR method (Situation, Task, Action, Result).",
        "Decent response. To improve, try to quantify your achievements with metrics or results.",
        "You addressed the question, but could elaborate more on how your skills apply to this role."
    ],
    "constructive": [
        "Try to be more specific with your examples and focus on your direct contributions.",
        "Consider keeping your answers more concise and focused on the most relevant points.",
        "Remember to highlight what you learned from challenging situations, not just what happened.",
        "Make sure to connect your experiences back to the job you're applying for.",
        "Work on eliminating filler words and pauses to sound more confident in your responses."
    ]
}

# API endpoint to start a new interview session
@app.route('/api/interview/start', methods=['POST'])
def start_interview():
    try:
        data = request.json
        interview_type = data.get('type', 'general')
        
        questions = load_questions()
        
        # Select questions based on interview type
        if interview_type == 'mixed':
            selected_questions = []
            for category in ['general', 'technical', 'behavioral']:
                selected_questions.extend(random.sample(questions.get(category, []), 
                                                      min(2, len(questions.get(category, [])))))
        else:
            selected_questions = random.sample(questions.get(interview_type, questions['general']), 
                                             min(5, len(questions.get(interview_type, questions['general']))))
        
        return jsonify({
            'success': True,
            'interview_id': random.randint(1000, 9999),
            'questions': selected_questions
        })
    except Exception as e:
        print(f"Error starting interview: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# API endpoint to get feedback on an answer
@app.route('/api/interview/feedback', methods=['POST'])
def get_feedback():
    try:
        data = request.json
        answer = data.get('answer', '')
        question = data.get('question', '')
        
        # Simple feedback logic based on answer length
        # In a real implementation, you would use NLP or an AI model here
        if len(answer) < 50:
            feedback_type = "constructive"
            score = random.randint(1, 3)
        elif len(answer) < 200:
            feedback_type = "neutral"
            score = random.randint(4, 7)
        else:
            feedback_type = "positive"
            score = random.randint(8, 10)
        
        feedback = random.choice(feedback_templates[feedback_type])
        
        # Add question-specific feedback
        if "yourself" in question.lower():
            feedback += " When introducing yourself, remember to keep it professional but personable."
        elif "strength" in question.lower() or "weakness" in question.lower():
            feedback += " For strengths and weaknesses, always show how you're working on improving."
        elif "technical" in question.lower() or "programming" in question.lower():
            feedback += " Technical questions should demonstrate both knowledge and practical experience."
        
        return jsonify({
            'success': True,
            'feedback': feedback,
            'score': score,
            'detailed_feedback': {
                'content': score if score > 5 else random.randint(1, 5),
                'delivery': random.randint(1, 10),
                'relevance': random.randint(1, 10)
            }
        })
    except Exception as e:
        print(f"Error generating feedback: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# API endpoint to end an interview and get overall feedback
@app.route('/api/interview/end', methods=['POST'])
def end_interview():
    try:
        data = request.json
        interview_id = data.get('interview_id', 0)
        scores = data.get('scores', [])
        
        # Calculate average score
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Generate overall feedback based on average score
        if avg_score < 4:
            overall_feedback = "You have some areas to improve. Focus on providing more specific examples and structuring your answers better."
        elif avg_score < 7:
            overall_feedback = "You did well overall. Continue practicing your interview skills and work on providing more detailed responses."
        else:
            overall_feedback = "Excellent job! Your responses were clear, detailed, and well-structured. You're well-prepared for real interviews."
        
        # Generate improvement tips
        improvement_tips = [
            "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.",
            "Research the company thoroughly before your interview.",
            "Prepare concise stories that highlight your achievements.",
            "Work on maintaining good eye contact and body language.",
            "Prepare thoughtful questions to ask the interviewer."
        ]
        
        return jsonify({
            'success': True,
            'interview_id': interview_id,
            'average_score': round(avg_score, 1),
            'overall_feedback': overall_feedback,
            'improvement_tips': random.sample(improvement_tips, 3)
        })
    except Exception as e:
        print(f"Error ending interview: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
