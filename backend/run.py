from app import create_app
from datetime import timedelta
import logging

app = create_app()

# Configure logging for the main process - INFO level
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)

if __name__ == '__main__':
    with app.app_context():
        from app import db
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5001)
