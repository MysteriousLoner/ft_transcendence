FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY dependencies/requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the project
COPY . /app/

# Set up entrypoint
COPY entrypoint.sh /app/
RUN dos2unix /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

EXPOSE 8000

CMD ["python", "BeatsPongServer/manage.py", "runserver", "0.0.0.0:8000"]