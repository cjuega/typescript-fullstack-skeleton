#!/usr/bin/env bash

if [ $# -lt 1 ]; then
    echo "Environment argument not given!"
    exit 1
fi

ENV=$1
ARTIFACT_DIR=$(pwd)/dist/artifact
PACKAGE_DIR=$ARTIFACT_DIR/$ENV
SERVERLESS_DIR=$PACKAGE_DIR/serverless

if [ ! -f .env.$ENV ]; then
    echo "dotenv file <.env.$ENV> doesn't exist!"
    exit 1
fi

source .env.$ENV

npx sls package --package $PACKAGE_DIR --stage $ENV

mkdir -p $SERVERLESS_DIR

cp .env.$ENV $SERVERLESS_DIR
cp serverless.yml $SERVERLESS_DIR
rsync -am --include='*.yml' --include='*/' --exclude='*' resources/ $SERVERLESS_DIR/resources/
rsync -am --include='function.yml' --include='*/' --exclude='*' src/ $SERVERLESS_DIR/src/