from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from app.models.user import User
from app.models.test import Test
from app import db

admin_bp = Blueprint('admin', __name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def require_admin():
    """Check if current user is admin"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or not user.is_admin:
        return None
    return user

@admin_bp.route('/tests', methods=['GET'])
@jwt_required()
def get_tests():
    """Get all tests (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        tests = Test.query.order_by(Test.created_at.desc()).all()
        return jsonify({
            'tests': [test.to_dict() for test in tests]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch tests'}), 500

@admin_bp.route('/tests', methods=['POST'])
@jwt_required()
def upload_test():
    """Upload a new test PDF (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        # Get form data
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        
        if not title:
            return jsonify({'error': 'Test title is required'}), 400
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'tests')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        file_size = os.path.getsize(file_path)
        
        # Create test record
        test = Test(
            title=title,
            description=description,
            pdf_filename=secure_filename(file.filename),
            pdf_path=file_path,
            file_size=file_size,
            created_by=admin_user.id
        )
        
        db.session.add(test)
        db.session.commit()
        
        return jsonify({
            'message': 'Test uploaded successfully',
            'test': test.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to upload test'}), 500

@admin_bp.route('/tests/<int:test_id>', methods=['GET'])
@jwt_required()
def get_test(test_id):
    """Get specific test details (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        test = Test.query.get(test_id)
        if not test:
            return jsonify({'error': 'Test not found'}), 404
        
        return jsonify({
            'test': test.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch test'}), 500

@admin_bp.route('/tests/<int:test_id>', methods=['DELETE'])
@jwt_required()
def delete_test(test_id):
    """Delete a test (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        test = Test.query.get(test_id)
        if not test:
            return jsonify({'error': 'Test not found'}), 404
        
        # Delete file from filesystem
        if os.path.exists(test.pdf_path):
            os.remove(test.pdf_path)
        
        # Delete from database
        db.session.delete(test)
        db.session.commit()
        
        return jsonify({
            'message': 'Test deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete test'}), 500

@admin_bp.route('/tests/<int:test_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_test_status(test_id):
    """Toggle test active status (admin only)"""
    admin_user = require_admin()
    if not admin_user:
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        test = Test.query.get(test_id)
        if not test:
            return jsonify({'error': 'Test not found'}), 404
        
        test.is_active = not test.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'Test {"activated" if test.is_active else "deactivated"} successfully',
            'test': test.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update test status'}), 500
