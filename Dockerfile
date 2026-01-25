# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm config set node-linker hoisted && \
    pnpm install --frozen-lockfile
COPY . .

RUN pnpm build

# Stage 2: Production 
FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

CMD ["node", "dist/server.js"]