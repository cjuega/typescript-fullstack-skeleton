import type AggregateRoot from '@src/domain/aggregateRoot';
import type TypeormDomainEventRepository from '@src/infrastructure/persistence/typeorm/typeormDomainEventRepository';
import type { DataSource, EntityManager, EntitySchema, Repository } from 'typeorm';

export default abstract class TypeormRepository<T extends AggregateRoot> {
    private readonly _dataSource: Promise<DataSource>;

    private readonly outboxRepository?: TypeormDomainEventRepository;

    private get isOutboxEnabled(): boolean {
        return !!this.outboxRepository;
    }

    constructor(dataSource: Promise<DataSource>, outboxRepository?: TypeormDomainEventRepository) {
        this._dataSource = dataSource;
        this.outboxRepository = outboxRepository;
    }

    protected get dataSource(): Promise<DataSource> {
        return this._dataSource;
    }

    protected abstract entitySchema(): EntitySchema<T>;

    protected async repository(): Promise<Repository<T>> {
        return (await this.dataSource).getRepository(this.entitySchema());
    }

    protected async persist(aggregateRoot: T): Promise<void> {
        if (this.isOutboxEnabled) {
            await this.persistAggregateRootAndDomainEvents(aggregateRoot);
        } else {
            await this.persistAggregateRoot(aggregateRoot);
        }
    }

    private async persistAggregateRootAndDomainEvents(aggregateRoot: T): Promise<void> {
        const ds = await this.dataSource;

        await ds.transaction(async (manager) => {
            await this.persistAggregateRoot(aggregateRoot, manager);
            await this.outboxRepository?.transactSave(aggregateRoot.pullDomainEvents(), manager);
        });
    }

    private async persistAggregateRoot(aggregateRoot: T, manager?: EntityManager): Promise<void> {
        if (manager) {
            await manager.save(aggregateRoot);
        } else {
            const repository = await this.repository();
            await repository.save(aggregateRoot);
        }
    }
}
