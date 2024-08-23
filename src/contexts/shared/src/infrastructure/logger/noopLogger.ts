import type { Logger } from '@src/domain/logger';

class NoopLogger implements Logger {
    debug(_: string): void {}

    error(_: string): void {}

    info(_: string): void {}

    warn(_: string): void {}
}

export default NoopLogger;
