import Datetime from '@context/shared/domain/datetime';
import CreateExampleAggregateCommand, {
    CreateExampleAggregateCommandParams
} from '@src/example-aggregate/application/create/createExampleAggregateCommand';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';

export default class CreateExampleAggregateCommandMother {
    static create(params: CreateExampleAggregateCommandParams): CreateExampleAggregateCommand {
        return new CreateExampleAggregateCommand(params);
    }

    static random(overwrites?: Partial<CreateExampleAggregateCommandParams>): CreateExampleAggregateCommand {
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
