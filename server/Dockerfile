# Use the official Python image from Docker Hub
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . .

# Expose port 8000 for the Django application
EXPOSE 8000

# Command to run the Django application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myapp.wsgi:application"]
