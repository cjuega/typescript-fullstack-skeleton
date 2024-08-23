import type AggregateRoot from '@src/domain/aggregateRoot';
import type DdbOneTableDomainEventRepository from '@src/infrastructure/persistence/ddbOneTable/ddbOneTableDomainEventRepository';
import type { Model, OneModel, Table } from 'dynamodb-onetable';

export default abstract class DdbOneTableRepository<T extends AggregateRoot> {
    private readonly table: Promise<Table>;

    private readonly outboxRepository?: DdbOneTableDomainEventRepository;

    private get isOutboxEnabled(): boolean {
        return !!this.outboxRepository;
    }

    constructor(table: Promise<Table>, outboxRepository?: DdbOneTableDomainEventRepository) {
        this.table = table;
        this.outboxRepository = outboxRepository;
    }

    protected abstract modelName(): string;

    protected abstract loadModel(): OneModel;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    protected async getModel(): Promise<Model<any>> {
        const table = await this.table,
            modelName = this.modelName();

        await this.loadSchema();

        return table.getModel(modelName);
    }

    private async loadSchema(): Promise<void> {
        const table = await this.table,
            modelName = this.modelName();

        try {
            table.getModel(modelName);
        } catch {
            table.addModel(modelName, this.loadModel());
        }
    }

    protected async persist(aggregateRoot: T): Promise<void> {
        if (this.isOutboxEnabled) {
            await this.persistAggregateRootAndDomainEvents(aggregateRoot);
        } else {
            await this.persistAggregateRoot(aggregateRoot);
        }
    }

    private async persistAggregateRootAndDomainEvents(aggregateRoot: T): Promise<void> {
        const transaction = {};

        await this.persistAggregateRoot(aggregateRoot, transaction);
        await this.outboxRepository?.transactSave(aggregateRoot.pullDomainEvents(), { transaction });

        await (await this.table).transact('write', transaction);
    }

    private async persistAggregateRoot(aggregateRoot: T, transaction?: object): Promise<void> {
        const model = await this.getModel();

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        await model.create(aggregateRoot.toPrimitives() as any, { transaction });
    }
}
