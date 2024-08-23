import type Command from '@src/domain/commandBus/command';

export interface CommandBus {
    dispatch(command: Command): Promise<void>;
}
