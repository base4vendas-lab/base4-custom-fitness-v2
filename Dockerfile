# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

WORKDIR /app

# Criar diretório de logs
RUN mkdir -p /app/logs

# Copiar node_modules do builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar arquivos da aplicação
COPY server.js .
COPY index.html .
COPY package*.json .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Mudar ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Iniciar aplicação
CMD ["node", "server.js"]
