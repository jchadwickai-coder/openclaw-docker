#!/bin/bash
# Helper script to open a page in the remote browser and get the DevTools URL

URL="${1:-https://example.com}"

echo "Opening $URL in remote browser..."
RESPONSE=$(curl -s -X PUT "http://localhost:9222/json/new?${URL}")

# Extract the WebSocket debugger URL and fix the port
WS_URL=$(echo "$RESPONSE" | jq -r '.webSocketDebuggerUrl' | sed 's/:19222/:9222/')
PAGE_ID=$(echo "$RESPONSE" | jq -r '.id')

# Construct the DevTools frontend URL with the corrected WebSocket URL
DEVTOOLS_URL="https://chrome-devtools-frontend.appspot.com/serve_rev/@0bbdf2913883391365383b0a5dfe7bf9fd1a5213/inspector.html?ws=localhost:9222/devtools/page/${PAGE_ID}"

echo ""
echo "✓ Page opened successfully!"
echo ""
echo "Open DevTools at:"
echo "$DEVTOOLS_URL"
echo ""
echo "Or add 'localhost:9222' to chrome://inspect/#devices"
