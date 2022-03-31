#!/usr/bin/env bash

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

SERVICE_FLAVOR=$(basename $(pwd))
DOCS=dist/docs/api/openapi.yml

AWS_ARGS=""

if [ ! -z "$AWS_REGION" ]; then
    AWS_ARGS="--region $AWS_REGION"
fi

if [ ! -z "$AWS_PROFILE" ]; then
    AWS_ARGS="$AWS_ARGS --profile $AWS_PROFILE"
fi

if [ ! -z "$DOCS_S3_BUCKET" ] && [ -f $DOCS ]; then
    echo "Deploying docs for <$PROJECT ($SERVICE_FLAVOR)>!"
    aws s3 cp $DOCS s3://$DOCS_S3_BUCKET/apis/$PROJECT/$SERVICE_FLAVOR/openapi.yml --cache-control no-cache $AWS_ARGS
else
    echo "docs for <$PROJECT ($SERVICE_FLAVOR)> not found or DOCS_S3_BUCKET not found in <.env.$ENV>. Skipping docs deployment..."
fi