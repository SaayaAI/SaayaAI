FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/whatsapp-types/package.json ./packages/whatsapp-types/
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter @saaya/database generate
RUN pnpm --filter @saaya/shared build
RUN pnpm --filter @saaya/whatsapp-types build
RUN pnpm --filter @saaya/database build
RUN pnpm --filter @saaya/api build

FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
