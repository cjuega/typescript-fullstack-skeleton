import { Primitives } from '@context/shared/domain/primitives';
import { Nullable } from '@context/shared/domain/nullable';
import DdbOneTableRepository from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableRepository';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import ExampleAggregateModel from '@src/example-aggregate/infrastructure/persistence/ddbOneTable/exampleAggregate.model';

export default class DdbOneTableExampleAggregateRepository
    extends DdbOneTableRepository<ExampleAggregate>
    implements ExampleAggregateRepository {
    // eslint-disable-next-line class-methods-use-this
    protected modelName(): string {
        return 'ExampleAggregate';
    }

    // eslint-disable-next-line class-methods-use-this
    protected loadModel(): typeof ExampleAggregateModel {
        return ExampleAggregateModel;
    }

    async save(aggregate: ExampleAggregate): Promise<void> {
        await this.persist(aggregate);
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        const model = await this.getModel(),
            primitives = await model.get({ id: id.value }) as Primitives<ExampleAggregate>;

        return primitives ? ExampleAggregate.fromPrimitives(primitives) : null;
    }
}
