# Define your Docker image and container names
IMAGE_NAME=beatspongfe
CONTAINER_NAME=beatspontct

# Default target
all: build run

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the Docker container
run:
	docker run -d -p 3000:80 --name $(CONTAINER_NAME) $(IMAGE_NAME)

# Stop the Docker container
stop:
	docker stop $(CONTAINER_NAME) || true

# Clean up Docker resources
clean: stop
	docker system prune -f
	docker image prune -f
	docker volume prune -f
	docker network prune -f
	docker system prune -f

.PHONY: all build run stop clean
