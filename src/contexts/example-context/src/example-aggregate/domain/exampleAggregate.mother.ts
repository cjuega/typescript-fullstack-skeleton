import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import DatetimeMother from '@context/shared/domain/datetime.mother';
import { PartialDeep } from '@context/shared/domain/partialDeep';
import { Primitives } from '@context/shared/domain/primitives';

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
