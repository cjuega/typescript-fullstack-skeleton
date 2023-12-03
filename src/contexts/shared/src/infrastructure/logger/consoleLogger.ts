/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { Logger } from '@src/domain/logger';

class ConsoleLogger implements Logger {
    debug(message: string): void {
        console.debug(message);
    }

    error(message: string): void {
        console.error(message);
    }

    info(message: string): void {
        console.info(message);
    }

    warn(message: string): void {
        console.warn(message);
    }
}

export default ConsoleLogger;
