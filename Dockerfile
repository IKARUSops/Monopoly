# --- Stage 1: Build Frontend ---
# UPDATED: Changed from node:18 to node:20 for Next.js compatibility
FROM node:24-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
# Exports Next.js to static HTML/CSS/JS in /out directory
RUN npm run build 

# --- Stage 2: Setup Backend ---
FROM python:3.14-slim
WORKDIR /app

# Install dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY server/ ./server

# Copy Frontend Build from Stage 1
COPY --from=frontend-builder /app/client/out ./client/out

# Environment Variables
ENV PORT=8000
EXPOSE 8000

# Run FastAPI (configured to serve static files from /client/out)
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]