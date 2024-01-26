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
ifndef GITHUB_ACTIONS
	yarn install --force
else
	yarn install --force >/dev/null 2>&1
endif

# Start infrastructure containers in background
.PHONY = start_infra
start_infra:
	docker-compose up -d --wait

# Start infrastructure containers in background for CI
.PHONY = start_infra_ci
start_infra_ci:
ifndef GITHUB_ACTIONS
	docker-compose up -d --wait dynamodb redis mysql mongo elasticsearch opensearch-node1 opensearch-node2 kafka rabbitmq
else
	docker compose up -d --wait dynamodb >/dev/null 2>&1
endif

# Start databases containers in background
.PHONY = start_database
start_database:
	docker-compose up -d --wait dynamodb redis mysql mongo elasticsearch opensearch-node1 opensearch-node2

# Start messaging containers in background
.PHONY = start_messaging
start_messaging:
	docker-compose up -d --wait kafka kafka-ui rabbitmq

# Run tests
.PHONY = test
test: deps start_infra_ci
	yarn test
	yarn lint

# Integration tests with all the containers are reaching the free tier limits in Github Actions.
# So we are not running them in Github Actions.
.PHONY = test_gh
test_gh: deps start_infra_ci
	yarn build && yarn test:unit && yarn test:features
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