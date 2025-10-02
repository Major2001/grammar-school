from datetime import datetime, timezone
from app import db

class ExamAttempt(db.Model):
    __tablename__ = 'exam_attempt'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'), nullable=False)
    
    # Attempt details
    started_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Scoring
    total_questions = db.Column(db.Integer, nullable=False)
    total_marks = db.Column(db.Integer, nullable=False)  # Total possible marks for the exam
    score = db.Column(db.Integer, default=0)  # User's actual score
    
    # Status
    status = db.Column(db.String(20), default='in_progress')  # 'in_progress', 'completed', 'abandoned'
    
    # User answers (stored as JSON)
    user_answers = db.Column(db.JSON, default=dict)  # {question_id: user_answer}
    
    # Audit fields
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='exam_attempts')
    exam = db.relationship('Exam', backref='attempts')
    
    def __repr__(self):
        return f'<ExamAttempt {self.id}: User {self.user_id} - Exam {self.exam_id}>'
    
    def get_score_percentage(self):
        """Calculate the score percentage for display purposes"""
        if self.total_marks > 0:
            return round((self.score / self.total_marks) * 100, 1)
        return 0.0
    
    def get_duration_minutes(self):
        """Get the duration of the exam attempt in minutes"""
        if self.completed_at and self.started_at:
            duration = self.completed_at - self.started_at
            return round(duration.total_seconds() / 60, 1)
        return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exam_id': self.exam_id,
            'exam_title': self.exam.title if self.exam else None,
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'total_questions': self.total_questions,
            'total_marks': self.total_marks,
            'score': self.score,
            'score_percentage': self.get_score_percentage(),
            'status': self.status,
            'duration_minutes': self.get_duration_minutes(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
