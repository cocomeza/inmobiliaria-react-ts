# Dockerfile para Render
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build del proyecto TypeScript
RUN npm run build

# Puerto que usa Render
EXPOSE 10000

# Comando de inicio
CMD ["npm", "start"]