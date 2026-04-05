# 1. Giai đoạn Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy toàn bộ source code Monorepo vào
COPY . .

# Khai báo môi trường CI để pnpm không bao giờ dừng lại hỏi các câu tương tác
ENV CI=true

# Cài đặt dependencies
RUN pnpm install --frozen-lockfile

# Build thư viện shared và database trước
RUN pnpm --filter @agri-scan/shared build
RUN pnpm --filter @agri-scan/database build

# Build Backend
RUN pnpm --filter backend build

# 2. Giai đoạn Run (Production)
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/packages ./packages

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
# THÊM 2 DÒNG NÀY ĐỂ MANG THEO THƯ VIỆN CỦA BACKEND:
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

EXPOSE 4000

CMD ["node", "apps/backend/dist/main.js"]