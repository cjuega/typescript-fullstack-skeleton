import type Command from '@src/domain/commandBus/command';
import type { CommandHandler } from '@src/domain/commandBus/commandHandler';
import CommandNotRegisteredError from '@src/domain/commandBus/commandNotRegisteredError';

export default class CommandHandlersInformation {
    private commandHandlersMap: Map<Command, CommandHandler<Command>>;

    constructor(commandHandlers: CommandHandler<Command>[]) {
        this.commandHandlersMap = this.formatHandlers(commandHandlers);
    }

    private formatHandlers(commandHandlers: CommandHandler<Command>[]): Map<Command, CommandHandler<Command>> {
        return commandHandlers.reduce(
            (map, commandHandler) => map.set(commandHandler.subscribedTo(), commandHandler),
            new Map<Command, CommandHandler<Command>>()
        );
    }

    public search(command: Command): CommandHandler<Command> {
        const commandHandler = this.commandHandlersMap.get(command.constructor);

        if (!commandHandler) {
            throw new CommandNotRegisteredError(command);
        }

        return commandHandler;
    }
}
