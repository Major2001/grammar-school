#!/usr/bin/env python3
"""
Script to create the first admin user for production deployment
Usage: python create_first_admin.py <username> <email> <password>
"""

import sys
import os
from werkzeug.security import generate_password_hash

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User

def create_first_admin(username, email, password):
    """Create the first admin user"""
    app = create_app()
    
    with app.app_context():
        # Check if any admin already exists
        existing_admin = User.query.filter_by(is_admin=True).first()
        if existing_admin:
            print(f"Admin user already exists: {existing_admin.username}")
            return False
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            print(f"User with username '{username}' or email '{email}' already exists")
            return False
        
        # Create admin user
        password_hash = generate_password_hash(password)
        admin_user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            is_admin=True,
            is_active=True
        )
        
        try:
            db.session.add(admin_user)
            db.session.commit()
            print(f"✅ First admin user created successfully!")
            print(f"   Username: {username}")
            print(f"   Email: {email}")
            print(f"   Admin: Yes")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to create admin user: {str(e)}")
            return False

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_first_admin.py <username> <email> <password>")
        print("Example: python create_first_admin.py admin admin@example.com securepassword123")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    
    # Basic validation
    if len(password) < 8:
        print("❌ Password must be at least 8 characters long")
        sys.exit(1)
    
    success = create_first_admin(username, email, password)
    sys.exit(0 if success else 1)
