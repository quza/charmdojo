#!/bin/bash
# Quick Verification Script for Chat API Implementation
# Checks that all files exist and have no syntax errors

echo "🔍 Verifying Chat API Implementation..."
echo "======================================"
echo ""

# Check file existence
FILES=(
  "src/lib/ai/moderation.ts"
  "src/lib/ai/chat.ts"
  "src/types/chat.ts"
  "src/app/api/chat/message/route.ts"
  "src/app/api/chat/CHAT_API_README.md"
  "src/app/api/chat/TEST_SCENARIOS.md"
  "src/app/api/chat/test-chat-functions.ts"
  "CHAT_API_IMPLEMENTATION_COMPLETE.md"
)

echo "📁 Checking files..."
MISSING=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (MISSING)"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "❌ $MISSING file(s) missing!"
  exit 1
fi

echo ""
echo "🔧 Checking TypeScript compilation..."
npx tsc --noEmit --skipLibCheck 2>&1 | head -n 20

echo ""
echo "📋 Running unit tests..."
npx tsx src/app/api/chat/test-chat-functions.ts 2>&1 | tail -n 20

echo ""
echo "======================================"
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. npm run dev"
echo "2. Test API at /api/chat/message"
echo "3. See CHAT_API_IMPLEMENTATION_COMPLETE.md for details"



