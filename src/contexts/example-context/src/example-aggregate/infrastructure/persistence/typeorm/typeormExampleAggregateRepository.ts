// eslint-disable-next-line import/no-extraneous-dependencies
import { EntitySchema } from 'typeorm';
import { Nullable } from '@context/shared/domain/nullable';
import TypeormRepository from '@context/shared/infrastructure/persistence/typeorm/typeormRepository';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import ExampleAggregateEntity from '@src/example-aggregate/infrastructure/persistence/typeorm/exampleAggregate.entity';

export default class TypeormExampleAggregateRepository extends TypeormRepository<ExampleAggregate> implements ExampleAggregateRepository {
    // eslint-disable-next-line class-methods-use-this
    protected entitySchema(): EntitySchema<ExampleAggregate> {
        return ExampleAggregateEntity;
    }

    async save(aggregate: ExampleAggregate): Promise<void> {
        const repository = await this.repository();
        await repository.save(aggregate);
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        const repository = await this.repository();

        // There is a wrong behaviour in TypeORM that forces arguments to not have other methods than toString.
        // However our ValueObjects have an equalsTo method too, so typing fails.
        // https://github.com/typeorm/typeorm/blob/master/src/find-options/FindOptionsWhere.ts#L47C6-L47C47
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return repository.findOneBy({ id } as any);
    }
}
