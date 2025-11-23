# -------------------------
# Single Stage: Full Build with Dev + Prod Deps
# -------------------------
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build


# Expose API port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
