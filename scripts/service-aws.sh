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

aws cloudformation describe-stacks --stack-name $PROJECT-$ENV --region $AWS_REGION --profile $AWS_PROFILE | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="ServiceEndpoint") | .OutputValue'