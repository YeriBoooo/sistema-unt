FROM node:20-alpine
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY src ./src

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Generar Prisma Client
RUN npx prisma generate

# Compilar la aplicación
RUN npm run build

# Verificar que dist se creó
RUN ls -la dist/

# Limpiar dependencias de desarrollo
RUN npm prune --production

EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]