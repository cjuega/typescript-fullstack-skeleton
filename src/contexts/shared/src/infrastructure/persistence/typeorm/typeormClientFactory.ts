import type { Logger } from '@src/domain/logger';
import type { Nullable } from '@src/domain/nullable';
import type TypeormConfig from '@src/infrastructure/persistence/typeorm/typeormConfig';
import TypeormLogger from '@src/infrastructure/persistence/typeorm/typeormLogger';
import { DataSource } from 'typeorm';

export default class TypeormClientFactory {
    private static clients: Record<string, DataSource> = {};

    static async createClient(contextName: string, config: TypeormConfig, logger: Logger): Promise<DataSource> {
        let client = TypeormClientFactory.getClient(contextName);

        if (!client) {
            client = await TypeormClientFactory.create(contextName, config, logger);

            TypeormClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<DataSource> {
        return TypeormClientFactory.clients[contextName];
    }

    private static async create(name: string, config: TypeormConfig, logger: Logger): Promise<DataSource> {
        const dataSource = new DataSource({
            name,
            type: 'mysql',
            ...config,
            entities: config.entities,
            subscribers: config.subscribers,
            migrations: config.migrations,
            synchronize: false,
            logger: new TypeormLogger(logger)
        });

        await dataSource.initialize();

        return dataSource;
    }

    private static registerClient(client: DataSource, contextName: string): void {
        TypeormClientFactory.clients[contextName] = client;
    }
}
