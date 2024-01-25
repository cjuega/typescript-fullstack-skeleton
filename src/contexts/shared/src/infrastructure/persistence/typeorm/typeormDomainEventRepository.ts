/* eslint-disable no-underscore-dangle */
import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import { DomainEventRepository } from '@src/domain/eventBus/domainEventRepository';
import { DataSource } from 'typeorm';

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
        const ds = await this.dataSource,
            rows = (Array.isArray(events) ? events : [events]).map((e) => ({
                occurred_on: e.occurredOn,
                payload: (this.marshaller.marshall(e) as string | Buffer).toString()
            }));

        await ds.transaction(async (manager) => manager.createQueryBuilder().insert().into(this.tableName).values(rows)
            .execute());
    }
}
