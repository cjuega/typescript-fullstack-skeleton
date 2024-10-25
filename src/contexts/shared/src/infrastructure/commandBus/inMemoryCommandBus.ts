import type Command from '@src/domain/commandBus/command';
import type { CommandBus } from '@src/domain/commandBus/commandBus';
import type CommandHandlersInformation from '@src/infrastructure/commandBus/commandHandlersInformation';

export default class InMemoryCommandBus implements CommandBus {
    private commandHandlersInformation?: CommandHandlersInformation;

    registerHandlers(commandHandlersInformation: CommandHandlersInformation): void {
        this.commandHandlersInformation = commandHandlersInformation;
    }

    async dispatch(command: Command): Promise<void> {
        if (!this.commandHandlersInformation) {
            throw new Error('No command handlers registered');
        }

        const handler = this.commandHandlersInformation.search(command);

        await handler.handle(command);
    }
}
