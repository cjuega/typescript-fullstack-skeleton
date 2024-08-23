import type Datetime from '@context/shared/domain/datetime';
import type { Primitives } from '@context/shared/domain/primitives';
import CreateExampleAggregateCommand from '@src/example-aggregate/application/create/createExampleAggregateCommand';
import type ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';

export default class CreateExampleAggregateCommandMother {
    static create(params: Primitives<CreateExampleAggregateCommand>): CreateExampleAggregateCommand {
        return new CreateExampleAggregateCommand(params);
    }

    static random(overwrites?: Partial<Primitives<CreateExampleAggregateCommand>>): CreateExampleAggregateCommand {
        return CreateExampleAggregateCommandMother.create({
            id: ExampleAggregateIdMother.random().value,
            ...overwrites
        });
    }

    static applyCommand(command: CreateExampleAggregateCommand, context: { createdAt: Datetime }): ExampleAggregate {
        return ExampleAggregateMother.create({
            ...command,
            createdAt: context.createdAt.value
        });
    }
}
