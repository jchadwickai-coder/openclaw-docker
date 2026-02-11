#!/bin/bash
set -e

# Start Chrome on port 19222 (internal) in the background
/usr/local/bin/chrome \
  --headless=new \
  --remote-debugging-port=19222 \
  --remote-allow-origins='*' \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-software-rasterizer \
  --disable-setuid-sandbox \
  "$@" &

CHROME_PID=$!

# Wait for Chrome to start
sleep 2

# Start nginx reverse proxy (rewrites Host header to localhost)
nginx -g 'daemon off;' &

NGINX_PID=$!

# Wait for either process to exit
wait -n $CHROME_PID $NGINX_PID
