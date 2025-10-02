#!/bin/bash

# Grammar School Backend Startup Script
echo "🚀 Starting Grammar School Backend..."

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Activate virtual environment and install dependencies
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    cp env.example .env
    echo "📝 Created .env file from template"
fi

# Initialize database and run migrations
echo "🗄️  Setting up database..."

# Initialize migrations if not already done
if [ ! -d "migrations" ]; then
    echo "📝 Initializing migrations..."
    flask db init
fi

# Create migration for current changes
echo "📝 Creating migration..."
flask db migrate -m "Add admin role and tests table"

# Apply migrations
echo "🔄 Running migrations..."
flask db upgrade

echo "✅ Database setup complete"

# Start Flask server
echo "🌐 Backend running on http://localhost:5001"
echo "📊 API: http://localhost:5001/api"
echo "Press Ctrl+C to stop"
echo "----------------------------------------"

python run.py
