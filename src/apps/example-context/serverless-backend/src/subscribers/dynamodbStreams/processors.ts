// eslint-disable-next-line import/no-unresolved
import { DynamoDBStreamHandler } from 'aws-lambda';
import 'source-map-support/register';
import container from '@src/config/dependency-injection';
import hydratateProcessors from '@src/subscribers/dynamodbStreams/hydratateProcessors';

const processors = hydratateProcessors(container);

// eslint-disable-next-line one-var,import/prefer-default-export
export const on: DynamoDBStreamHandler = async (event) => {
    await Promise.all(processors.map((p) => p.process(event.Records)));
};
