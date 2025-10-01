# Grammar School Backend

Flask-based REST API for the Grammar School online testing platform.

## Architecture

The backend follows Flask best practices with a modular structure:

```
backend/
├── app/
│   ├── __init__.py          # Application factory
│   ├── models/              # Database models
│   │   ├── __init__.py
│   │   └── user.py          # User model
│   ├── routes/              # API routes (blueprints)
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication routes
│   │   ├── user.py          # User profile routes
│   │   └── health.py        # Health check routes
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   └── auth_service.py  # Authentication service
│   └── utils/               # Utility functions
│       ├── __init__.py
│       └── validators.py   # Input validation
├── config.py               # Configuration classes
├── run.py                  # Application entry point
├── requirements.txt        # Python dependencies
└── env.example            # Environment variables template
```

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database:**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

4. **Run the application:**
   ```bash
   python run.py
   ```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00",
    "is_active": true
  }
}
```

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "username_or_email": "johndoe",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00",
    "is_active": true
  }
}
```

#### Get User Profile
```http
GET /api/profile
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00",
    "is_active": true
  }
}
```

### Health Check

#### API Health Status
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Grammar School API is running"
}
```

## Configuration

The application supports multiple configuration environments:

- **Development**: Default configuration with debug mode
- **Production**: Production-ready configuration
- **Testing**: Test configuration with in-memory database

Set the `FLASK_ENV` environment variable to switch between configurations.

## Database

The application uses SQLAlchemy ORM with support for:
- PostgreSQL (recommended for production)
- SQLite (default for development)

Database migrations are handled by Flask-Migrate.

## Security

- Password hashing with Werkzeug
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- SQL injection protection via ORM

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
