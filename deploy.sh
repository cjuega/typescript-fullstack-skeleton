#! /bin/bash

echo "Installing dependencies"
echo "_______________________________"

npm i -g npm serverless

echo "Deploying to AWS environment"
echo "_______________________________"

ROOT_DIR=$(pwd)

for dir in $CODEBUILD_SRC_DIR/artifacts/*/*
do
    echo "Deploying $dir"
    echo "_______________________________"

    cd $dir

    # .serverless folder must be used to prevent current serverless issues --> https://github.com/serverless/serverless/issues/5381
    mkdir -p .serverless
    cp -r * .serverless

    ENV=$(basename $dir)
    sls deploy --stage $ENV --package .serverless -v

    cd $ROOT_DIR
done