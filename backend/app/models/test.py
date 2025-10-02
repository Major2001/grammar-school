from datetime import datetime
from app import db

class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    pdf_filename = db.Column(db.String(255), nullable=False)
    pdf_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)  # File size in bytes
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_parsed = db.Column(db.Boolean, default=False)  # Whether PDF has been parsed for questions
    
    # Relationship
    creator = db.relationship('User', backref='created_tests')

    def __repr__(self):
        return f'<Test {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'pdf_filename': self.pdf_filename,
            'file_size': self.file_size,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active,
            'is_parsed': self.is_parsed
        }
