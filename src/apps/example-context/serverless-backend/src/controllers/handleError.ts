import type { Logger } from '@context/shared/domain/logger';
import type { Nullable } from '@context/shared/domain/nullable';
import container from '@src/config/dependency-injection';
import type { APIGatewayProxyResult } from 'aws-lambda';

const logger: Logger = container.get('Shared.Logger');

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type ErrorMapping = { clazz: Function; errorCode: number };

function handleCustomException(exceptions: ErrorMapping[], error: Error): Nullable<APIGatewayProxyResult> {
    const errorResult = exceptions.reduce((_errorResult: Nullable<APIGatewayProxyResult>, { clazz, errorCode }) => {
        if (_errorResult) {
            return _errorResult;
        }

        if (error instanceof clazz) {
            return {
                statusCode: errorCode,
                body: JSON.stringify({ message: error.toString() })
            };
        }

        return null;
    }, null);

    return errorResult;
}

export default function handleError(exceptions: ErrorMapping[], error: Error): APIGatewayProxyResult {
    logger.error(error.toString());

    return (
        handleCustomException(exceptions, error) || {
            statusCode: 500,
            body: JSON.stringify({ message: error.toString() })
        }
    );
}
