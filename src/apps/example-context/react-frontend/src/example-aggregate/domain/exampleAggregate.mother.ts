import ObjectMother from '@context/shared/domain/objectMother.mother';
import type { ExampleAggregate } from '@src/example-aggregate/domain/exampleAggregate';

export class ExampleAggregateMother {
    static random(overwrites?: Partial<ExampleAggregate>): ExampleAggregate {
        return {
            id: ObjectMother.uuid(),
            name: ObjectMother.word(),
            description: ObjectMother.text(),
            ...overwrites
        };
    }

    static randomList(): ExampleAggregate[] {
        const size = ObjectMother.zeroOrPositiveNumber(5);

        return ObjectMother.repeat(ExampleAggregateMother.random, size);
    }
}
