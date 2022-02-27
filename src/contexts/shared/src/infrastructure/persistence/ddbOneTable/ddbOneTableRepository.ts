import AggregateRoot from '@src/domain/aggregateRoot';
import { Table, Model } from 'dynamodb-onetable';

export default abstract class DdbOneTableRepository<T extends AggregateRoot> {
    private readonly table: Promise<Table>;

    constructor(table: Promise<Table>) {
        this.table = table;
    }

    protected abstract modelName(): string;

    protected async getModel(): Promise<Model<any>> {
        const modelName = this.modelName();

        return (await this.table).getModel(modelName);
    }

    protected async persist(aggregateRoot: T): Promise<void> {
        const model = await this.getModel();

        await model.create(aggregateRoot.toPrimitives() as any);
    }
}
