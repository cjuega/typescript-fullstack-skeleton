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

# Start infrastructure containers in background
.PHONY = start_infra
start_infra:
	docker-compose up -d

# Start databases containers in background
.PHONY = start_database
start_database:
	docker-compose up -d dynamodb

# Start messaging containers in background
.PHONY = start_messaging
start_messaging:
	docker-compose up -d kafka kafka-ui

# Run tests
.PHONY = test
test: deps start_infra
	yarn test
	yarn lint

# Deploy code to an environment in AWS (cicd by default)
env = cicd
.PHONY = deploy
deploy:
	yarn restoreSetup:aws $(env)
	yarn deploy:aws $(env)

# Clean containers
.PHONY = clean
clean:
	docker-compose down --rmi local --volumes --remove-orphans