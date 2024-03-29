export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LoggerConfig {
    logLevel: LogLevel;
}

export interface Logger {
    info(message: string): void;
    debug(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
