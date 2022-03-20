import Datetime from '@context/shared/domain/datetime';
import DatetimeMother from '@context/shared/domain/datetime.mother';
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

    static random(overwrites?: { id?: string }): CreateExampleAggregateCommand {
        const id = overwrites?.id ? overwrites.id : ExampleAggregateIdMother.random().value;

        return CreateExampleAggregateCommandMother.create({ id });
    }

    static applyCommand(command: CreateExampleAggregateCommand, context: { createdAt: Datetime }): ExampleAggregate {
        const id = ExampleAggregateIdMother.create(command.id),
            createdAt = DatetimeMother.create(context.createdAt.value);

        return ExampleAggregateMother.create(id, createdAt);
    }
}
