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

AWS_ARGS=""

if [ ! -z "$AWS_REGION" ]; then
    AWS_ARGS="--region $AWS_REGION"
fi

if [ ! -z "$AWS_PROFILE" ]; then
    AWS_ARGS="$AWS_ARGS --profile $AWS_PROFILE"
fi

aws ssm put-parameter --name $PROJECT-$ENV-dotenv --type SecureString --value "$(cat .env.$ENV)" --overwrite $AWS_ARGS

if [ -f src/config/$ENV.json ]; then
    aws ssm put-parameter --name $PROJECT-$ENV-config --type SecureString --value "$(cat ./src/config/$ENV.json)" --overwrite $AWS_ARGS
else
    echo "WARNING!!!! Config file <src/config/$ENV.json> doesn't exist! Nothing saved!"
fi