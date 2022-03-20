import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import Datetime from '@context/shared/domain/datetime';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import DatetimeMother from '@context/shared/domain/datetime.mother';

export default class ExampleAggregateMother {
    static create(id: ExampleAggregateId, createdAt: Datetime): ExampleAggregate {
        return new ExampleAggregate(id, createdAt);
    }

    static random(): ExampleAggregate {
        const id = ExampleAggregateIdMother.random(),
            createdAt = DatetimeMother.random();

        return ExampleAggregateMother.create(id, createdAt);
    }
}
