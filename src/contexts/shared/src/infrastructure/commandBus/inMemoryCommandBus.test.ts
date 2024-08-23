import Command from '@src/domain/commandBus/command';
import type { CommandHandler } from '@src/domain/commandBus/commandHandler';
import CommandNotRegisteredError from '@src/domain/commandBus/commandNotRegisteredError';
import CommandHandlersInformation from '@src/infrastructure/commandBus/commandHandlersInformation';
import InMemoryCommandBus from '@src/infrastructure/commandBus/inMemoryCommandBus';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class UnhandledCommand extends Command {
    static COMMAND_NAME = 'unhandled.command';
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class HandledCommand extends Command {
    static COMMAND_NAME = 'handled.command';
}

class MyCommandHandler implements CommandHandler<HandledCommand> {
    subscribedTo(): HandledCommand {
        return HandledCommand;
    }

    async handle(_command: HandledCommand): Promise<void> {}
}

describe('inMemoryCommandBus', () => {
    it('throws an error if dispatches a command without handler', async () => {
        expect.hasAssertions();

        const unhandledCommand = new UnhandledCommand(),
            commandHandlersInformation = new CommandHandlersInformation([]),
            commandBus = new InMemoryCommandBus(commandHandlersInformation);

        await expect(commandBus.dispatch(unhandledCommand)).rejects.toThrow(CommandNotRegisteredError);
    });

    it('accepts a command with handler', async () => {
        const handledCommand = new HandledCommand(),
            myCommandHandler = new MyCommandHandler(),
            commandHandlersInformation = new CommandHandlersInformation([myCommandHandler]),
            commandBus = new InMemoryCommandBus(commandHandlersInformation);

        await commandBus.dispatch(handledCommand);
    });
});
