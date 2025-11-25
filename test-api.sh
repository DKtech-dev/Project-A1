#!/bin/bash

# Test script for Moments API
# This script tests all the endpoints with sample data

BASE_URL="http://localhost:5000/api"

echo "🚀 Testing Moments API"
echo "======================"

# Test health check
echo "1. Testing health check..."
curl -s "$BASE_URL/../health" | jq '.'

echo -e "\n2. Creating a test moment..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/moments" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beautiful Sunset",
    "description": "Amazing sunset at the beach today. The colors were incredible!",
    "photo_url": "https://picsum.photos/seed/sunset/400/300.jpg",
    "mood": "happy",
    "latitude": 37.7749,
    "longitude": -122.4194
  }')

echo "$CREATE_RESPONSE" | jq '.'

# Extract the moment ID
MOMENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')

if [ "$MOMENT_ID" != "null" ] && [ "$MOMENT_ID" != "" ]; then
  echo -e "\n3. Getting the created moment (ID: $MOMENT_ID)..."
  curl -s "$BASE_URL/moments/$MOMENT_ID" | jq '.'

  echo -e "\n4. Updating the moment..."
  curl -s -X PUT "$BASE_URL/moments/$MOMENT_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Updated Beautiful Sunset",
      "description": "Updated: Amazing sunset at the beach today!"
    }' | jq '.'

  echo -e "\n5. Listing all moments..."
  curl -s "$BASE_URL/moments?limit=5" | jq '.'

  echo -e "\n6. Finding nearby moments (San Francisco)..."
  curl -s "$BASE_URL/moments/nearby?lat=37.7749&lng=-122.4194&radius=10000" | jq '.'

  echo -e "\n7. Finding nearby moments with mood filter..."
  curl -s "$BASE_URL/moments/nearby?lat=37.7749&lng=-122.4194&radius=10000&moods=happy,grateful" | jq '.'

  echo -e "\n8. Deleting the test moment..."
  curl -s -X DELETE "$BASE_URL/moments/$MOMENT_ID" | jq '.'
else
  echo "❌ Failed to create moment for testing"
fi

echo -e "\n✅ API testing completed!"