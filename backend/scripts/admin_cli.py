#!/usr/bin/env python3
"""
Comprehensive Admin Management CLI Tool
Usage: python admin_cli.py <command> [arguments]

Commands:
  create-admin <username> <email> <password>  - Create first admin user
  make-admin <username>                        - Make existing user admin
  remove-admin <username>                      - Remove admin privileges
  list-users                                   - List all users
  list-admins                                  - List admin users
  activate <username>                          - Activate user account
  deactivate <username>                        - Deactivate user account
  stats                                        - Show system statistics
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
            print(f"❌ Admin user already exists: {existing_admin.username}")
            return False
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            print(f"❌ User with username '{username}' or email '{email}' already exists")
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

def make_user_admin(username):
    """Make an existing user an admin"""
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"❌ User '{username}' not found")
            return False
        
        if user.is_admin:
            print(f"⚠️  User '{username}' is already an admin")
            return True
        
        try:
            user.is_admin = True
            db.session.commit()
            print(f"✅ User '{username}' is now an admin")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to make user admin: {str(e)}")
            return False

def remove_user_admin(username):
    """Remove admin privileges from a user"""
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"❌ User '{username}' not found")
            return False
        
        if not user.is_admin:
            print(f"⚠️  User '{username}' is not an admin")
            return True
        
        try:
            user.is_admin = False
            db.session.commit()
            print(f"✅ Admin privileges removed from '{username}'")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to remove admin privileges: {str(e)}")
            return False

def list_users():
    """List all users"""
    app = create_app()
    
    with app.app_context():
        users = User.query.all()
        if not users:
            print("No users found")
            return
        
        print(f"\n📋 All Users ({len(users)} total):")
        print("-" * 80)
        print(f"{'ID':<4} {'Username':<15} {'Email':<25} {'Admin':<6} {'Active':<7} {'Created'}")
        print("-" * 80)
        
        for user in users:
            admin_status = "Yes" if user.is_admin else "No"
            active_status = "Yes" if user.is_active else "No"
            created = user.created_at.strftime("%Y-%m-%d")
            print(f"{user.id:<4} {user.username:<15} {user.email:<25} {admin_status:<6} {active_status:<7} {created}")

def list_admins():
    """List admin users"""
    app = create_app()
    
    with app.app_context():
        admins = User.query.filter_by(is_admin=True).all()
        if not admins:
            print("No admin users found")
            return
        
        print(f"\n👑 Admin Users ({len(admins)} total):")
        print("-" * 60)
        print(f"{'ID':<4} {'Username':<15} {'Email':<25} {'Active':<7} {'Created'}")
        print("-" * 60)
        
        for admin in admins:
            active_status = "Yes" if admin.is_active else "No"
            created = admin.created_at.strftime("%Y-%m-%d")
            print(f"{admin.id:<4} {admin.username:<15} {admin.email:<25} {active_status:<7} {created}")

def activate_user(username):
    """Activate a user account"""
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"❌ User '{username}' not found")
            return False
        
        if user.is_active:
            print(f"⚠️  User '{username}' is already active")
            return True
        
        try:
            user.is_active = True
            db.session.commit()
            print(f"✅ User '{username}' has been activated")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to activate user: {str(e)}")
            return False

def deactivate_user(username):
    """Deactivate a user account"""
    app = create_app()
    
    with app.app_context():
        user = User.query.filter_by(username=username).first()
        if not user:
            print(f"❌ User '{username}' not found")
            return False
        
        if not user.is_active:
            print(f"⚠️  User '{username}' is already inactive")
            return True
        
        try:
            user.is_active = False
            db.session.commit()
            print(f"✅ User '{username}' has been deactivated")
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to deactivate user: {str(e)}")
            return False

def show_stats():
    """Show system statistics"""
    app = create_app()
    
    with app.app_context():
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admin_users = User.query.filter_by(is_admin=True).count()
        
        print(f"\n📊 System Statistics:")
        print("-" * 30)
        print(f"Total Users:     {total_users}")
        print(f"Active Users:    {active_users}")
        print(f"Inactive Users:  {total_users - active_users}")
        print(f"Admin Users:     {admin_users}")
        print(f"Regular Users:   {total_users - admin_users}")

def show_help():
    """Show help message"""
    print(__doc__)

def main():
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "create-admin":
        if len(sys.argv) != 5:
            print("Usage: python admin_cli.py create-admin <username> <email> <password>")
            sys.exit(1)
        username, email, password = sys.argv[2], sys.argv[3], sys.argv[4]
        if len(password) < 8:
            print("❌ Password must be at least 8 characters long")
            sys.exit(1)
        success = create_first_admin(username, email, password)
        sys.exit(0 if success else 1)
    
    elif command == "make-admin":
        if len(sys.argv) != 3:
            print("Usage: python admin_cli.py make-admin <username>")
            sys.exit(1)
        username = sys.argv[2]
        success = make_user_admin(username)
        sys.exit(0 if success else 1)
    
    elif command == "remove-admin":
        if len(sys.argv) != 3:
            print("Usage: python admin_cli.py remove-admin <username>")
            sys.exit(1)
        username = sys.argv[2]
        success = remove_user_admin(username)
        sys.exit(0 if success else 1)
    
    elif command == "list-users":
        list_users()
    
    elif command == "list-admins":
        list_admins()
    
    elif command == "activate":
        if len(sys.argv) != 3:
            print("Usage: python admin_cli.py activate <username>")
            sys.exit(1)
        username = sys.argv[2]
        success = activate_user(username)
        sys.exit(0 if success else 1)
    
    elif command == "deactivate":
        if len(sys.argv) != 3:
            print("Usage: python admin_cli.py deactivate <username>")
            sys.exit(1)
        username = sys.argv[2]
        success = deactivate_user(username)
        sys.exit(0 if success else 1)
    
    elif command == "stats":
        show_stats()
    
    elif command == "help":
        show_help()
    
    else:
        print(f"❌ Unknown command: {command}")
        show_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
