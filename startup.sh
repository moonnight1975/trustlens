#!/bin/sh
cd /workspace 2>/dev/null || cd /Users/littobiju/Downloads/trust
if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
nohup npm run dev > /tmp/trustlens-dev.log 2>&1 &
exit 0
