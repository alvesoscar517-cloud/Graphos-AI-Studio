#!/bin/bash

# Test backend locally before deploying
# Usage: ./scripts/test-local.sh

set -e

echo "🧪 Testing backend locally..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Start server in background
echo "🚀 Starting server..."
PORT=8080 node index.js &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Test health endpoint
echo "🔍 Testing health endpoint..."
curl -s http://localhost:8080/health | jq '.'

# Test CORS
echo ""
echo "🔍 Testing CORS..."
curl -s -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://localhost:8080/api/admin/notifications \
     -v 2>&1 | grep -i "access-control"

# Kill server
echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID

echo ""
echo "✅ Local tests passed!"
echo "🚀 Ready to deploy!"
