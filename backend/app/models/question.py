from datetime import datetime, timezone
from app import db

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('test.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), nullable=False)  # 'multiple_choice', 'fill_blank', 'short_answer'
    subject = db.Column(db.String(20), nullable=False)  # 'math', 'english'
    question_context = db.Column(db.Text)  # Additional context for grouped questions
    difficulty = db.Column(db.String(20))  # 'easy', 'medium', 'hard'
    diagram_path = db.Column(db.String(255))  # Path to diagram image if any
    options = db.Column(db.JSON)  # Store answer options as JSON array
    correct_answer = db.Column(db.String(10))  # Store correct answer (e.g., 'A', 'B', etc.)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    def __repr__(self):
        return f'<Question {self.id}: {self.question_text[:50]}...>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'test_id': self.test_id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'subject': self.subject,
            'question_context': self.question_context,
            'difficulty': self.difficulty,
            'diagram_path': self.diagram_path,
            'options': self.options,
            'correct_answer': self.correct_answer,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
