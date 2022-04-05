# Swagger UI

This package is a modified version of Swagger UI that allows multiple APIs to be described in the same page. AWS CDK is used to handle infrastructure in AWS.

![Architecture](architecture.png)

## Prerequisites

* [node](https://nodejs.org/en/download/) (v14+)

* [yarn](https://classic.yarnpkg.com/lang/en/docs/install/)

* [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

* [jq](https://stedolan.github.io/jq/download/)

## Setup

You must create a dotenv file for each environment you want to deploy. These dotenv files are in the format `.env.<env>`. For instance, `.env.pro` for a production environment.

The table below indicates the environment variables you can define within these dotenv files:

| Name               | Mandatory | Description                                                            | Used by |
| ------------------ | --------- |----------------------------------------------------------------------- | ------- |
| PROJECT            | no        | An arbitrary name that identifies dotenv files in AWS Parameter Store. If it is not set, dependent commands may not work properly. | `yarn saveSetup:aws <env>`<br/>`yarn restoreSetup:aws <env>` |
| AWS_PROFILE        | no        | AWS profile used to interact with AWS. If it is not set, then the default configuration is used. | `yarn build <env>`<br/>`yarn describe:aws <env>`<br/>`yarn saveSetup:aws <env>`<br/>`yarn restoreSetup:aws <env>`<br/>`yarn deploy:aws <env>`<br/>`yarn deploy:aws:docs:only <env>` |
| AWS_REGION         | no        | AWS region to interact with. If it is not set, then the default configuration is used. | `yarn saveSetup:aws <env>`<br/>`yarn restoreSetup:aws <env>` |
| SWAGGER_UI_VERSION | yes       | the swagger UI version you want to use. For instance, `3.43.0`. | `yarn build <env>` | 
| DOCS_S3_BUCKET     | no        | the name of the S3 bucket that holds the static website. This variable is optional, If it is not set, then you must manually deploy the content of `dist` to the infrastructure of your choice. | `yarn build <env>`<br/>`yarn deploy:aws:docs:only <env>`|

## Useful commands

* `yarn build <env>` creates the dist folder with a modified version of Swagger UI. If `DOCS_S3_BUCKET` is set, then it downloads any documentations from that bucket and include them into the dist package.
* `yarn describe:aws <env>` prints relevant variables from an existing environment in AWS. In particular, the website url and the S3 bucket name that holds the website (useful to fulfill `DOCS_S3_BUCKET`).
* `yarn saveSetup:aws <env>` stores the local `.env.<env>` file in AWS Parameter Store.
* `yarn restoreSetup:aws <env>` retrieves `.env.<env>` file from AWS Parameter Store.
* `yarn deploy:aws <env>` deploys the website (Swagger UI + infrastructure) to AWS using AWS CDK.
* `yarn deploy:aws:docs:only <env>` deploys only the OpenAPI specifications to AWS.
* `yarn destroy:aws <env>` destroys the website in AWS using AWS CDK.
* `yarn cdk ...` launches AWS CDK commands.