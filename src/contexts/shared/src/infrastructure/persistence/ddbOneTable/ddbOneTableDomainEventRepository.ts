import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import { DomainEventRepository } from '@src/domain/eventBus/domainEventRepository';
import { OneProperties, Table } from 'dynamodb-onetable';

const model = {
    pk: { type: String, required: true },
    sk: { type: String, required: true },
    payload: { type: 'binary', required: true }
} as const;

export default class DdbOneTableDomainEventRepository implements DomainEventRepository {
    private readonly table: Promise<Table>;

    private readonly marshaller: DomainEventMarshaller;

    constructor(table: Promise<Table>, marshaller: DomainEventMarshaller) {
        this.table = table;
        this.marshaller = marshaller;
    }

    protected async setupModel(): Promise<void> {
        const table = await this.table,
            modelName = 'DomainEvent';

        try {
            table.getModel(modelName);
        } catch {
            table.addModel(modelName, model);
        }
    }

    async save(events: DomainEvent | DomainEvent[]): Promise<void> {
        await this.setupModel();

        const table = await this.table,
            transaction = {};

        if (!Array.isArray(events)) {
            await table.create('DomainEvent', this.map(events));
            return;
        }

        await Promise.all(events.map((e) => table.create('DomainEvent', this.map(e), { transaction })));

        await table.transact('write', transaction);
    }

    private map(event: DomainEvent): OneProperties {
        const N_SHARDS = 100;
        let payload = this.marshaller.marshall(event) as string | Buffer;

        if (!Buffer.isBuffer(payload)) {
            payload = Buffer.from(payload);
        }

        return {
            pk: `failedEvents:${event.occurredOn.toISOString().split('T')[0]}:${Math.floor(Math.random() * N_SHARDS)}`,
            sk: `${event.occurredOn.getTime().toString()}:${event.aggregateId}:${event.eventId}`,
            payload
        };
    }
}
