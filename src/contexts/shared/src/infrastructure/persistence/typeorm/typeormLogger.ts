import { Logger } from '@src/domain/logger';
import { Logger as ITypeormLogger } from 'typeorm';

export default class TypeormLogger implements ITypeormLogger {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    private static formatLog(query: string, parameters?: unknown[] | undefined): string {
        const log = `query: ${query}`;

        if (!parameters || parameters.length === 0) {
            return log;
        }

        return `${log} | parameters: [${parameters.map((p) => p as string).join(', ')}]`;
    }

    logQuery(query: string, parameters?: unknown[] | undefined) {
        this.logger.debug(TypeormLogger.formatLog(query, parameters));
    }

    logQueryError(error: string | Error, query: string, parameters?: unknown[] | undefined) {
        const message = error instanceof Error ? error.message : error;
        this.logger.error(`failed ${TypeormLogger.formatLog(query, parameters)} | error: ${message}`);
    }

    logQuerySlow(time: number, query: string, parameters?: unknown[] | undefined) {
        this.logger.warn(`slow ${TypeormLogger.formatLog(query, parameters)} | time: ${time}`);
    }

    logSchemaBuild(message: string) {
        this.logger.debug(message);
    }

    logMigration(message: string) {
        this.logger.info(message);
    }

    log(level: 'log' | 'info' | 'warn', message: unknown) {
        const method = level === 'log' ? 'info' : level;
        this.logger[method](message as string);
    }
}
