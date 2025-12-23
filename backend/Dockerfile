FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema (Needed for postinstall "prisma generate")
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start application
# Start application
# Start application
CMD ["/bin/sh", "-c", "npx prisma db push && npm start"]
