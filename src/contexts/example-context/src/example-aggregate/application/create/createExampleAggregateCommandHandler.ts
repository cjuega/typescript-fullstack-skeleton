import type Command from '@context/shared/domain/commandBus/command';
import type { CommandHandler } from '@context/shared/domain/commandBus/commandHandler';
import CreateExampleAggregateCommand from '@src/example-aggregate/application/create/createExampleAggregateCommand';
import type ExampleAggregateCreator from '@src/example-aggregate/application/create/exampleAggregateCreator';

export default class CreateExampleAggregateCommandHandler implements CommandHandler<CreateExampleAggregateCommand> {
    private creator: ExampleAggregateCreator;

    constructor(creator: ExampleAggregateCreator) {
        this.creator = creator;
    }

    subscribedTo(): Command {
        return CreateExampleAggregateCommand;
    }

    async handle(command: CreateExampleAggregateCommand): Promise<void> {
        await this.creator.run(command);
    }
}
