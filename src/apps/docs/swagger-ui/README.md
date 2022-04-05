# Swagger UI

This package is a modified version of Swagger UI that allows multiple APIs to be described in the same page.

## Setup

You must create a dotenv file for each environment you want to deploy. These dotenv files are in the format `.env.<env>`. For instance, `.env.pro` for a production environment.

There are two environment variables you may need to define:

* **SWAGGER_UI_VERSION** the swagger UI version you want to use. For instance, `3.43.0`.
* **DOCS_S3_BUCKET** the S3 bucket name that will hold the static website. This variable is optional, if you don't pass it, then you must manually deploy the content of `dist` to the infrastructure of your choice.