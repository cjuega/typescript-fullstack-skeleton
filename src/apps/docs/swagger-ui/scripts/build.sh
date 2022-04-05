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

rm -rf .tmp/
mkdir .tmp
rm -rf dist/
mkdir -p dist/apis

cd .tmp

echo '---- Fetching SwaggerUI $SWAGGER_UI_VERSION -->'
wget https://github.com/swagger-api/swagger-ui/archive/v$SWAGGER_UI_VERSION.tar.gz
tar -zxvf v$SWAGGER_UI_VERSION.tar.gz
rm v$SWAGGER_UI_VERSION.tar.gz
cp -r swagger-ui-$SWAGGER_UI_VERSION/dist/ ../dist/
cp ../src/index.html ../dist/
cp ../src/docs-list.json ../dist/

if [ -z "$DOCS_S3_BUCKET" ]; then
    echo "DOCS_S3_BUCKET not found in <.env.$ENV>. I can't try to update docs-list.json from an existing deployment."
    exit 0
fi

AWS_ARGS=""

if [ ! -z "$AWS_REGION" ]; then
    AWS_ARGS="--region $AWS_REGION"
fi

if [ ! -z "$AWS_PROFILE" ]; then
    AWS_ARGS="$AWS_ARGS --profile $AWS_PROFILE"
fi

echo '---- Retrieve exising API swagger files -->'
aws s3 cp s3://$DOCS_S3_BUCKET/docs-list.json ../dist/docs-list.json $AWS_ARGS
aws s3 sync s3://$DOCS_S3_BUCKET/apis/ ../dist/apis/ $AWS_ARGS