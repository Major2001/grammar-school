# Grammar School - Online Testing Platform

A full-stack web application for online testing with user authentication, built with React frontend and Flask backend.

## Project Structure

```
grammar-school/
├── frontend/          # React frontend application
├── backend/           # Flask backend API
└── README.md         # This file
```

## Features

- User registration and login
- JWT-based authentication
- Responsive design
- Secure password validation
- PostgreSQL database support

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, defaults to SQLite)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your database URL and secret keys
   ```

5. Initialize the database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. Run the backend server:
   ```bash
   python run.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (requires authentication)

### Health Check
- `GET /api/health` - API health status

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address
- `password_hash` - Hashed password
- `created_at` - Account creation timestamp
- `is_active` - Account status

## Development

### Backend Development
The backend follows Flask best practices with:
- Application factory pattern
- Blueprint-based routing
- Service layer architecture
- Configuration management
- Database migrations

### Frontend Development
The frontend uses:
- React with functional components
- React Router for navigation
- Axios for API calls
- CSS modules for styling
- JWT token management

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/grammar_school
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
FLASK_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Security Features

- Password hashing with Werkzeug
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Secure session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
