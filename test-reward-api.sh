#!/bin/bash
# Test script for Reward Generation API

echo "🧪 Testing Reward Generation API"
echo "=================================="
echo ""

# Configuration
PROJECT_ID="ketkanvkuzmnbsebeuax"
TEST_ROUND_ID="000eef06-b884-49b8-b52f-35a337d23257"  # Stephanie's won round
API_URL="http://localhost:3000/api/reward/generate"

echo "📋 Test Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Test Round ID: $TEST_ROUND_ID"
echo "   API URL: $API_URL"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Generate Reward for Valid Won Round"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⏱️  Making API request (this may take 25-35 seconds)..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"roundId\": \"$TEST_ROUND_ID\"}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "📊 Response Status: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Test PASSED - Reward generated successfully!"
  echo ""
  echo "📄 Response Body:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  
  # Extract URLs
  VOICE_URL=$(echo "$BODY" | jq -r '.rewardVoiceUrl // empty' 2>/dev/null)
  IMAGE_URL=$(echo "$BODY" | jq -r '.rewardImageUrl // empty' 2>/dev/null)
  REWARD_TEXT=$(echo "$BODY" | jq -r '.rewardText // empty' 2>/dev/null)
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Reward Assets:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "💬 Reward Text:"
  echo "   $REWARD_TEXT"
  echo ""
  
  if [ ! -z "$VOICE_URL" ] && [ "$VOICE_URL" != "null" ]; then
    echo "✅ Voice URL: $VOICE_URL"
    echo "   Testing accessibility..."
    VOICE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VOICE_URL")
    if [ "$VOICE_STATUS" = "200" ]; then
      echo "   ✅ Voice file accessible (HTTP $VOICE_STATUS)"
    else
      echo "   ❌ Voice file not accessible (HTTP $VOICE_STATUS)"
    fi
  else
    echo "⚠️  Voice URL: null (generation may have failed)"
  fi
  echo ""
  
  if [ ! -z "$IMAGE_URL" ] && [ "$IMAGE_URL" != "null" ]; then
    echo "✅ Image URL: $IMAGE_URL"
    echo "   Testing accessibility..."
    IMAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL")
    if [ "$IMAGE_STATUS" = "200" ]; then
      echo "   ✅ Image file accessible (HTTP $IMAGE_STATUS)"
    else
      echo "   ❌ Image file not accessible (HTTP $IMAGE_STATUS)"
    fi
  else
    echo "⚠️  Image URL: null (generation may have failed)"
  fi
  
elif [ "$HTTP_STATUS" = "409" ]; then
  echo "ℹ️  Test Result: Reward already exists (409 Conflict)"
  echo "   This is expected if you've run this test before."
  echo ""
  echo "📄 Response Body:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "💡 To test again, delete the existing reward first:"
  echo "   DELETE FROM rewards WHERE round_id = '$TEST_ROUND_ID';"
  
elif [ "$HTTP_STATUS" = "401" ]; then
  echo "❌ Test FAILED - Unauthorized (401)"
  echo "   You need to be authenticated to generate rewards."
  echo ""
  echo "📄 Response Body:"
  echo "$BODY"
  
else
  echo "❌ Test FAILED - Unexpected status: $HTTP_STATUS"
  echo ""
  echo "📄 Response Body:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Test Invalid Round ID (should fail)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INVALID_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"roundId": "invalid-id"}')

INVALID_STATUS=$(echo "$INVALID_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
INVALID_BODY=$(echo "$INVALID_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$INVALID_STATUS" = "400" ]; then
  echo "✅ Test PASSED - Correctly rejected invalid UUID (400)"
  echo "📄 Error message:"
  echo "$INVALID_BODY" | jq -r '.message // .' 2>/dev/null
else
  echo "❌ Test FAILED - Expected 400, got $INVALID_STATUS"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Testing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


