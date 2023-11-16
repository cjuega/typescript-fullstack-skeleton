import Command from '@context/shared/domain/commandBus/command';
import { Primitives } from '@context/shared/domain/primitives';

export default class CreateExampleAggregateCommand extends Command {
    readonly id: string;

    constructor({ id }: Primitives<CreateExampleAggregateCommand>) {
        super();

        this.id = id;
    }
}
