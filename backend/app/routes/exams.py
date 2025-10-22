from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.exam import Exam
from app.models.exam_attempt import ExamAttempt
from app import db

exams_bp = Blueprint('exams', __name__)

def require_admin():
    """Helper function to check if current user is admin"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or not user.is_admin:
        return None
    return user

# ============================================================================
# ADMIN EXAM MANAGEMENT ROUTES
# ============================================================================

@exams_bp.route('/exams', methods=['GET'])
@jwt_required()
def get_exams():
    """
    Get exams with optional filters
    Query params:
    - status: 'active' to get only active exams (for users)
    - include_attempts: 'true' to include user's attempt history
    
    If user is admin and no filters: returns all exams
    If user is not admin: only returns active exams
    """
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    try:
        # Get query parameters
        status = request.args.get('status')
        include_attempts = request.args.get('include_attempts', '').lower() == 'true'
        
        # Base query
        query = Exam.query
        
        # Apply filters
        if status == 'active' or not user.is_admin:
            # Non-admins can only see active exams
            query = query.filter_by(is_active=True)
        
        exams = query.order_by(Exam.created_at.desc()).all()
        
        # If include_attempts is true, add attempt history and question counts
        if include_attempts:
            exam_data = []
            for exam in exams:
                # Get user's latest attempt for this exam
                latest_attempt = ExamAttempt.query.filter_by(
                    user_id=int(user_id), 
                    exam_id=exam.id
                ).order_by(ExamAttempt.created_at.desc()).first()
                
                # Questions are now generated dynamically, so we use a default count
                question_count = 50
                total_marks = 50
                
                exam_info = exam.to_dict()
                exam_info['question_count'] = question_count
                exam_info['total_marks'] = total_marks
                exam_info['has_attempted'] = latest_attempt is not None
                exam_info['latest_attempt'] = latest_attempt.to_dict() if latest_attempt else None
                
                exam_data.append(exam_info)
            
            return jsonify({'exams': exam_data}), 200
        else:
            # Simple response without attempts
            return jsonify({
                'exams': [exam.to_dict() for exam in exams]
            }), 200
            
    except Exception as e:
        return jsonify({'error': 'Failed to fetch exams'}), 500

@exams_bp.route('/exams', methods=['POST'])
@jwt_required()
def create_exam():
    """Create a new exam with answers (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        answers = data.get('answers', [])
        
        if not title:
            return jsonify({'error': 'Exam title is required'}), 400
        
        # Validate answers
        if not answers or len(answers) != 50:
            return jsonify({'error': 'Exactly 50 answers are required'}), 400
        
        # Validate each answer is A, B, C, or D
        valid_answers = {'A', 'B', 'C', 'D'}
        for i, answer in enumerate(answers):
            if answer not in valid_answers:
                return jsonify({'error': f'Invalid answer for question {i+1}. Must be A, B, C, or D'}), 400
        
        # Create exam record
        exam = Exam(
            title=title,
            description=description,
            created_by=admin_user.id,
            answers=answers
        )
        
        db.session.add(exam)
        db.session.commit()
        
        return jsonify({
            'message': 'Exam created successfully',
            'exam': exam.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create exam: {str(e)}'}), 500

@exams_bp.route('/exams/<int:exam_id>', methods=['GET'])
@jwt_required()
def get_exam(exam_id):
    """
    Get specific exam details
    - Admin: Full access to any exam
    - User: Can view active exams with question counts by subject
    """
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Non-admin users can only view active exams
        if not user.is_admin and not exam.is_active:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Get exam details
        exam_data = exam.to_dict()
        
        # Add question count (always 50 for grading system)
        exam_data['question_count'] = 50
        exam_data['total_marks'] = 50
        exam_data['subject_counts'] = {'English': 25, 'Maths': 25}  # Default breakdown
        exam_data['difficulty_counts'] = {'easy': 15, 'medium': 20, 'hard': 15}  # Default breakdown
        
        return jsonify({
            'exam': exam_data
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch exam'}), 500

@exams_bp.route('/exams/<int:exam_id>/questions', methods=['GET'])
@jwt_required()
def get_exam_questions(exam_id):
    """Get questions for an exam (for grading purposes) - returns 50 generic questions"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Non-admin users can only view active exams
        if not user.is_admin and not exam.is_active:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Generate 50 generic questions for grading
        questions_data = []
        for i in range(1, 51):
            questions_data.append({
                'id': i,
                'question_text': f'Question {i}: Select the correct answer.',
                'question_type': 'multiple_choice',
                'subject': 'English' if i <= 25 else 'Maths',
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'marks': 1
            })
        
        return jsonify({
            'questions': questions_data
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch exam questions'}), 500

@exams_bp.route('/exams/<int:exam_id>', methods=['DELETE'])
@jwt_required()
def delete_exam(exam_id):
    """Delete an exam (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        # Delete associated exam attempts first (foreign key constraint)
        ExamAttempt.query.filter_by(exam_id=exam_id).delete()
        
        # Delete the exam
        db.session.delete(exam)
        db.session.commit()
        
        return jsonify({
            'message': 'Exam deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting exam: {str(e)}")  # Log the actual error
        return jsonify({'error': f'Failed to delete exam: {str(e)}'}), 500

@exams_bp.route('/exams/<int:exam_id>', methods=['PATCH'])
@jwt_required()
def update_exam(exam_id):
    """
    Update exam properties (admin only)
    
    Supported fields:
    - is_active: boolean - Set exam active status
    - title: string - Update exam title (optional)
    - description: string - Update exam description (optional)
    
    Request body examples:
    - { "is_active": true }
    - { "is_active": false }
    - { "title": "New Title", "description": "New description" }
    """
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        exam = Exam.query.get(exam_id)
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields if provided
        updated_fields = []
        
        if 'is_active' in data:
            exam.is_active = bool(data['is_active'])
            updated_fields.append('is_active')
        
        if 'title' in data:
            title = data['title'].strip()
            if title:
                exam.title = title
                updated_fields.append('title')
        
        if 'description' in data:
            exam.description = data['description'].strip()
            updated_fields.append('description')
        
        if 'answers' in data:
            answers = data['answers']
            # Validate answers
            if not answers or len(answers) != 50:
                return jsonify({'error': 'Exactly 50 answers are required'}), 400
            
            # Validate each answer is A, B, C, or D
            valid_answers = {'A', 'B', 'C', 'D'}
            for i, answer in enumerate(answers):
                if answer not in valid_answers:
                    return jsonify({'error': f'Invalid answer for question {i+1}. Must be A, B, C, or D'}), 400
            
            exam.answers = answers
            updated_fields.append('answers')
        
        if not updated_fields:
            return jsonify({'error': 'No valid fields provided'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': f'Exam updated successfully',
            'updated_fields': updated_fields,
            'exam': exam.to_dict()
        }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update exam'}), 500

# Note: Questions are now generated dynamically for grading


