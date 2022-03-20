import Command from '@context/shared/domain/commandBus/command';

export type CreateExampleAggregateCommandParams = {
    id: string;
};

export default class CreateExampleAggregateCommand extends Command {
    readonly id: string;

    constructor({ id }: CreateExampleAggregateCommandParams) {
        super();

        this.id = id;
    }
}
