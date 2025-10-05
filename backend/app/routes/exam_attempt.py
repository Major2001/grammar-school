from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.exam import Exam
from app.models.exam_attempt import ExamAttempt
from app.models.question import Question
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
        
        # Get all questions for this exam
        questions = Question.query.filter_by(exam_id=exam.id).order_by(Question.id).all()
        
        # Prepare questions data with user answers
        questions_data = []
        user_answers = attempt.user_answers or {}
        
        for question in questions:
            question_dict = question.to_dict()
            question_dict['user_answer'] = user_answers.get(str(question.id), None)
            questions_data.append(question_dict)
        
        return jsonify({
            'attempt': attempt.to_dict(),
            'exam': exam.to_dict(),
            'questions': questions_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get exam attempt details'}), 500

@exam_attempt_bp.route('/start-exam/<int:exam_id>', methods=['POST'])
@jwt_required()
def start_exam(exam_id):
    """Start a new exam attempt"""
    try:
        user_id = get_jwt_identity()
        
        # Check if exam exists and is active
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        if not exam.is_active:
            return jsonify({'error': 'Exam is not active'}), 400
        
        # Get questions and calculate total marks
        questions = Question.query.filter_by(exam_id=exam_id).all()
        if not questions:
            return jsonify({'error': 'Exam has no questions'}), 400
        
        question_count = len(questions)
        total_marks = sum(getattr(q, 'marks', 1) for q in questions)  # Default to 1 if marks not set
        
        # Check if user has an in-progress attempt
        existing_attempt = ExamAttempt.query.filter_by(
            user_id=int(user_id),
            exam_id=exam_id,
            status='in_progress'
        ).first()
        
        if existing_attempt:
            return jsonify({
                'message': 'Exam attempt already in progress',
                'attempt': existing_attempt.to_dict()
            }), 200
        
        # Create new exam attempt
        attempt = ExamAttempt(
            user_id=int(user_id),
            exam_id=exam_id,
            total_questions=question_count,
            total_marks=total_marks,
            status='in_progress'
        )
        
        db.session.add(attempt)
        db.session.commit()
        
        return jsonify({
            'message': 'Exam started successfully',
            'attempt': attempt.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to start exam'}), 500

@exam_attempt_bp.route('/submit-exam/<int:attempt_id>', methods=['POST'])
@jwt_required()
def submit_exam(attempt_id):
    """Submit an exam attempt with answers"""
    try:
        user_id = get_jwt_identity()
        
        # Get the exam attempt and ensure it belongs to the current user
        attempt = ExamAttempt.query.filter_by(id=attempt_id, user_id=int(user_id)).first()
        if not attempt:
            return jsonify({'error': 'Exam attempt not found'}), 404
        
        if attempt.status != 'in_progress':
            return jsonify({'error': 'Exam attempt is not in progress'}), 400
        
        # Get submitted answers
        data = request.get_json()
        if not data or 'answers' not in data:
            return jsonify({'error': 'Answers are required'}), 400
        
        user_answers = data['answers']
        
        # Get questions and calculate score
        questions = Question.query.filter_by(exam_id=attempt.exam_id).all()
        total_score = 0
        
        for question in questions:
            user_answer = user_answers.get(str(question.id))
            if user_answer and user_answer == question.correct_answer:
                total_score += getattr(question, 'marks', 1)
        
        # Update the attempt
        attempt.user_answers = user_answers
        attempt.score = total_score
        attempt.status = 'completed'
        attempt.completed_at = datetime.now(timezone.utc)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Exam submitted successfully',
            'attempt': attempt.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to submit exam'}), 500
