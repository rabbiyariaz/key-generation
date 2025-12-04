# backend/Dockerfile  (place this file inside the backend/ folder)
FROM python:3.11-slim

# Install system packages needed to build wheels (including rust/cargo)
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc libffi-dev libssl-dev \
      rustc cargo && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements first for better cache behavior
COPY requirements.txt /app/requirements.txt

# Use a venv to keep environment clean
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and build tools then install requirements
RUN pip install --upgrade pip setuptools wheel maturin
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code from the current context (backend/) into /app
COPY . /app

# Set env and expose port Railway will map
ENV PORT=8080
EXPOSE 8080

# Start Uvicorn (assumes FastAPI app is `app` in main.py)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
