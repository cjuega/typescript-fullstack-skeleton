import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import AggregateRoot from '@src/domain/aggregateRoot';
import { Nullable } from '@src/domain/nullable';
import { Primitives } from '@src/domain/primitives';

export default abstract class ElasticsearchRepository<T extends AggregateRoot> {
    private client: ElasticsearchClient;

    constructor(client: ElasticsearchClient) {
        this.client = client;
    }

    protected abstract moduleName(): string;

    protected async persist(id: string, aggregateRoot: T): Promise<void> {
        const document = aggregateRoot.toPrimitives() as Primitives<T>;

        // wait_for wait for a refresh to make this operation visible to search
        await this.client.index<Primitives<T>>({
            index: this.moduleName(),
            id,
            body: document,
            refresh: 'wait_for'
        });
    }

    protected async remove(id: string): Promise<void> {
        await this.client.delete(
            {
                index: this.moduleName(),
                id,
                refresh: 'wait_for'
            },
            {
                ignore: [404]
            }
        );
    }

    protected async byId(id: string, fromPrimitives: (plainData: Primitives<T>) => T): Promise<Nullable<T>> {
        const { _source, found } = await this.client.get<Primitives<T>>(
            {
                index: this.moduleName(),
                id
            },
            {
                ignore: [404]
            }
        );

        return found ? fromPrimitives(_source!) : null;
    }
}
