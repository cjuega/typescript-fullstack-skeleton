import type { Logger } from '@src/domain/logger';

class ConsoleLogger implements Logger {
    debug(message: string): void {
        // biome-ignore lint/nursery/noConsole: <explanation>
        console.debug(message);
    }

    error(message: string): void {
        // biome-ignore lint/nursery/noConsole: <explanation>
        console.error(message);
    }

    info(message: string): void {
        // biome-ignore lint/nursery/noConsole: <explanation>
        console.info(message);
    }

    warn(message: string): void {
        // biome-ignore lint/nursery/noConsole: <explanation>
        console.warn(message);
    }
}

export default ConsoleLogger;
