#!/bin/bash
# Test script for app-financa backend
# Usage: ./scripts/test-backend.sh

set -e

echo "🚀 Starting backend tests..."
echo ""

# Start wrangler dev in background
echo "📡 Starting wrangler dev..."
cd "$(dirname "$0")/../backend"
wrangler dev --local &
WRANGLER_PID=$!
sleep 3

# Test health endpoint
echo "✓ Testing /health..."
curl -s http://localhost:8787/health | grep -q "ok" && echo "  ✅ Health check passed" || echo "  ❌ Health check failed"

# Test login with valid credentials
echo "✓ Testing POST /api/auth/login (valid credentials)..."
RESPONSE=$(curl -s -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user123","password":"senha123"}')
echo "$RESPONSE" | grep -q "token" && echo "  ✅ Login successful (JWT received)" || echo "  ❌ Login failed"

# Extract token for further tests
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  # Test get current user
  echo "✓ Testing GET /api/auth/me..."
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8787/api/auth/me | grep -q "name" && echo "  ✅ Get user info passed" || echo "  ❌ Get user info failed"

  # Test create transaction
  echo "✓ Testing POST /api/transactions..."
  curl -s -X POST http://localhost:8787/api/transactions \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"type":"expense","amount":50.00,"category":"Teste","payment":"debit","description":"Test transaction","date":"2026-04-28"}' | grep -q "id" && echo "  ✅ Create transaction passed" || echo "  ❌ Create transaction failed"

  # Test list transactions
  echo "✓ Testing GET /api/transactions..."
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8787/api/transactions | grep -q "type" && echo "  ✅ List transactions passed" || echo "  ❌ List transactions failed"
else
  echo "  ⚠️  Skipping authenticated tests (no token)"
fi

# Test login with invalid credentials
echo "✓ Testing POST /api/auth/login (invalid credentials)..."
curl -s -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"wrong"}' | grep -q "401\|Unauthorized" && echo "  ✅ Invalid login correctly rejected" || echo "  ❌ Invalid login not rejected"

# Kill wrangler dev
echo ""
echo "🛑 Stopping wrangler dev..."
kill $WRANGLER_PID 2>/dev/null || true

echo ""
echo "✅ Backend tests completed!"
