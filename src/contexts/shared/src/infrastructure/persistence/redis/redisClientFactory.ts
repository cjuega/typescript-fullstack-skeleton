import type { Nullable } from '@src/domain/nullable';
import type RedisConfig from '@src/infrastructure/persistence/redis/redisConfig';
import Redis, { Cluster } from 'ioredis';

export type RedisClient = Redis | Cluster;

export default class RedisClientFactory {
    private static clients: Record<string, RedisClient> = {};

    static createClient(contextName: string, config: RedisConfig): RedisClient {
        let client = RedisClientFactory.getClient(contextName);

        if (!client) {
            client = RedisClientFactory.create(config);

            RedisClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<RedisClient> {
        return RedisClientFactory.clients[contextName];
    }

    private static create(config: RedisConfig): RedisClient {
        return config.clusterModeEnabled
            ? RedisClientFactory.createClusterClient(config)
            : RedisClientFactory.createStandaloneClient(config);
    }

    private static createClusterClient(config: RedisConfig): Cluster {
        return new Cluster(config.endpoints);
    }

    private static createStandaloneClient(config: RedisConfig): Redis {
        return new Redis(config.endpoints[0]);
    }

    private static registerClient(client: Redis | Cluster, contextName: string): void {
        RedisClientFactory.clients[contextName] = client;
    }
}
