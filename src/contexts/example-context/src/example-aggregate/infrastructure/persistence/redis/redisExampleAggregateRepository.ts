import type { Nullable } from '@context/shared/domain/nullable';
import type { Primitives } from '@context/shared/domain/primitives';
import type { RedisClient } from '@context/shared/infrastructure/persistence/redis/redisClientFactory';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import type ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import type { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';

export default class RedisExampleAggregateRepository implements ExampleAggregateRepository {
    private readonly client: RedisClient;

    constructor(client: RedisClient) {
        this.client = client;
    }

    async save(aggregate: ExampleAggregate): Promise<void> {
        await this.client.hset(aggregate.id.value, aggregate.toPrimitives());
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        const primitives = (await this.client.hgetall(id.value)) as Primitives<ExampleAggregate>,
            noResults = !primitives || Object.keys(primitives).length === 0;

        return noResults ? null : ExampleAggregate.fromPrimitives(primitives);
    }
}
