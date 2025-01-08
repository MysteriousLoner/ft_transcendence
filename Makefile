# Makefile

# Root Check
ifeq ($(shell id -u),0)
    COMPOSE = docker-compose
else
    $(error This Makefile needs to be run with sudo)
endif

PROJECT_NAME = myproject

# Targets
.PHONY: all stop clean re

all:## Build the entire project with Docker Compose
	@echo "Starting project..."
	@echo "Note: Migrations will run automatically during startup - no need to run them manually"
	$(COMPOSE) up --build -d

stop: ## Stop all containers
	$(COMPOSE) down --remove-orphans

clean:## Remove all containers, images, and volumes
	$(COMPOSE) down --rmi all --volumes --remove-orphans

soft:## Restart only the server container
	@echo "Restarting server..."
	@echo "Note: Any new migrations will be applied automatically"
	$(COMPOSE) restart server

migrate:## DEPRECATED - Migrations now run automatically during startup
	@echo "⚠️  WARNING: Migrations now run automatically during startup"
	@echo "⚠️  Running migrations manually may cause conflicts"
	@echo "⚠️  Use 'make all' or 'make re' instead"
	@exit 1

re: stop clean all ## Restart the project: stop, clean, and build again

help: ## Display this help
	@echo "Usage:"
	@echo "  make [target]"
	@echo "Note: This Makefile must be run with sudo"
	@echo
	@echo "Examples:"
	@echo "  sudo make all"
	@echo "  sudo make stop"
	@echo
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Note: Migrations are handled automatically during startup - no need to run them manually"