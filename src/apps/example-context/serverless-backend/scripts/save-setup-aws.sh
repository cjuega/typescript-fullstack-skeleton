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

AWS_PROFILE=$AWS_PROFILE aws ssm put-parameter --name $PROJECT-$ENV-dotenv --type SecureString --value "$(cat .env.$ENV)" --overwrite

if [ -f src/config/$ENV.json ]; then
    AWS_PROFILE=$AWS_PROFILE aws ssm put-parameter --name $PROJECT-$ENV-config --type SecureString --value "$(cat ./src/config/$ENV.json)" --overwrite
else
    echo "WARNING!!!! Config file <src/config/$ENV.json> doesn't exist! Nothing saved!"
fi