from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models.user import User
from app.models.exam import Exam
from app.models.question import Question
from app import db
import os
import uuid

admin_bp = Blueprint('admin', __name__)

def require_admin():
    """Check if current user is admin"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or not user.is_admin:
        return None
    return user

@admin_bp.route('/exams', methods=['GET'])
@jwt_required()
def get_exams():
    """Get all exams (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exams = Exam.query.order_by(Exam.created_at.desc()).all()
        return jsonify({
            'exams': [exam.to_dict() for exam in exams]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch exams'}), 500

@admin_bp.route('/exams', methods=['POST'])
@jwt_required()
def create_exam():
    """Create a new exam (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        
        if not title:
            return jsonify({'error': 'Exam title is required'}), 400
        
        # Create exam record
        exam = Exam(
            title=title,
            description=description,
            created_by=admin_user.id
        )
        
        db.session.add(exam)
        db.session.commit()
        
        return jsonify({
            'message': 'Exam created successfully',
            'exam': exam.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create exam'}), 500

@admin_bp.route('/exams/<int:exam_id>', methods=['GET'])
@jwt_required()
def get_exam(exam_id):
    """Get specific exam details (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        return jsonify({
            'exam': exam.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch exam'}), 500

@admin_bp.route('/exams/<int:exam_id>', methods=['DELETE'])
@jwt_required()
def delete_exam(exam_id):
    """Delete a exam (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Delete from database
        db.session.delete(exam)
        db.session.commit()
        
        return jsonify({
            'message': 'Exam deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete exam'}), 500

@admin_bp.route('/exams/<int:exam_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_exam_status(exam_id):
    """Toggle exam active status (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        exam.is_active = not exam.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'Exam {"activated" if exam.is_active else "deactivated"} successfully',
            'exam': exam.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update exam status'}), 500

@admin_bp.route('/exams/<int:exam_id>/questions', methods=['POST'])
@jwt_required()
def add_questions_to_exam(exam_id):
    """Add questions to a exam via JSON input (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        data = request.get_json()
        if not data or 'questions' not in data:
            return jsonify({'error': 'Questions array is required'}), 400
        
        questions_data = data['questions']
        if not isinstance(questions_data, list):
            return jsonify({'error': 'Questions must be an array'}), 400
        
        created_questions = []
        
        for question_data in questions_data:
            # Validate required fields
            required_fields = ['question_text', 'question_type', 'subject']
            for field in required_fields:
                if field not in question_data:
                    return jsonify({'error': f'Missing required field: {field}'}), 400
            
            # Create question
            question = Question(
                exam_id=exam_id,
                question_text=question_data['question_text'],
                question_type=question_data['question_type'],
                subject=question_data['subject'],
                question_context=question_data.get('question_context'),
                difficulty=question_data.get('difficulty'),
                marks=question_data.get('marks', 1),  # Default to 1 mark
                diagram_path=question_data.get('diagram_path'),
                options=question_data.get('options'),
                correct_answer=question_data.get('correct_answer')
            )
            
            db.session.add(question)
            created_questions.append(question)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully added {len(created_questions)} questions',
            'questions_count': len(created_questions),
            'questions': [q.to_dict() for q in created_questions]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add questions: {str(e)}'}), 500

@admin_bp.route('/exams/<int:exam_id>/questions', methods=['GET'])
@jwt_required()
def get_exam_questions(exam_id):
    """Get all questions for a specific exam (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        questions = Question.query.filter_by(exam_id=exam_id).order_by(Question.id).all()
        
        return jsonify({
            'exam': exam.to_dict(),
            'questions': [question.to_dict() for question in questions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch questions'}), 500

@admin_bp.route('/questions/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_question(question_id):
    """Update a specific question (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update question fields
        if 'question_text' in data:
            question.question_text = data['question_text']
        if 'question_type' in data:
            question.question_type = data['question_type']
        if 'subject' in data:
            question.subject = data['subject']
        if 'question_context' in data:
            question.question_context = data['question_context']
        if 'difficulty' in data:
            question.difficulty = data['difficulty']
        if 'diagram_path' in data:
            question.diagram_path = data['diagram_path']
        if 'options' in data:
            question.options = data['options']
        if 'correct_answer' in data:
            question.correct_answer = data['correct_answer']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Question updated successfully',
            'question': question.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update question'}), 500

@admin_bp.route('/exams/<int:exam_id>/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(exam_id, question_id):
    """Delete a specific question (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        # Check if exam exists
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Check if question exists and belongs to the exam
        question = Question.query.filter_by(id=question_id, exam_id=exam_id).first()
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        # Delete the question
        db.session.delete(question)
        db.session.commit()
        
        return jsonify({
            'message': 'Question deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete question: {str(e)}'}), 500

@admin_bp.route('/upload-diagram', methods=['POST'])
@jwt_required()
def upload_diagram():
    """Upload a diagram image for questions (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, svg, webp'}), 400
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'diagrams')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Return the URL path
        diagram_url = f"/api/admin/diagrams/{unique_filename}"
        
        return jsonify({
            'message': 'Diagram uploaded successfully',
            'diagram_path': diagram_url,
            'filename': unique_filename
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to upload diagram: {str(e)}'}), 500

@admin_bp.route('/diagrams/<filename>')
def serve_diagram(filename):
    """Serve uploaded diagram files"""
    try:
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'diagrams')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404
