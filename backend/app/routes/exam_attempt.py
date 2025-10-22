from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.exam import Exam
from app.models.exam_attempt import ExamAttempt
from app import db
from datetime import datetime, timezone

exam_attempt_bp = Blueprint('exam_attempt', __name__)

@exam_attempt_bp.route('/exam-attempts', methods=['GET'])
@jwt_required()
def get_user_exam_attempts():
    """Get all exam attempts for the current user"""
    try:
        user_id = get_jwt_identity()
        
        # Get all exam attempts for this user, ordered by most recent first
        attempts = ExamAttempt.query.filter_by(user_id=int(user_id)).order_by(ExamAttempt.created_at.desc()).all()
        
        return jsonify({
            'exam_attempts': [attempt.to_dict() for attempt in attempts]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get exam attempts'}), 500

@exam_attempt_bp.route('/exam-attempts/<int:attempt_id>', methods=['GET'])
@jwt_required()
def get_exam_attempt_details(attempt_id):
    """Get detailed exam attempt with questions and answers"""
    try:
        user_id = get_jwt_identity()
        
        # Get the exam attempt and ensure it belongs to the current user
        attempt = ExamAttempt.query.filter_by(id=attempt_id, user_id=int(user_id)).first()
        if not attempt:
            return jsonify({'error': 'Exam attempt not found'}), 404
        
        # Get the exam and its questions
        exam = Exam.query.get(attempt.exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Generate 50 generic questions for display
        questions_data = []
        user_answers = attempt.user_answers or {}
        
        for i in range(1, 51):
            question_dict = {
                'id': i,
                'question_text': f'Question {i}: Select the correct answer.',
                'question_type': 'multiple_choice',
                'subject': 'English' if i <= 25 else 'Maths',
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'marks': 1,
                'user_answer': user_answers.get(str(i), None)
            }
            questions_data.append(question_dict)
        
        return jsonify({
            'attempt': attempt.to_dict(),
            'exam': exam.to_dict(),
            'questions': questions_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get exam attempt details'}), 500


@exam_attempt_bp.route('/submit-graded-exam/<int:exam_id>', methods=['POST'])
@jwt_required()
def submit_graded_exam(exam_id):
    """Submit a graded exam (user enters their answers and gets results)"""
    try:
        user_id = get_jwt_identity()
        
        # Check if exam exists and is active
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        if not exam.is_active:
            return jsonify({'error': 'Exam is not active'}), 400
        
        # Get submitted answers
        data = request.get_json()
        if not data or 'answers' not in data:
            return jsonify({'error': 'Answers are required'}), 400
        
        user_answers = data['answers']
        
        # Get exam and calculate score
        exam = Exam.query.get(exam_id)
        if not exam or not exam.answers:
            return jsonify({'error': 'Exam has no answers configured'}), 400
        
        total_questions = 50
        total_marks = 50
        total_score = 0
        
        # Calculate score by comparing user answers with exam answers
        for i in range(50):
            question_id = str(i + 1)
            user_answer = user_answers.get(question_id)
            correct_answer = exam.answers[i] if i < len(exam.answers) else None
            
            if user_answer and correct_answer and user_answer == correct_answer:
                total_score += 1
        
        # Create exam attempt record
        attempt = ExamAttempt(
            user_id=int(user_id),
            exam_id=exam_id,
            total_questions=total_questions,
            total_marks=total_marks,
            score=total_score,
            status='completed',
            user_answers=user_answers,
            completed_at=datetime.now(timezone.utc)
        )
        
        db.session.add(attempt)
        db.session.commit()
        
        # Calculate percentage
        score_percentage = round((total_score / total_marks) * 100, 1) if total_marks > 0 else 0
        
        return jsonify({
            'message': 'Exam graded successfully',
            'score': total_score,
            'total_marks': total_marks,
            'score_percentage': score_percentage,
            'total_questions': total_questions,
            'attempt_id': attempt.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to grade exam'}), 500
