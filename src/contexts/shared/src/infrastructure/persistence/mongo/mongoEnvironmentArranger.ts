import EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import type { MongoClient } from 'mongodb';

export default class MongoEnvironmentArranger extends EnvironmentArranger {
    private readonly _client: Promise<MongoClient>;

    constructor(_client: Promise<MongoClient>) {
        super();

        this._client = _client;
    }

    async arrange(): Promise<void> {
        await this.cleanDatabase();
    }

    private async cleanDatabase(): Promise<void> {
        const collections = await this.collections();

        for (const collection of collections) {
            await (await this.client()).db().dropCollection(collection);
        }
    }

    private async collections(): Promise<string[]> {
        const client = await this.client(),
            collections = await client.db().listCollections(undefined, { nameOnly: true }).toArray();

        return collections.map((collection) => collection.name);
    }

    private client(): Promise<MongoClient> {
        return this._client;
    }

    async close(): Promise<void> {
        return (await this.client()).close();
    }
}
