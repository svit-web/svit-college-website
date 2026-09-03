# ---- Stage 1: Install dependencies ----
# Alpine (musl) base in every stage so sharp's native binary — installed here
# and picked up by Next's standalone output tracing — matches the alpine
# runtime below. A glibc build stage (e.g. plain oven/bun:1, Debian-based)
# paired with an alpine runtime installs the wrong sharp binary and only
# fails at request time, not at build time.
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- Stage 2: Build ----
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time and are
# safe to pass as build args (they're already public — that's what the prefix
# means). .dockerignore excludes .env entirely so no secret ever enters an
# image layer; pass these explicitly via `docker build --build-arg ...` (or
# your CI's build-arg equivalent) instead. Pages that read Supabase at build
# time for static generation (e.g. /placement) fail without them.
FROM oven/bun:1-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_PROJECT_ID
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_PROJECT_ID=$NEXT_PUBLIC_SUPABASE_PROJECT_ID
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Search index (docs/design/SEARCH_PLAN.md): this project has no SSG, so
# there's no build output to read tags out of — the crawl script needs an
# actual running instance. Start one against this stage's freshly built
# .next (next start, not the trimmed standalone output — that's assembled
# below), crawl it into public/search-index.json, then stop it. A failed
# crawl fails the image build rather than silently shipping without search.
RUN bun run start & \
    SERVER_PID=$! && \
    bun run search:index; \
    STATUS=$?; \
    kill $SERVER_PID 2>/dev/null; \
    exit $STATUS

# ---- Stage 3: Production ----
# Next's `output: "standalone"` (next.config.ts) produces a self-contained
# server at .next/standalone/server.js with only the traced dependencies —
# no full node_modules copy needed, unlike the old Nitro output.
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
