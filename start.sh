#!/bin/bash
# MetaPlay Quick Start Script

echo "🎮 MetaPlay — Starting Development Environment"
echo "=============================================="

# Check for Node.js
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+ first."
  exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend && npm install
echo "✅ Backend dependencies installed"

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
echo "✅ Frontend dependencies installed"

echo ""
echo "🚀 Starting services..."
echo ""
echo "  Backend  → http://localhost:5000"
echo "  Frontend → http://localhost:5173"
echo ""
echo "⚠️  Make sure MongoDB is running (or update MONGODB_URI in backend/.env)"
echo ""

# Open two terminals (macOS/Linux)
cd ..
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/backend && npm run dev"'
  osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/frontend && npm run dev"'
elif command -v gnome-terminal &>/dev/null; then
  # Linux with GNOME
  gnome-terminal -- bash -c "cd $(pwd)/backend && npm run dev; exec bash"
  gnome-terminal -- bash -c "cd $(pwd)/frontend && npm run dev; exec bash"
else
  echo "Run these in separate terminals:"
  echo "  Terminal 1: cd backend && npm run dev"
  echo "  Terminal 2: cd frontend && npm run dev"
fi
