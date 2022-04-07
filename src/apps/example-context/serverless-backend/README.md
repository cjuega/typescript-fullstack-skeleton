# typescript-fullstack-skeleton

[![serverless](http://public.serverless.com/badges/v3.svg)](https://serverless.com)

A serverless project to illustrate how a serverless implementation in AWS of the `example-context` bounded context would look like.

## Prerequisites

* [node](https://nodejs.org/en/download/) (v14+)

* [yarn](https://classic.yarnpkg.com/lang/en/docs/install/)

* [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

* [jq](https://stedolan.github.io/jq/download/)

## Managing more than one environment

You likely work in a multienvironment ecosystem. A common pattern is having (at least) an `staging` and `production` environments. Each environment usually has different settings or, at least, they are deployed in different infrastructure. This tipically leads to different values for environment variables, etc. Packages in this repository heavily rely on dotenv files to solve this problem. When it comes to decide which environment must be used, commands include a mandatory argument `<env>`.

For instance, to deploy services to your production environment you will do:

```sh
yarn deploy:aws pro
```

Assuming `pro` is your production environment.

## Setup

There two types of configuration files in this repository. On one hand, dotenv (`.env.<env>`) files, they define environment variables that are used by the Serverless Framework to interact with AWS (for instance, which AWS Region deploy to). On the other hand, you have config files at `src/config/<env>.json` that includes specific configuration at application level (database credentials, urls, etc.).

A dotenv file is as follows:

```sh
PROJECT=example-context
AWS_REGION=eu-west-1
DEBUG=*
```

Whereas a config file looks like:

```json
{
    "eventbridge": {
        "source": "company.service.cicd",
        "eventBusName": "example-context-cicd-events"
    },
    "ddbonetable": {
        "tableName": "example-context-cicd-table",
        "indexes": {
            "primary": {
                "hash": "pk",
                "sort": "sk"
            },
            "example-context-cicd-gsi1": {
                "hash": "gsi1pk",
                "sort": "gsi1sk"
            }
        },
        "logger": true
    }
}
```

None of these files are persisted in the repository as they are classified as *secrets*. Nevertheless, this repository *does* provide a mechanism to share configurations with the CI/CD pipeline and other team members: `saveSetup` and `restoreSetup` yarn scripts.

Before running any commands in a particular environment, make sure you have the proper configuration files.

The table below indicates the environment variables you can define within these dotenv files:

| Name               | Mandatory | Description                                                            | Used by |
| ------------------ | --------- |----------------------------------------------------------------------- | ------- |
| PROJECT            | yes       | An arbitrary name that identifies this service in AWS, it's also used to save/restore dotenv and config files in AWS Parameter Store. | `yarn deploy:aws <env>`<br/>`yarn saveSetup:aws <env>`<br/>`yarn restoreSetup:aws <env>`<br/>`yarn test:features:aws <env>`<br/>`yarn describe:aws <env>`<br/>`yarn destroy:aws <env>` |
| AWS_PROFILE        | no        | AWS profile used to interact with AWS. If it is not set, then the default configuration is used. | `yarn deploy:aws <env>`<br/>`yarn saveSetup:aws <env>`<br/>`yarn restoreSetup:aws <env>`<br/>`yarn test:features:aws <env>`<br/>`yarn describe:aws <env>`<br/>`yarn destroy:aws <env>` |
| AWS_REGION         | no        | AWS region to interact with. If it is not set, then the default configuration is used. | `yarn deploy:aws <env>`<br/>`yarn saveSetup:aws <env>`<br/>`yarn restoreSetup:aws <env>`<br/>`yarn test:features:aws <env>`<br/>`yarn describe:aws <env>`<br/>`yarn destroy:aws <env>` |
| DEBUG              | no        | debug level in the Serverless Framework. Typically set to `DEBUG=*` |  `yarn start`<br/>`yarn test` |

---
**NOTE**

Adding `AWS_PROFILE` to the dotenv file prevents you from passing it manually to each command. But **do not persist that parameter using `saveSetup`**! Otherwise you will impact other team member (which may not use the same name as yours for their AWS profiles); but also the CI/CD which doesn't use any profile at all!

---

## Launch tests

e2e tests can be launched against an offline environment (powered by [serverless-offline](https://github.com/dherault/serverless-offline)):

```sh
yarn test
```

---
**NOTE**

For offline testing make sure you have called `make start_database` before running tests, so any required infrastructure is up when they are launched!

---

You can also run e2e tests in an existing environment in AWS:

```sh
yarn test:features:aws <env>
```

Be aware e2e tests will clean up any data between tests, so **don't launch them in a production environment**.

## Deploy to AWS

```sh
yarn deploy:aws <env>
```

## Useful commands

* `yarn lint` runs linter for all packages that have changed since the last git tag.
* `yarn docs:bundle` creates a distribution version of the Open API specification for this service.
* `yarn start` launches serverless offline.
* `yarn test` runs e2e tests in an offline environment.
* `yarn test:features:aws <env>` runs e2e tests in an existing AWS environment.
* `yarn deploy:aws <env>` deploys this service to AWS.
* `yarn saveSetup:aws <env>` stores dotenv and config files for the given environment in AWS Parameter Store.
* `yarn restoreSetup:aws <env>` retrieves dotenv and config files for the given environment from AWS Parameter Store.
* `yarn describe:aws <env>` prints relevant information like the API endpoint of a concrete AWS environment.
* `yarn publish:docs:aws <env>` publishes the current version of the documentation to an existing **@app/swagger-ui-docs** instance.
* `yarn destroy:aws <env>` deletes a concrete AWS environment.
