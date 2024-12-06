# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY dependencies/requirements.txt /app/

# Install the dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

# Copy the project files into the container at /app
COPY . /app/

# Copy the entrypoint script
# COPY entrypoint.sh /entrypoint.sh

# Make the entrypoint script executable
# RUN chmod +x /entrypoint.sh

# Expose the port that the application will run on
EXPOSE 8000

# Use the entrypoint script
# ENTRYPOINT ["/entrypoint.sh", "db"]

# Command to run the migration and then start the application
CMD ["bash", "-c", "python BeatsPongServer/manage.py makemigrations && python BeatsPongServer/manage.py migrate && python BeatsPongServer/manage.py runserver 0.0.0.0:8000"]
