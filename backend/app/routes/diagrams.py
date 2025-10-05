from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models.user import User
import os
import uuid

diagrams_bp = Blueprint('diagrams', __name__)

def require_admin():
    """Check if current user is admin"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or not user.is_admin:
        return None
    return user

@diagrams_bp.route('/diagrams/upload', methods=['POST'])
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
        diagram_url = f"/api/diagrams/{unique_filename}"
        
        return jsonify({
            'message': 'Diagram uploaded successfully',
            'diagram_path': diagram_url,
            'filename': unique_filename
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to upload diagram: {str(e)}'}), 500

@diagrams_bp.route('/diagrams/<filename>', methods=['GET'])
def get_diagram(filename):
    """Serve uploaded diagram files"""
    try:
        upload_dir = os.path.join(os.getcwd(), 'uploads', 'diagrams')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

