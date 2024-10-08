import type { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import CreateExampleAggregateCommand from '@context/example/example-aggregate/application/create/createExampleAggregateCommand';
import type CreateExampleAggregateCommandHandler from '@context/example/example-aggregate/application/create/createExampleAggregateCommandHandler';
import ExampleAggregateAlreadyExists from '@context/example/example-aggregate/domain/exampleAggregateAlreadyExists';
import InvalidArgument from '@context/shared/domain/invalidArgument';
import type { Logger } from '@context/shared/domain/logger';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import container from '@src/config/dependency-injection';
import handleError from '@src/controllers/handleError';

const logger: Logger = container.get('Shared.Logger'),
    commandHandler: CreateExampleAggregateCommandHandler = container.get(
        '<YourBoundedContext>.exampleAggregate.CreateExampleAggregateCommandHandler'
    ),
    exceptions = [
        {
            clazz: InvalidArgument,
            errorCode: 400
        },
        {
            clazz: ExampleAggregateAlreadyExists,
            errorCode: 400
        }
    ],
    handler: APIGatewayProxyHandler = async (event) => {
        try {
            logger.debug(`REQUEST:: ${JSON.stringify(event, null, 2)}`);

            const { id } = event.pathParameters || {},
                command = new CreateExampleAggregateCommand({
                    id: id || ''
                });

            await commandHandler.handle(command);

            return {
                statusCode: 201,
                body: ''
            };
        } catch (e) {
            return handleError(exceptions, e as Error);
        }
    };

export const create = middy(handler).use(cors());
