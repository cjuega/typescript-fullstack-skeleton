SHELL := $(shell which bash)
# Test if the dependencies we need to run this Makefile are installed
DOCKER := $(shell command -v docker)
DOCKER_COMPOSE := $(shell command -v docker-compose)
.PHONY = deps
deps:
ifndef DOCKER
	@echo "Docker is not available. Please install docker"
	@exit 1
endif
ifndef DOCKER_COMPOSE
	@echo "docker-compose is not available. Please install docker-compose"
	@exit 1
endif
	yarn install --force

# Start databases containers in background
.PHONY = start_database
start_database:
	docker-compose up -d dynamodb

# Build deployment code for AWS
.PHONY = build
build:
	yarn build
	yarn build:aws

# Run tests
.PHONY = test
test: deps start_database
	yarn test

# Clean containers
.PHONY = clean
clean:
	docker-compose down --rmi local --volumes --remove-orphans