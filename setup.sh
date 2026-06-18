#!/bin/bash
# VeriFeed — One-Command Setup Script
# Run this after cloning: bash setup.sh

echo ""
echo "🛡️  VeriFeed — Setting up..."
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Install from https://nodejs.org (v20+)"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check Python
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found! Install from https://python.org (v3.10+)"
    exit 1
fi
echo "✅ Python $($PYTHON_CMD --version 2>&1)"

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
cd server && npm install --silent 2>&1 | tail -1
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install --silent 2>&1 | tail -1
cd ..

# Install ML dependencies
echo "📦 Installing ML service dependencies..."
cd ml-service && $PYTHON_CMD -m pip install -r requirements.txt -q 2>&1 | tail -3
cd ..

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "Now open 3 terminals and run:"
echo ""
echo "  Terminal 1 (Backend):    cd server && npm run dev"
echo "  Terminal 2 (Frontend):   cd client && npm run dev"
echo "  Terminal 3 (ML Service): cd ml-service && $PYTHON_CMD -m uvicorn app.main:app --reload --port 8000"
echo ""
echo "Then open: http://localhost:5173"
echo "================================"
