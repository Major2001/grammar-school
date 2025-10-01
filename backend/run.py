from app import create_app
from datetime import timedelta

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        from app import db
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
