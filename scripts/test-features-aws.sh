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

SERVICE_URL=$(../../../../scripts/service-aws.sh $ENV)

if [ -z "$AWS_PROFILE" ]; then
    AWS_REGION=$AWS_REGION NODE_ENV=$ENV CLOUD_URL=$SERVICE_URL yarn test:only
else
    AWS_PROFILE=$AWS_PROFILE AWS_REGION=$AWS_REGION NODE_ENV=$ENV CLOUD_URL=$SERVICE_URL yarn test:only
fi