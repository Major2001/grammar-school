from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.exam import Exam
from app.models.question import Question
from app import db

questions_bp = Blueprint('questions', __name__)

def require_admin():
    """Helper function to check if current user is admin"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or not user.is_admin:
        return None
    return user

# ============================================================================
# QUESTION MANAGEMENT ROUTES (Admin only)
# ============================================================================

@questions_bp.route('/questions', methods=['GET'])
@jwt_required()
def get_questions():
    """
    Get all questions, optionally filtered by exam_id
    Query params:
    - exam_id: Filter questions by exam ID
    """
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exam_id = request.args.get('exam_id', type=int)
        
        # Build query
        query = Question.query
        
        if exam_id:
            # Check if exam exists
            exam = Exam.query.get(exam_id)
            if not exam:
                return jsonify({'error': 'Exam not found'}), 404
            
            query = query.filter_by(exam_id=exam_id)
        
        # Get questions
        questions = query.order_by(Question.id).all()
        
        response = {
            'questions': [q.to_dict() for q in questions],
            'count': len(questions)
        }
        
        # Include exam info if filtered by exam
        if exam_id:
            response['exam'] = exam.to_dict()
        
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch questions'}), 500

@questions_bp.route('/questions', methods=['POST'])
@jwt_required()
def add_questions():
    """
    Add questions to an exam (admin only)
    Request body must include:
    - exam_id: ID of the exam
    - questions: List of question objects
    """
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        exam_id = data.get('exam_id')
        if not exam_id:
            return jsonify({'error': 'exam_id is required'}), 400
        
        # Check if exam exists
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        if 'questions' not in data:
            return jsonify({'error': 'Questions data is required'}), 400
        
        questions_data = data['questions']
        if not isinstance(questions_data, list):
            return jsonify({'error': 'Questions must be a list'}), 400
        
        added_questions = []
        for q_data in questions_data:
            # Validate required fields
            if not q_data.get('question_text'):
                continue
            
            question = Question(
                exam_id=exam_id,
                question_text=q_data.get('question_text'),
                question_type=q_data.get('question_type', 'multiple_choice'),
                subject=q_data.get('subject', 'General'),
                question_context=q_data.get('question_context'),
                difficulty=q_data.get('difficulty', 'medium'),
                marks=q_data.get('marks', 1),
                diagram_path=q_data.get('diagram_path'),
                options=q_data.get('options'),
                correct_answer=q_data.get('correct_answer')
            )
            
            db.session.add(question)
            added_questions.append(question)
        
        db.session.commit()
        
        return jsonify({
            'message': f'{len(added_questions)} questions added successfully',
            'questions': [q.to_dict() for q in added_questions]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add questions: {str(e)}'}), 500

@questions_bp.route('/questions/<int:question_id>', methods=['GET'])
@jwt_required()
def get_question(question_id):
    """Get a specific question (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        return jsonify({
            'question': question.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch question'}), 500

@questions_bp.route('/questions/<int:question_id>', methods=['PATCH'])
@jwt_required()
def update_question(question_id):
    """Update a question (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        # Get the question
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields if provided
        updated_fields = []
        
        if 'question_text' in data:
            question.question_text = data['question_text']
            updated_fields.append('question_text')
        if 'question_type' in data:
            question.question_type = data['question_type']
            updated_fields.append('question_type')
        if 'subject' in data:
            question.subject = data['subject']
            updated_fields.append('subject')
        if 'question_context' in data:
            question.question_context = data['question_context']
            updated_fields.append('question_context')
        if 'difficulty' in data:
            question.difficulty = data['difficulty']
            updated_fields.append('difficulty')
        if 'marks' in data:
            question.marks = data['marks']
            updated_fields.append('marks')
        if 'diagram_path' in data:
            question.diagram_path = data['diagram_path']
            updated_fields.append('diagram_path')
        if 'options' in data:
            question.options = data['options']
            updated_fields.append('options')
        if 'correct_answer' in data:
            question.correct_answer = data['correct_answer']
            updated_fields.append('correct_answer')
        
        if not updated_fields:
            return jsonify({'error': 'No valid fields provided'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Question updated successfully',
            'updated_fields': updated_fields,
            'question': question.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update question: {str(e)}'}), 500

@questions_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(question_id):
    """Delete a question (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        # Get the question
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        db.session.delete(question)
        db.session.commit()
        
        return jsonify({
            'message': 'Question deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete question: {str(e)}'}), 500

