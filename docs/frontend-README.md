# Grammar School Frontend

React-based frontend application for the Grammar School online testing platform.

## Features

- User authentication (login/register)
- Responsive design
- JWT token management
- Protected routes
- Modern UI with CSS styling

## Project Structure

```
frontend/src/
├── components/           # Reusable components
│   ├── LoginForm.js     # Login form component
│   ├── RegisterForm.js  # Registration form component
│   └── AuthForm.css     # Shared styling for auth forms
├── pages/               # Page components
│   ├── LoginPage.js     # Login/Register page
│   ├── Dashboard.js     # User dashboard
│   └── Dashboard.css    # Dashboard styling
├── services/            # API services
│   └── api.js          # Axios configuration and API calls
├── utils/               # Utility functions
│   └── auth.js         # Authentication utilities
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Components

### LoginForm
Handles user login with form validation and error handling.

**Props:**
- `onLoginSuccess(user)` - Callback when login is successful
- `onSwitchToRegister()` - Callback to switch to registration form

### RegisterForm
Handles user registration with password confirmation and validation.

**Props:**
- `onRegisterSuccess(user)` - Callback when registration is successful
- `onSwitchToLogin()` - Callback to switch to login form

### Dashboard
Protected page that displays user information and provides logout functionality.

## Services

### API Service (`services/api.js`)
Centralized API configuration with:
- Axios instance with base URL
- Request/response interceptors
- Automatic token attachment
- Token expiration handling

**Available methods:**
- `authAPI.register(userData)` - Register new user
- `authAPI.login(credentials)` - Login user
- `userAPI.getProfile()` - Get user profile

## Utilities

### Authentication (`utils/auth.js`)
Token and user management utilities:

- `setAuthToken(token)` - Store JWT token
- `setUser(user)` - Store user data
- `getToken()` - Retrieve stored token
- `getUser()` - Retrieve stored user data
- `isAuthenticated()` - Check authentication status
- `logout()` - Clear authentication data

## Routing

The application uses React Router for navigation:

- `/` - Redirects to dashboard (if authenticated) or login
- `/login` - Login/Register page
- `/dashboard` - User dashboard (protected)

## Styling

The application uses custom CSS with:
- Responsive design
- Modern gradient backgrounds
- Form validation styling
- Mobile-friendly layouts

## Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Structure

The application follows React best practices:
- Functional components with hooks
- Separation of concerns
- Reusable components
- Service layer for API calls
- Utility functions for common operations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security

- JWT token storage in localStorage
- Automatic token expiration handling
- Protected route implementation
- Input validation and sanitization