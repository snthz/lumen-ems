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

# Build arguments for required env vars at build time
ARG NEXT_PUBLIC_TB_API
ENV NEXT_PUBLIC_TB_API=${NEXT_PUBLIC_TB_API}

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

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER node

EXPOSE 3000

CMD ["node", "server.js"]
