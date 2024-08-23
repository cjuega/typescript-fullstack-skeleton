# typescript-fullstack-skeleton

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
![tests](https://github.com/cjuega/typescript-fullstack-skeleton/actions/workflows/ci.yml/badge.svg)

Monorepo boilerplate for backend/frontend projects written in Typescript and following the Hexagonal Architecture and Domain-Driven Design.

This monorepo is organized in different packages with different purposes:

* `bounded context` packages (located at `src/contexts/`). These packages encapsulate the business logic of a concrete bounded context (according to a DDD approach). These are Domain entities and Use Cases, as well as Infrastructure integration code. Be aware that these packages' name must be `@context/<context-name>`.

* `application` packages (located at `src/apps/`). These packages encapsulate concrete applications of a given bounded context. It is at this point when all infrastructure details, frameworks and so on are declared. For instance, a serverless backend implementation, or an angular frontend implementation of a context. An application package makes use of the bounded context package. That way, different implementations, a *containerized backend*, a *serverless backend* and an *angular frontend*, can reuse the same domain logic. Be aware that these packages' name must be `@app/<app-name>`.

Additionally, there are two management applications that can be deployed as well:

* `@app/aws-cicd` (located at `src/apps/cicd/aws/`). This is a complete CI/CD pipeline deployed in AWS CodePipeline. The pipeline is described in `buildspec.yml` file.

* `@app/swagger-ui-docs` (located at `src/apps/docs/swagger-ui/`). This is a slightly modified version of Swagger UI to share OpenAPI specifications in a website. The website is also deployed to AWS.

For a detailed overview of each package, please refer to its README file.

## Prerequisites

* [node](https://nodejs.org/en/download/) (v14+)

* [yarn](https://classic.yarnpkg.com/lang/en/docs/install/)

* [docker](https://docs.docker.com/get-docker/)

* [docker-compose](https://docs.docker.com/compose/install/)

* [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

* [jq](https://stedolan.github.io/jq/download/)

---
**NOTE**

Make sure to check each package's README as they might have additional prerequisites.

---

## Managing more than one environment

You likely work in a multienvironment ecosystem. A common pattern is having (at least) an `staging` and `production` environments. Each environment usually has different settings or, at least, they are deployed in different infrastructure. This tipically leads to different values for environment variables, etc. Packages in this repository heavily rely on dotenv files to solve this problem. When it comes to decide which environment must be used, commands include a mandatory argument `<env>`.

For instance, to deploy services to your production environment you will do:

```sh
yarn deploy:aws pro
```

Assuming `pro` is your production environment.

## Launch tests

```sh
make test # run unit, integration and e2e tests
make clean # destroys any docker containers launched by make start_infra
```

or

```sh
make start_infra
yarn test
make clean
```

You can also go into each individual package and run tests from there (check each package README for more details).

## Versioning and releases

In order to automatically version each package, [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) are followed.

## Deploy to AWS

* deploy all services:

    ```sh
    yarn deploy:all:aws <env>
    ```

* deploy only services that have changed since the last git tag:

    ```sh
    make deploy env=<env>
    ```

    or

    ```sh
    yarn deploy:aws <env>
    ```

---
**NOTE**

Check each package's README for more details regarding any configuration files that service may need.

---

## Useful commands

### Yarn

* `yarn lint` runs linter for all packages that have changed since the last git tag.
* `yarn test:unit` runs unit tests for all packages that have changed since the last git tag.
* `yarn test:integration` runs integration tests for all packages that have changed since the last git tag.
* `yarn test:features` runs e2e tests in a local environment for all packages that have changed since the last git tag.
* `yarn test:features:aws <env>` runs e2e tests in an existing AWS environment for all packages that have changed since the last git tag.
* `yarn test` unit tests + integration tests + e2e tests all together.
* `yarn saveSetup:aws <env>` runs this same command (`saveSetup:aws <env>`) within each service in the monorepo.
* `yarn restoreSetup:aws <env>` runs this same command (`restoreSetup:aws <env>`) within each service in the monorepo.
* `yarn deploy:aws <env>` deploys all services that have changed since the last git tag to a concrete AWS environment.
* `yarn deploy:all:aws <env>` deploys all services to a concrete AWS environment.
* `yarn publish:docs:aws <env>` deploys the documentation of all services that have changed since the last git tag to a concrete AWS environment.
* `yarn destroy:aws <env>` deletes all services in a concrete AWS environment.
* `yarn clean:libs` deletes node_modules recursively.

### Make

* `make deps` check if you have docker installed and installs all dependencies.
* `make start_infra` launches docker containers for integration and e2e testing. You can mimic managed AWS services like SQS, Dynamodb, etc. But also unify any instrastructure needed by your system (databases, message brokers, etc.).
* `make test` runs linter and tests.
* `make clean` destroys any docker container launched by `make start_infra`.
* `make deploy env=<env>` deploys services to the given AWS environment. It first attempts to get configuration files for that environment using `yarn restoreSetup:aws <env>` command.

## Advanced tips

* You can disable [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) by removing the `commitlint.config.js` file and the **commit-msg** git hook from `.husky/`.
