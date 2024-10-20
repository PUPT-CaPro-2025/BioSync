# Stage 1: Build stage
FROM python:3.10-slim AS builder

WORKDIR /app

RUN apt-get update && \
  apt-get install -y cmake build-essential && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install gunicorn && pip install -r requirements.txt

# Stage 2: Runtime stage
FROM python:3.10-slim

WORKDIR /app

# Copy installed packages and the Gunicorn binary from builder stage
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin/gunicorn /usr/local/bin/gunicorn

COPY . .

EXPOSE 5000

ENV FLASK_APP=run.py

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]

