from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

admin_bp = Blueprint('admin', __name__)

def require_admin():
    """Check if current user is admin"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or not user.is_admin:
        return None
    return user

# Note: All exam and question management routes have been moved to exams.py
# All diagram upload/serving routes have been moved to diagrams.py
# This file is kept for future admin-specific utilities and features
