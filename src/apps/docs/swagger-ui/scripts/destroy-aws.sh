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

AWS_ARGS=""

if [ ! -z "$AWS_REGION" ]; then
    AWS_ARGS="--region $AWS_REGION"
fi

if [ ! -z "$AWS_PROFILE" ]; then
    AWS_ARGS="$AWS_ARGS --profile $AWS_PROFILE"
fi

# FIXME: this should be done within CDK, but autoDeleteObjects property can't be set on an existing bucket
if [ ! -z "$DOCS_S3_BUCKET" ]; then
    aws s3 rm s3://$DOCS_S3_BUCKET --recursive $AWS_ARGS
fi

npx cdk destroy $AWS_ARGS