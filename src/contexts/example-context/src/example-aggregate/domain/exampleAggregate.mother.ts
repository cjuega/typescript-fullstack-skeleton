import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import DatetimeMother from '@context/shared/domain/datetime.mother';
import { RecursivePartial } from '@context/shared/domain/recursivePartial.mother';
import { Primitives } from '@context/shared/domain/primitives';

export default class ExampleAggregateMother {
    static create(primitives: Primitives<ExampleAggregate>): ExampleAggregate {
        return new ExampleAggregate(primitives);
    }

    static random(overwrites?: RecursivePartial<Primitives<ExampleAggregate>>): ExampleAggregate {
        return ExampleAggregateMother.create({
            id: ExampleAggregateIdMother.random().value,
            createdAt: DatetimeMother.random().value,
            ...overwrites
        });
    }
}
