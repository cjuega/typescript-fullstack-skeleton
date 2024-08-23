import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';
import { EventBus } from '@src/domain/eventBus/eventBus';
import { DataSource } from 'typeorm';

export default class TypeormOutboxConsumer {
    private static readonly N_MESSAGES = 50;

    private readonly _dataSource: Promise<DataSource>;

    private readonly unmarshaller: DomainEventUnmarshaller;

    private readonly eventBus: EventBus;

    private readonly tableName: string;

    constructor(dataSource: Promise<DataSource>, unmarshaller: DomainEventUnmarshaller, eventBus: EventBus, config: { tableName: string }) {
        this._dataSource = dataSource;
        this.unmarshaller = unmarshaller;
        this.eventBus = eventBus;
        this.tableName = config.tableName;
    }

    protected get dataSource(): Promise<DataSource> {
        return this._dataSource;
    }

    async consume(nMessages?: number): Promise<void> {
        const nItems = nMessages ?? TypeormOutboxConsumer.N_MESSAGES;

        await this.transactionalConsume(nItems, this.publish.bind(this));
    }

    private async transactionalConsume(nEvents: number, action: (events: DomainEvent[]) => Promise<void>): Promise<void> {
        const ds = await this.dataSource;

        await ds.transaction(async (manager) => {
            const rows = await manager.query<Array<{ id: string; payload: string }>>(
                `SELECT id, payload FROM ${this.tableName} ORDER BY occurred_on ASC LIMIT ? FOR UPDATE SKIP LOCKED`,
                [nEvents]
            ),
                events = rows.map(({ payload }) => this.unmarshaller.unmarshall(payload)),
                ids = rows.map(({ id }) => id);

            if (events.length === 0) {
                return;
            }

            try {
                await action(events);

                await manager.createQueryBuilder().delete().from(this.tableName).where('id In(:ids)', { ids })
                    .execute();
            } catch {
                // Do nothing
            }
        });
    }

    private publish(events: DomainEvent[]): Promise<void> {
        return this.eventBus.publish(events);
    }
}
