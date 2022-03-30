#! /bin/bash

echo "Installing dependencies"
echo "_______________________________"

npm i -g npm serverless

echo "Deploying to AWS environment"
echo "_______________________________"

ROOT_DIR=$(pwd)
ARTIFACT_DIR=dist/artifact/
DOCS_PATH=dist/docs/api/openapi.yml

for dir in $CODEBUILD_SRC_DIR/src/apps/*/*/$ARTIFACT_DIR/*
do
    ENV=$(basename $dir)
    PACKAGE_DIR=$dir
    cd $dir/../../../
    SERVICE_FLAVOR=$(basename $(pwd))
    DOCS=$(pwd)/$DOCS_PATH

    source .env.$ENV

    echo "Deploying <$PROJECT ($SERVICE_FLAVOR)> into <$ENV> environment"

    # .serverless folder must be used to prevent current serverless issues --> https://github.com/serverless/serverless/issues/5381
    mkdir -p .serverless
    cp -r $PACKAGE_DIR .serverless

    sls deploy --stage $ENV --package .serverless

    $ROOT_DIR/scripts/publish-docs-aws.sh $ENV

    echo "_______________________________"

    cd $ROOT_DIR
done