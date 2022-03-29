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

SERVICE_URL=$(scripts/service-aws.sh $ENV)

AWS_PROFILE=$AWS_PROFILE NODE_ENV=$ENV CLOUD_URL=$SERVICE_URL yarn test:only