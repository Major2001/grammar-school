from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from datetime import timedelta
import os
import logging
import sys

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    from config import config
    config_name = config_name or os.getenv('FLASK_ENV', 'default')
    app.config.from_object(config[config_name])
    
    # Configure logging - INFO level and exceptions only
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ],
        force=True  # Override any existing configuration
    )
    
    # Set Flask logger to INFO
    app.logger.setLevel(logging.INFO)
    
    # Keep Werkzeug request logging at INFO level
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.setLevel(logging.INFO)
    
    # Suppress SQLAlchemy query logging
    sqlalchemy_logger = logging.getLogger('sqlalchemy.engine')
    sqlalchemy_logger.setLevel(logging.INFO)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS
    # Allow all origins in development, specific origins in production
    cors_origins = os.getenv('CORS_ORIGINS', '*')
    if cors_origins == '*':
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        # Parse comma-separated origins
        origins = [origin.strip() for origin in cors_origins.split(',')]
        CORS(app, resources={r"/api/*": {
            "origins": origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }})
    
    # Import models to register them with SQLAlchemy
    from app.models.user import User
    from app.models.exam import Exam
    from app.models.exam_attempt import ExamAttempt
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.health import health_bp
    from app.routes.exams import exams_bp
    from app.routes.exam_attempt import exam_attempt_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(exams_bp, url_prefix='/api')
    app.register_blueprint(exam_attempt_bp, url_prefix='/api')
    
    # Register error handlers for exception logging
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Log all unhandled exceptions with full traceback"""
        import traceback
        app.logger.error(f"Unhandled exception: {str(e)}")
        app.logger.error(traceback.format_exc())
        # Re-raise to let Flask handle it normally
        raise
    
    return app
