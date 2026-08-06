# ---- Stage 1: Install dependencies ----
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- Stage 2: Build ----
FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NITRO_PRESET=node-server
RUN bun run build

# ---- Stage 3: Production ----
FROM node:22-alpine AS runtime
WORKDIR /app

# Copy only the nitro output (server + static assets)
COPY --from=build /app/.output ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/index.mjs"]
