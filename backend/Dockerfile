FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Compilar TypeScript a JavaScript
RUN npm run build

# Verificar que dist se creó
RUN ls -la dist/

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Verificar que dist existe en runner
RUN ls -la ./dist/ || echo "WARNING: dist not found"

EXPOSE 3000
CMD ["npm", "run", "start:prod"]