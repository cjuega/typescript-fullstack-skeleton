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

aws ssm put-parameter --name $PROJECT-$ENV-dotenv --type SecureString --value "$(cat .env.$ENV)" --overwrite --region $AWS_REGION --profile $AWS_PROFILE

if [ -f src/config/$ENV.json ]; then
    aws ssm put-parameter --name $PROJECT-$ENV-config --type SecureString --value "$(cat ./src/config/$ENV.json)" --overwrite --region $AWS_REGION --profile $AWS_PROFILE
else
    echo "WARNING!!!! Config file <src/config/$ENV.json> doesn't exist! Nothing saved!"
fi