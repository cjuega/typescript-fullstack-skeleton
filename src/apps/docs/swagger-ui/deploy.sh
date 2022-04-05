#!/bin/bash

if [ $# -lt 1 ]; then
    echo "Environment argument not given!"
    exit 1
fi

ENV=$1

if [ ! -f .env.$ENV ]; then
    echo "dotenv file <.env.$ENV> doesn't exist!"
    exit 1
fi

source .env.$ENV

if [ ! -d dist ]; then
    echo "There is no dist folder. You must run _yarn build <env>_ first"
fi

if [ -z "$DOCS_S3_BUCKET" ]; then
    echo "DOCS_S3_BUCKET not found in <.env.$ENV>. Skipping docs deployment..."
    exit 0
fi

AWS_ARGS=""

if [ ! -z "$AWS_REGION" ]; then
    AWS_ARGS="--region $AWS_REGION"
fi

if [ ! -z "$AWS_PROFILE" ]; then
    AWS_ARGS="$AWS_ARGS --profile $AWS_PROFILE"
fi

echo '---- Cleaning up $S3_BUCKET_NAME S3 bucket -->'
aws s3 rm s3://$DOCS_S3_BUCKET --recursive $AWS_ARGS

echo '---- Uploading SwaggerUI to S3 -->'
aws s3 sync dist/ s3://$DOCS_S3_BUCKET/ --cache-control no-cache $AWS_ARGS