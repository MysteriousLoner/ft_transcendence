# Makefile

# Variables
COMPOSE = docker-compose
PROJECT_NAME = myproject

# Targets
.PHONY: all stop clean re

all:## Build the entire project with Docker Compose
	$(COMPOSE) up --build -d

stop: ## Stop all containers
	$(COMPOSE) down --remove-orphans

clean:## Remove all containers, images, and volumes
	$(COMPOSE) down --rmi all --volumes --remove-orphans

soft:
	docker-compose restart server

migrate:
	docker-compose run server python BeatsPongServer/manage.py makemigrations
	docker-compose run server python BeatsPongServer/manage.py migrate


re: stop clean all ## Restart the project: stop, clean, and build again

help: ## Display this help
	@echo "Usage:"
	@echo "  make [target]"
	@echo
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[_{{{CITATION{{{_1{](https://github.com/buettel/projx/tree/ffe283daf695b88a1797e7e460472c9e6d6699ac/conf%2Fprojx.sh)[_{{{CITATION{{{_2{](https://github.com/budougumi0617/blog/tree/0981a18200223097fafa702e0ab313042b2b8162/content%2Fpost%2F2019%2F03%2F20%2Fpublish-docker-image-for-sql-training.md)