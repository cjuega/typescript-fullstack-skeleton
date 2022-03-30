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

if [ -z "$AWS_PROFILE" ]; then
    AWS_PROFILE=default
fi

DOES_PARAM_EXIST=$(aws ssm describe-parameters --parameter-filters Key=Name,Option=Equals,Values=$PROJECT-$ENV-dotenv --region $AWS_REGION --profile $AWS_PROFILE | jq -r '.Parameters[0]')
if [ ! -z "$DOES_PARAM_EXIST" ] && [ "$DOES_PARAM_EXIST" != "null" ]; then
    aws ssm get-parameter --with-decryption --name $PROJECT-$ENV-dotenv --region $AWS_REGION --profile $AWS_PROFILE | jq -r '.Parameter.Value' > .env.$ENV
fi

DOES_PARAM_EXIST=$(aws ssm describe-parameters --parameter-filters Key=Name,Option=Equals,Values=$PROJECT-$ENV-config --region $AWS_REGION --profile $AWS_PROFILE | jq -r '.Parameters[0]')
if [ ! -z "$DOES_PARAM_EXIST" ] && [ "$DOES_PARAM_EXIST" != "null" ]; then
    aws ssm get-parameter --with-decryption --name $PROJECT-$ENV-config --region $AWS_REGION --profile $AWS_PROFILE | jq -r '.Parameter.Value' > ./src/config/$ENV.json
fi