import type { Nullable } from '@context/shared/domain/nullable';
import TypeormRepository from '@context/shared/infrastructure/persistence/typeorm/typeormRepository';
import type ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import type ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import type { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import ExampleAggregateEntity from '@src/example-aggregate/infrastructure/persistence/typeorm/exampleAggregate.entity';
import type { EntitySchema } from 'typeorm';

export default class TypeormExampleAggregateRepository extends TypeormRepository<ExampleAggregate> implements ExampleAggregateRepository {
    protected entitySchema(): EntitySchema<ExampleAggregate> {
        return ExampleAggregateEntity;
    }

    async save(aggregate: ExampleAggregate): Promise<void> {
        await this.persist(aggregate);
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        const repository = await this.repository();

        // There is a wrong behaviour in TypeORM that forces arguments to not have other methods than toString.
        // However our ValueObjects have an equalsTo method too, so typing fails.
        // https://github.com/typeorm/typeorm/blob/master/src/find-options/FindOptionsWhere.ts#L47C6-L47C47
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return repository.findOneBy({ id } as any);
    }
}
