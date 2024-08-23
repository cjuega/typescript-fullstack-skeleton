import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import type { DomainEventRepository } from '@src/domain/eventBus/domainEventRepository';
import type { DataSource, EntityManager } from 'typeorm';

export default class TypeormDomainEventRepository implements DomainEventRepository {
    private readonly _dataSource: Promise<DataSource>;

    private readonly marshaller: DomainEventMarshaller;

    private readonly tableName: string;

    constructor(dataSource: Promise<DataSource>, marshaller: DomainEventMarshaller, config: { tableName: string }) {
        this._dataSource = dataSource;
        this.marshaller = marshaller;
        this.tableName = config.tableName;
    }

    protected get dataSource(): Promise<DataSource> {
        return this._dataSource;
    }

    async save(events: DomainEvent | DomainEvent[]): Promise<void> {
        const ds = await this.dataSource;

        await ds.transaction((manager) => this.transactSave(events, manager));
    }

    async transactSave(events: DomainEvent | DomainEvent[], manager: EntityManager): Promise<void> {
        const rows = (Array.isArray(events) ? events : [events]).map((e) => ({
            occurred_on: e.occurredOn,
            payload: (this.marshaller.marshall(e) as string | Buffer).toString()
        }));

        if (!rows.length) {
            return;
        }

        await manager.createQueryBuilder().insert().into(this.tableName, ['occurred_on', 'payload']).values(rows).execute();
    }
}
