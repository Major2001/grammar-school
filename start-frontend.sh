#!/bin/bash

# Grammar School Frontend Startup Script
echo "🚀 Starting Grammar School Frontend..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
    echo "📝 Created .env file"
fi

# Start React server
echo "🌐 Frontend running on http://localhost:3000"
echo "🔗 API: http://localhost:5001/api"
echo "Press Ctrl+C to stop"
echo "----------------------------------------"

npm start
