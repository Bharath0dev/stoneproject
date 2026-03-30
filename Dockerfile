# ---------- FRONTEND BUILD ----------
FROM node:20 AS frontend

WORKDIR /app/frontend
COPY frontend/ .

RUN npm install
RUN npm run build


# ---------- BACKEND ----------
FROM python:3.10

WORKDIR /app

# Copy backend
COPY backend/ ./backend

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend build into backend static folder
COPY --from=frontend /app/frontend/dist ./frontend_dist

# Expose port
EXPOSE 8000

# Run app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]