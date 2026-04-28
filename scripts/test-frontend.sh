#!/bin/bash
# Test script for app-financa frontend build
# Usage: ./scripts/test-frontend.sh

set -e

echo "🚀 Starting frontend build tests..."
echo ""

cd "$(dirname "$0")/../frontend"

# Test build with adapter-auto
echo "✓ Testing frontend build (adapter-auto)..."
if pnpm build 2>&1 | tee /tmp/frontend-build.log | tail -5 | grep -q "built in"; then
  echo "  ✅ Frontend build passed"
else
  echo "  ❌ Frontend build failed"
  cat /tmp/frontend-build.log | tail -20
fi

# Check output files
echo "✓ Checking build output..."
if [ -d ".svelte-kit/output/client" ] && [ -d ".svelte-kit/output/server" ]; then
  echo "  ✅ Build output exists (client + server)"
  echo "  📊 Client files: $(find .svelte-kit/output/client -type f | wc -l)"
  echo "  📊 Server files: $(find .svelte-kit/output/server -type f | wc -l)"
else
  echo "  ❌ Build output missing"
fi

echo ""
echo "✅ Frontend build tests completed!"
echo ""
echo "📝 Manual tests needed:"
echo "  1. Deploy to Cloudflare Pages for full testing"
echo "  2. Or run: cd frontend && pnpm exec vite dev --host 127.0.0.1"
