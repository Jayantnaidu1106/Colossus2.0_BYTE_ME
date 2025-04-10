from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import random
import json
import os
import base64
import numpy as np
import time
import threading
import re
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "methods": "*"}})

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

# Create directories for storing data
def create_directories():
    directories = ['questions', 'recordings', 'frames']
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)

create_directories()

# Load interview questions from JSON file
def load_questions():
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

# Communication feedback templates
communication_feedback = {
    "eye_contact": {
        "good": "You maintained excellent eye contact throughout the interview, which conveys confidence and engagement.",
        "average": "Your eye contact was generally good, but try to maintain it more consistently throughout your responses.",
        "poor": "Work on improving your eye contact. Looking at the camera helps establish a connection with the interviewer."
    },
    "facial_expressions": {
        "good": "Your facial expressions were engaging and showed enthusiasm for the position.",
        "average": "Your facial expressions were appropriate, but could be more animated to show your interest and enthusiasm.",
        "poor": "Try to be more expressive during your interview. A neutral face can sometimes be interpreted as disinterest."
    },
    "speaking_pace": {
        "good": "Your speaking pace was excellent - clear, measured, and easy to follow.",
        "average": "Your speaking pace was generally good, but occasionally you spoke too quickly. Remember to pause between key points.",
        "poor": "Work on your speaking pace. Speaking too quickly can make it difficult for interviewers to follow your responses."
    },
    "voice_clarity": {
        "good": "Your voice was clear and well-modulated, making your answers easy to understand.",
        "average": "Your voice clarity was generally good, but sometimes your volume dropped. Maintain a consistent, clear voice.",
        "poor": "Focus on speaking more clearly and at a consistent volume to ensure your answers are fully understood."
    },
    "filler_words": {
        "good": "You used minimal filler words, which made your responses sound polished and well-prepared.",
        "average": "You occasionally used filler words like 'um' and 'uh'. Try to reduce these for more polished responses.",
        "poor": "Work on reducing filler words like 'um', 'uh', and 'like'. These can distract from your message and make you appear less confident."
    }
}

# Active interview sessions
active_sessions = {}

# Simulate AI analysis of video frames
def analyze_video_frame(frame_data):
    """
    Simulates AI analysis of a video frame to detect eye contact, facial expressions, etc.
    In a real implementation, this would use computer vision libraries like OpenCV and facial recognition.
    """
    # Simulate processing time
    time.sleep(0.1)

    # Generate random scores for demonstration purposes
    # In a real implementation, these would be calculated using AI models
    scores = {
        "eye_contact": random.uniform(0.5, 1.0),
        "facial_expressions": random.uniform(0.4, 0.9),
        "posture": random.uniform(0.6, 1.0),
        "engagement": random.uniform(0.5, 0.95)
    }

    return scores

# Simulate AI analysis of audio
def analyze_audio(audio_data):
    """
    Simulates AI analysis of audio to detect speaking pace, clarity, filler words, etc.
    In a real implementation, this would use speech recognition and NLP libraries.
    """
    # Simulate processing time
    time.sleep(0.1)

    # Generate random scores for demonstration purposes
    # In a real implementation, these would be calculated using AI models
    scores = {
        "speaking_pace": random.uniform(0.6, 0.95),
        "voice_clarity": random.uniform(0.5, 0.9),
        "filler_words": random.uniform(0.4, 0.85),
        "tone": random.uniform(0.5, 0.9)
    }

    return scores

# Function to save frame data (for demonstration purposes)
def save_frame(session_id, question_idx, frame_data):
    """Save a base64 encoded frame to disk"""
    try:
        # Create directory for this session if it doesn't exist
        session_dir = os.path.join('frames', str(session_id))
        if not os.path.exists(session_dir):
            os.makedirs(session_dir)

        # Save frame
        frame_path = os.path.join(session_dir, f"q{question_idx}_{int(time.time())}.txt")
        with open(frame_path, 'w') as f:
            # In a real implementation, you would decode and save as an image
            # Here we just save a placeholder to avoid large files
            f.write(f"Frame data placeholder for session {session_id}, question {question_idx}")

        return True
    except Exception as e:
        print(f"Error saving frame: {e}")
        return False

# Function to save audio data (for demonstration purposes)
def save_audio(session_id, question_idx, audio_data):
    """Save audio data to disk"""
    try:
        # Create directory for this session if it doesn't exist
        session_dir = os.path.join('recordings', str(session_id))
        if not os.path.exists(session_dir):
            os.makedirs(session_dir)

        # Save audio
        audio_path = os.path.join(session_dir, f"q{question_idx}_{int(time.time())}.txt")
        with open(audio_path, 'w') as f:
            # In a real implementation, you would decode and save as an audio file
            # Here we just save a placeholder to avoid large files
            f.write(f"Audio data placeholder for session {session_id}, question {question_idx}")

        return True
    except Exception as e:
        print(f"Error saving audio: {e}")
        return False

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

        # Generate a unique session ID
        session_id = random.randint(1000, 9999)

        # Initialize session data
        active_sessions[session_id] = {
            'type': interview_type,
            'questions': selected_questions,
            'answers': [None] * len(selected_questions),
            'feedback': [None] * len(selected_questions),
            'communication_scores': [None] * len(selected_questions),
            'start_time': datetime.now().isoformat(),
            'last_activity': datetime.now().isoformat()
        }

        return jsonify({
            'success': True,
            'interview_id': session_id,
            'questions': selected_questions
        })
    except Exception as e:
        print(f"Error starting interview: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# API endpoint to process video frame
@app.route('/api/interview/process-frame', methods=['POST'])
def process_frame():
    try:
        data = request.json
        session_id = data.get('session_id')
        question_idx = data.get('question_idx', 0)
        frame_data = data.get('frame_data', '')  # Base64 encoded image

        if not session_id or session_id not in active_sessions:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired session ID'
            }), 400

        # Update last activity timestamp
        active_sessions[session_id]['last_activity'] = datetime.now().isoformat()

        # Save frame for analysis (in a real implementation)
        save_frame(session_id, question_idx, frame_data)

        # Analyze frame
        frame_scores = analyze_video_frame(frame_data)

        # Store or update communication scores
        if active_sessions[session_id]['communication_scores'][question_idx] is None:
            active_sessions[session_id]['communication_scores'][question_idx] = {
                'video': frame_scores,
                'audio': None
            }
        else:
            active_sessions[session_id]['communication_scores'][question_idx]['video'] = frame_scores

        return jsonify({
            'success': True,
            'scores': frame_scores
        })
    except Exception as e:
        print(f"Error processing frame: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# API endpoint to process audio
@app.route('/api/interview/process-audio', methods=['POST'])
def process_audio():
    try:
        data = request.json
        session_id = data.get('session_id')
        question_idx = data.get('question_idx', 0)
        audio_data = data.get('audio_data', '')  # Base64 encoded audio

        if not session_id or session_id not in active_sessions:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired session ID'
            }), 400

        # Update last activity timestamp
        active_sessions[session_id]['last_activity'] = datetime.now().isoformat()

        # Save audio for analysis (in a real implementation)
        save_audio(session_id, question_idx, audio_data)

        # Analyze audio
        audio_scores = analyze_audio(audio_data)

        # Store or update communication scores
        if active_sessions[session_id]['communication_scores'][question_idx] is None:
            active_sessions[session_id]['communication_scores'][question_idx] = {
                'video': None,
                'audio': audio_scores
            }
        else:
            active_sessions[session_id]['communication_scores'][question_idx]['audio'] = audio_scores

        return jsonify({
            'success': True,
            'scores': audio_scores
        })
    except Exception as e:
        print(f"Error processing audio: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# API endpoint to get feedback on an answer with communication analysis
@app.route('/api/interview/feedback', methods=['POST'])
def get_feedback():
    try:
        data = request.json
        session_id = data.get('session_id')
        question_idx = data.get('question_idx', 0)
        answer = data.get('answer', '')
        question = data.get('question', '')
        video_data = data.get('video_data', {})  # Aggregated video analysis data
        audio_data = data.get('audio_data', {})  # Aggregated audio analysis data

        if not session_id or session_id not in active_sessions:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired session ID'
            }), 400

        # Update last activity timestamp
        active_sessions[session_id]['last_activity'] = datetime.now().isoformat()

        # Store the answer
        active_sessions[session_id]['answers'][question_idx] = answer

        # Content feedback logic based on answer length and quality
        # Improved scoring algorithm with more nuanced ranges
        answer_length = len(answer)

        # Base score calculation
        if answer_length < 20:  # Very short answer
            feedback_type = "constructive"
            content_score = random.uniform(5.0, 6.5)  # Higher minimum score
        elif answer_length < 50:  # Short answer
            feedback_type = "constructive"
            content_score = random.uniform(6.0, 7.5)
        elif answer_length < 100:  # Brief answer
            feedback_type = "neutral"
            content_score = random.uniform(7.0, 8.0)
        elif answer_length < 200:  # Moderate answer
            feedback_type = "neutral"
            content_score = random.uniform(7.5, 8.5)
        else:  # Detailed answer
            feedback_type = "positive"
            content_score = random.uniform(8.0, 9.5)

        # Round to one decimal place
        content_score = round(content_score, 1)

        content_feedback = random.choice(feedback_templates[feedback_type])

        # Add question-specific feedback
        if "yourself" in question.lower():
            content_feedback += " When introducing yourself, remember to keep it professional but personable."
        elif "strength" in question.lower() or "weakness" in question.lower():
            content_feedback += " For strengths and weaknesses, always show how you're working on improving."
        elif "technical" in question.lower() or "programming" in question.lower():
            content_feedback += " Technical questions should demonstrate both knowledge and practical experience."

        # Communication feedback based on video and audio analysis
        # In a real implementation, these would be calculated from actual analysis
        eye_contact_score = video_data.get('eye_contact', random.uniform(0.5, 1.0))
        facial_expressions_score = video_data.get('facial_expressions', random.uniform(0.4, 0.9))
        speaking_pace_score = audio_data.get('speaking_pace', random.uniform(0.6, 0.95))
        voice_clarity_score = audio_data.get('voice_clarity', random.uniform(0.5, 0.9))
        filler_words_score = audio_data.get('filler_words', random.uniform(0.4, 0.85))

        # Generate communication feedback
        comm_feedback = []

        # Eye contact feedback
        if eye_contact_score > 0.8:
            comm_feedback.append(communication_feedback["eye_contact"]["good"])
        elif eye_contact_score > 0.5:
            comm_feedback.append(communication_feedback["eye_contact"]["average"])
        else:
            comm_feedback.append(communication_feedback["eye_contact"]["poor"])

        # Facial expressions feedback
        if facial_expressions_score > 0.8:
            comm_feedback.append(communication_feedback["facial_expressions"]["good"])
        elif facial_expressions_score > 0.5:
            comm_feedback.append(communication_feedback["facial_expressions"]["average"])
        else:
            comm_feedback.append(communication_feedback["facial_expressions"]["poor"])

        # Speaking pace feedback
        if speaking_pace_score > 0.8:
            comm_feedback.append(communication_feedback["speaking_pace"]["good"])
        elif speaking_pace_score > 0.5:
            comm_feedback.append(communication_feedback["speaking_pace"]["average"])
        else:
            comm_feedback.append(communication_feedback["speaking_pace"]["poor"])

        # Voice clarity feedback
        if voice_clarity_score > 0.8:
            comm_feedback.append(communication_feedback["voice_clarity"]["good"])
        elif voice_clarity_score > 0.5:
            comm_feedback.append(communication_feedback["voice_clarity"]["average"])
        else:
            comm_feedback.append(communication_feedback["voice_clarity"]["poor"])

        # Filler words feedback
        if filler_words_score > 0.8:
            comm_feedback.append(communication_feedback["filler_words"]["good"])
        elif filler_words_score > 0.5:
            comm_feedback.append(communication_feedback["filler_words"]["average"])
        else:
            comm_feedback.append(communication_feedback["filler_words"]["poor"])

        # Select 2 random communication feedback items to avoid overwhelming the user
        selected_comm_feedback = random.sample(comm_feedback, min(2, len(comm_feedback)))

        # Calculate overall communication score with weighted components
        # Give more weight to eye contact and facial expressions
        communication_score = round((
            eye_contact_score * 2.5 +  # Higher weight for eye contact
            facial_expressions_score * 2.0 +  # Higher weight for facial expressions
            speaking_pace_score * 1.8 +
            voice_clarity_score * 1.8 +
            filler_words_score * 1.9
        ) / 10.0 * 10, 1)  # Scale to 0-10

        # Ensure communication score is never below 5.0 for better user experience
        communication_score = max(communication_score, 5.0)

        # Calculate overall score with higher weight on communication (60%)
        overall_score = round(content_score * 0.4 + communication_score * 0.6, 1)

        # Store feedback
        feedback_data = {
            'content_feedback': content_feedback,
            'communication_feedback': selected_comm_feedback,
            'content_score': content_score,
            'communication_score': communication_score,
            'overall_score': overall_score,
            'detailed_scores': {
                'content': content_score,
                'eye_contact': round(eye_contact_score * 10, 1),
                'facial_expressions': round(facial_expressions_score * 10, 1),
                'speaking_pace': round(speaking_pace_score * 10, 1),
                'voice_clarity': round(voice_clarity_score * 10, 1),
                'filler_words': round(filler_words_score * 10, 1)
            }
        }

        active_sessions[session_id]['feedback'][question_idx] = feedback_data

        return jsonify({
            'success': True,
            'content_feedback': content_feedback,
            'communication_feedback': selected_comm_feedback,
            'overall_score': overall_score,
            'content_score': content_score,
            'communication_score': communication_score,
            'detailed_scores': {
                'content': content_score,
                'eye_contact': round(eye_contact_score * 10, 1),
                'facial_expressions': round(facial_expressions_score * 10, 1),
                'speaking_pace': round(speaking_pace_score * 10, 1),
                'voice_clarity': round(voice_clarity_score * 10, 1),
                'filler_words': round(filler_words_score * 10, 1)
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
        session_id = data.get('session_id')

        if not session_id or session_id not in active_sessions:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired session ID'
            }), 400

        session_data = active_sessions[session_id]

        # Calculate average scores
        content_scores = []
        communication_scores = []
        overall_scores = []

        for feedback in session_data['feedback']:
            if feedback:
                content_scores.append(feedback['content_score'])
                communication_scores.append(feedback['communication_score'])
                overall_scores.append(feedback['overall_score'])

        # Ensure we have valid scores even if no feedback was provided
        avg_content_score = sum(content_scores) / len(content_scores) if content_scores else 7.5
        avg_communication_score = sum(communication_scores) / len(communication_scores) if communication_scores else 8.5
        avg_overall_score = sum(overall_scores) / len(overall_scores) if overall_scores else 8.0

        # Generate overall content feedback based on average score
        if avg_content_score < 4:
            content_feedback = "Your answers need improvement. Focus on providing more specific examples and structuring your responses better."
        elif avg_content_score < 7:
            content_feedback = "Your answers were generally good. Continue practicing and work on providing more detailed responses."
        else:
            content_feedback = "Your answers were excellent! They were clear, detailed, and well-structured."

        # Generate overall communication feedback
        if avg_communication_score < 4:
            communication_feedback = "Your communication skills need improvement. Focus on maintaining eye contact, speaking clearly, and reducing filler words."
        elif avg_communication_score < 7:
            communication_feedback = "Your communication was generally good. Continue practicing your delivery and body language."
        else:
            communication_feedback = "Your communication skills were excellent! You presented yourself professionally and confidently."

        # Generate improvement tips
        content_tips = [
            "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.",
            "Research the company thoroughly before your interview.",
            "Prepare concise stories that highlight your achievements.",
            "Focus on quantifiable results and specific examples.",
            "Tailor your answers to the specific job requirements."
        ]

        communication_tips = [
            "Practice maintaining eye contact with the camera during video interviews.",
            "Record yourself answering questions to identify areas for improvement.",
            "Work on reducing filler words like 'um', 'uh', and 'like'.",
            "Practice speaking at a moderate pace - not too fast or too slow.",
            "Pay attention to your facial expressions and body language."
        ]

        # Select tips based on scores
        selected_content_tips = random.sample(content_tips, min(2, len(content_tips)))
        selected_communication_tips = random.sample(communication_tips, min(2, len(communication_tips)))

        # Combine tips
        all_tips = selected_content_tips + selected_communication_tips

        # Store end time
        session_data['end_time'] = datetime.now().isoformat()

        # Calculate detailed scores
        detailed_scores = {
            'eye_contact': 0,
            'facial_expressions': 0,
            'speaking_pace': 0,
            'voice_clarity': 0,
            'filler_words': 0
        }

        # Track the lowest scores to identify weak areas
        lowest_scores = {
            'eye_contact': 10,
            'facial_expressions': 10,
            'speaking_pace': 10,
            'voice_clarity': 10,
            'filler_words': 10
        }

        count = 0
        for feedback in session_data['feedback']:
            if feedback and 'detailed_scores' in feedback:
                for key in detailed_scores:
                    if key in feedback['detailed_scores']:
                        score_value = feedback['detailed_scores'][key]
                        detailed_scores[key] += score_value
                        # Track the lowest score for each metric
                        if score_value < lowest_scores[key]:
                            lowest_scores[key] = score_value
                count += 1

        # Default scores if no feedback was provided
        if count == 0:
            detailed_scores = {
                'eye_contact': 8.5,
                'facial_expressions': 8.7,
                'speaking_pace': 7.8,
                'voice_clarity': 8.2,
                'filler_words': 7.5
            }
        else:
            for key in detailed_scores:
                detailed_scores[key] = round(detailed_scores[key] / count, 1)

        # Identify weak areas (scores below 8.0)
        weak_areas = []
        for key, value in detailed_scores.items():
            if value < 8.0:
                weak_areas.append(key)

        # If no weak areas found, identify the relatively weakest areas
        if not weak_areas and count > 0:
            # Find the two lowest scoring areas
            sorted_scores = sorted(detailed_scores.items(), key=lambda x: x[1])
            weak_areas = [item[0] for item in sorted_scores[:2]]

        # Generate specific feedback for weak areas
        weak_area_feedback = []
        for area in weak_areas:
            if area == 'eye_contact':
                weak_area_feedback.append("Your eye contact needs improvement. Try to look directly at the camera more consistently during video interviews.")
            elif area == 'facial_expressions':
                weak_area_feedback.append("Your facial expressions could be more engaging. Practice showing interest and enthusiasm through your expressions.")
            elif area == 'speaking_pace':
                weak_area_feedback.append("Your speaking pace needs adjustment. Practice speaking at a moderate, steady pace - not too fast or too slow.")
            elif area == 'voice_clarity':
                weak_area_feedback.append("Your voice clarity could be improved. Focus on speaking clearly and at an appropriate volume.")
            elif area == 'filler_words':
                weak_area_feedback.append("You use too many filler words (like 'um', 'uh', 'like'). Practice pausing instead of using these words.")

        response_data = {
            'success': True,
            'interview_id': session_id,
            'content_score': round(avg_content_score, 1),
            'communication_score': round(avg_communication_score, 1),
            'overall_score': round(avg_overall_score, 1),
            'content_feedback': content_feedback,
            'communication_feedback': communication_feedback,
            'improvement_tips': all_tips,
            'detailed_scores': detailed_scores,
            'weak_areas': weak_areas,
            'weak_area_feedback': weak_area_feedback
        }

        # In a real implementation, you might want to store the session data in a database
        # before removing it from memory

        # For demonstration purposes, we'll keep the session data in memory
        # active_sessions.pop(session_id, None)

        return jsonify(response_data)
    except Exception as e:
        print(f"Error ending interview: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Cleanup thread to remove old sessions
def cleanup_old_sessions():
    while True:
        try:
            current_time = datetime.now()
            sessions_to_remove = []

            for session_id, session_data in active_sessions.items():
                last_activity = datetime.fromisoformat(session_data['last_activity'])
                # Remove sessions inactive for more than 1 hour
                if (current_time - last_activity).total_seconds() > 3600:
                    sessions_to_remove.append(session_id)

            for session_id in sessions_to_remove:
                active_sessions.pop(session_id, None)
                print(f"Removed inactive session: {session_id}")

            # Check every 10 minutes
            time.sleep(600)
        except Exception as e:
            print(f"Error in cleanup thread: {e}")
            time.sleep(600)

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_old_sessions, daemon=True)
cleanup_thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True)
