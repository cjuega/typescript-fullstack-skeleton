#!/usr/bin/env bash

if [ $# -lt 1 ]; then
    echo "Environment argument not given!"
    exit 1
fi

PACKAGE_DIR=$(pwd)/dist/artifacts
ENV=$1

rm -rf $PACKAGE_DIR
mkdir -p $PACKAGE_DIR

if [ ! -f .env.$ENV ]; then
    echo "dotenv file <.env.$ENV> doesn't exist!"
    exit 1
fi

source .env.$ENV

npx sls package --package $PACKAGE_DIR --stage $ENV

cp .env.$ENV $PACKAGE_DIR
cp serverless.yml $PACKAGE_DIR
rsync -am --include='*.yml' --include='*/' --exclude='*' resources/ $PACKAGE_DIR/resources/
rsync -am --include='function.yml' --include='*/' --exclude='*' src/ $PACKAGE_DIR/src/