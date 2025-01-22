# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY dependencies/requirements.txt /app/

# Install the dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Install PostgreSQL client and OpenSSL
RUN apt-get update && apt-get install -y postgresql-client openssl

# Create directory for certificates
RUN mkdir -p /etc/certs

# Ensure the init.sh script is executable

# Copy the project files and the init script into the container
COPY . /app/

RUN chmod +x init.sh
# Expose the ports that the application will run on
EXPOSE 8000
EXPOSE 8001

# Use the entrypoint script
# ENTRYPOINT ["bash", "init.sh"]

# Command to run the migration and then start the application
CMD ["bash", "-c", "python BeatsPongServer/manage.py makemigrations && python BeatsPongServer/manage.py migrate && python BeatsPongServer/manage.py runserver 0.0.0.0:8000 && init.sh"]
