import { MongoClient } from 'mongodb';
import { Nullable } from '@src/domain/nullable';
import MongoConfig from '@src/infrastructure/persistence/mongo/mongoConfig';
import { Logger } from '@src/domain/logger';

export default class MongoClientFactory {
    private static clients: Record<string, MongoClient> = {};

    static async createClient(contextName: string, config: MongoConfig, logger: Logger): Promise<MongoClient> {
        let client = MongoClientFactory.getClient(contextName);

        if (!client) {
            client = await MongoClientFactory.createAndConnectClient(config, logger);

            MongoClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<MongoClient> {
        return MongoClientFactory.clients[contextName];
    }

    private static async createAndConnectClient(config: MongoConfig, logger: Logger): Promise<MongoClient> {
        const client = new MongoClient(MongoClientFactory.buildUrl(config), {
            ignoreUndefined: true
        });

        MongoClientFactory.setUpLogger(client, logger);

        await client.connect();

        return client;
    }

    private static buildUrl(config: MongoConfig): string {
        const url = new URL(config.url);

        if (!url.username && config.username) {
            url.username = config.username;
        }

        if (!url.password && config.password) {
            url.password = config.password;
        }

        return url.toString();
    }

    private static setUpLogger(client: MongoClient, logger: Logger): void {
        client.on('commandStarted', (event) => {
            logger.debug(JSON.stringify(event));
        });

        client.on('commandSucceeded', (event) => {
            logger.debug(JSON.stringify(event));
        });

        client.on('commandFailed', (event) => {
            logger.error(JSON.stringify(event));
        });
    }

    private static registerClient(client: MongoClient, contextName: string): void {
        MongoClientFactory.clients[contextName] = client;
    }
}
