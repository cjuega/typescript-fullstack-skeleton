// eslint-disable-next-line import/no-unresolved
import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import ConsoleLogger from '@context/shared/infrastructure/consoleLogger';
import { version } from '../../../../package.json';

const logger = new ConsoleLogger(),
    handler: APIGatewayProxyHandler = async (event) => {
        logger.debug(`REQUEST:: ${JSON.stringify(event, null, 2)}`);

        return {
            statusCode: 200,
            body: JSON.stringify({ version })
        };
    };

// eslint-disable-next-line import/prefer-default-export,one-var
export const get = middy(handler).use(cors());
