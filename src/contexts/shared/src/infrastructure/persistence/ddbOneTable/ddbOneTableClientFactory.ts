import DynamoDB from 'aws-sdk/clients/dynamodb';
import { Nullable } from '@src/domain/nullable';
import { Table, OneModelSchema } from 'dynamodb-onetable';
import DdbOneTableConfig from '@src/infrastructure/persistence/ddbOneTable/ddbOneTableConfig';
import fglob from 'fast-glob';
import { basename, extname } from 'path';

export default class DdbOneTableClientFactory {
    private static clients: { [key: string]: Table } = {};

    static async createClient(contextName: string, ddbClient: DynamoDB.DocumentClient, config: DdbOneTableConfig): Promise<Table> {
        let client = DdbOneTableClientFactory.getClient(contextName);

        if (!client) {
            client = await DdbOneTableClientFactory.create(ddbClient, config);

            DdbOneTableClientFactory.registerClient(client, contextName);
        }

        return client;
    }

    private static getClient(contextName: string): Nullable<Table> {
        return DdbOneTableClientFactory.clients[contextName];
    }

    private static async create(ddbClient: DynamoDB.DocumentClient, config: DdbOneTableConfig): Promise<Table> {
        return new Table({
            name: config.tableName,
            client: ddbClient,
            schema: {
                format: 'onetable:1.1.0',
                version: '0.0.1',
                indexes: config.indexes,
                models: await DdbOneTableClientFactory.loadModels(config),
                params: {
                    isoDates: config.isoDates
                }
            },
            logger: config.logger
        });
    }

    private static async loadModels(config: DdbOneTableConfig): Promise<{ [key: string]: OneModelSchema }> {
        const models: { [key: string]: OneModelSchema } = {},
            modelFiles = await fglob(config.models || '**/ddbOneTable/*.model.{ts,js}', { absolute: true });

        for (const filepath of modelFiles) {
            const modelFile = basename(filepath, extname(filepath)).split('.')[0],
                modelName = modelFile.charAt(0).toLocaleUpperCase() + modelFile.slice(1),
                // eslint-disable-next-line no-await-in-loop
                { default: model } = await import(filepath);

            models[modelName] = model;
        }

        return models;
    }

    private static registerClient(client: Table, contextName: string): void {
        DdbOneTableClientFactory.clients[contextName] = client;
    }
}
