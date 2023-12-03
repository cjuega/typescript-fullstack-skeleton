import { Nullable } from '@context/shared/domain/nullable';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import { RedisClient } from '@context/shared/infrastructure/persistence/redis/redisClientFactory';
import { Primitives } from '@context/shared/domain/primitives';

export default class RedisExampleAggregateRepository implements ExampleAggregateRepository {
    private readonly client: RedisClient;

    constructor(client: RedisClient) {
        this.client = client;
    }

    async save(aggregate: ExampleAggregate): Promise<void> {
        await this.client.hset(aggregate.id, aggregate.toPrimitives());
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        const primitives = await this.client.hgetall(id.value) as Primitives<ExampleAggregate>,
            noResults = !primitives || Object.keys(primitives).length === 0;

        return noResults ? null : new ExampleAggregate(primitives);
    }
}
