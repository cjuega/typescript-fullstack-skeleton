/* eslint-disable no-underscore-dangle */
import AggregateRoot from '@src/domain/aggregateRoot';
import { Nullable } from '@src/domain/nullable';
import { Primitives } from '@src/domain/primitives';
import { Collection, MongoClient } from 'mongodb';

export default abstract class MongoRepository<T extends AggregateRoot> {
    private readonly _client: Promise<MongoClient>;

    constructor(_client: Promise<MongoClient>) {
        this._client = _client;
    }

    protected abstract moduleName(): string;

    protected client(): Promise<MongoClient> {
        return this._client;
    }

    protected async collection(): Promise<Collection> {
        return (await this._client).db().collection(this.moduleName());
    }

    protected persist(id: string, aggregateRoot: T): Promise<void> {
        return this.rawPersist(id, aggregateRoot.toPrimitives() as Record<string, any>);
    }

    protected async rawPersist(id: string, item: Record<string, any>): Promise<void> {
        const collection = await this.collection(),
            document = {
                ...item,
                id: undefined
            };

        await collection.updateOne({ id }, { $set: document }, { upsert: true });
    }

    protected async remove(id: string): Promise<void> {
        const collection = await this.collection();

        await collection.deleteOne({ id });
    }

    protected async byId(id: string, fromPrimitives: (plainData: Primitives<T>) => T): Promise<Nullable<T>> {
        const collection = await this.collection(),
            document = await collection.findOne({ id });

        if (!document) {
            return null;
        }

        return fromPrimitives(document as Primitives<T>);
    }
}
