import type { Logger, LoggerConfig } from '@src/domain/logger';
import { type Logger as InternalLogger, createLogger, format } from 'winston';

export default class WinstonLogger implements Logger {
    private readonly winston: InternalLogger;

    constructor(config: LoggerConfig) {
        const outputFormat = format.printf(({ level, message, timestamp, ...meta }) =>
                JSON.stringify({
                    timestamp,
                    level: level.toUpperCase(),
                    message,
                    meta: JSON.stringify(meta)
                })
            ),
            formats = [format.errors({ stack: true }), format.timestamp(), outputFormat];

        this.winston = createLogger({
            level: config.logLevel,
            format: format.combine(...formats)
        });
    }

    info(message: string): void {
        this.winston.info(message);
    }

    debug(message: string): void {
        this.winston.debug(message);
    }

    warn(message: string): void {
        this.winston.warn(message);
    }

    error(message: string): void {
        this.winston.error(message);
    }
}
