import DatetimeMother from '@context/shared/domain/datetime.mother';
import type { PartialDeep } from '@context/shared/domain/partialDeep';
import type { Primitives } from '@context/shared/domain/primitives';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';

export default class ExampleAggregateMother {
    static create(primitives: Primitives<ExampleAggregate>): ExampleAggregate {
        return ExampleAggregate.fromPrimitives(primitives);
    }

    static random(overwrites?: PartialDeep<Primitives<ExampleAggregate>>): ExampleAggregate {
        return ExampleAggregateMother.create({
            id: ExampleAggregateIdMother.random().value,
            createdAt: DatetimeMother.random().value,
            ...overwrites
        });
    }
}
