#!/usr/bin/env python3
"""
Script to make a user an admin
Usage: python make_admin.py <username>
"""

import sys
from app import create_app, db
from app.models.user import User

def make_admin(username):
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"User '{username}' not found")
            return False
        
        user.is_admin = True
        db.session.commit()
        print(f"User '{username}' is now an admin")
        return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_admin.py <username>")
        sys.exit(1)
    
    username = sys.argv[1]
    make_admin(username)
