// eslint-disable-next-line import/no-unresolved
import { APIGatewayProxyResult } from 'aws-lambda';
import { Nullable } from '@context/shared/domain/nullable';
import ConsoleLogger from '@context/shared/infrastructure/consoleLogger';

const logger = new ConsoleLogger();

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
