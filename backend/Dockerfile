FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

# ✅ CORREGIDO: main.js está en dist/src/, no en dist/
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]