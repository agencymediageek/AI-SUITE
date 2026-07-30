#!/usr/bin/env bash
set -euo pipefail

PASS=0
FAIL=0

check() {
  local desc="$1"
  local result="$2"
  if [ "$result" = "ok" ]; then
    echo "  ✓ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $desc"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Validating recording lifecycle ==="

# 1. useVideoPlayer is imported from hooks
check "useVideoPlayer imported in VideoTemplate" \
  "$(grep -q 'useVideoPlayer' src/components/video/VideoTemplate.tsx && echo ok || echo fail)"

# 2. startRecording in hooks.ts
check "startRecording called in hooks.ts" \
  "$(grep -q 'startRecording' src/lib/video/hooks.ts && echo ok || echo fail)"

# 3. stopRecording in hooks.ts
check "stopRecording called in hooks.ts" \
  "$(grep -q 'stopRecording' src/lib/video/hooks.ts && echo ok || echo fail)"

# 4. AnimatePresence present
check "AnimatePresence in VideoTemplate" \
  "$(grep -q 'AnimatePresence' src/components/video/VideoTemplate.tsx && echo ok || echo fail)"

# 5. overflow-hidden on root container
check "overflow-hidden on root container" \
  "$(grep -q 'overflow-hidden' src/components/video/VideoTemplate.tsx && echo ok || echo fail)"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ $FAIL -eq 0 ] && exit 0 || exit 1
