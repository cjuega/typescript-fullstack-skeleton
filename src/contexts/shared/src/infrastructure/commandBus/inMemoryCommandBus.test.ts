/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import Command from '@src/domain/commandBus/command';
import { CommandHandler } from '@src/domain/commandBus/commandHandler';
import CommandNotRegisteredError from '@src/domain/commandBus/commandNotRegisteredError';
import CommandHandlersInformation from '@src/infrastructure/commandBus/commandHandlersInformation';
import InMemoryCommandBus from '@src/infrastructure/commandBus/inMemoryCommandBus';

class UnhandledCommand extends Command {
    static COMMAND_NAME = 'unhandled.command';
}

class HandledCommand extends Command {
    static COMMAND_NAME = 'handled.command';
}

class MyCommandHandler implements CommandHandler<HandledCommand> {
    subscribedTo(): HandledCommand {
        return HandledCommand;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async handle(_command: HandledCommand): Promise<void> {}
}

describe('inMemoryCommandBus', () => {
    it('throws an error if dispatches a command without handler', async () => {
        expect.hasAssertions();

        const unhandledCommand = new UnhandledCommand(),
            commandHandlersInformation = new CommandHandlersInformation([]),
            commandBus = new InMemoryCommandBus(commandHandlersInformation);

        let error;

        try {
            await commandBus.dispatch(unhandledCommand);
        } catch (e) {
            error = e;
        } finally {
            expect(error).toBeInstanceOf(CommandNotRegisteredError);
            expect((error as Error).message).toBe("The command <UnhandledCommand> hasn't a command handler associated");
        }
    });

    // eslint-disable-next-line jest/prefer-expect-assertions,jest/expect-expect
    it('accepts a command with handler', async () => {
        const handledCommand = new HandledCommand(),
            myCommandHandler = new MyCommandHandler(),
            commandHandlersInformation = new CommandHandlersInformation([myCommandHandler]),
            commandBus = new InMemoryCommandBus(commandHandlersInformation);

        await commandBus.dispatch(handledCommand);
    });
});
