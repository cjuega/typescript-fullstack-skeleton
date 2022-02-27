// eslint-disable-next-line import/no-unresolved
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import handleError from '@src/controllers/handleError';
import ConsoleLogger from '@context/shared/infrastructure/consoleLogger';
import CurrentTimeClock from '@context/shared/infrastructure/currentTimeClock';
// eslint-disable-next-line max-len
import InMemoryExampleAggregateRepository from '@context/example/example-module/infrastructure/persistence/inMemoryExampleAggregateRepository';
import InMemorySyncEventBus from '@context/shared/infrastructure/eventBus/inMemorySyncEventBus';
import CreateExampleAggregateCommandHandler from '@context/example/example-module/application/create/createExampleAggregateCommandHandler';
import ExampleAggregateCreator from '@context/example/example-module/application/create/exampleAggregateCreator';
import CreateExampleAggregateCommand from '@context/example/example-module/application/create/createExampleAggregateCommand';
import InvalidArgument from '@context/shared/domain/invalidArgument';
import ExampleAggregateAlreadyExists from '@context/example/example-module/domain/exampleAggregateAlreadyExists';

const logger = new ConsoleLogger(),
    clock = new CurrentTimeClock(),
    repository = new InMemoryExampleAggregateRepository(),
    eventBus = new InMemorySyncEventBus(),
    commandHandler = new CreateExampleAggregateCommandHandler(new ExampleAggregateCreator(clock, repository, eventBus)),
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

// eslint-disable-next-line import/prefer-default-export,one-var
export const create = middy(handler).use(cors());
