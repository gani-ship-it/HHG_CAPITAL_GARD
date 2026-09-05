# Python 3.11/3.12 slim for lightweight footprint
FROM python:3.11-slim

WORKDIR /app

# Install system build dependencies for CVXPY / scientific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run.py"]
