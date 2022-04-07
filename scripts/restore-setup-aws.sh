#!/usr/bin/env bash

if [ $# -lt 1 ]; then
    echo "Environment argument not given!"
    exit 1
fi

ENV=$1

if [ ! -f .env.$ENV ]; then
    echo "dotenv file <.env.$ENV> doesn't exist!"
    echo ""
    echo "defaulting to <.env.offline> settings..."
    cp .env.offline .env.$ENV
fi

source .env.$ENV

AWS_ARGS=""

if [ ! -z "$AWS_REGION" ]; then
    AWS_ARGS="--region $AWS_REGION"
fi

if [ ! -z "$AWS_PROFILE" ]; then
    AWS_ARGS="$AWS_ARGS --profile $AWS_PROFILE"
fi

DOES_PARAM_EXIST=$(aws ssm describe-parameters --parameter-filters Key=Name,Option=Equals,Values=$SERVICE_NAME-$ENV-dotenv $AWS_ARGS | jq -r '.Parameters[0]')
if [ ! -z "$DOES_PARAM_EXIST" ] && [ "$DOES_PARAM_EXIST" != "null" ]; then
    aws ssm get-parameter --with-decryption --name $SERVICE_NAME-$ENV-dotenv $AWS_ARGS | jq -r '.Parameter.Value' > .env.$ENV
fi

DOES_PARAM_EXIST=$(aws ssm describe-parameters --parameter-filters Key=Name,Option=Equals,Values=$SERVICE_NAME-$ENV-config $AWS_ARGS | jq -r '.Parameters[0]')
if [ ! -z "$DOES_PARAM_EXIST" ] && [ "$DOES_PARAM_EXIST" != "null" ]; then
    aws ssm get-parameter --with-decryption --name $SERVICE_NAME-$ENV-config $AWS_ARGS | jq -r '.Parameter.Value' > ./src/config/$ENV.json
fi