#!/bin/bash

if [ $# -lt 3 ]; then
    echo "Some params are missing!"
    echo ""
    echo "publish-aws-single-api.sh <api-name> <openapi-filepath> <environment>"
    exit 1
fi

SERVICE_NAME=$1
OPENAPI_FILEPATH=$2
ENV=$3
OPENAPI_FILENAME=$(basename $OPENAPI_FILEPATH)
OPENAPI_NAME=$(yq e '.info.title' $OPENAPI_FILEPATH)
OPENAPI_SERVICE_VERSION=v$(yq e '.info.version' $OPENAPI_FILEPATH)
NAME_IN_SWAGGER="$OPENAPI_NAME ($OPENAPI_SERVICE_VERSION)"
SWAGGER_DIR="apis/$SERVICE_NAME/$OPENAPI_SERVICE_VERSION"
URL_IN_SWAGGER="$SWAGGER_DIR/$OPENAPI_FILENAME"

if [ ! -f .env.$ENV ]; then
    echo "dotenv file <.env.$ENV> doesn't exist!"
    exit 1
fi

if [ ! -f $OPENAPI_FILEPATH ]; then
    echo "Given OpenAPI file <$OPENAPI_FILEPATH> doesn't exist!"
    exit 1
fi

source .env.$ENV

if [ -z "$DOCS_S3_BUCKET" ]; then
    echo "DOCS_S3_BUCKET not found in <.env.$ENV>. Skipping docs deployment..."
    exit 0
fi

rm -rf .tmp/
mkdir .tmp

cp src/docs-list.json .tmp/
mkdir -p .tmp/$SWAGGER_DIR

AWS_ARGS=""

if [ ! -z "$AWS_REGION" ]; then
    AWS_ARGS="--region $AWS_REGION"
fi

if [ ! -z "$AWS_PROFILE" ]; then
    AWS_ARGS="$AWS_ARGS --profile $AWS_PROFILE"
fi

aws s3 cp s3://$DOCS_S3_BUCKET/docs-list.json .tmp/docs-list.json $AWS_ARGS
jq ". += [{\"name\": \"$NAME_IN_SWAGGER\", \"url\": \"$URL_IN_SWAGGER\"}] | unique_by(.name) | sort_by(.name) | reverse" .tmp/docs-list.json > .tmp/docs-list.tmp.json && mv .tmp/docs-list.tmp.json .tmp/docs-list.json

aws s3 cp s3://$DOCS_S3_BUCKET/apis/ .tmp/apis/ $AWS_ARGS
cp $OPENAPI_FILEPATH .tmp/$SWAGGER_DIR

aws s3 sync .tmp/ s3://$DOCS_S3_BUCKET/ $AWS_ARGS

CLOUDFRONT_DISTRIBUTION_ID=$(scripts/describe-aws.sh $ENV | jq -r '.CloudfrontDistributionId')
if [ "$CLOUDFRONT_DISTRIBUTION_ID" != "null" ]; then
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths '/docs-list.json' '/apis/*' $AWS_ARGS
fi