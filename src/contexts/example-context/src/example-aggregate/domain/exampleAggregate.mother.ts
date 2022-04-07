import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import DatetimeMother from '@context/shared/domain/datetime.mother';
import { ExampleAggregatePrimitives } from '@src/example-aggregate/domain/exampleAggregatePrimitives';
import { RecursivePartial } from '@context/shared/domain/recursivePartial.mother';

export default class ExampleAggregateMother {
    static create(primitives: ExampleAggregatePrimitives): ExampleAggregate {
        return ExampleAggregate.fromPrimitives(primitives);
    }

    static random(overwrites?: RecursivePartial<ExampleAggregatePrimitives>): ExampleAggregate {
        return ExampleAggregateMother.create({
            id: ExampleAggregateIdMother.random().value,
            createdAt: DatetimeMother.random().value,
            ...overwrites
        });
    }
}
