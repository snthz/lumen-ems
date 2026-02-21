# ── Stage 1: Install dependencies ──────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build the Next.js app ────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Use a placeholder so the image is portable.
# The real value is injected at runtime by docker-entrypoint.sh.
ENV NEXT_PUBLIC_TB_API=__NEXT_PUBLIC_TB_API_PLACEHOLDER__

RUN bun run build

# ── Stage 3: Production runner ─────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create data directory for file-based fallback storage
RUN mkdir -p /data && chown -R node:node /data
ENV DATA_DIR=/data

# Copy standalone output (owned by node so entrypoint can sed in-place)
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Entrypoint script replaces NEXT_PUBLIC_TB_API placeholder at runtime
COPY --chown=node:node docker-entrypoint.sh /app/docker-entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
