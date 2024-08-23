import type EnvironmentArranger from '@src/infrastructure/arranger/environmentArranger';
import type { RedisClient } from '@src/infrastructure/persistence/redis/redisClientFactory';

export default class RedisEnvironmentArranger implements EnvironmentArranger {
    private readonly client: RedisClient;

    constructor(client: RedisClient) {
        this.client = client;
    }

    async arrange(): Promise<void> {
        await this.client.flushall();
    }

    close(): Promise<void> {
        this.client.disconnect();
        return Promise.resolve();
    }
}
