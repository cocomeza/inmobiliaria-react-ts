# Dockerfile para Railway
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

# CRÍTICO: Declarar variables de Railway como argumentos de build
ARG JWT_SECRET
ARG ADMIN_USERNAME
ARG ADMIN_PASSWORD

# CRÍTICO: Convertir argumentos a variables de entorno para runtime
ENV JWT_SECRET=$JWT_SECRET \
    ADMIN_USERNAME=$ADMIN_USERNAME \
    ADMIN_PASSWORD=$ADMIN_PASSWORD \
    NODE_ENV=production

# Puerto que usa Railway (adaptable)
EXPOSE $PORT

# Comando de inicio
CMD ["npm", "start"]