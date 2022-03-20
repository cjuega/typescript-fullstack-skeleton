import Command from '@context/shared/domain/commandBus/command';
import { CommandHandler } from '@context/shared/domain/commandBus/commandHandler';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import CreateExampleAggregateCommand from '@src/example-aggregate/application/create/createExampleAggregateCommand';
import ExampleAggregateCreator from '@src/example-aggregate/application/create/exampleAggregateCreator';

export default class CreateExampleAggregateCommandHandler implements CommandHandler<CreateExampleAggregateCommand> {
    private creator: ExampleAggregateCreator;

    constructor(creator: ExampleAggregateCreator) {
        this.creator = creator;
    }

    // eslint-disable-next-line class-methods-use-this
    subscribedTo(): Command {
        return CreateExampleAggregateCommand;
    }

    async handle(command: CreateExampleAggregateCommand): Promise<void> {
        const id = new ExampleAggregateId(command.id);

        await this.creator.run({ id });
    }
}
