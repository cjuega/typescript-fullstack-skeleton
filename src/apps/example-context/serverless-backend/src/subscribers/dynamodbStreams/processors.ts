import { DynamoDBStreamHandler } from 'aws-lambda';
import 'source-map-support/register';
import container from '@src/config/dependency-injection';
import hydratateProcessors from '@src/subscribers/dynamodbStreams/hydratateProcessors';

const processors = hydratateProcessors(container);

export const on: DynamoDBStreamHandler = async (event) => {
    await Promise.all(processors.map((p) => p.process(event.Records)));
};
