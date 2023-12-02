/* eslint-disable no-console */
import { Logger } from '@src/domain/logger';

class ConsoleLogger implements Logger {
    // eslint-disable-next-line class-methods-use-this
    debug(message: string): void {
        console.debug(message);
    }

    // eslint-disable-next-line class-methods-use-this
    error(message: string): void {
        console.error(message);
    }

    // eslint-disable-next-line class-methods-use-this
    info(message: string): void {
        console.info(message);
    }

    // eslint-disable-next-line class-methods-use-this
    warn(message: string): void {
        console.warn(message);
    }
}

export default ConsoleLogger;
