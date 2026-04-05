FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY . .
ENV CI=true
RUN pnpm install --frozen-lockfile

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN pnpm install --frozen-lockfile
# Nếu Web có sử dụng các type/schema từ shared, cần build shared trước
RUN pnpm --filter @agri-scan/shared build

RUN pnpm --filter @agri-scan/shared build
# Build Web Frontend
RUN pnpm --filter web build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Thêm dòng này vào để pnpm chạy tự động, không hỏi han


# Copy các file cần thiết từ standalone build của Next.js
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

# File server.js được Next.js tự động tạo ra khi bật output: 'standalone'
CMD ["node", "apps/web/server.js"]