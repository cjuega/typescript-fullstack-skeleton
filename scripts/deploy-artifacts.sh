#! /bin/bash

ROOT_DIR=$(pwd)
ARTIFACT_DIR=dist/artifact/
DOCS_PATH=dist/docs/api/openapi.yml

if [ -z "$CODEBUILD_SRC_DIR" ]; then
    CODEBUILD_SRC_DIR=$ROOT_DIR
else
    echo "Installing dependencies"
    echo "_______________________________"

    npm i -g npm serverless
fi

echo "Deploying to AWS environment"
echo "_______________________________"

for dir in $CODEBUILD_SRC_DIR/src/apps/*/*/$ARTIFACT_DIR/*/
do  
    ENV=$(basename $dir)
    cd $dir/../../../
    SERVICE_FLAVOR=$(basename $(pwd))
    DOCS=$(pwd)/$DOCS_PATH

    cp -r $dir/serverless/. ./

    # .serverless folder must be used to prevent current serverless issues --> https://github.com/serverless/serverless/issues/5381
    mkdir -p .serverless
    cp -r $dir/. .serverless

    source .env.$ENV

    echo "Deploying <$PROJECT ($SERVICE_FLAVOR)> into <$ENV> environment"

    sls deploy --stage $ENV --package .serverless

    $ROOT_DIR/scripts/publish-docs-aws.sh $ENV

    echo "_______________________________"

    cd $ROOT_DIR
done