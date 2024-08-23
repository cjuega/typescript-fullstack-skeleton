import type Command from '@src/domain/commandBus/command';

export interface CommandHandler<T extends Command> {
    subscribedTo(): Command;
    handle(command: T): Promise<void>;
}
