from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models.user import User
from app import db
from app.utils.validators import validate_email, validate_password, validate_username

class AuthService:
    @staticmethod
    def register_user(username, email, password):
        """Register a new user"""
        # Validate input
        is_valid_username, username_message = validate_username(username)
        if not is_valid_username:
            return None, username_message
        
        if not validate_email(email):
            return None, "Invalid email format"
        
        is_valid_password, password_message = validate_password(password)
        if not is_valid_password:
            return None, password_message
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return None, "Username already exists"
        
        if User.query.filter_by(email=email).first():
            return None, "Email already exists"
        
        # Create new user
        password_hash = generate_password_hash(password)
        user = User(username=username, email=email, password_hash=password_hash)
        
        try:
            db.session.add(user)
            db.session.commit()
            
            # Generate JWT token
            access_token = create_access_token(identity=user.id)
            
            return {
                'user': user.to_dict(),
                'access_token': access_token
            }, None
        except Exception as e:
            db.session.rollback()
            return None, "Registration failed"
    
    @staticmethod
    def authenticate_user(username_or_email, password):
        """Authenticate user login"""
        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return None, "Invalid credentials"
        
        if not user.is_active:
            return None, "Account is deactivated"
        
        # Generate JWT token
        access_token = create_access_token(identity=user.id)
        
        return {
            'user': user.to_dict(),
            'access_token': access_token
        }, None
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        return User.query.get(user_id)
