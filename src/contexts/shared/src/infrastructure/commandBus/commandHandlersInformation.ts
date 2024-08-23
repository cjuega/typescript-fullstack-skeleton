import Command from '@src/domain/commandBus/command';
import { CommandHandler } from '@src/domain/commandBus/commandHandler';
import CommandNotRegisteredError from '@src/domain/commandBus/commandNotRegisteredError';

export default class CommandHandlersInformation {
    private commandHandlersMap: Map<Command, CommandHandler<Command>>;

    constructor(commandHandlers: Array<CommandHandler<Command>>) {
        this.commandHandlersMap = this.formatHandlers(commandHandlers);
    }

    private formatHandlers(commandHandlers: Array<CommandHandler<Command>>): Map<Command, CommandHandler<Command>> {
        const handlersMap = new Map<Command, CommandHandler<Command>>();

        commandHandlers.forEach((commandHandler) => {
            handlersMap.set(commandHandler.subscribedTo(), commandHandler);
        });

        return handlersMap;
    }

    public search(command: Command): CommandHandler<Command> {
        const commandHandler = this.commandHandlersMap.get(command.constructor);

        if (!commandHandler) {
            throw new CommandNotRegisteredError(command);
        }

        return commandHandler;
    }
}
