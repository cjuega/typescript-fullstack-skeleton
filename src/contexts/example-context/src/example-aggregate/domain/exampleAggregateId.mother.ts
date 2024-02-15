import ObjectMother from '@context/shared/domain/objectMother.mother';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';

export default class ExampleAggregateIdMother {
    static create(id: string): ExampleAggregateId {
        return new ExampleAggregateId(id);
    }

    static random(): ExampleAggregateId {
        return ExampleAggregateIdMother.create(ObjectMother.uuid());
    }
}
