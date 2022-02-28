import { Nullable } from '@context/shared/domain/nullable';
import DdbOneTableRepository from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableRepository';
import ExampleAggregate from '@src/example-module/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-module/domain/exampleAggregateId';
import { ExampleAggregateRepository } from '@src/example-module/domain/exampleAggregateRepository';
import ExampleAggregateModel from '@src/example-module/infrastructure/persistence/ddbOneTable/exampleAggregate.model';

export default class DdbOneTableExampleAggregateRepository
    extends DdbOneTableRepository<ExampleAggregate>
    implements ExampleAggregateRepository {
    // eslint-disable-next-line class-methods-use-this
    protected modelName(): string {
        return 'ExampleAggregate';
    }

    // eslint-disable-next-line class-methods-use-this
    protected loadModel(): any {
        return ExampleAggregateModel;
    }

    async save(aggregate: ExampleAggregate): Promise<void> {
        await this.persist(aggregate);
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        const model = await this.getModel(),
            primitives = await model.get({ id: id.value });

        return primitives ? ExampleAggregate.fromPrimitives(primitives as any) : null;
    }
}
