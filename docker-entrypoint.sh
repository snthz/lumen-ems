#!/bin/sh
set -e

# ── Replace NEXT_PUBLIC_TB_API placeholder in the built JS bundle ──
# Next.js inlines NEXT_PUBLIC_* vars at build time.  We build with a
# placeholder and swap it for the real value at container start so a
# single image works with any ThingsBoard URL.

PLACEHOLDER="__NEXT_PUBLIC_TB_API_PLACEHOLDER__"
REPLACEMENT="${NEXT_PUBLIC_TB_API:-$TB_API}"

if [ -z "$REPLACEMENT" ]; then
  echo "⚠️  WARNING: Neither NEXT_PUBLIC_TB_API nor TB_API is set."
  echo "   Client-side ThingsBoard URLs will be empty."
fi

if [ -n "$REPLACEMENT" ]; then
  echo "🔧 Injecting NEXT_PUBLIC_TB_API = $REPLACEMENT"
  # Replace in all JS files within the .next directory
  find /app/.next -name "*.js" -type f -exec \
    sed -i "s|${PLACEHOLDER}|${REPLACEMENT}|g" {} +
  find /app/.next -name "*.html" -type f -exec \
    sed -i "s|${PLACEHOLDER}|${REPLACEMENT}|g" {} +
fi

# ── Start the application ──
exec node server.js
