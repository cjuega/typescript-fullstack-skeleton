import UuidMother from '@context/shared/domain/uuid.mother';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';

export default class ExampleAggregateIdMother {
    static create(id: string): ExampleAggregateId {
        return new ExampleAggregateId(id);
    }

    static random(): ExampleAggregateId {
        return ExampleAggregateIdMother.create(UuidMother.random());
    }
}
