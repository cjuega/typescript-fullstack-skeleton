import AggregateRoot from '@src/domain/aggregateRoot';
import { Table, Model, OneModelSchema } from 'dynamodb-onetable';

export default abstract class DdbOneTableRepository<T extends AggregateRoot> {
    private readonly table: Promise<Table>;

    constructor(table: Promise<Table>) {
        this.table = table;
    }

    protected abstract modelName(): string;

    protected abstract loadModel(): OneModelSchema;

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
        } catch (e) {
            table.addModel(modelName, this.loadModel());
        }
    }

    protected async persist(aggregateRoot: T): Promise<void> {
        const model = await this.getModel();

        await model.create(aggregateRoot.toPrimitives() as any);
    }
}
