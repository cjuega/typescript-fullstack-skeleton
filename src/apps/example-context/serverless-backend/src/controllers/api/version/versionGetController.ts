import type { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import type { Logger } from '@context/shared/domain/logger';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import container from '@src/config/dependency-injection';
import { version } from '../../../../package.json';

const logger: Logger = container.get('Shared.Logger'),
    handler: APIGatewayProxyHandler = (event) => {
        logger.debug(`REQUEST:: ${JSON.stringify(event, null, 2)}`);

        return Promise.resolve({
            statusCode: 200,
            body: JSON.stringify({ version })
        });
    };

export const get = middy(handler).use(cors());
